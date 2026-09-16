'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      // Automatic login using the NEW bypass token from the verification API
      const result = await signIn('verify-account', {
        redirect: false,
        userId: data.userId,
        bypassToken: data.bypassToken,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        setError('Login failed after verification. Please sign in manually.');
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setResendStatus('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendStatus('A new OTP has been sent to your email.');
      } else {
        setError('Failed to resend OTP. Please try again later.');
      }
    } catch (err) {
      setError('Connection error. Could not resend OTP.');
    }
    setResending(false);
  };

  const handleVerifyLater = async () => {
    if (!userId || !token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    // Explicitly use the token provided in the URL for skipping
    const result = await signIn('verify-account', {
      redirect: false,
      userId: userId,
      bypassToken: token,
      callbackUrl: callbackUrl,
    });

    if (result?.error) {
      router.push('/login?message=Could not log in. Please sign in manually.');
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #ecfdf5, #eff6ff)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '18px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '32px',
            border: '1px solid #d1fae5',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
            color: '#10b981',
          }}>
            <ShieldCheck size={36} />
          </div>
        </div>
        <h1 style={{ marginBottom: 8 }}>Verify Your Email</h1>
        <p className="auth-subtitle" style={{ marginBottom: 24 }}>
          We've sent a 6-digit code to <br />
          <strong style={{ color: 'var(--text)' }}>{email}</strong>
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
        {resendStatus && (
          <div className="alert alert-success" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>{resendStatus}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: 32 }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                className="form-input"
                style={{ 
                  width: '45px', 
                  height: '55px', 
                  textAlign: 'center', 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            disabled={loading}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleResend} 
            disabled={resending}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4f46e5', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {resending ? 'Resending...' : "Didn't receive code? Resend"}
          </button>

          <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>

          <button 
            onClick={handleVerifyLater}
            className="btn"
            style={{ 
              width: '100%', 
              backgroundColor: '#f8fafc', 
              color: '#334155', 
              border: '1px solid #e2e8f0',
              fontWeight: '600'
            }}
          >
            Verify Later
          </button>
        </div>

        <p className="auth-footer" style={{ marginTop: 24 }}>
          Wait, that's not my email? <Link href="/register">Back to register</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyAccountContent />
    </Suspense>
  );
}
