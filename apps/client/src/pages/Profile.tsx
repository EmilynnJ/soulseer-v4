import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ReaderProfile {
  id: string;
  full_name: string;
  bio: string;
  specialties: string[];
  rate_per_minute: number;
  is_online: boolean;
  avatar_url: string | null;
  rating_avg: number;
  reading_count: number;
}

export default function Profile() {
  const { readerId } = useParams<{ readerId: string }>();
  const [profile, setProfile] = useState<ReaderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!readerId) return;
    fetch(`/api/readers/${readerId}`)
      .then(r => r.json())
      .then(data => { setProfile(data.reader); setLoading(false); })
      .catch(() => setLoading(false));
  }, [readerId]);

  const handleConnect = () => {
    if (!user) { navigate('/login'); return; }
    navigate(`/session/${readerId}`);
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!profile) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Reader not found.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 border border-purple-900/40">
          <div className="flex items-center gap-6 mb-6">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-800 flex items-center justify-center text-4xl">🔮</div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-purple-200">{profile.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${profile.is_online ? 'bg-green-400' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-400">{profile.is_online ? 'Online' : 'Offline'}</span>
              </div>
              <p className="text-yellow-400 mt-1">
                {'\u2605'.repeat(Math.round(profile.rating_avg || 0))}
                <span className="text-gray-400 text-sm ml-1">({profile.reading_count} readings)</span>
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-purple-300 mb-2">About</h2>
            <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-purple-300 mb-2">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {profile.specialties?.map(s => (
                <span key={s} className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rate</p>
              <p className="text-2xl font-bold text-purple-300">${(profile.rate_per_minute / 100).toFixed(2)}<span className="text-sm font-normal text-gray-400">/min</span></p>
            </div>
            <button
              onClick={handleConnect}
              disabled={!profile.is_online}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full font-semibold text-lg transition"
            >
              {profile.is_online ? 'Start Session' : 'Offline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
