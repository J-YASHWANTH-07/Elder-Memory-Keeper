import { useEffect, useState } from 'react';
import { api } from '../api/client';
import DemoBanner from '../components/DemoBanner';
import PageHeader from '../components/PageHeader';
import { useSchedule } from '../context/ScheduleContext';

export default function History() {
  const { schedule } = useSchedule();
  const [days, setDays] = useState(null);
  const [error, setError] = useState('');

  // Reload whenever today's schedule changes so counts stay in sync.
  useEffect(() => {
    api.getHistory().then((res) => setDays(res.days)).catch((err) => setError(err.message));
  }, [schedule]);

  const taken = days?.reduce((sum, d) => sum + d.taken, 0) ?? 0;
  const missed = days?.reduce((sum, d) => sum + d.missed, 0) ?? 0;

  return (
    <main className="page">
      <PageHeader title="Last 7 days" subtitle={days ? `${taken} taken · ${missed} missed` : ''} />
      <DemoBanner />
      {error && <p className="error" role="alert">{error}</p>}
      {days && (
        <section className="card">
          {days.map((day) => (
            <div key={day.date} className="history-row">
              <span className="history-row__label">{day.label}</span>
              <span className="badge badge--taken">✓ {day.taken}</span>
              <span className={`badge ${day.missed ? 'badge--missed' : 'badge--upcoming'}`}>✗ {day.missed}</span>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
