import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { useAdminAuth } from './AdminAuth.jsx';

export default function AdminLayout() {
  const { isAuthenticated, username, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <>
      <Seo title="Admin — GamScholarship" description="Private admin dashboard." noIndex />
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <span className="admin-login-mark">GS</span>
            <div>
              <strong>Admin</strong>
              <span>GamScholarship</span>
            </div>
          </div>
          <nav className="admin-nav" aria-label="Admin">
            <NavLink to="/admin" end>
              Overview
            </NavLink>
            <NavLink to="/admin/queue">Review queue</NavLink>
          </nav>
          <div className="admin-sidebar-footer">
            <p className="admin-user">Signed in as <strong>{username}</strong></p>
            <button type="button" className="btn btn-outline-dark admin-logout" onClick={handleLogout}>
              Sign out
            </button>
            <a className="admin-back-link" href="/" target="_blank" rel="noreferrer">
              View public site ↗
            </a>
          </div>
        </aside>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </>
  );
}
