import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { username, password }, { withCredentials: true });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
      <div className="glass p-14 rounded-[4rem] w-full max-w-md animate-fade-in relative overflow-hidden border-white/5 shadow-2xl group">
        
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-500/5 rounded-full blur-[100px] group-hover:bg-brand-500/10 transition-all duration-1000"></div>
        
        <div className="flex justify-center mb-10 relative z-10 transition-transform duration-700 hover:scale-110">
          <div className="p-6 bg-slate-950 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5">
            <BookOpen className="w-12 h-12 text-brand-500" />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-center mb-2 text-white tracking-widest uppercase">
          Login
        </h2>
        <p className="text-center text-slate-500 font-black mb-12 uppercase text-[10px] tracking-[0.4em]">Sign in to your account</p>
        
        {error && <p className="text-rose-400 text-[10px] font-black mb-8 text-center bg-rose-950/40 py-4 rounded-2xl border border-rose-500/10 uppercase tracking-widest">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Username</label>
            <input 
              type="text" 
              className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-brand-500 transition-all placeholder-slate-800 font-bold" 
              placeholder="Your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4.5 text-white focus:outline-none focus:border-brand-500 transition-all placeholder-slate-800 font-bold" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-slate-100 hover:bg-brand-500 text-slate-950 font-black py-5 rounded-[2rem] transition-all shadow-2xl relative group/btn overflow-hidden">
            <span className="relative z-10 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3">
               Login <ShieldCheck className="w-4 h-4" />
            </span>
          </button>
        </form>
        <p className="text-center text-[10px] font-black text-slate-700 mt-12 uppercase tracking-widest">
          No account? <Link to="/register" className="text-brand-500 hover:text-brand-300 transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
}
