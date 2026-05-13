'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', ok: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', ok: /[a-z]/.test(password) },
    { label: 'One number (0-9)', ok: /\d/.test(password) },
    { label: 'One symbol (!@#$...)', ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {checks.map(c => (
        <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: c.ok ? '#10b981' : '#94a3b8' }}>
          <span style={{ fontSize: '0.9rem' }}>{c.ok ? '✅' : '⬜'}</span>
          {c.label}
        </div>
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=otp+password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setStep(2);
      startResendTimer();
    } catch {
      setError('Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!PASSWORD_REGEX.test(newPassword)) {
      setError('Password does not meet the requirements below.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '2.5rem' }}>🔐</span>
        </div>

        {step === 1 ? (
          <>
            <h1>Forgot Password</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a 6-digit OTP</p>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email" className="form-input"
                  placeholder="you@example.com" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Sending OTP...' : '📨 Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1>Reset Password</h1>
            <p className="auth-subtitle">
              OTP sent to <strong>{email}</strong>
            </p>

            {error && <div className="alert alert-danger">⚠️ {error}</div>}
            {success && <div className="alert alert-success">✅ {success}</div>}

            <form onSubmit={handleResetPassword}>
              {/* OTP Input */}
              <div className="form-group">
                <label className="form-label">6-Digit OTP</label>
                <input
                  type="text" className="form-input"
                  placeholder="Enter OTP from email"
                  maxLength={6} required
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{ letterSpacing: '0.3em', fontSize: '1.3rem', textAlign: 'center', fontWeight: 700 }}
                />
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleSendOTP}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a strong password" required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password" className="form-input"
                  placeholder="Re-enter new password" required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 4 }}>✓ Passwords match</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg"
                disabled={loading || !PASSWORD_REGEX.test(newPassword) || newPassword !== confirmPassword}
                style={{ width: '100%', marginTop: 8 }}>
                {loading ? 'Resetting...' : '🔐 Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer" style={{ marginTop: 20 }}>
          Remember your password? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
