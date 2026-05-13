'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  { icon: '🤖', title: 'AI Course Generator', desc: 'Enter any topic and get a complete, structured course with modules, notes, and exercises.' },
  { icon: '📝', title: 'Smart Quizzes', desc: 'AI-generated quizzes test your knowledge with instant feedback and explanations.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Track your learning streak, quiz scores, and completion rates in real-time.' },
  { icon: '🧠', title: 'Smart Recommendations', desc: 'Get personalized suggestions based on your performance and learning patterns.' },
  { icon: '🏆', title: 'Achievements & Badges', desc: 'Earn badges for milestones like streaks, perfect scores, and course completions.' },
  { icon: '🎓', title: 'Certificates', desc: 'Download professional certificates with QR verification upon completing courses.' },
  { icon: '🗺️', title: 'AI Mind Maps', desc: 'Visualize complex concepts with AI-generated, interactive mind maps and flowcharts.' },
  { icon: '🎙️', title: 'Voice Mentorship', desc: 'Interact with your AI mentor hands-free using advanced speech-to-text and voice playback.' },
  { icon: '🎯', title: 'Skill Analysis', desc: 'Monitor your academic growth across various subjects with dynamic radar charts.' },
  { icon: '🔒', title: 'Secure Profile', desc: 'Manage your data securely with OTP-verified changes and multi-factor authentication.' },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  return (
    <div>
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="logo-icon" style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #4F46E5, #818CF8)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', color: 'white'
          }}>🎓</div>
          <h2>ICM System</h2>
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Learning Platform</div>
          <h1 className="hero-title">
            Learn Smarter with <span>Intelligent Courses</span>
          </h1>
          <p className="hero-subtitle">
            Generate personalized courses on any topic, study with interactive modules,
            take AI-powered quizzes, and track your progress — all in one platform.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="btn btn-primary btn-lg">Start Learning Free →</Link>
            <Link href="/login" className="btn btn-outline btn-lg">Sign In</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><h3>∞</h3><p>Topics Available</p></div>
            <div className="hero-stat"><h3>AI</h3><p>Powered Content</p></div>
            <div className="hero-stat"><h3>Free</h3><p>To Use</p></div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Everything You Need to Learn Effectively</h2>
        <p className="subtitle">Powered by AI, designed for students who want structured, engaging learning experiences.</p>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={i} className="feature-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: '80px 40px', textAlign: 'center',
        background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>Ready to Start Learning?</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: 32 }}>
          Join now and generate your first AI-powered course in seconds.
        </p>
        <Link href="/register" className="btn btn-primary btn-lg">Create Free Account →</Link>
      </section>

      <footer style={{
        padding: '24px 40px', textAlign: 'center',
        borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)',
      }}>
        © 2026 ICM System — Intelligent Course Management System
      </footer>
    </div>
  );
}
