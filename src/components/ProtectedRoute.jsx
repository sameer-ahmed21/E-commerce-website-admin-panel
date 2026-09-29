import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-xl font-black uppercase tracking-tight">Access Denied</h1>
          <p className="text-sm text-slate-500">
            Your account doesn't have admin access. Log in with an admin account to use this dashboard.
          </p>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            Log out
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
