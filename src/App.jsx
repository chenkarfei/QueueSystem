import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { useAuth } from './hooks/useAuth';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import CustomerBooking from './pages/customer/CustomerBooking';
import CustomerTracker from './pages/customer/CustomerTracker';
import DisplayBoard from './pages/display/DisplayBoard';
import CounterView from './pages/counter/CounterView';
import Dashboard from './pages/admin/Dashboard';
import QueueMonitor from './pages/admin/QueueMonitor';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/settings/Settings';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueueProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/queue" element={<CustomerBooking />} />
            <Route path="/queue/track" element={<CustomerTracker />} />
            <Route path="/display" element={<DisplayBoard />} />
            
            {/* Login */}
            <Route path="/" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<Layout />}>
              <Route 
                path="/counter" 
                element={
                  <ProtectedRoute allowedRoles={['counter', 'admin']}>
                    <CounterView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/monitor" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <QueueMonitor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reports" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
