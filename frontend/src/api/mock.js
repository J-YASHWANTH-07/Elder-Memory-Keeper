/**
 * Demo-mode data source. Mirrors the FastAPI backend so the app works
 * without a server. State lives in memory plus localStorage for the dose log.
 */
import { todayIso } from '../utils/time';

const DEMO_OTP = '123456';
const DUE_WINDOW_MIN = 15;
const GRACE_MIN = 60;
const LOG_KEY = 'emk_demo_dose_log';

const MEDICINES = [
  { id: 'm1', name: 'Metformin', dose: '500 mg · 1 tablet', instruction: 'Take with breakfast', times: ['08:00', '20:00'], color: '#2563EB' },
  { id: 'm2', name: 'Amlodipine', dose: '5 mg · 1 tablet', instruction: 'Take after food', times: ['09:00'], color: '#059669' },
  { id: 'm3', name: 'Vitamin D3', dose: '1 capsule', instruction: 'Take with lunch', times: ['13:00'], color: '#D97706' },
  { id: 'm4', name: 'Atorvastatin', dose: '10 mg · 1 tablet', instruction: 'Take before sleep', times: ['21:30'], color: '#7C3AED' },
];

function readLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || {}; } catch { return {}; }
}
function writeLog(log) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch { /* ignore */ }
}

function period(time) {
  const h = Number(time.slice(0, 2));
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 20) return 'Evening';
  return 'Night';
}

function status(log, dayIso, doseId, time, now) {
  const logged = log[`${dayIso}|${doseId}`];
  if (logged) return logged;
  const [h, m] = time.split(':').map(Number);
  const scheduled = new Date(`${dayIso}T00:00:00`);
  scheduled.setHours(h, m, 0, 0);
  const diffMin = (now - scheduled) / 60000;
  if (diffMin > GRACE_MIN) return 'missed';
  if (diffMin >= -DUE_WINDOW_MIN) return 'due';
  return 'upcoming';
}

function dosesFor(dayIso, now = new Date()) {
  const log = readLog();
  return MEDICINES.flatMap((med) =>
    med.times.map((time) => ({
      id: `${med.id}-${time}`,
      medicine_id: med.id,
      name: med.name,
      dose: med.dose,
      instruction: med.instruction,
      time,
      period: period(time),
      status: status(log, dayIso, `${med.id}-${time}`, time, now),
      color: med.color,
    })),
  ).sort((a, b) => a.time.localeCompare(b.time));
}

function buildToday() {
  const date = todayIso();
  const doses = dosesFor(date);
  const pending = doses
    .filter((d) => d.status === 'due' || d.status === 'upcoming')
    .sort((a, b) => (a.status !== 'due') - (b.status !== 'due') || a.time.localeCompare(b.time));
  return {
    date,
    doses,
    taken: doses.filter((d) => d.status === 'taken').length,
    total: doses.length,
    next_dose: pending[0] || null,
  };
}

/** Seed a realistic past week once so History is not empty. */
function seedHistory() {
  const log = readLog();
  if (log.__seeded) return;
  const pattern = [5, 4, 5, 3, 5, 4];
  const allIds = MEDICINES.flatMap((m) => m.times.map((t) => `${m.id}-${t}`)).sort();
  pattern.forEach((count, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i + 1));
    const iso = d.toISOString().slice(0, 10);
    allIds.slice(0, count).forEach((id) => { log[`${iso}|${id}`] = 'taken'; });
  });
  log.__seeded = true;
  writeLog(log);
}
seedHistory();

const delay = (ms = 150) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async requestOtp(mobile) {
    await delay();
    return { message: `OTP sent to ${mobile}. Demo OTP is ${DEMO_OTP}.` };
  },
  async verifyOtp(mobile, otp) {
    await delay();
    if (otp !== DEMO_OTP) throw new Error('Wrong OTP. Please try again.');
    return { token: 'demo-token', user: { name: 'Lakshmi', mobile } };
  },
  async getMedicines() {
    await delay();
    return MEDICINES;
  },
  async getToday() {
    await delay();
    return buildToday();
  },
  async markDose(doseId, outcome) {
    await delay();
    const log = readLog();
    log[`${todayIso()}|${doseId}`] = outcome;
    writeLog(log);
    return buildToday();
  },
  async getHistory() {
    await delay();
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      const iso = d.toISOString().slice(0, 10);
      const doses = dosesFor(iso);
      const label = offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : d.toLocaleDateString(undefined, { weekday: 'long' });
      days.push({
        date: iso,
        label,
        taken: doses.filter((x) => x.status === 'taken').length,
        missed: doses.filter((x) => x.status === 'missed' || x.status === 'skipped').length,
        total: doses.length,
      });
    }
    return { days };
  },
};
