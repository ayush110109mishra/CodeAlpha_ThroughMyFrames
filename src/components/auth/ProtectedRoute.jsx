import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Aperture } from 'lucide-react';

/**
 * ==============================================================================
 * ProtectedRoute Component
 * ==============================================================================
 * Guards routes that require user authentication (e.g. /upload).
 * - Displays a subtle spinner during initial auth hydration.
 * - Redirects unauthenticated visitors to /login, preserving the requested route in state
 *   so they can be smoothly redirected back after successful sign-in.
 */

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted">
        <Aperture className="w-8 h-8 animate-spin text-accent" />
        <span className="text-xs font-mono uppercase tracking-wider">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
