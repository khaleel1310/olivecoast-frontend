import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'CHEF' | 'OWNER'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, user } = useAuthStore();

  // 1. If the user is not authenticated at all, redirect to the staff login view
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If authenticated but trying to access a dashboard outside their role permissions
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'OWNER' ? '/owner' : '/chef'} replace />;
  }

  // 3. If credentials clear perfectly, allow passage to the dashboard
  return <>{children}</>;
};