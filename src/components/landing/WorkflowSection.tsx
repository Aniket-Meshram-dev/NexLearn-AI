'use client';
import { Target, Zap, Trophy } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    {
      num: '01',
      title: 'Prompt Your Target Domain',
      desc: 'Type any skill, framework, or exam topic. Choose your comfort level (Beginner to Expert) and dedicated study hours.',
      badge: 'Zero Configuration',
      icon: Target,
    },
    {
      num: '02',
      title: 'Autonomous Synthesis & Guidance',
      desc: 'Our AI engines architect a structured roadmap, deep theory modules, code snippets, visual mindmaps, and voice mentoring.',
      badge: 'Groq & Gemini Core',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Active Recall & Official Certification',
      desc: 'Cement knowledge with adaptive quizzes and spaced repetition flashcards. Graduate with a cryptographically verified certificate.',
      badge: 'Verified Credential',
      icon: Trophy,
    },
  ];

  return (
    <section id="workflow" className="lp-section">
      <div className="lp-section-header">
        <span className="lp-section-tag">How It Works</span>
        <h2 className="lp-section-title">From Blank Slate to Mastery in 3 Steps</h2>
        <p className="lp-section-desc">
          NexLearn replaces weeks of disorganized searching with a tailored, high-fidelity curriculum that adapts to your learning pace.
        </p>
      </div>

      <div className="lp-workflow-steps">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="lp-glass lp-glass-hover lp-step-card">
              <div className="lp-step-num">{step.num}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', color: '#818CF8' }}>
                  <Icon size={22} />
                </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: '#818CF8',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                {step.badge}
              </span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px', color: 'var(--lp-text-primary)' }}>
              {step.title}
            </h3>
            <p style={{ color: 'var(--lp-text-secondary)', fontSize: '0.94rem', lineHeight: '1.65' }}>
              {step.desc}
            </p>
          </div>
          );
        })}
      </div>
    </section>
  );
}
