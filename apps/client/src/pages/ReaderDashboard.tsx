import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Reading {
  id: string;
  client_id: string;
  started_at: string;
  ended_at: string | null;
  total_cost: number;
  reader_earnings: number;
  status: string;
  client_review?: { rating: number; comment: string };
}

export default function ReaderDashboard() {
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [rate, setRate] = useState(200); // cents per minute
  const [readings, setReadings] = useState<Reading[]>([]);
  const [earnings, setEarnings] = useState({ today: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [savingRate, setSavingRate] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (profile?.role !== 'reader') { navigate('/dashboard'); return; }
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
      const [readerRes, readingsRes, earningsRes] = await Promise.all([
        fetch('/api/readers/me', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/readers/readings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/readers/earnings', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const readerData = await readerRes.json();
      const readingsData = await readingsRes.json();
      const earningsData = await earningsRes.json();
      setIsOnline(readerData.reader?.is_online || false);
      setRate(readerData.reader?.rate_per_minute || 200);
      setReadings(readingsData.readings || []);
      setEarnings(earningsData.earnings || { today: 0, pending: 0, total: 0 });
    } catch {}
    setLoading(false);
  };

  const toggleOnline = async () => {
    const token = await getToken();
    if (!token) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    await fetch('/api/readers/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_online: newStatus })
    });
  };

  const saveRate = async () => {
    const token = await getToken();
    if (!token) return;
    setSavingRate(true);
    await fetch('/api/readers/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ rate_per_minute: rate })
    });
    setSavingRate(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;

  const reviews = readings.filter(r => r.client_review).map(r => ({ ...r.client_review!, readingId: r.id, date: r.started_at }));

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-purple-300">Reader Dashboard</h1>
            <p className="text-gray-400">{profile?.full_name}</p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 transition text-sm">
            Sign Out
          </button>
        </div>

        {/* Online Toggle & Rate */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">Status</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleOnline}
                className={`relative w-16 h-8 rounded-full transition ${
                  isOnline ? 'bg-green-600' : 'bg-gray-700'
                }`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isOnline ? 'translate-x-8' : 'translate-x-0'
                }`} />
              </button>
              <span className={`font-semibold ${
                isOnline ? 'text-green-400' : 'text-gray-500'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-3">Toggle to accept new reading requests</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">Per-Minute Rate</h2>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">$</span>
              <input
                type="number"
                value={(rate / 100).toFixed(2)}
                onChange={e => setRate(Math.round(parseFloat(e.target.value || '0') * 100))}
                step="0.01"
                min="0"
                className="w-24 bg-gray-800 border border-purple-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-gray-400">/ min</span>
              <button
                onClick={saveRate}
                disabled={savingRate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg text-sm transition"
              >
                {savingRate ? 'Saving...' : 'Save'}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3">You earn 60% ({((rate * 0.6) / 100).toFixed(2)}/min)</p>
          </div>
        </div>

        {/* Earnings Summary */}
        <div className="bg-gradient-to-br from-green-900/40 to-purple-900/40 rounded-2xl p-8 mb-8 border border-green-700/40">
          <h2 className="text-xl font-semibold text-green-300 mb-6">Earnings</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Today</p>
              <p className="text-3xl font-bold text-white">${(earnings.today / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Pending Payout</p>
              <p className="text-3xl font-bold text-yellow-400">${(earnings.pending / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">All-Time</p>
              <p className="text-3xl font-bold text-green-400">${(earnings.total / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Session History */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
            <h2 className="text-xl font-semibold text-purple-200 mb-4">Session History</h2>
            {readings.filter(r => r.status === 'completed').length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No completed sessions yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {readings.filter(r => r.status === 'completed').map(r => (
                  <div key={r.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">Client #{r.client_id.slice(0, 8)}</p>
                        <p className="text-gray-400 text-xs">{new Date(r.started_at).toLocaleDateString()} &middot; {Math.round((new Date(r.ended_at!).getTime() - new Date(r.started_at).getTime()) / 60000)} min</p>
                      </div>
                      <p className="text-green-400 font-semibold">${(r.reader_earnings / 100).toFixed(2)}</p>
                    </div>
                    {r.client_review && (
                      <div className="text-yellow-400 text-sm">
                        {'\u2605'.repeat(r.client_review.rating)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Received */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
            <h2 className="text-xl font-semibold text-purple-200 mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 py-6 text-center">No reviews yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reviews.map((review, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-yellow-400">{'\u2605'.repeat(review.rating)}</div>
                      <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{review.comment}</p>
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
