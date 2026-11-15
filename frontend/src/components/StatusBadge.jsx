const LABELS = { taken: '✓ Taken', missed: '✗ Missed', skipped: 'Skipped', due: '⏰ Due now', upcoming: 'Upcoming' };

export default function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{LABELS[status] || status}</span>;
}
