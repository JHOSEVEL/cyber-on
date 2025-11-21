import React, { useState } from 'react';
import { Difficulty, LabType } from '../types';
import { api } from '../services/api';
import { PlusCircle, Save } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    flag: '',
    points: 100,
    difficulty: Difficulty.EASY,
    type: LabType.CTF,
    tags: ''
  });
  const [msg, setMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLab({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()),
        points: Number(form.points)
      });
      setMsg('Lab created successfully!');
      setForm({
        title: '', description: '', longDescription: '', flag: '',
        points: 100, difficulty: Difficulty.EASY, type: LabType.CTF, tags: ''
      });
      setTimeout(() => setMsg(''), 3000);
    } catch (error) {
      setMsg('Error creating lab');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-xl border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <PlusCircle className="text-cyber-purple" /> Create New Lab
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Lab Title</label>
          <input required name="title" value={form.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Difficulty</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
              {Object.values(Difficulty).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Points</label>
            <input type="number" name="points" value={form.points} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Short Description</label>
          <input required name="description" value={form.description} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Markdown Content (Instructions)</label>
          <textarea required name="longDescription" value={form.longDescription} onChange={handleChange} rows={6} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono text-sm" placeholder="# Title..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Flag</label>
          <input required name="flag" value={form.flag} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Tags (comma separated)</label>
          <input name="tags" value={form.tags} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="web, linux, ctf" />
        </div>

        <button type="submit" className="w-full bg-cyber-purple hover:bg-violet-600 text-white font-bold py-3 rounded-lg mt-4 flex justify-center items-center gap-2 transition-colors">
          <Save size={18} /> Save Lab
        </button>
        {msg && <div className="text-center text-emerald-400 font-bold mt-2">{msg}</div>}
      </form>
    </div>
  );
};

export default AdminPanel;