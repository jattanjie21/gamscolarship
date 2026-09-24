import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Seo from '../../components/Seo.jsx';
import { useAdminAuth } from './AdminAuth.jsx';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAdminAuth();
  const convex = useConvex();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await convex.query(api.admin.login, {
        username: username.trim(),
        password,
      });
      if (!result?.ok) {
        setError('Invalid username or password.');
        return;
      }
      login(username.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Login failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Admin Login — GamScholarship" description="Private admin login." noIndex />
      <div className="admin-login-page">
        <div className="admin-login-panel">
          <div className="admin-login-brand">
            <span className="admin-login-mark">GS</span>
            <div>
              <p className="admin-login-kicker">GamScholarship</p>
              <h1>Admin sign in</h1>
            </div>
          </div>
          <p className="admin-login-copy">Sign in to review listings and manage the catalogue.</p>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label htmlFor="admin-username">
              Username
              <input
                id="admin-username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
            <label htmlFor="admin-password">
              Password
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <div className="admin-error" role="alert">{error}</div>}
            <button type="submit" className="btn btn-primary admin-login-submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
