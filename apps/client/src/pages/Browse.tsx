import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Reader {
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

export default function Browse() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    fetch('/api/readers')
      .then(r => r.json())
      .then(data => { setReaders(data.readers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = readers.filter(r =>
    !filter || r.specialties.some(s => s.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleConnect = (readerId: string) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/session/${readerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-purple-300">Browse Readers</h1>
        <p className="text-gray-400 mb-8">Connect with a psychic advisor for live, pay-per-minute guidance.</p>

        <input
          type="text"
          placeholder="Filter by specialty (e.g. tarot, love, career)"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-md bg-gray-800 border border-purple-700 rounded-lg px-4 py-2 mb-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
        />

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading readers...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-20">No readers found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(reader => (
              <div key={reader.id} className="bg-gray-900 rounded-2xl p-6 border border-purple-900/40 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {reader.avatar_url ? (
                      <img src={reader.avatar_url} alt={reader.full_name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-purple-800 flex items-center justify-center text-2xl">🔮</div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${reader.is_online ? 'bg-green-400' : 'bg-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">{reader.full_name}</h3>
                    <p className="text-yellow-400 text-sm">{'★'.repeat(Math.round(reader.rating_avg || 0))} <span className="text-gray-400">({reader.reading_count})</span></p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3 flex-1">{reader.bio?.slice(0, 100)}...</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {reader.specialties?.map(s => (
                    <span key={s} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold">${(reader.rate_per_minute / 100).toFixed(2)}/min</span>
                  <button
                    onClick={() => handleConnect(reader.id)}
                    disabled={!reader.is_online}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
                  >
                    {reader.is_online ? 'Connect' : 'Offline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
