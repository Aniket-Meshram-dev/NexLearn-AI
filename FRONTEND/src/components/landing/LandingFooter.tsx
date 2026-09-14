'use client';
import Link from 'next/link';
import NexLearnLogo from '../NexLearnLogo';

export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-content">
        {/* Brand Column */}
        <div style={{ maxWidth: '340px' }}>
          <NexLearnLogo size="md" clickable={true} />
          <p
            style={{
              marginTop: '16px',
              fontSize: '0.9rem',
              color: 'var(--lp-text-secondary)',
              lineHeight: '1.65',
            }}
          >
            NexLearn is an AI-native autonomous educational platform engineered to synthesize adaptive,
            interactive courses, active recall flashcards, and verified academic credentials.
          </p>
          <div style={{ marginTop: '20px' }}>
            <span className="lp-status-pill">
              <span className="lp-status-pill-dot" />
              <span>All AI Systems Operational</span>
            </span>
          </div>
        </div>

        {/* Column 1: Core Platform */}
        <div className="lp-footer-column">
          <h4>Platform</h4>
          <ul className="lp-footer-links">
            <li>
              <Link href="/discover">Course Catalog</Link>
            </li>
            <li>
              <Link href="/generate">AI Course Generator</Link>
            </li>
            <li>
              <a href="#simulator">Interactive Demo</a>
            </li>
            <li>
              <Link href="/dashboard">Student Workspace</Link>
            </li>
          </ul>
        </div>

        {/* Column 2: Architecture */}
        <div className="lp-footer-column">
          <h4>Ecosystem</h4>
          <ul className="lp-footer-links">
            <li>
              <a href="#features">Groq 70B Core</a>
            </li>
            <li>
              <a href="#features">Google Gemini Pipeline</a>
            </li>
            <li>
              <a href="#features">Neon PostgreSQL</a>
            </li>
            <li>
              <a href="#features">Brevo Transactional API</a>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Security */}
        <div className="lp-footer-column">
          <h4>Trust &amp; Access</h4>
          <ul className="lp-footer-links">
            <li>
              <Link href="/login">Account Sign In</Link>
            </li>
            <li>
              <Link href="/register">Register New Account</Link>
            </li>
            <li>
              <Link href="/forgot-password">Security &amp; OTP Reset</Link>
            </li>
            <li>
              <a href="https://github.com/Aniket-Meshram-dev/NexLearn-AI" target="_blank" rel="noreferrer">
                GitHub Source Code ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="lp-footer-bottom">
        <div suppressHydrationWarning>
          © 2026 NexLearn AI Inc. All rights reserved. Powered by Next.js 16 &amp; Turbopack.
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ color: 'var(--lp-text-muted)' }}>Built with Precision &bull; 100% TypeScript</span>
        </div>
      </div>
    </footer>
  );
}
