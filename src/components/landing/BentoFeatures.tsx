'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Brain,
  Mic,
  Network,
  Zap,
  GraduationCap,
  ShieldCheck,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export default function BentoFeatures() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

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
              <Brain size={28} />
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
              <Mic size={26} />
            </div>
            <h3>4 Multi-Persona Voice Mentors</h3>
            <p>
              Switch between Socrates (Inquiry), Ada (Code Precision), Maya (Intuitive Concepts), and Ethan (Industry Velocity) with natural speech synthesis.
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
              Speaking: Ada (Architecture)
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
              <Network size={26} />
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

        {/* Card 4: Adaptive Quizzes & Gamification (Span 4) */}
        <div className="lp-bento-col-4 lp-glass lp-glass-hover lp-bento-card">
          <div>
            <div className="lp-bento-card-icon" style={{ color: '#F59E0B' }}>
              <Zap size={26} />
            </div>
            <h3>Smart Quizzes &amp; Badges</h3>
            <p>
              Calibrated questions verify depth of comprehension with detailed solutions, instant XP,
              and milestone achievements across 5 distinct badge tiers.
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
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B' }}>+100 XP &bull; Streak Master</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--lp-text-muted)' }}>96% Accuracy</span>
          </div>
        </div>

        {/* Card 5: Verified Certificates & Public Portal (Span 4) */}
        <div className="lp-bento-col-4 lp-glass lp-glass-hover lp-bento-card">
          <div>
            <div className="lp-bento-card-icon" style={{ color: '#10B981' }}>
              <GraduationCap size={26} />
            </div>
            <h3>Verified Micro-Credentials</h3>
            <p>
              Earn cryptographically verified certificates with QR verification, tamper-proof hashes,
              and real-time public verification portal access.
            </p>
          </div>

          <Link
            href="/verify"
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
              justifyContent: 'space-between',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            title="Open real-time verification portal"
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>ID: ICD-849201-NEX</span>
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Verify Live →</span>
          </Link>
        </div>

        {/* Card 6: Academic Performance Reports & Spaced Repetition (Span 12) */}
        <div className="lp-bento-col-12 lp-glass lp-glass-hover lp-bento-card" style={{ minHeight: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '680px' }}>
              <div className="lp-bento-card-icon" style={{ color: '#EC4899', marginBottom: '14px' }}>
                <BarChart3 size={28} />
              </div>
              <h3 style={{ fontSize: '1.45rem' }}>Academic Performance Reports &amp; Spaced Repetition</h3>
              <p>
                Track retention decay and study session velocity. NexLearn serves active recall flashcards
                before memory fades, mapped across dynamic multi-dimensional radar charts with certified PDF transcripts.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link 
                href={isAuthenticated ? "/reports" : "/register"} 
                className="lp-btn lp-btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>{isAuthenticated ? 'View Academic Reports' : 'Explore Analytics'}</span>
              </Link>
              <Link 
                href={isAuthenticated ? "/dashboard" : "/register"} 
                className="lp-btn lp-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Experience It Yourself'}</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
