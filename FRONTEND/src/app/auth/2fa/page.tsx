'use client';
import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TwoFAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!email) router.push('/login');
  }, [email, router]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Step 1: Validate OTP via our dedicated API
      const res = await fetch('/api/auth/google-2fa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please try again.');
        setLoading(false);
        return;
      }

      // Step 2: Complete authentication via internal google-2fa provider using the bypass token
      const result = await signIn('google-2fa', {
        redirect: false,
        userId: data.userId,
        bypassToken: data.bypassToken,
      });

      if (result?.error) {
        setError('Authentication failed after verification. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
            marginBottom: 16
          }}>🔐</div>
          <h1 style={{ marginBottom: 4 }}>Two-Factor Authentication</h1>
          <p className="auth-subtitle">
            A 6-digit security code was sent to<br />
            <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
        {resent && <div className="alert alert-success" style={{ marginBottom: 16 }}>✓ A new code has been sent to your email.</div>}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Verification Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              autoFocus
              style={{
                textAlign: 'center',
                fontSize: '1.8rem',
                letterSpacing: '10px',
                fontWeight: 700,
                fontFamily: 'monospace',
                padding: '14px 8px',
                borderWidth: '2px',
                borderColor: 'var(--primary)',
              }}
              required
            />
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Code expires in 10 minutes.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || otp.length !== 6}
            style={{ width: '100%', marginBottom: 12 }}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link href="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TwoFAPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>Loading...</div>}>
      <TwoFAForm />
    </Suspense>
  );
}
