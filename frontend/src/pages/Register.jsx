import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { UserPlus, Sparkles } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', name: '', password: '', program: '', bio: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData, { withCredentials: true });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Initialization failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] py-12 px-4">
      <div className="glass p-12 md:p-14 rounded-[4rem] w-full max-w-2xl animate-slide-up relative overflow-hidden border-white/5 shadow-2xl group">
        
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-500/5 rounded-full blur-[100px] group-hover:bg-brand-500/10 transition-all duration-1000"></div>
        
        <div className="flex justify-center mb-10 relative z-10 transition-transform hover:rotate-6 duration-500">
          <div className="p-6 bg-slate-950 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/5">
            <UserPlus className="w-12 h-12 text-brand-500" />
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-center mb-2 text-white tracking-widest uppercase">
          Register
        </h2>
        <p className="text-center text-slate-500 font-black mb-12 uppercase text-[10px] tracking-[0.4em]">Create a new account</p>
        
        {error && <p className="text-rose-400 text-[10px] font-black mb-8 text-center bg-rose-950/40 py-4 rounded-2xl border border-rose-500/10 uppercase tracking-widest">{error}</p>}
        
        <form onSubmit={handleRegister} className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Username</label>
              <input type="text" name="username" onChange={handleChange} required className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-500 transition-all placeholder-slate-800 font-bold" placeholder="johndoe" />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Full Name</label>
              <input type="text" name="name" onChange={handleChange} required className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-500 transition-all placeholder-slate-800 font-bold" placeholder="John Doe" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-500 transition-all placeholder-slate-800 font-bold" placeholder="••••••••" />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Academic Program</label>
            <input type="text" name="program" onChange={handleChange} className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-500 transition-all placeholder-slate-800 font-bold" placeholder="e.g. Computer Science" />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Bio</label>
            <textarea name="bio" onChange={handleChange} rows="2" className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-brand-500 transition-all resize-none placeholder-slate-800 font-bold" placeholder="Tell us about yourself..."></textarea>
          </div>
          <button type="submit" className="w-full mt-4 bg-slate-100 hover:bg-brand-500 text-slate-950 font-black py-5 rounded-[2rem] transition-all shadow-2xl transform active:scale-95 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3">
            Create Account <Sparkles className="w-5 h-5 fill-current" />
          </button>
        </form>
        <p className="text-center text-[10px] font-black text-slate-700 mt-12 uppercase tracking-widest">
          Already have an account? <Link to="/" className="text-brand-500 hover:text-brand-300 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
}
