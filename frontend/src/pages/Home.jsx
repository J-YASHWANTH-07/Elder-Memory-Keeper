import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import DemoBanner from '../components/DemoBanner';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useSchedule } from '../context/ScheduleContext';
import { formatTime, greeting, longDate } from '../utils/time';

export default function Home() {
  const { user } = useAuth();
  const { schedule, error, markTaken } = useSchedule();
  const navigate = useNavigate();
  const next = schedule?.next_dose;
  const missed = schedule?.doses.filter((d) => d.status === 'missed') || [];

  return (
    <main className="page">
      <PageHeader title={`${greeting()}, ${user?.name || ''}`} subtitle={longDate()} />
      <DemoBanner />
      {error && <p className="error" role="alert">{error}</p>}

      {schedule && (
        <section className="card stack">
          <div className="row">
            <h2>Today's progress</h2>
            <span className="spacer" />
            <strong>{schedule.taken} of {schedule.total} taken</strong>
          </div>
          <ProgressBar value={schedule.taken} max={schedule.total} />
        </section>
      )}

      <p className="section-title">Next medicine</p>
      {next ? (
        <section className="card card--accent stack" style={{ borderLeftColor: next.color }}>
          <div className="dose__row">
            <span className="dose__time">{formatTime(next.time)}</span>
            <StatusBadge status={next.status} />
          </div>
          <p className="dose__name">{next.name}</p>
          <p className="dose__meta">{next.dose} · {next.instruction}</p>
          <BigButton variant="success" tall onClick={() => markTaken(next.id)}>✓ I took it</BigButton>
        </section>
      ) : (
        schedule && (
          <section className="card center stack">
            <span style={{ fontSize: '3rem' }} aria-hidden="true">🎉</span>
            <h2>All done for today!</h2>
          </section>
        )
      )}

      {missed.length > 0 && (
        <section className="card stack" style={{ borderColor: 'var(--color-danger)' }}>
          <h2 className="error">Missed today: {missed.length}</h2>
          <p className="hint">{missed.map((d) => `${d.name} at ${formatTime(d.time)}`).join(', ')}</p>
          <BigButton variant="danger" onClick={() => navigate('/schedule')}>See all medicines</BigButton>
        </section>
      )}
    </main>
  );
}
