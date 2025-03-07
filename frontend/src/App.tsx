import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Register from './pages/Register';

// Lazy load components
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Suppliers = React.lazy(() => import('./pages/Suppliers'));
const PurchaseOrders = React.lazy(() => import('./pages/PurchaseOrders'));
const Payments = React.lazy(() => import('./pages/Payments'));
const Users = React.lazy(() => import('./pages/Users'));
const AuditLogs = React.lazy(() => import('./pages/AuditLogs'));

function App() {
  return (
    <Provider store={store}>
      <Router>
        <React.Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="purchase-orders" element={<PurchaseOrders />} />
              <Route path="payments" element={<Payments />} />
              <Route path="users" element={<Users />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </Provider>
  );
}

export default App;