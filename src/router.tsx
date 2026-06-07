import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CustomerPage } from './pages/CustomerPage';
import { LoginPage } from './pages/LoginPage';
import { ChefDashboard } from './pages/ChefDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OwnerDashboard } from './pages/OwnerDashboard';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <CustomerPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/chef',
    element: (
      <ProtectedRoute allowedRoles={['CHEF']}>
        <ChefDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/owner',
    element: (
      <ProtectedRoute allowedRoles={['OWNER']}>
        {/* Placeholder for Day 5 Owner view */}
        <OwnerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    // ↩️ Catch-all redirect fallback to send any broken URLs straight back home
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);