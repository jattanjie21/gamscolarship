import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuth.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminQueue from './AdminQueue.jsx';
import './Admin.css';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="queue" element={<AdminQueue />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
