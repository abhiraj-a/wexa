import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/20 rounded-full blur-[120px] pointer-events-none" />
      
      <form onSubmit={handleLogin} className="glass-card p-12 rounded-[3rem] max-w-md w-full relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Admin Portal</h2>
          <p className="text-slate-400 mt-2 font-medium">Authenticate to manage inventory</p>
        </div>
        
        {error && (
          <div className="mb-6 text-center bg-red-500/10 border border-red-500/30 text-red-400 py-3 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Username</label>
          <input 
            type="text" 
            className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white placeholder-slate-600"
            placeholder="Enter your username"
            value={username} onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Password</label>
          <input 
            type="password" 
            className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white placeholder-slate-600"
            placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full glass-button text-white font-bold py-4 rounded-2xl hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Authenticate &rarr;
        </button>
      </form>
    </div>
  );
}
