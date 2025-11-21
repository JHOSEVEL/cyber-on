
import React, { useEffect, useState } from 'react';
import { User, Lab, LabType, Difficulty } from '../types';
import { api } from '../services/api';
import { RANK_SYSTEM } from '../constants';
import { Terminal, Shield, Cpu, Activity, Lock, CheckCircle, Search, Trophy, Award, BookOpen, Layers } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (path: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const data = await api.getLabs();
        setLabs(data);
      } catch (e) {
        console.error("Failed to load labs");
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  // Calculate Progress to next Rank
  const currentRankIdx = RANK_SYSTEM.findIndex(r => r.title === user.rankTitle);
  const nextRank = RANK_SYSTEM[currentRankIdx + 1];
  const currentRankMin = RANK_SYSTEM[currentRankIdx]?.minScore || 0;
  const nextRankMin = nextRank?.minScore || user.score * 1.5; 
  const range = nextRankMin - currentRankMin;
  const progress = range === 0 ? 100 : Math.min(100, Math.max(0, ((user.score - currentRankMin) / range) * 100));

  // Group Labs by Module
  const modules = Array.from(new Set(labs.map(l => l.module || 'Extra Labs')));

  const getDifficultyColor = (diff: Difficulty) => {
    switch(diff) {
      case Difficulty.EASY: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case Difficulty.MEDIUM: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case Difficulty.HARD: return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case Difficulty.INSANE: return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Terminal size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
             <div>
                <h1 className="text-3xl font-bold mb-2">Painel de Controle, <span className="text-cyber-green">{user.name}</span></h1>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Trophy size={14} className="text-yellow-500"/>
                    <span>Rank Global: <span className="text-white font-bold">#{user.rank || '-'}</span></span>
                </div>
             </div>
             <div className="text-right hidden md:block">
                 <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Status Atual</div>
                 <div className="text-2xl font-mono font-bold text-cyber-purple">{user.rankTitle || 'Script Kiddie'}</div>
             </div>
          </div>

          {/* Rank Progress Bar */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400 font-mono">Score: {user.score}</span>
                <span className="text-slate-400 font-mono">Próximo: {nextRank ? nextRank.title : 'Max Level'} ({nextRankMin} pts)</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                    className="h-full bg-gradient-to-r from-cyber-green to-cyber-accent transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Activity size={20}/></div>
            <div>
                <div className="text-2xl font-bold text-white">{user.completedLabs.length}</div>
                <div className="text-xs text-slate-500 uppercase">Labs Concluídos</div>
            </div>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Shield size={20}/></div>
            <div>
                <div className="text-2xl font-bold text-white">{user.score}</div>
                <div className="text-xs text-slate-500 uppercase">Pontuação</div>
            </div>
         </div>
         <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle size={20}/></div>
            <div>
                <div className="text-2xl font-bold text-white">{labs.length > 0 ? Math.round((user.completedLabs.length / labs.length) * 100) : 0}%</div>
                <div className="text-xs text-slate-500 uppercase">Progresso Total</div>
            </div>
         </div>
      </div>

      {/* Lab Track Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <BookOpen className="text-cyber-accent" /> Trilha Pentester Profissional
          </h2>
          <p className="text-slate-400 text-sm mt-1">Complete os 30 exercícios para dominar a cibersegurança.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar desafio..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-accent w-full md:w-64"
          />
        </div>
      </div>

      {/* Labs Track List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Carregando Trilha de Ensino...</div>
      ) : (
        <div className="space-y-12">
          {modules.map((moduleName) => {
            const moduleLabs = labs.filter(l => l.module === moduleName && (l.title.toLowerCase().includes(filter.toLowerCase()) || l.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))));
            
            if (moduleLabs.length === 0) return null;

            return (
              <div key={moduleName} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <h3 className="text-xl font-bold text-cyber-purple flex items-center gap-2 whitespace-nowrap">
                        <Layers size={20}/> {moduleName}
                    </h3>
                    <div className="h-px bg-slate-700 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moduleLabs.map((lab) => {
                        const isSolved = user.completedLabs.includes(lab.id);
                        return (
                        <div 
                            key={lab.id} 
                            onClick={() => onNavigate(`/lab/${lab.id}`)}
                            className={`group bg-slate-800 border ${isSolved ? 'border-emerald-500/30' : 'border-slate-700'} rounded-xl overflow-hidden hover:border-cyber-accent transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-cyan-900/20 flex flex-col h-full`}
                        >
                            <div className="relative h-32 overflow-hidden">
                            <img src={lab.thumbnail} alt={lab.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                            <div className="absolute top-2 right-2">
                                {isSolved ? (
                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg uppercase">
                                    <CheckCircle size={10} /> Concluído
                                </span>
                                ) : (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border backdrop-blur-md uppercase ${getDifficultyColor(lab.difficulty)}`}>
                                    {lab.difficulty}
                                </span>
                                )}
                            </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider border border-slate-700 px-1 rounded">{lab.type}</span>
                                <span className="text-xs font-mono text-cyber-accent flex items-center gap-1">
                                    <Award size={12}/> {lab.points} pts
                                </span>
                            </div>
                            <h3 className="text-md font-bold mb-2 group-hover:text-cyber-accent transition-colors leading-tight">{lab.title}</h3>
                            <p className="text-slate-400 text-xs mb-4 line-clamp-2 flex-1">{lab.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {lab.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-700">
                                    #{tag}
                                </span>
                                ))}
                            </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
