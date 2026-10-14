// TC-007: Auth Guards & Protected Route Redirects Defect (FRN07)
// Protected route component renders children before auth validation finishes, leaking view.
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function ProtectedRoute({ auth }: { auth: AuthContextType }) {
  // Defect: Only checks !isAuthenticated, rendering Outlet while auth is still loading (auth.isLoading === true)
  if (!auth.isAuthenticated && !auth.isLoading) {
    return <Navigate to="/login" replace />;
  }

  // Defect: Unresolved session state renders protected child routes prematurely
  return <Outlet />;
}

