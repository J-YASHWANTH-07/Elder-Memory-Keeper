/**
 * Single entry point for data access. Chooses the live FastAPI server or the
 * demo-mode mock based on settings, and falls back to demo automatically when
 * the server cannot be reached (mode "auto").
 */
import { mockApi } from './mock';

const TIMEOUT_MS = 4000;

const config = {
  baseUrl: 'http://localhost:8000',
  mode: 'auto',          // 'auto' | 'server' | 'demo'
  token: null,
  usingDemo: false,
  onSourceChange: () => {},
};

export function configureApi(partial) {
  Object.assign(config, partial);
}

export function isUsingDemo() {
  return config.mode === 'demo' || config.usingDemo;
}

function setUsingDemo(value) {
  if (config.usingDemo !== value) {
    config.usingDemo = value;
    config.onSourceChange(isUsingDemo());
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.detail || 'Something went wrong', res.status);
    setUsingDemo(false);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/** Runs the live call, or the mock when demo mode is on or the server is unreachable. */
async function withFallback(live, mock) {
  if (config.mode === 'demo') return mock();
  try {
    return await live();
  } catch (err) {
    const serverReplied = err instanceof ApiError;
    if (serverReplied || config.mode === 'server') throw err;
    setUsingDemo(true);
    return mock();
  }
}

export const api = {
  requestOtp: (mobile) =>
    withFallback(
      () => request('/auth/request-otp', { method: 'POST', body: { mobile } }),
      () => mockApi.requestOtp(mobile),
    ),
  verifyOtp: (mobile, otp) =>
    withFallback(
      () => request('/auth/verify-otp', { method: 'POST', body: { mobile, otp } }),
      () => mockApi.verifyOtp(mobile, otp),
    ),
  getMedicines: () => withFallback(() => request('/medicines'), () => mockApi.getMedicines()),
  getToday: () => withFallback(() => request('/schedule/today'), () => mockApi.getToday()),
  markTaken: (id) =>
    withFallback(() => request(`/doses/${id}/taken`, { method: 'POST' }), () => mockApi.markDose(id, 'taken')),
  markSkipped: (id) =>
    withFallback(() => request(`/doses/${id}/skip`, { method: 'POST' }), () => mockApi.markDose(id, 'skipped')),
  getHistory: () => withFallback(() => request('/history'), () => mockApi.getHistory()),
};
