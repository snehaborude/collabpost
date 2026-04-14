import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { Search, Send, ThumbsUp, MessageSquare, Bookmark, Link as LinkIcon, ExternalLink, BookmarkCheck, Pin } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('academic');

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, { withCredentials: true });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts?category=${category}&search=${search}`);
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUser();
  }, [category, search]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/posts`, 
        { title: newTitle, content: newContent, category: newCategory, url: newUrl },
        { withCredentials: true }
      );
      setNewTitle('');
      setNewContent('');
      setNewUrl('');
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API_URL}/api/posts/${postId}/like`, {}, { withCredentials: true });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (postId) => {
    try {
      await axios.post(`${API_URL}/api/posts/${postId}/save`, {}, { withCredentials: true });
      fetchUser();
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      await axios.post(`${API_URL}/api/posts/${postId}/comment`, { text }, { withCredentials: true });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'academic', label: 'Academic' },
    { id: 'coding', label: 'Coding' },
    { id: 'experiences', label: 'Experience' },
  ];

  const currentUser = user || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Create Post Section - Frosted White Look */}
      <div className="glass-light p-8 rounded-3xl mb-12 relative overflow-hidden group border-white/10 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-teal-400 opacity-50"></div>
        <h3 className="text-2xl font-black mb-6 text-slate-100 flex items-center gap-3">
           <div className="p-2 bg-brand-500 rounded-xl shadow-lg shadow-brand-500/20">
              <Send className="w-5 h-5 text-slate-950" />
           </div>
           Create a Post
        </h3>
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Title..." 
              className="flex-1 bg-slate-950/40 border border-white/5 text-white rounded-2xl px-5 py-3.5 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-400 font-medium"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <select 
                className="flex-1 bg-slate-950/40 border border-white/5 text-white rounded-2xl px-5 py-3.5 focus:border-brand-500 focus:outline-none appearance-none cursor-pointer font-medium"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                <option value="academic">Academic</option>
                <option value="coding">Coding</option>
                <option value="experiences">Experience</option>
              </select>
              <div className="relative flex-1">
                 <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                  type="url" 
                  placeholder="Link (optional)" 
                  className="w-full bg-slate-950/40 border border-white/5 text-white rounded-2xl pl-12 pr-5 py-3.5 focus:border-brand-500 focus:outline-none transition-all placeholder-slate-400 text-sm font-medium"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
          <textarea 
            placeholder="What's on your mind?" 
            className="w-full bg-slate-950/40 border border-white/5 text-white rounded-2xl px-5 py-5 min-h-[140px] resize-none focus:border-brand-500 focus:outline-none transition-all placeholder-slate-400 font-medium leading-relaxed"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            required
          />
          <div className="flex justify-end pt-2">
            <button type="submit" className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-400 text-slate-950 px-10 py-4 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/20 uppercase tracking-widest text-xs">
              <span>Post</span>
               <Sparkles className="w-4 h-4 fill-current" />
            </button>
          </div>
        </form>
      </div>

      {/* Modern Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex p-1 bg-slate-900/40 rounded-2xl border border-white/5 backdrop-blur-md">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${category === cat.id ? 'bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/10' : 'text-slate-400 hover:text-slate-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search posts..." 
            className="w-full bg-slate-950/30 border border-white/5 rounded-2xl pl-12 pr-5 py-3.5 focus:outline-none focus:border-brand-500 text-slate-100 placeholder-slate-600 transition-all font-bold text-sm tracking-tight"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Clean Posts Feed */}
      <div className="space-y-10">
        {posts.length === 0 ? (
          <div className="glass p-24 text-center rounded-[3rem] border-white/5">
             <div className="inline-block p-6 bg-slate-900/50 rounded-3xl mb-4 border border-white/5">
                <LayoutGrid className="w-10 h-10 text-slate-700" />
             </div>
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No entries found</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              currentUser={currentUser}
              onLike={() => handleLike(post._id)}
              onSave={() => handleSave(post._id)}
              onComment={(text) => handleComment(post._id, text)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Sparkles({ className }) {
   return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
}

function LayoutGrid({ className }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
}

function PostCard({ post, currentUser, onLike, onSave, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const getCategoryTheme = (cat) => {
    switch(cat) {
      case 'academic': return 'text-brand-400 bg-brand-400/5 border-brand-400/10';
      case 'coding': return 'text-sky-400 bg-sky-400/5 border-sky-400/10';
      case 'experiences': return 'text-amber-400 bg-amber-400/5 border-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/5 border-slate-400/10';
    }
  };

  const hasLiked = post.likes.includes(currentUser._id);
  const isSaved = currentUser.savedPosts?.some(p => p._id === post._id);

  return (
    <div className={`glass p-8 rounded-[2.5rem] hover:border-brand-500/20 transition-all duration-500 relative group border-white/5 ${post.isPinned ? 'ring-2 ring-brand-500/30' : ''}`}>
      
      {post.isPinned && (
         <div className="absolute -top-3 left-8 bg-brand-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <Pin className="w-3 h-3 fill-current" /> Pinned
         </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-4 items-center">
           <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-brand-400 border border-white/5 shadow-inner uppercase tracking-tighter">
              {post.user?.name?.[0] || 'U'}
           </div>
           <div>
              <h4 className="text-2xl font-black text-slate-100 group-hover:text-brand-400 transition-colors uppercase tracking-tight">{post.title}</h4>
              <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">
                @{post.user?.username || 'user'} • {new Date(post.date).toLocaleDateString()}
              </p>
           </div>
        </div>
        <div className="flex gap-2.5">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-[0.2em] self-start ${getCategoryTheme(post.category)}`}>
              {post.category}
            </span>
            <button 
              onClick={onSave}
              className={`p-3 rounded-2xl transition-all border ${isSaved ? 'bg-brand-500 border-brand-500 text-slate-950 shadow-lg shadow-brand-500/20' : 'bg-slate-800/40 border-white/5 text-slate-400 hover:text-brand-400 hover:border-brand-500/30'}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
        </div>
      </div>
      
      <p className="text-slate-300 leading-relaxed text-lg mb-8 font-medium">{post.content}</p>
      
      {post.url && (
         <a 
          href={post.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 bg-slate-800/30 hover:bg-slate-800/60 border border-white/5 text-slate-300 hover:text-brand-400 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all mb-8 group/link transition-all"
         >
           <LinkIcon className="w-4 h-4 text-brand-500" />
           <span>View Resource</span>
           <ExternalLink className="w-4 h-4 opacity-30 group-hover/link:opacity-100 transition-opacity" />
         </a>
      )}
      
      <div className="flex items-center space-x-10 border-t border-white/5 pt-8">
        <button onClick={onLike} className={`flex items-center space-x-2 text-xs font-black tracking-widest transition-colors ${hasLiked ? 'text-brand-500' : 'text-slate-600 hover:text-brand-400 uppercase'}`}>
          <ThumbsUp className={`w-6 h-6 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{post.likes.length} Likes</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 text-xs font-black tracking-widest text-slate-600 hover:text-brand-400 transition-colors uppercase">
          <MessageSquare className="w-6 h-6" />
          <span>{post.comments.length} Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-8 pt-8 border-t border-white/5 animate-fade-in space-y-6">
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {post.comments.map((comment, idx) => (
              <div key={idx} className="bg-slate-900/30 rounded-[1.5rem] p-5 border border-white/5 relative group/comment">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-brand-500/70 uppercase tracking-widest italic">{comment.user?.name || 'User'}</span>
                  <span className="text-[10px] text-slate-700 font-black">{new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <input 
              type="text" 
              placeholder="Write a comment..." 
              className="flex-1 bg-slate-950/40 border border-white/5 rounded-2xl px-6 py-3.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-all font-bold placeholder-slate-700"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onComment(commentText);
                  setCommentText('');
                }
              }}
            />
            <button 
              onClick={() => { onComment(commentText); setCommentText(''); }}
              className="bg-slate-800 hover:bg-brand-500 px-8 py-3.5 rounded-2xl text-slate-300 hover:text-slate-950 text-[10px] font-black uppercase tracking-widest transition-all border border-brand-500/10 shadow-lg"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
