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
}

interface Profile {
  full_name: string;
  role: string;
  balance: number;
  avatar_url: string | null;
}

export default function Dashboard() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${(supabase.auth as any)._session?.access_token}` } }).then(r => r.json()),
      fetch('/api/user/readings', { headers: { 'Authorization': `Bearer ${(supabase.auth as any)._session?.access_token}` } }).then(r => r.json()),
    ]).then(([profileData, readingsData]) => {
      setProfile(profileData.profile);
      setReadings(readingsData.readings || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-purple-300">My Dashboard</h1>
            <p className="text-gray-400">{profile?.full_name} &middot; <span className="capitalize">{profile?.role}</span></p>
          </div>
          <button onClick={handleSignOut} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-gray-400 transition text-sm">
            Sign Out
          </button>
        </div>

        {/* Balance */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-purple-900/40">
          <p className="text-gray-400 text-sm mb-1">Account Balance</p>
          <p className="text-3xl font-bold text-green-400">${((profile?.balance || 0) / 100).toFixed(2)}</p>
          <Link to="/add-funds" className="text-purple-400 text-sm hover:text-purple-300 mt-2 inline-block">+ Add Funds</Link>
        </div>

        {/* Reader panel */}
        {profile?.role === 'reader' && (
          <div className="bg-purple-900/20 rounded-2xl p-6 mb-6 border border-purple-700/40">
            <h2 className="text-xl font-semibold mb-3 text-purple-200">Reader Controls</h2>
            <div className="flex gap-3">
              <Link to="/reader/settings" className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm">Settings</Link>
              <Link to="/reader/earnings" className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm">Earnings</Link>
            </div>
          </div>
        )}

        {/* Admin panel */}
        {profile?.role === 'admin' && (
          <div className="bg-yellow-900/20 rounded-2xl p-6 mb-6 border border-yellow-700/40">
            <h2 className="text-xl font-semibold mb-3 text-yellow-200">Admin Panel</h2>
            <Link to="/admin" className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg text-sm">Go to Admin</Link>
          </div>
        )}

        {/* Reading history */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40">
          <h2 className="text-xl font-semibold mb-4 text-purple-200">Reading History</h2>
          {readings.length === 0 ? (
            <p className="text-gray-500">No readings yet. <Link to="/browse" className="text-purple-400">Browse readers</Link></p>
          ) : (
            <div className="space-y-3">
              {readings.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{r.reader?.full_name}</p>
                    <p className="text-gray-400 text-sm">{new Date(r.started_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400">${(r.total_cost / 100).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 capitalize">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
