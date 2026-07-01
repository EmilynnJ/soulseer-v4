import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/browse', label: 'Browse' },
    { to: '/community', label: 'Community' },
    { to: '/about', label: 'About' },
    { to: '/help', label: 'Help' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-purple-900/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          SoulSeer
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm font-medium transition">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">Sign In</Link>
              <Link to="/signup" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-900 border-t border-purple-900/30 px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block text-sm font-medium py-1 ${
                  isActive ? 'text-purple-400' : 'text-gray-400'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-purple-400">Dashboard</Link>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-gray-400">Sign In</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-purple-400">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
