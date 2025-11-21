import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, User, Terminal } from 'lucide-react';
import { AuthResponse } from '../types';

interface AuthProps {
  onSuccess: (res: AuthResponse) => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulating login process
    try {
      const res = await api.login(email);
      onSuccess(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mb-6 text-cyber-green shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Terminal size={32} />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">CyberLabs</h1>
          <p className="text-slate-400 mb-8">Enter the simulation. Hacking is a skill.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-accent transition-colors" size={20} />
              <input
                type="email"
                placeholder="Enter email to begin..."
                className="w-full bg-slate-950 border border-slate-700 text-white py-3 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyber-accent focus:border-transparent transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <button
              disabled={loading}
              className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <Lock size={18} /> INITIALIZE SESSION
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-600">
            By entering, you agree to our Ethics Code. Unauthorized testing is illegal.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;