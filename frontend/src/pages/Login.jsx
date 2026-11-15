import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import DemoBanner from '../components/DemoBanner';
import { useAuth } from '../context/AuthContext';

const MOBILE_LEN = 10;
const OTP_LEN = 6;

export default function Login() {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const digits = (value, max) => value.replace(/\D/g, '').slice(0, max);

  async function sendOtp() {
    setBusy(true);
    setError('');
    try {
      const res = await requestOtp(mobile);
      setInfo(res.message);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtp() {
    setBusy(true);
    setError('');
    try {
      await verifyOtp(mobile, otp);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page page--full" style={{ justifyContent: 'center' }}>
      <div className="center stack">
        <span style={{ fontSize: '4rem' }} aria-hidden="true">💊</span>
        <h1>Elder Memory Keeper</h1>
        <p className="hint">Never miss your medicine</p>
      </div>
      <DemoBanner />

      {step === 'mobile' ? (
        <form className="card stack" onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
          <label className="label" htmlFor="mobile">Your mobile number</label>
          <input
            id="mobile"
            className="input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10 digit number"
            value={mobile}
            onChange={(e) => setMobile(digits(e.target.value, MOBILE_LEN))}
            autoFocus
          />
          {error && <p className="error" role="alert">{error}</p>}
          <BigButton type="submit" disabled={mobile.length !== MOBILE_LEN || busy}>
            {busy ? 'Sending…' : 'Send OTP'}
          </BigButton>
        </form>
      ) : (
        <form className="card stack" onSubmit={(e) => { e.preventDefault(); confirmOtp(); }}>
          <label className="label" htmlFor="otp">Enter the 6 digit OTP</label>
          <p className="hint">{info}</p>
          <input
            id="otp"
            className="input"
            type="tel"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="● ● ● ● ● ●"
            value={otp}
            onChange={(e) => setOtp(digits(e.target.value, OTP_LEN))}
            autoFocus
          />
          {error && <p className="error" role="alert">{error}</p>}
          <BigButton type="submit" variant="success" disabled={otp.length !== OTP_LEN || busy}>
            {busy ? 'Checking…' : 'Login'}
          </BigButton>
          <BigButton variant="secondary" onClick={() => { setStep('mobile'); setOtp(''); setError(''); }}>
            Change number
          </BigButton>
        </form>
      )}
    </main>
  );
}
