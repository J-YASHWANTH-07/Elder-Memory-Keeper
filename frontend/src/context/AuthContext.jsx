import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, configureApi } from '../api/client';

const KEY = 'emk_auth';
const AuthContext = createContext(null);

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(load);

  useEffect(() => {
    configureApi({ token: session?.token || null });
    try {
      if (session) localStorage.setItem(KEY, JSON.stringify(session));
      else localStorage.removeItem(KEY);
    } catch { /* ignore */ }
  }, [session]);

  const requestOtp = useCallback((mobile) => api.requestOtp(mobile), []);
  const verifyOtp = useCallback(async (mobile, otp) => {
    const data = await api.verifyOtp(mobile, otp);
    setSession(data);
    return data;
  }, []);
  const logout = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({ user: session?.user || null, isLoggedIn: Boolean(session), requestOtp, verifyOtp, logout }),
    [session, requestOtp, verifyOtp, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
