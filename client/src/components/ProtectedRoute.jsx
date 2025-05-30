// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';
import './ProtectedRoute.css';

export default function ProtectedRoute() {
  const context = useContext(AppContext);

  if (!context) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner />
        <p>Initializing application...</p>
      </div>
    );
  }

  const { user, loading } = context;

  if (loading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
