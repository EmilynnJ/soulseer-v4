import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

type Tab = 'users' | 'readings' | 'transactions' | 'forum';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'client' | 'reader' | 'admin';
  balance: number;
  created_at: string;
}

interface Reading {
  id: string;
  client: { full_name: string; email: string };
  reader: { full_name: string; email: string };
  status: string;
  started_at: string;
  ended_at: string | null;
  total_cost: number;
  reader_earnings: number;
}

interface Transaction {
  id: string;
  user: { full_name: string; email: string };
  amount: number;
  type: 'topup' | 'charge';
  description: string;
  created_at: string;
}

interface ForumPost {
  id: string;
  title: string;
  body: string;
  author: { full_name: string };
  created_at: string;
  reply_count: number;
}

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Reader Form
  const [showCreateReader, setShowCreateReader] = useState(false);
  const [newReader, setNewReader] = useState({
    full_name: '', email: '', bio: '', specialties: '', rate_per_minute: '2.00'
  });

  // Edit Reader
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Balance Adjustment
  const [balanceAdjust, setBalanceAdjust] = useState<{ userId: string; amount: string; reason: string } | null>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role !== 'admin') { navigate('/dashboard'); return; }
    fetchData();
  }, [user, profile]);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  const fetchData = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const [usersRes, readingsRes, transactionsRes, forumRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/readings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/transactions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/forum/posts', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const usersData = await usersRes.json();
      const readingsData = await readingsRes.json();
      const transactionsData = await transactionsRes.json();
      const forumData = await forumRes.json();
      setUsers(usersData.users || []);
      setReadings(readingsData.readings || []);
      setTransactions(transactionsData.transactions || []);
      setForumPosts(forumData.posts || []);
    } catch {}
    setLoading(false);
  };

  const createReader = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) return;
    const specialtiesArray = newReader.specialties.split(',').map(s => s.trim()).filter(Boolean);
    const rateInCents = Math.round(parseFloat(newReader.rate_per_minute) * 100);
    await fetch('/api/admin/create-reader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...newReader, specialties: specialtiesArray, rate_per_minute: rateInCents })
    });
    setShowCreateReader(false);
    setNewReader({ full_name: '', email: '', bio: '', specialties: '', rate_per_minute: '2.00' });
    fetchData();
  };

  const adjustBalance = async () => {
    if (!balanceAdjust) return;
    const token = await getToken();
    if (!token) return;
    const amountInCents = Math.round(parseFloat(balanceAdjust.amount) * 100);
    await fetch('/api/admin/adjust-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ user_id: balanceAdjust.userId, amount: amountInCents, reason: balanceAdjust.reason })
    });
    setBalanceAdjust(null);
    fetchData();
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    const token = await getToken();
    if (!token) return;
    await fetch(`/api/admin/forum/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReadings = readings.filter(r =>
    r.client.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.reader.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-yellow-300">⚠️ Admin Dashboard</h1>
            <p className="text-gray-400">{profile?.full_name}</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 transition text-sm">
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {(['users', 'readings', 'transactions', 'forum'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize whitespace-nowrap ${
                activeTab === tab ? 'bg-yellow-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 mb-6 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
        />

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-yellow-200">All Users</h2>
              <button
                onClick={() => setShowCreateReader(true)}
                className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg font-medium"
              >
                + Create Reader
              </button>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-yellow-900/40 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Name</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Email</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Role</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Balance</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">{u.full_name}</td>
                      <td className="p-4 text-gray-400">{u.email}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${
                        u.role === 'admin' ? 'bg-yellow-900/50 text-yellow-300' :
                        u.role === 'reader' ? 'bg-purple-900/50 text-purple-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>{u.role}</span></td>
                      <td className="p-4 text-green-400">${(u.balance / 100).toFixed(2)}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setBalanceAdjust({ userId: u.id, amount: '', reason: '' })}
                          className="text-yellow-400 hover:text-yellow-300 text-sm mr-3"
                        >
                          Adjust Balance
                        </button>
                        {u.role === 'reader' && (
                          <button
                            onClick={() => setEditingUser(u)}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Readings Tab */}
        {activeTab === 'readings' && (
          <div>
            <h2 className="text-2xl font-semibold text-yellow-200 mb-4">All Readings</h2>
            <div className="bg-gray-900 rounded-2xl border border-yellow-900/40 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Client</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Reader</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Started</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Duration</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Total</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings.map(r => (
                    <tr key={r.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">{r.client.full_name}</td>
                      <td className="p-4 text-purple-300">{r.reader.full_name}</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(r.started_at).toLocaleString()}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        {r.ended_at ? `${Math.round((new Date(r.ended_at).getTime() - new Date(r.started_at).getTime()) / 60000)} min` : 'Active'}
                      </td>
                      <td className="p-4 text-green-400">${(r.total_cost / 100).toFixed(2)}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${
                        r.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300'
                      }`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-2xl font-semibold text-yellow-200 mb-4">Transaction Ledger</h2>
            <div className="bg-gray-900 rounded-2xl border border-yellow-900/40 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 text-yellow-300 font-semibold">User</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Type</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Description</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Amount</th>
                    <th className="text-left p-4 text-yellow-300 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">{t.user.full_name}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${
                        t.type === 'topup' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}>{t.type}</span></td>
                      <td className="p-4 text-gray-400 text-sm">{t.description}</td>
                      <td className="p-4 font-semibold">
                        <span className={t.type === 'topup' ? 'text-green-400' : 'text-red-400'}>
                          {t.type === 'topup' ? '+' : '-'}${(t.amount / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div>
            <h2 className="text-2xl font-semibold text-yellow-200 mb-4">Forum Moderation</h2>
            <div className="space-y-3">
              {forumPosts.map(post => (
                <div key={post.id} className="bg-gray-900 rounded-xl p-6 border border-yellow-900/40">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{post.body.slice(0, 200)}...</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{post.author.full_name}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>{post.reply_count} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Reader Modal */}
        {showCreateReader && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-yellow-700">
              <h2 className="text-2xl font-bold text-yellow-300 mb-6">Create Reader Account</h2>
              <form onSubmit={createReader} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newReader.full_name}
                      onChange={e => setNewReader({ ...newReader, full_name: e.target.value })}
                      required
                      className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={newReader.email}
                      onChange={e => setNewReader({ ...newReader, email: e.target.value })}
                      required
                      className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={newReader.bio}
                    onChange={e => setNewReader({ ...newReader, bio: e.target.value })}
                    required
                    rows={3}
                    className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={newReader.specialties}
                    onChange={e => setNewReader({ ...newReader, specialties: e.target.value })}
                    placeholder="tarot, astrology, love"
                    required
                    className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rate per Minute ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newReader.rate_per_minute}
                    onChange={e => setNewReader({ ...newReader, rate_per_minute: e.target.value })}
                    required
                    className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg font-semibold transition"
                  >
                    Create Reader
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateReader(false)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Balance Adjustment Modal */}
        {balanceAdjust && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-yellow-700">
              <h2 className="text-2xl font-bold text-yellow-300 mb-6">Adjust Balance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Use negative for deductions"
                    value={balanceAdjust.amount}
                    onChange={e => setBalanceAdjust({ ...balanceAdjust, amount: e.target.value })}
                    className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Reason</label>
                  <input
                    type="text"
                    placeholder="Why is this adjustment being made?"
                    value={balanceAdjust.reason}
                    onChange={e => setBalanceAdjust({ ...balanceAdjust, reason: e.target.value })}
                    className="w-full bg-gray-800 border border-yellow-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={adjustBalance}
                    className="px-6 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg font-semibold transition"
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => setBalanceAdjust(null)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
