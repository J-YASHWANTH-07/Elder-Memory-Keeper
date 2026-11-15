import BigButton from './BigButton';
import StatusBadge from './StatusBadge';
import { formatTime } from '../utils/time';

/** One medicine dose with its status and, when actionable, Taken / Skip buttons. */
export default function DoseCard({ dose, onTaken, onSkipped }) {
  const actionable = dose.status === 'due' || dose.status === 'upcoming' || dose.status === 'missed';
  return (
    <div className="card card--accent dose" style={{ borderLeftColor: dose.color }}>
      <div className="dose__row">
        <span className="dose__time">{formatTime(dose.time)}</span>
        <StatusBadge status={dose.status} />
      </div>
      <div>
        <p className="dose__name">{dose.name}</p>
        <p className="dose__meta">{dose.dose} · {dose.instruction}</p>
      </div>
      {actionable && (
        <div className="dose__actions">
          <BigButton variant="success" onClick={() => onTaken(dose.id)}>✓ Taken</BigButton>
          {dose.status !== 'missed' && (
            <BigButton variant="secondary" onClick={() => onSkipped(dose.id)}>Skip</BigButton>
          )}
        </div>
      )}
    </div>
  );
}
