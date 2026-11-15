import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { configureApi } from '../api/client';

const KEY = 'emk_settings';
const DEFAULTS = {
  apiUrl: 'http://localhost:8000',
  dataMode: 'auto',        // auto | server | demo
  textSize: 'normal',      // normal | large | xl
  highContrast: false,
};

function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return DEFAULTS; }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);
  const [usingDemo, setUsingDemo] = useState(settings.dataMode === 'demo');

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
    configureApi({ baseUrl: settings.apiUrl.replace(/\/$/, ''), mode: settings.dataMode, onSourceChange: setUsingDemo });
    setUsingDemo(settings.dataMode === 'demo');
    document.documentElement.dataset.text = settings.textSize;
    document.documentElement.dataset.contrast = settings.highContrast ? 'high' : 'normal';
  }, [settings]);

  const value = useMemo(
    () => ({ settings, usingDemo, update: (patch) => setSettings((s) => ({ ...s, ...patch })) }),
    [settings, usingDemo],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
