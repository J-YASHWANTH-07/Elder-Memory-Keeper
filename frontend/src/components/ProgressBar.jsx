export default function ProgressBar({ value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="progress__bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
