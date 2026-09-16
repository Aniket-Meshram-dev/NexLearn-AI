'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowRight, Sparkles, Zap, Database, Layers, Mail, Compass } from 'lucide-react';

export default function HeroSection() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();
  const [topicInput, setTopicInput] = useState('');

  const quickPills = [
    'Next.js 15 Full-Stack',
    'AI & Neural Networks',
    'Zero-Trust Cyber Defense',
    'Quantum Computing',
  ];

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    const topic = topicInput.trim() || 'Modern Full-Stack Engineering';
    const targetUrl = `/generate?topic=${encodeURIComponent(topic)}`;
    if (isAuthenticated) {
      router.push(targetUrl);
    } else {
      router.push(`/register?callbackUrl=${encodeURIComponent(targetUrl)}`);
    }
  };

  const handleQuickSelect = (pill: string) => {
    setTopicInput(pill);
    const targetUrl = `/generate?topic=${encodeURIComponent(pill)}`;
    if (isAuthenticated) {
      router.push(targetUrl);
    } else {
      router.push(`/register?callbackUrl=${encodeURIComponent(targetUrl)}`);
    }
  };

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

      {/* Interactive Quick Generator Bar */}
      <form onSubmit={handleSynthesize} className="lp-hero-prompt-box">
        <div className="lp-hero-prompt-input-wrapper">
          <Sparkles size={18} color="#818CF8" className="lp-hero-prompt-icon" />
          <input
            type="text"
            className="lp-hero-prompt-input"
            placeholder="What do you want to learn? (e.g. Distributed Systems, Rust, LLM Fine-Tuning)..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
          />
        </div>
        <button type="submit" className="lp-btn lp-btn-primary lp-hero-prompt-btn">
          <span>Synthesize Course</span>
          <ArrowRight size={16} />
        </button>
      </form>

      {/* Quick Pills */}
      <div className="lp-hero-pills">
        <span style={{ fontSize: '0.8rem', color: 'var(--lp-text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Compass size={13} />
          <span>Popular:</span>
        </span>
        {quickPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => handleQuickSelect(pill)}
            className="lp-hero-pill-btn"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Hero Action Buttons */}
      <div className="lp-hero-actions">
        <Link 
          href={isAuthenticated ? "/dashboard" : "/register"} 
          className="lp-btn lp-btn-primary lp-btn-lg"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'}</span>
          <ArrowRight size={18} />
        </Link>
        <a href="#simulator" className="lp-btn lp-btn-outline lp-btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#818CF8" />
          <span>Try Interactive Simulator</span>
        </a>
      </div>

      {/* Partner & Tech Stack Trust Row */}
      <div className="lp-trust-row">
        <span className="lp-trust-title">Engineered with next-gen foundational intelligence</span>
        <div className="lp-trust-badges">
          <div className="lp-trust-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="#F59E0B" />
            <span>Groq Llama 3.3 (70B)</span>
          </div>
          <div className="lp-trust-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#38BDF8" />
            <span>Google Gemini Flash</span>
          </div>
          <div className="lp-trust-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Database size={14} color="#10B981" />
            <span>Neon PostgreSQL</span>
          </div>
          <div className="lp-trust-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#8B5CF6" />
            <span>Next.js Turbopack</span>
          </div>
          <div className="lp-trust-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} color="#06B6D4" />
            <span>Brevo Transactional API</span>
          </div>
        </div>
      </div>
    </section>
  );
}
