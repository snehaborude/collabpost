import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { User, Mail, Book, Trash2, Bookmark, LayoutGrid, Award, Pin, PinOff } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('mine');

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
      setProfile(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDeletePost = async (postId) => {
    if(!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/posts/${postId}`, { withCredentials: true });
      alert(res.data.message);
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Deletion failed");
    }
  };

  const handlePinPost = async (postId) => {
    try {
      await axios.post(`${API_URL}/api/posts/${postId}/pin`, {}, { withCredentials: true });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center min-h-[70vh]">
       <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Profile Header */}
      <div className="glass p-12 rounded-[3.5rem] mb-12 relative overflow-hidden group border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/10 transition-all duration-1000"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="relative">
             <div className="w-40 h-40 bg-slate-900 rounded-[3rem] flex items-center justify-center border-2 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group-hover:scale-105 transition-transform duration-700">
                <User className="w-20 h-20 text-slate-800" />
             </div>
             <div className="absolute -bottom-3 -right-3 bg-brand-500 p-4 rounded-3xl shadow-xl border-4 border-slate-950 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-950 uppercase leading-none mb-1">Points</span>
                <span className="text-lg font-black text-slate-950 leading-none">{profile.reputation || 0}</span>
             </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">{profile.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <p className="text-brand-500 font-black text-xl tracking-tight">@{profile.username}</p>
              <div className="h-5 w-[1px] bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
                 <Award className="w-4 h-4" /> Student Profile
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
               <div className="flex items-center gap-3 bg-slate-950/60 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                  <Book className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">{profile.program || 'Student'}</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5 relative z-10">
          <h4 className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <LayoutGrid className="w-3 h-3" /> Bio
          </h4>
          <p className="text-slate-400 leading-relaxed font-medium italic text-lg pr-4">{profile.bio || 'Your bio is currently empty.'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 p-1 bg-slate-900/60 rounded-3xl border border-white/5 w-fit">
         <button 
          onClick={() => setActiveTab('mine')}
          className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase transition-all tracking-[0.2em] ${activeTab === 'mine' ? 'bg-brand-500 text-slate-950 shadow-xl shadow-brand-500/10' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <LayoutGrid className="w-4 h-4" />
            My Posts
         </button>
         <button 
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase transition-all tracking-[0.2em] ${activeTab === 'saved' ? 'bg-brand-500 text-slate-950 shadow-xl shadow-brand-500/10' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <Bookmark className="w-4 h-4" />
            Saved
         </button>
      </div>
      
      {/* Dynamic Content Feed */}
      <div className="space-y-8">
        {activeTab === 'mine' ? (
          (!profile.posts || profile.posts.length === 0) ? (
            <div className="glass p-20 text-center rounded-[3rem] border-white/5 opacity-40">
               <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No posts yet</p>
            </div>
          ) : (
            // Sort to Show Pinned items first
            [...profile.posts].sort((a,b) => (b.isPinned?1:0) - (a.isPinned?1:0)).map(post => (
              <ProfilePostCard 
                key={post._id} 
                post={post} 
                onDelete={() => handleDeletePost(post._id)} 
                onPin={() => handlePinPost(post._id)}
              />
            ))
          )
        ) : (
          (!profile.savedPosts || profile.savedPosts.length === 0) ? (
            <div className="glass p-20 text-center rounded-[3rem] border-white/5 opacity-40">
               <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">No saved posts</p>
            </div>
          ) : (
            profile.savedPosts.map(post => (
              <ProfilePostCard key={post._id} post={post} isSavedTab={true} />
            ))
          )
        )}
      </div>
    </div>
  );
}

function ProfilePostCard({ post, onDelete, isSavedTab, onPin }) {
  return (
    <div className={`glass p-8 rounded-[2.5rem] flex justify-between items-center group hover:border-brand-500/30 transition-all duration-500 border-white/5 ${post.isPinned ? 'bg-slate-900/60 ring-1 ring-brand-500/20 shadow-brand-500/5' : ''}`}>
      <div className="flex-1 pr-10">
        <div className="flex items-center gap-3 mb-2">
           {post.isPinned && <Pin className="w-4 h-4 text-brand-500 fill-current" />}
           <h4 className="font-black text-2xl text-slate-100 tracking-tight group-hover:text-brand-400 transition-colors uppercase">{post.title}</h4>
        </div>
        <p className="text-slate-500 text-base leading-relaxed line-clamp-2 font-medium italic pr-10">"{post.content}"</p>
        <div className="flex items-center space-x-8 mt-8">
           <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest leading-none">
                {isSavedTab ? `By @${post.user?.username || 'user'}` : new Date(post.date).toLocaleDateString()}
              </span>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{post.likes?.length || 0} Likes</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{post.comments?.length || 0} Comments</span>
           </div>
        </div>
      </div>
      
      {!isSavedTab && (
        <div className="flex gap-3">
          <button 
            onClick={onPin}
            className={`p-5 rounded-[1.8rem] border border-white/5 transition-all group/pin ${post.isPinned ? 'bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/20' : 'bg-slate-950/40 text-slate-700 hover:text-brand-500 hover:border-brand-500/30'}`}
            title={post.isPinned ? "Unpin Post" : "Pin post to top"}
          >
             {post.isPinned ? <PinOff className="w-6 h-6" /> : <Pin className="w-6 h-6" />}
          </button>
          <button 
            onClick={onDelete}
            className="p-5 bg-slate-950/40 hover:bg-rose-500/10 text-slate-700 hover:text-rose-400 rounded-[1.8rem] border border-white/5 hover:border-rose-500/30 transition-all group/btn"
            title="Delete Post"
          >
            <Trash2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
