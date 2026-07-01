import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/api';
import { StarIcon } from '../components/icons/StarIcon';

interface Reader {
  id: number;
  fullName: string;
  username: string;
  bio: string;
  specialties: string[];
  profileImage: string;
  pricingChat: number;
  pricingVoice: number;
  pricingVideo: number;
  isOnline: boolean;
  rating?: number;
  reviewCount?: number;
}

interface Review {
  id: number;
  rating: number;
  review: string;
  createdAt: string;
  clientName: string;
}

export default function ReaderProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reader, setReader] = useState<Reader | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    const fetchReader = async () => {
      try {
        const data = await apiClient.get(`/readers/${id}`);
        setReader(data.reader);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Failed to load reader:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReader();
  }, [id]);

  const handleStartReading = async (type: 'chat' | 'voice' | 'video') => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setStarting(type);
      const data = await apiClient.post('/readings/on-demand', { readerId: parseInt(id!), type });
      navigate(`/reading/${data.reading.id}`);
    } catch (err: any) {
      const msg = err.message || 'Failed to start reading';
      if (msg.includes('balance')) {
        navigate('/dashboard?tab=add-funds');
      } else {
        alert(msg);
      }
    } finally {
      setStarting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
      <div className="text-white text-xl" style={{ fontFamily: 'Playfair Display' }}>Loading...</div>
    </div>
  );

  if (!reader) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
      <div className="text-white text-xl">Reader not found</div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F', color: 'white' }}>
      {/* Header */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #13111A 0%, #1a0f2e 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4" style={{ borderColor: '#D4AF37' }}>
                {reader.profileImage ? (
                  <img src={reader.profileImage} alt={reader.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: '#13111A' }}>
                    <span style={{ fontSize: 64 }}>🔮</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{ fontFamily: 'Alex Brush', fontSize: 42, color: '#FF69B4' }}>{reader.fullName}</h1>
                {reader.isOnline && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{ background: '#1a3a1a', color: '#4ade80', border: '1px solid #4ade80' }}>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </span>
                )}
              </div>
              <p style={{ color: '#D4AF37', fontFamily: 'Playfair Display', marginBottom: 8 }}>@{reader.username}</p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-4">
                {reader.specialties?.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full text-sm"
                    style={{ background: 'rgba(255,105,180,0.15)', color: '#FF69B4', border: '1px solid rgba(255,105,180,0.3)' }}>
                    {s}
                  </span>
                ))}
              </div>

              {/* Rating */}
              {reader.rating && (
                <div className="flex items-center gap-2 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <StarIcon key={star} filled={star <= Math.round(reader.rating!)} />
                  ))}
                  <span style={{ color: '#D4AF37' }}>({reader.reviewCount || 0} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Bio */}
          <div className="md:col-span-2">
            <h2 style={{ fontFamily: 'Alex Brush', fontSize: 28, color: '#FF69B4', marginBottom: 16 }}>About {reader.fullName}</h2>
            <p style={{ fontFamily: 'Playfair Display', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>{reader.bio}</p>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mt-8">
                <h2 style={{ fontFamily: 'Alex Brush', fontSize: 28, color: '#FF69B4', marginBottom: 16 }}>Client Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl" style={{ background: '#13111A', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map((star) => (
                            <StarIcon key={star} filled={star <= review.rating} size={16} />
                          ))}
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Playfair Display', color: 'rgba(255,255,255,0.8)' }}>{review.review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Panel */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl sticky top-4" style={{ background: '#13111A', border: '1px solid rgba(212,175,55,0.3)' }}>
              <h3 style={{ fontFamily: 'Alex Brush', fontSize: 24, color: '#FF69B4', marginBottom: 16 }}>Start a Reading</h3>

              {reader.pricingChat && reader.pricingChat > 0 && (
                <button
                  onClick={() => handleStartReading('chat')}
                  disabled={!reader.isOnline || starting !== null}
                  className="w-full py-3 px-4 rounded-xl mb-3 font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #FF69B4, #ff4081)', color: 'white' }}>
                  {starting === 'chat' ? 'Starting...' : `💬 Chat — $${(reader.pricingChat / 100).toFixed(2)}/min`}
                </button>
              )}

              {reader.pricingVoice && reader.pricingVoice > 0 && (
                <button
                  onClick={() => handleStartReading('voice')}
                  disabled={!reader.isOnline || starting !== null}
                  className="w-full py-3 px-4 rounded-xl mb-3 font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #b8960c)', color: 'white' }}>
                  {starting === 'voice' ? 'Starting...' : `🎙️ Voice — $${(reader.pricingVoice / 100).toFixed(2)}/min`}
                </button>
              )}

              {reader.pricingVideo && reader.pricingVideo > 0 && (
                <button
                  onClick={() => handleStartReading('video')}
                  disabled={!reader.isOnline || starting !== null}
                  className="w-full py-3 px-4 rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white' }}>
                  {starting === 'video' ? 'Starting...' : `📹 Video — $${(reader.pricingVideo / 100).toFixed(2)}/min`}
                </button>
              )}

              {!reader.isOnline && (
                <p className="text-center mt-3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  This reader is currently offline
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
