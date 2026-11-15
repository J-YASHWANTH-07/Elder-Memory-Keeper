import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import { SettingsProvider } from './context/SettingsContext';
import History from './pages/History';
import Home from './pages/Home';
import Login from './pages/Login';
import Reminder from './pages/Reminder';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';

/** Redirects to the Reminder screen whenever a dose becomes due. */
function ReminderWatcher() {
  const { dueDose } = useSchedule();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (dueDose && !pathname.startsWith('/reminder')) navigate(`/reminder/${dueDose.id}`);
  }, [dueDose, pathname, navigate]);
  return null;
}

function ProtectedLayout() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <ScheduleProvider>
      <ReminderWatcher />
      <Outlet />
    </ScheduleProvider>
  );
}

function WithNav() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/reminder/:doseId" element={<Reminder />} />
              <Route element={<WithNav />}>
                <Route path="/" element={<Home />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  );
}
