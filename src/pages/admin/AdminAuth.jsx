import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'gs_admin_session';
const AdminAuthContext = createContext(null);

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.username || !parsed?.adminKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession());

  const login = useCallback((username, adminKey) => {
    const next = { username, adminKey };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      username: session?.username || '',
      adminKey: session?.adminKey || '',
      login,
      logout,
    }),
    [session, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
