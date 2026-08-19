// 📁 frontend/src/router.tsx
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
    element: <OwnerDashboard />, // Temporarily direct access without guard for testing
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);