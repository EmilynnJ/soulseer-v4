import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Reading {
  id: string;
  reader_id: string;
  started_at: string;
  ended_at: string | null;
  total_cost: number;
  status: string;
  reader: { full_name: string };
  client_review?: { rating: number; comment: string };
}

interface Transaction {
  id: string;
  amount: number;
  type: 'topup' | 'charge';
  description: string;
  created_at: string;
}

export default function ClientDashboard() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role !== 'client') { navigate('/dashboard'); return; }
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
      const [readingsRes, transactionsRes] = await Promise.all([
        fetch('/api/user/readings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/transactions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const readingsData = await readingsRes.json();
      const transactionsData = await transactionsRes.json();
      setReadings(readingsData.readings || []);
      setTransactions(transactionsData.transactions || []);
    } catch {}
    setLoading(false);
  };

  const handleAddFunds = () => {
    // TODO: Navigate to Stripe checkout
    alert('Add Funds integration: Create Stripe checkout session');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;

  const activeReading = readings.find(r => r.status === 'active');

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-purple-300">Client Dashboard</h1>
            <p className="text-gray-400">{profile?.full_name}</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 transition text-sm">
            Sign Out
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-8 mb-8 border border-purple-700/40">
          <p className="text-gray-300 text-sm mb-2">Account Balance</p>
          <p className="text-5xl font-bold text-white mb-6">${((profile?.balance || 0) / 100).toFixed(2)}</p>
          <button
            onClick={handleAddFunds}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            + Add Funds
          </button>
        </div>

        {/* Active Reading */}
        {activeReading && (
          <div className="bg-green-900/20 border border-green-700/40 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-green-300 mb-2">Active Reading</h2>
            <p className="text-gray-300 mb-4">You're currently in a session with {activeReading.reader.full_name}</p>
            <Link to={`/session/${activeReading.reader_id}`} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg inline-block">
              Return to Session
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Reading History */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
            <h2 className="text-xl font-semibold text-purple-200 mb-4">Reading History</h2>
            {readings.filter(r => r.status === 'completed').length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No completed readings yet. <Link to="/browse" className="text-purple-400">Browse readers</Link></p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {readings.filter(r => r.status === 'completed').map(r => (
                  <div key={r.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">{r.reader.full_name}</p>
                        <p className="text-gray-400 text-xs">{new Date(r.started_at).toLocaleDateString()} &middot; {Math.round((new Date(r.ended_at!).getTime() - new Date(r.started_at).getTime()) / 60000)} min</p>
                      </div>
                      <p className="text-green-400 font-semibold">${(r.total_cost / 100).toFixed(2)}</p>
                    </div>
                    {r.client_review ? (
                      <div className="text-yellow-400 text-sm">
                        {'\u2605'.repeat(r.client_review.rating)} <span className="text-gray-500">Your review</span>
                      </div>
                    ) : (
                      <button className="text-purple-400 text-xs hover:text-purple-300">Leave a review</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
            <h2 className="text-xl font-semibold text-purple-200 mb-4">Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{t.description}</p>
                      <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-semibold ${t.type === 'topup' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'topup' ? '+' : '-'}${(t.amount / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
