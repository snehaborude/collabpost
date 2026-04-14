import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, User } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/logout', {}, { withCredentials: true });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 px-8 py-5 border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to={token ? "/feed" : "/"} className="flex items-center space-x-3 text-2xl font-black text-white tracking-tighter uppercase group">
          <div className="p-2 bg-brand-500 rounded-2xl shadow-xl shadow-brand-500/10 group-hover:rotate-12 transition-transform duration-500">
            <BookOpen className="w-6 h-6 text-slate-950" />
          </div>
          <span>Collab<span className="text-brand-500">Post</span></span>
        </Link>
        <div className="flex space-x-10 items-center font-black text-[10px] uppercase tracking-[0.2em]">
          {token ? (
            <>
              <Link to="/feed" className="text-slate-500 hover:text-brand-500 transition-all">Feed</Link>
              <Link to="/profile" className="flex items-center space-x-2 text-slate-500 hover:text-brand-500 transition-all">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-slate-900/60 hover:bg-slate-800 px-6 py-3 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="text-slate-500 hover:text-brand-500 transition-all">Login</Link>
              <Link to="/register" className="bg-brand-500 hover:bg-brand-400 text-slate-950 px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-brand-500/10">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
