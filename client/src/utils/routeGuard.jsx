import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function RequireAuth({ children }) {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RequireGuest({ children }) {
  const { user, loading } = useApp();

  if (loading) {
    return null; // or a loading spinner
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function RequireRole({ children, role }) {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}