import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center py-32 px-4 bg-gradient-to-b from-purple-900/40 to-gray-950">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          SoulSeer
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl">
          Connect with gifted psychic readers for live, pay-per-minute guidance.
        </p>
        <p className="text-gray-400 mb-10 max-w-xl">
          Chat or video call with verified spiritual advisors anytime. Your first session starts in seconds.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/browse"
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold text-lg transition"
          >
            Browse Readers
          </Link>
          {!user && (
            <Link
              to="/signup"
              className="px-8 py-3 border border-purple-500 hover:bg-purple-900/30 rounded-full font-semibold text-lg transition"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-purple-300">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔮', title: 'Choose a Reader', desc: 'Browse profiles, specialties, and reviews to find your perfect match.' },
            { icon: '💬', title: 'Start a Session', desc: 'Connect instantly via chat or video. Pay only for the time you use.' },
            { icon: '✨', title: 'Gain Clarity', desc: 'Receive guidance on love, career, spirituality, and more.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-900 rounded-2xl p-8 text-center border border-purple-900/50">
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-purple-200">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-16 px-4 bg-purple-900/20 text-center">
        <h2 className="text-3xl font-bold mb-4 text-purple-300">Join Our Community</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Share experiences, ask questions, and connect with like-minded seekers in the SoulSeer community forum.
        </p>
        <Link
          to="/community"
          className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-semibold text-lg transition"
        >
          Visit Community
        </Link>
      </section>
    </div>
  );
}
