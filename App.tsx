
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { User, LeaderboardEntry } from './types';
import { api } from './services/api';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LabWorkspace from './components/LabWorkspace';
import AdminPanel from './components/AdminPanel';
import { Terminal, LogOut, LayoutDashboard, ShieldAlert, Award, Menu, X, Shield } from 'lucide-react';
import { APP_NAME } from './constants';

const Sidebar = ({ user, onLogout, open, setOpen }: { user: User, onLogout: () => void, open: boolean, setOpen: (o: boolean) => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => (
    <Link 
      to={path} 
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(path) ? 'bg-cyber-accent/10 text-cyber-accent border-r-2 border-cyber-accent' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />}
      
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-30 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded flex items-center justify-center text-white">
            <Terminal size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{APP_NAME}</h1>
          <button className="ml-auto md:hidden text-slate-400" onClick={() => setOpen(false)}><X size={20}/></button>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem path="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem path="/leaderboard" icon={Award} label="Leaderboard" />
          {user.role === 'admin' && (
            <NavItem path="/admin" icon={ShieldAlert} label="Admin Panel" />
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-700" />
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.rankTitle || 'User'}</div>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 w-full px-2 py-2 text-sm transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    api.getLeaderboard().then(setUsers);
  }, []);

  const getRankIconColor = (idx: number) => {
     if (idx === 0) return 'text-yellow-400'; // Gold
     if (idx === 1) return 'text-slate-300'; // Silver
     if (idx === 2) return 'text-amber-600'; // Bronze
     return 'text-slate-600';
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Award className="text-yellow-500" /> Global Rankings</h2>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-sm uppercase">
                <tr>
                <th className="p-4 w-16">Rank</th>
                <th className="p-4">Hacker</th>
                <th className="p-4 hidden md:table-cell">Title</th>
                <th className="p-4 text-right">Score</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {users.map((u, i) => (
                <tr key={u.userId} className={`hover:bg-slate-700/50 transition-colors ${i < 3 ? 'bg-slate-800/50' : ''}`}>
                    <td className="p-4 font-mono font-bold">
                        <div className={`flex items-center gap-2 ${getRankIconColor(i)}`}>
                            {i < 3 && <Award size={16}/>}
                            #{u.rank}
                        </div>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                    <img src={u.avatarUrl} className="w-10 h-10 rounded-full border border-slate-600" />
                    <span className="font-bold text-white">{u.name}</span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-slate-400 font-mono text-sm">
                        <span className="bg-slate-900 px-2 py-1 rounded border border-slate-700">{u.rankTitle}</span>
                    </td>
                    <td className="p-4 text-right font-mono text-cyber-accent font-bold text-lg">{u.score.toLocaleString()}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const LabWorkspaceWrapper = ({ user, setUser }: { user: User, setUser: (u: User) => void }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  return <LabWorkspace labId={Number(id)} user={user} onUpdateUser={setUser} onBack={() => navigate('/')} />;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const u = await api.getCurrentUser();
      setUser(u);
      setLoading(false);
    };
    init();
  }, []);

  const handleLoginSuccess = ({ user }: { user: User }) => {
    setUser(user);
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyber-accent">Initializing Core Systems...</div>;

  if (!user) return <Auth onSuccess={handleLoginSuccess} />;

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyber-green selection:text-black">
        <Sidebar user={user} onLogout={handleLogout} open={sidebarOpen} setOpen={setSidebarOpen} />
        
        <main className="md:ml-64 min-h-screen transition-all">
          <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between sticky top-0 z-10">
            <div className="font-bold text-white flex items-center gap-2"><Terminal size={18}/> {APP_NAME}</div>
            <button onClick={() => setSidebarOpen(true)} className="text-white"><Menu /></button>
          </header>

          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard user={user} onNavigate={(path) => window.location.hash = path} />} />
              <Route path="/lab/:id" element={<LabWorkspaceWrapper user={user} setUser={setUser} />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
