'use client';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="lp-hero">
      {/* Top Shimmer Badge */}
      <div className="lp-badge-shimmer">
        <span className="lp-pulse-dot" />
        <span>NexLearn 2.0 &bull; Autonomous AI Course Synthesizer</span>
        <span style={{ opacity: 0.6 }}>&bull; Powered by Groq &amp; Gemini</span>
      </div>

      {/* Main Punchy Title */}
      <h1 className="lp-hero-title">
        Master Any Subject with <br />
        <span className="lp-gradient-text">Autonomous AI Course Engines</span>
      </h1>

      {/* Subtitle */}
      <p className="lp-hero-subtitle">
        Say goodbye to outdated static tutorials. NexLearn synthesizes customized, deep-theory courses
        complete with structured modules, real-world code examples, interactive mind maps,
        adaptive quizzes, and an empathetic voice-enabled AI mentor.
      </p>

      {/* Hero Buttons */}
      <div className="lp-hero-actions">
        <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
          <span>Start Learning Free</span>
          <span style={{ fontSize: '1.2rem', transition: 'transform 0.2s ease' }}>→</span>
        </Link>
        <a href="#simulator" className="lp-btn lp-btn-outline lp-btn-lg">
          <span>⚡ Try Interactive Simulator</span>
        </a>
      </div>

      {/* Partner & Tech Stack Trust Row */}
      <div className="lp-trust-row">
        <span className="lp-trust-title">Engineered with next-gen foundational intelligence</span>
        <div className="lp-trust-badges">
          <div className="lp-trust-badge">
            <span style={{ color: '#F59E0B' }}>⚡</span> Groq Llama 3.3 (70B)
          </div>
          <div className="lp-trust-badge">
            <span style={{ color: '#38BDF8' }}>✦</span> Google Gemini Flash
          </div>
          <div className="lp-trust-badge">
            <span style={{ color: '#10B981' }}>🟢</span> Neon PostgreSQL
          </div>
          <div className="lp-trust-badge">
            <span style={{ color: '#8B5CF6' }}>▲</span> Next.js Turbopack
          </div>
          <div className="lp-trust-badge">
            <span style={{ color: '#06B6D4' }}>✉️</span> Brevo Transactional API
          </div>
        </div>
      </div>
    </section>
  );
}
