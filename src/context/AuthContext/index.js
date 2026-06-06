import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { login as svcLogin, signup as svcSignup, logout as svcLogout } from '../../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [isLoading, setLoading]   = useState(true);  // true only during initial session rehydration
  const [authBusy, setAuthBusy]   = useState(false);  // true during login/signup API calls
  const [error, setError]         = useState(null);

  // ── Rehydrate session from localStorage on mount ──────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('flowpilot_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem('flowpilot_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // ── login ─────────────────────────────────────────────────────────────────
  // Uses authBusy (not isLoading) so PublicRoute never unmounts during submit
  const login = useCallback(async (email, password) => {
    setAuthBusy(true);
    setError(null);
    try {
      const u = await svcLogin(email, password);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  // ── signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    setAuthBusy(true);
    setError(null);
    try {
      const u = await svcSignup(name, email, password);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    svcLogout();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,               // session rehydration only
      authBusy,                // login/signup in-progress
      error,
      login,
      signup,
      logout,
      clearError,
    }),
    [user, isLoading, authBusy, error, login, signup, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
