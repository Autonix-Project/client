import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { LinesPage } from './pages/LinesPage';
import { InventoryPage } from './pages/InventoryPage';
import { ShipmentsPage } from './pages/ShipmentsPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/orders',
    element: <ProtectedRoute><OrdersPage /></ProtectedRoute>,
  },
  {
    path: '/lines',
    element: <ProtectedRoute><LinesPage /></ProtectedRoute>,
  },
  {
    path: '/inventory',
    element: <ProtectedRoute><InventoryPage /></ProtectedRoute>,
  },
  {
    path: '/shipments',
    element: <ProtectedRoute><ShipmentsPage /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);