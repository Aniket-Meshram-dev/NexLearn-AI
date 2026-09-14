'use client';
import Link from 'next/link';

export default function BentoFeatures() {
  return (
    <section id="features" className="lp-section">
      <div className="lp-section-header">
        <span className="lp-section-tag">Next-Gen Capabilities</span>
        <h2 className="lp-section-title">
          An End-to-End Autonomous Learning Ecosystem
        </h2>
        <p className="lp-section-desc">
          Every tool you need to master complex technical and academic domains—synthesized into a cohesive,
          AI-accelerated workspace.
        </p>
      </div>

      <div className="lp-bento-grid">
        {/* Card 1: Autonomous Curriculum Architect (Span 8) */}
        <div className="lp-bento-col-8 lp-glass lp-glass-hover lp-bento-card">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="lp-bento-card-icon" style={{ color: '#6366F1' }}>
              🧠
            </div>
            <h3>Autonomous Curriculum Architect</h3>
            <p style={{ maxWidth: '520px', marginBottom: '24px' }}>
              Input any topic, target mastery level, and daily commitment. Our Groq &amp; Gemini AI
              pipelines generate comprehensive, deeply reasoned theory with zero fluff.
            </p>

            {/* Mini preview bar */}
            <div
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid var(--lp-card-border)',
                maxWidth: '560px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
                <span style={{ color: '#818CF8' }}>AI Course Generation Pipeline</span>
                <span style={{ color: '#10B981' }}>100% Complete &bull; 8 Modules</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'var(--lp-accent-gradient)' }} />
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: '-40px',
              bottom: '-40px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Card 2: AI Voice Mentorship (Span 4) */}
        <div className="lp-bento-col-4 lp-glass lp-glass-hover lp-bento-card">
          <div>
            <div className="lp-bento-card-icon" style={{ color: '#06B6D4' }}>
              🎙️
            </div>
            <h3>Voice AI Mentorship</h3>
            <p>
              Ask complex doubts naturally using speech-to-text and listen to intuitive voice explanations
              tailored to your understanding.
            </p>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#06B6D4' }}>
              Speaking: Speech Synthesis
            </span>
            <div className="lp-soundwave">
              <div className="lp-soundwave-bar" style={{ background: '#06B6D4' }} />
              <div className="lp-soundwave-bar" style={{ background: '#06B6D4' }} />
              <div className="lp-soundwave-bar" style={{ background: '#06B6D4' }} />
              <div className="lp-soundwave-bar" style={{ background: '#06B6D4' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Interactive Mind Maps (Span 4) */}
        <div className="lp-bento-col-4 lp-glass lp-glass-hover lp-bento-card">
          <div>
            <div className="lp-bento-card-icon" style={{ color: '#8B5CF6' }}>
              🗺️
            </div>
            <h3>Neural Concept Maps</h3>
            <p>
              Transform dry text into interactive flowcharts and concept graphs powered by Mermaid.js,
              making mental models stick forever.
            </p>
          </div>

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <span style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(139, 92, 246, 0.15)', color: '#A5B4FC' }}>Core</span>
            <span>→</span>
            <span style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>Logic</span>
            <span>→</span>
            <span style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>Mastery</span>
          </div>
        </div>

        {/* Card 4: Adaptive Quizzes & XP (Span 4) */}
        <div className="lp-bento-col-4 lp-glass lp-glass-hover lp-bento-card">
          <div>
            <div className="lp-bento-card-icon" style={{ color: '#F59E0B' }}>
              ⚡
            </div>
            <h3>Smart Quizzes &amp; Instant XP</h3>
            <p>
              AI questions calibrated to verify depth of comprehension with detailed answers and instant
              XP rewards upon passing.
            </p>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B' }}>+100 XP Earned</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--lp-text-muted)' }}>96% Accuracy</span>
          </div>
        </div>

        {/* Card 5: Verified Certificates (Span 4) */}
        <div className="lp-bento-col-4 lp-glass lp-glass-hover lp-bento-card">
          <div>
            <div className="lp-bento-card-icon" style={{ color: '#10B981' }}>
              🎓
            </div>
            <h3>Verified Micro-Certifications</h3>
            <p>
              Complete courses to earn unique, tamper-proof certificates complete with cryptographic IDs
              and instant PDF export.
            </p>
          </div>

          <div
            style={{
              marginTop: '20px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🛡️</span>
            <span>ID: ICD-849201-NEX</span>
          </div>
        </div>

        {/* Card 6: Spaced Repetition & Analytics (Span 12) */}
        <div className="lp-bento-col-12 lp-glass lp-glass-hover lp-bento-card" style={{ minHeight: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div className="lp-bento-card-icon" style={{ color: '#EC4899', marginBottom: '14px' }}>
                📊
              </div>
              <h3 style={{ fontSize: '1.45rem' }}>Automated Spaced Repetition &amp; Skill Radar</h3>
              <p>
                Track retention decay over time. NexLearn serves flashcard reviews at the optimal moment
                before memory fades, mapped across dynamic multi-dimensional radar charts.
              </p>
            </div>

            <Link href="/register" className="lp-btn lp-btn-primary lp-btn-lg">
              <span>Experience It Yourself</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
