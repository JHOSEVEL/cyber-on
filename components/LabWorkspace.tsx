
import React, { useEffect, useState, useRef } from 'react';
import { Lab, User } from '../types';
import { api } from '../services/api';
import { LAB_SCENARIOS } from '../constants';
import { Flag, Server, CheckCircle, ChevronRight, RotateCcw, HelpCircle } from 'lucide-react';

interface LabWorkspaceProps {
  labId: number;
  user: User;
  onUpdateUser: (u: User) => void;
  onBack: () => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'system';
  content: string;
  dir?: string;
}

const LabWorkspace: React.FC<LabWorkspaceProps> = ({ labId, user, onUpdateUser, onBack }) => {
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Step State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [stepStatus, setStepStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Terminal State
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'Iniciando instância CyberLabs Kali Linux...' },
    { type: 'system', content: 'Conectado à interface VPN tun0' },
    { type: 'system', content: 'Digite "help" para ver comandos disponíveis.' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [directory, setDirectory] = useState('~');
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadLab = async () => {
      const l = await api.getLabById(labId);
      if (l) {
         setLab(l);
      }
      setLoading(false);
    };
    loadLab();
  }, [labId]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lab) return;

    const currentStep = lab.steps[currentStepIndex];
    // Allow loose matching for case insensitivity
    const isCorrect = answer.trim().toLowerCase() === currentStep.answer.toLowerCase();
    
    if (isCorrect) {
      setStepStatus('success');
      
      // Grant points if it's the last step
      if (currentStepIndex === lab.steps.length - 1) {
        if (!user.completedLabs.includes(lab.id)) {
           await api.submitFlag(lab.id, lab.steps[lab.steps.length - 1].answer, user.id);
           const updatedUser = await api.getCurrentUser();
           if(updatedUser) onUpdateUser(updatedUser);
        }
      }

      // Wait a moment then move to next step if available
      setTimeout(() => {
        if (currentStepIndex < lab.steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
          setAnswer('');
          setStepStatus('idle');
        }
      }, 1500);

    } else {
      setStepStatus('error');
      setTimeout(() => setStepStatus('idle'), 2000);
    }
  };

  // --- Terminal Engine ---
  const executeCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    
    const parts = cmd.trim().split(' ');
    const bin = parts[0];
    const fullCmd = cmd.trim();

    let output = '';
    const scenario = LAB_SCENARIOS[labId] || { fileSystem: {}, network: {} };

    // 1. Check System Commands
    if (bin === 'clear') {
        setHistory([]);
        return;
    } else if (bin === 'help') {
        output = 'Comandos Disponíveis: ls, cat, pwd, whoami, id, grep, find, curl, ping, base64, nmap, ifconfig, ps, chmod, nc';
    } else if (bin === 'ls') {
        const args = parts.slice(1).join(' ');
        if (args.includes('-la') || args.includes('-al')) {
            output = Object.keys(scenario.fileSystem).join('\n');
        } else {
            output = Object.keys(scenario.fileSystem).filter(f => !f.startsWith('.')).join('  ');
        }
        if (!output) output = '(diretório vazio)';
    } else if (bin === 'pwd') {
        output = '/home/user';
    } else if (bin === 'cat') {
        const targetFile = parts[1];
        if (!targetFile) {
            output = 'Usage: cat <filename>';
        } else {
            if (scenario.fileSystem[targetFile]) {
                output = scenario.fileSystem[targetFile];
            } 
            else {
                 const foundKey = Object.keys(scenario.fileSystem).find(k => k.endsWith(targetFile) || k === targetFile);
                 if(foundKey) output = scenario.fileSystem[foundKey];
                 else output = `cat: ${targetFile}: No such file or directory`;
            }
        }
    } 
    // 2. Check Network/Scenario Responses (Partial & Exact Matching)
    else {
        if (scenario.network[fullCmd]) {
            output = scenario.network[fullCmd];
        } 
        else {
            const matchKey = Object.keys(scenario.network).find(k => fullCmd.includes(k));
            if (matchKey) {
                output = scenario.network[matchKey];
            } else {
                if (['grep', 'find', 'curl', 'ping', 'base64', 'dirb', 'nmap', 'nc', 'gobuster', 'chmod', 'ps'].includes(bin)) {
                    output = `[Shell Simulado]: Comando não reconhecido para este passo específico.\nDica: Tente seguir exatamente a sintaxe das instruções.`;
                } else {
                    output = `bash: ${bin}: comando não encontrado`;
                }
            }
        }
    }

    setHistory(prev => [
      ...prev,
      { type: 'input', content: fullCmd, dir: directory },
      ...(output ? [{ type: 'output', content: output } as TerminalLine] : [])
    ]);
  };

  const handleTerminalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    }
  };

  if (loading || !lab) return <div className="p-10 text-center animate-pulse">Carregando Dados da Missão...</div>;

  const currentStep = lab.steps[currentStepIndex];
  const isCompleted = user.completedLabs.includes(lab.id);
  
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* Left Panel: Lab Walkthrough */}
      <div className="lg:w-5/12 flex flex-col gap-4 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div>
            <button onClick={onBack} className="text-slate-400 hover:text-white text-xs font-mono mb-1 block">
               &lt; SAIR DA MISSÃO
            </button>
            <h1 className="font-bold text-white flex items-center gap-2">
              {lab.title}
              {isCompleted && <CheckCircle size={16} className="text-emerald-500" />}
            </h1>
          </div>
          <div className="text-xs font-mono text-cyber-accent">
            PASSO {currentStepIndex + 1}/{lab.steps.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isCompleted && currentStepIndex === lab.steps.length - 1 && stepStatus === 'success' ? (
            <div className="text-center py-10">
                <div className="inline-block p-4 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 animate-pulse-fast">
                    <Flag size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Missão Cumprida!</h2>
                <p className="text-slate-400 mb-4">Você ganhou <span className="text-cyber-accent font-bold">{lab.points} Pontos</span>.</p>
                <button onClick={() => { setCurrentStepIndex(0); setStepStatus('idle'); }} className="mt-4 text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded border border-slate-600 text-white flex items-center justify-center gap-2 mx-auto transition-colors">
                    <RotateCcw size={14} /> Rejogar Missão
                </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-4">{currentStep.title}</h2>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 mb-8">
                {currentStep.content.split('\n').map((line, i) => {
                    // Simple formatting
                    if(line.startsWith('`') && line.endsWith('`')) {
                        return <code key={i} className="block bg-black p-3 rounded border border-slate-700 my-2 font-mono text-emerald-400 text-xs whitespace-pre-wrap">{line.replace(/`/g, '')}</code>;
                    }
                    return <p key={i} className="mb-2">{line}</p>;
                })}
              </div>

              {/* Question & Answer */}
              <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                <div className="flex items-start gap-3 mb-3">
                  <HelpCircle className="text-cyber-accent mt-1 shrink-0" size={18} />
                  <span className="font-bold text-sm text-white">{currentStep.question}</span>
                </div>
                
                <form onSubmit={handleAnswerSubmit} className="relative">
                    <input 
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Digite sua resposta..."
                        className={`w-full bg-slate-900 border ${stepStatus === 'error' ? 'border-red-500' : stepStatus === 'success' ? 'border-emerald-500' : 'border-slate-600'} rounded p-3 pr-12 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyber-accent`}
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-1.5 p-1.5 bg-cyber-accent hover:bg-sky-400 text-white rounded transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </form>
                
                {stepStatus === 'error' && <p className="text-red-400 text-xs mt-2 pl-1 animate-pulse">Resposta incorreta. Verifique o terminal ou as dicas.</p>}
                {stepStatus === 'success' && <p className="text-emerald-400 text-xs mt-2 pl-1">Correto! Validação do sistema concluída.</p>}
                
                {currentStep.hint && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <details className="text-xs text-slate-500 cursor-pointer group">
                        <summary className="group-hover:text-slate-300 transition-colors list-none flex items-center gap-1">
                           <span>💡 Precisa de uma dica?</span>
                        </summary>
                        <div className="mt-2 p-2 bg-slate-900/80 rounded border border-slate-700/50 text-slate-400 font-mono">
                            {currentStep.hint}
                        </div>
                    </details>
                  </div>
                )}
              </div>
              
              {/* Pagination dots for progress */}
              <div className="flex gap-1 mt-6 justify-center">
                {lab.steps.map((_, idx) => (
                   <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentStepIndex ? 'w-6 bg-cyber-accent' : idx < currentStepIndex ? 'w-1.5 bg-emerald-500' : 'w-1.5 bg-slate-700'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Panel: Terminal */}
      <div className="flex-1 bg-black rounded-xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden font-mono text-sm relative">
         {/* Terminal Bar */}
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 opacity-70">
            <Server size={12} /> root@kali: {directory}
          </div>
        </div>

        {/* Terminal Output Area */}
        <div 
          className="flex-1 p-4 overflow-y-auto custom-scrollbar" 
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((line, i) => (
            <div key={i} className="mb-1 break-all">
              {line.type === 'input' ? (
                <div className="text-white mt-2">
                  <span className="text-cyber-green font-bold">root@kali</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-blue-400">{line.dir}</span>
                  <span className="text-slate-500">$ </span>
                  <span>{line.content}</span>
                </div>
              ) : line.type === 'system' ? (
                 <div className="text-slate-500 italic my-1">> {line.content}</div>
              ) : (
                <div className="text-slate-300 whitespace-pre-wrap pl-2 border-l-2 border-slate-800">{line.content}</div>
              )}
            </div>
          ))}
          
          {/* Active Input Line */}
          <div className="flex items-center text-white mt-2">
             <span className="text-cyber-green font-bold">root@kali</span>
             <span className="text-slate-500">:</span>
             <span className="text-blue-400">{directory}</span>
             <span className="text-slate-500">$ </span>
             <input 
                ref={inputRef}
                type="text" 
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleTerminalKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-white ml-2"
                autoFocus
                autoComplete="off"
                spellCheck="false"
             />
          </div>
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LabWorkspace;
