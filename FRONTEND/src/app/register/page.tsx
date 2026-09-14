'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NexLearnLogo from '@/components/NexLearnLogo';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', learningGoal: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          learningGoal: form.learningGoal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Instead of auto sign in, redirect to verification page with bypass token
      router.push(`/verify-account?email=${encodeURIComponent(form.email)}&userId=${data.userId}&token=${data.bypassToken}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <NexLearnLogo size="md" clickable={true} />
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Start your intelligent learning journey</p>

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
          <div className="auth-grid-2col">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="John Doe" 
                required
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                required
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
          </div>

          <div className="auth-grid-2col">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Min. 6 chars" 
                required
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Repeat password" 
                required
                value={form.confirmPassword} 
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Learning Goal <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>(optional)</span>
            </label>
            <select 
              className="form-select" 
              value={form.learningGoal}
              onChange={(e) => setForm({ ...form, learningGoal: e.target.value })}
            >
              <option value="">Select a goal (optional)</option>
              <option value="Interview Preparation">Interview Preparation</option>
              <option value="Project Building">Project Building</option>
              <option value="Exam Preparation">Exam Preparation</option>
              <option value="Skill Development">Skill Development</option>
              <option value="Career Change">Career Change</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '11px', marginTop: 4, borderRadius: 10, fontWeight: 700 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
