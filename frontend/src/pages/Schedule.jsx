import DemoBanner from '../components/DemoBanner';
import DoseCard from '../components/DoseCard';
import PageHeader from '../components/PageHeader';
import { useSchedule } from '../context/ScheduleContext';

const PERIODS = ['Morning', 'Afternoon', 'Evening', 'Night'];

export default function Schedule() {
  const { schedule, error, loading, markTaken, markSkipped } = useSchedule();

  return (
    <main className="page">
      <PageHeader title="Today's medicines" subtitle={schedule ? `${schedule.taken} of ${schedule.total} taken` : ''} />
      <DemoBanner />
      {error && <p className="error" role="alert">{error}</p>}
      {loading && !schedule && <p className="hint">Loading…</p>}

      {schedule && PERIODS.map((period) => {
        const doses = schedule.doses.filter((d) => d.period === period);
        if (doses.length === 0) return null;
        return (
          <section key={period} className="stack">
            <p className="section-title">{period}</p>
            {doses.map((dose) => (
              <DoseCard key={dose.id} dose={dose} onTaken={markTaken} onSkipped={markSkipped} />
            ))}
          </section>
        );
      })}
    </main>
  );
}
