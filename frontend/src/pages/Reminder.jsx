import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BigButton from '../components/BigButton';
import { useSchedule } from '../context/ScheduleContext';
import { formatTime } from '../utils/time';

/** Full-screen prompt shown when a dose is due. */
export default function Reminder() {
  const { doseId } = useParams();
  const { schedule, markTaken, markSkipped, snooze } = useSchedule();
  const navigate = useNavigate();
  const dose = schedule?.doses.find((d) => d.id === doseId);

  // Leave the screen once the dose is no longer actionable (taken / skipped elsewhere).
  useEffect(() => {
    if (schedule && (!dose || dose.status === 'taken' || dose.status === 'skipped')) navigate('/', { replace: true });
  }, [schedule, dose, navigate]);

  if (!dose) return null;

  const finish = async (action) => {
    await action(dose.id);
    navigate('/', { replace: true });
  };

  return (
    <main className="page page--full reminder">
      <p className="reminder__clock">{formatTime(dose.time)}</p>
      <h1>Time for your medicine</h1>
      <div className="reminder__pill" style={{ background: dose.color, color: '#fff' }} aria-hidden="true">💊</div>
      <div>
        <p className="dose__name" style={{ fontSize: '1.8rem' }}>{dose.name}</p>
        <p className="dose__meta" style={{ fontSize: '1.15rem' }}>{dose.dose}</p>
        <p className="dose__meta" style={{ fontSize: '1.15rem' }}>{dose.instruction}</p>
      </div>
      <div className="stack">
        <BigButton variant="success" tall onClick={() => finish(markTaken)}>✓ I took it</BigButton>
        <BigButton variant="secondary" onClick={() => { snooze(dose.id); navigate('/', { replace: true }); }}>
          ⏰ Remind me in 10 minutes
        </BigButton>
        <BigButton variant="danger" onClick={() => finish(markSkipped)}>Skip this dose</BigButton>
      </div>
    </main>
  );
}
