import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    if (!profile) {
      // Still loading profile
      return;
    }

    switch (profile.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'reader':
        navigate('/reader');
        break;
      case 'client':
      default:
        navigate('/client');
        break;
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      Redirecting...
    </div>
  );
}
