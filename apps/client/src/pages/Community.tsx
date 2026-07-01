import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  author: { full_name: string };
  reply_count: number;
}

export default function Community() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = () => {
    fetch('/api/forum/posts')
      .then(r => r.json())
      .then(data => { setPosts(data.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    const token = await getToken();
    await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, body }),
    });
    setTitle(''); setBody(''); setShowForm(false); setPosting(false);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-300">Community</h1>
            <p className="text-gray-400">Share, discuss, and connect with fellow seekers.</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition"
            >
              {showForm ? 'Cancel' : 'New Post'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handlePost} className="bg-gray-900 rounded-2xl p-6 mb-8 border border-purple-700/40 space-y-4">
            <input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full bg-gray-800 border border-purple-700 rounded-lg px-4 py-2 text-white focus:outline-none"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={4}
              className="w-full bg-gray-800 border border-purple-700 rounded-lg px-4 py-2 text-white focus:outline-none resize-none"
            />
            <button type="submit" disabled={posting}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400 text-center py-20">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No posts yet. Be the first to share!</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-gray-900 rounded-2xl p-6 border border-purple-900/30">
                <h3 className="text-lg font-semibold text-purple-200 mb-1">{post.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{post.body.slice(0, 200)}{post.body.length > 200 ? '...' : ''}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{post.author?.full_name}</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>{post.reply_count} replies</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
