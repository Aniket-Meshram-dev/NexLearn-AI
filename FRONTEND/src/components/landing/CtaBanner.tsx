'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CtaBanner() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  return (
    <section className="lp-cta-wrapper">
      <div className="lp-cta-box">
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#A5B4FC',
            marginBottom: '12px',
            display: 'inline-block',
          }}
        >
          Begin Your Transformation
        </span>

        <h2 className="lp-cta-title">
          Ready to Supercharge Your Learning with Autonomous AI?
        </h2>

        <p className="lp-cta-desc">
          Join over 25,000 ambitious minds. Generate your first personalized course in under 15 seconds.
          No credit card required.
        </p>

        {isAuthenticated ? (
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="lp-btn lp-btn-primary lp-btn-lg">
              <span>Go to Workspace Dashboard</span>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </Link>
            <Link href="/discover" className="lp-btn lp-btn-outline lp-btn-lg">
              <span>Explore Course Catalog</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
              <span>Create Your Free Account</span>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </Link>
            <Link href="/login" className="lp-btn lp-btn-outline lp-btn-lg">
              <span>Sign In to Existing Workspace</span>
            </Link>
          </div>
        )}

        <div
          style={{
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            fontSize: '0.84rem',
            color: 'var(--lp-text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <span>✓ Instant AI Course Setup</span>
          <span>✓ Zero Credit Card Needed</span>
          <span>✓ Verified Shareable PDF Certificates</span>
        </div>
      </div>
    </section>
  );
}
