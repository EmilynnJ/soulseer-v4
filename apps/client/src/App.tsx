import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BrowseReadersPage from './pages/BrowseReadersPage';
import ReaderProfilePage from './pages/ReaderProfilePage';
import AboutPage from './pages/AboutPage';
import CommunityPage from './pages/CommunityPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReadingSessionPage from './pages/ReadingSessionPage';
import HelpPage from './pages/HelpPage';

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(r => r.json()).then(profile => setProfile(profile)).catch(() => {});
      } else {
        setProfile(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowseReadersPage />} />
        <Route path="/reader/:id" element={<ReaderProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/session/:id" element={<RequireAuth><ReadingSessionPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
