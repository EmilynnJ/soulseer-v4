import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Props {
  requiredRole?: 'client' | 'reader' | 'admin';
}

export default function ProtectedRoute({ requiredRole }: Props) {
  const { user, profile } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // Admin can access everything
    if (profile?.role === 'admin') return <Outlet />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
