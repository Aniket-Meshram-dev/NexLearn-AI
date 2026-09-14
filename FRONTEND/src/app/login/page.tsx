'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NexLearnLogo from '@/components/NexLearnLogo';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requireOTP, setRequireOTP] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const signPayload: any = {
      redirect: false,
      email: form.email,
      password: form.password,
    }
    if (form.otp?.trim()) {
      signPayload.otp = form.otp.trim()
    }

    const result = await signIn('credentials', signPayload);

    console.log("Sign-in result:", result);

    if (result?.error) {
      if (result.error.includes('2FA_REQUIRED')) {
        setRequireOTP(true);
        setError('');
      } else {
        // Map common errors or show provided one
        setError(result.error);
        if (result.error.includes('OTP')) {
          setRequireOTP(true);
        }
      }
      setLoading(false);
    } else {
      // If the server-side callback returned a specific redirect (Verify/2FA), follow it
      if (result?.url && !result.url.includes('/login')) {
        router.push(result.url);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <NexLearnLogo size="md" clickable={true} />
        </div>
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your learning journey</p>

        <button 
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="btn btn-google" 
          style={{ width: '100%', marginBottom: 12 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.705a5.41 5.41 0 0 1 0-3.41V4.963H.957a8.992 8.992 0 0 0 0 8.074l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.963l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">OR</div>

        {error && (
          <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.82rem', marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email" className="form-input"
              placeholder="you@example.com" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password" className="form-input"
              placeholder="••••••••" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={requireOTP}
            />
          </div>

          {requireOTP && (
            <div className="form-group animate-slide-up">
              <label className="form-label" style={{ color: 'var(--primary)', fontWeight: 700 }}>🔐 Verification Code</label>
              <input 
                type="text" className="form-input" 
                placeholder="Enter 6-digit OTP" required
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                autoFocus
                style={{ borderColor: 'var(--primary)', borderWidth: '2px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                A security code was sent to your registered email address.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '11px', marginTop: 4, borderRadius: 10, fontWeight: 700 }}
          >
            {loading ? 'Processing...' : requireOTP ? 'Verify & Sign In' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
