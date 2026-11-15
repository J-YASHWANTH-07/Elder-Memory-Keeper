import { useState } from 'react';
import BigButton from '../components/BigButton';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

function Toggle({ options, value, onChange }) {
  return (
    <div className="toggle" role="group">
      {options.map((opt) => (
        <BigButton key={opt.value} variant="secondary" className={value === opt.value ? 'btn--on' : ''} onClick={() => onChange(opt.value)} aria-pressed={value === opt.value}>
          {opt.label}
        </BigButton>
      ))}
    </div>
  );
}

export default function Settings() {
  const { settings, update, usingDemo } = useSettings();
  const { user, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState(settings.apiUrl);

  return (
    <main className="page">
      <PageHeader title="Settings" subtitle={user ? `Logged in as ${user.mobile}` : ''} />

      <section className="card stack">
        <h2>Text size</h2>
        <Toggle
          value={settings.textSize}
          onChange={(textSize) => update({ textSize })}
          options={[{ value: 'normal', label: 'A' }, { value: 'large', label: 'A+' }, { value: 'xl', label: 'A++' }]}
        />
      </section>

      <section className="card stack">
        <h2>High contrast</h2>
        <Toggle
          value={settings.highContrast}
          onChange={(highContrast) => update({ highContrast })}
          options={[{ value: false, label: 'Off' }, { value: true, label: 'On' }]}
        />
      </section>

      <section className="card stack">
        <h2>Data source</h2>
        <p className="hint">Currently using: <strong>{usingDemo ? 'Demo data' : 'Server'}</strong></p>
        <Toggle
          value={settings.dataMode}
          onChange={(dataMode) => update({ dataMode })}
          options={[{ value: 'auto', label: 'Auto' }, { value: 'server', label: 'Server' }, { value: 'demo', label: 'Demo' }]}
        />
        <label className="label" htmlFor="apiUrl">Server address</label>
        <input id="apiUrl" className="input" style={{ letterSpacing: 0, fontSize: '1rem' }} value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="http://192.168.1.10:8000" />
        <BigButton variant="secondary" disabled={apiUrl === settings.apiUrl} onClick={() => update({ apiUrl: apiUrl.trim() })}>Save address</BigButton>
        <p className="hint">On the phone, enter your laptop's Wi-Fi IP address instead of localhost.</p>
      </section>

      <BigButton variant="danger" onClick={logout}>Log out</BigButton>
    </main>
  );
}
