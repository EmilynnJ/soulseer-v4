import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import Browse from './pages/Browse';
import ReaderProfile from './pages/ReaderProfile';
import About from './pages/About';
import Community from './pages/Community';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReadingSession from './pages/ReadingSession';
import Help from './pages/Help';

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/readers" element={<Browse />} />
        <Route path="/readers/:id" element={<ReaderProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/help" element={<Help />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/reading/:id"
          element={
            <RequireAuth>
              <ReadingSession />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
