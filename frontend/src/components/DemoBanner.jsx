import { useSettings } from '../context/SettingsContext';

/** Shown whenever the app is serving built-in demo data instead of the server. */
export default function DemoBanner() {
  const { usingDemo, settings } = useSettings();
  if (!usingDemo) return null;
  const reason = settings.dataMode === 'demo' ? 'Demo mode is on.' : 'Server not reachable, showing demo data.';
  return <div className="banner" role="status">{reason}</div>;
}
