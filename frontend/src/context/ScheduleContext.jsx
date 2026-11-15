import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const POLL_MS = 60_000;
const SNOOZE_MS = 10 * 60_000;
const ScheduleContext = createContext(null);

export function ScheduleProvider({ children }) {
  const { isLoggedIn, logout } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const snoozed = useRef({});          // doseId -> timestamp until which the reminder is hidden

  const handleError = useCallback((err) => {
    if (err.status === 401) logout();
    setError(err.message || 'Could not load schedule');
  }, [logout]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSchedule(await api.getToday());
      setError('');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    if (!isLoggedIn) { setSchedule(null); return undefined; }
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [isLoggedIn, refresh]);

  const act = useCallback(async (fn) => {
    try {
      setSchedule(await fn());
      setError('');
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const markTaken = useCallback((id) => act(() => api.markTaken(id)), [act]);
  const markSkipped = useCallback((id) => act(() => api.markSkipped(id)), [act]);
  const snooze = useCallback((id) => { snoozed.current[id] = Date.now() + SNOOZE_MS; }, []);

  /** First due dose that is not snoozed, used to pop the Reminder screen. */
  const dueDose = useMemo(() => {
    if (!schedule) return null;
    const now = Date.now();
    return schedule.doses.find((d) => d.status === 'due' && (snoozed.current[d.id] || 0) < now) || null;
  }, [schedule]);

  const value = useMemo(
    () => ({ schedule, dueDose, error, loading, refresh, markTaken, markSkipped, snooze }),
    [schedule, dueDose, error, loading, refresh, markTaken, markSkipped, snooze],
  );
  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
