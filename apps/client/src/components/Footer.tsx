import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-purple-900/30 text-gray-400 py-10 px-4 mt-auto">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">SoulSeer</h3>
          <p className="text-sm">Live psychic readings. Transparent pricing. Genuine guidance.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/browse" className="hover:text-white transition">Browse Readers</Link></li>
            <li><Link to="/community" className="hover:text-white transition">Community</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About</Link></li>
            <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
            <li><Link to="/signup" className="hover:text-white transition">Create Account</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-purple-900/20 text-center text-xs">
        <p>&copy; {new Date().getFullYear()} SoulSeer. All rights reserved.</p>
        <p className="mt-1">For entertainment purposes. Must be 18+.</p>
      </div>
    </footer>
  );
}
