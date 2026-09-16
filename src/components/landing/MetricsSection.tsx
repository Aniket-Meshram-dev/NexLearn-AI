'use client';
import { Users, Award, Layers, TrendingUp } from 'lucide-react';

export default function MetricsSection() {
  const metrics = [
    {
      number: '25,000+',
      label: 'Active Students & Engineers',
      sub: 'Enrolled across 120+ countries',
      icon: Users,
      color: '#6366F1',
    },
    {
      number: '98.4%',
      label: 'First-Attempt Quiz Pass Rate',
      sub: 'Powered by adaptive AI recall',
      icon: Award,
      color: '#10B981',
    },
    {
      number: '500k+',
      label: 'Active Recall Flashcards',
      sub: 'Optimized via Leitner algorithm',
      icon: Layers,
      color: '#06B6D4',
    },
    {
      number: '10x',
      label: 'Faster Concept Mastery',
      sub: 'Compared to traditional video lectures',
      icon: TrendingUp,
      color: '#F59E0B',
    },
  ];

  return (
    <section className="lp-section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="lp-metrics-grid">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="lp-glass lp-glass-hover lp-metric-card">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `${m.color}18`,
                  border: `1px solid ${m.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.color,
                  marginBottom: '14px',
                }}
              >
                <Icon size={22} />
              </div>
              <div className="lp-metric-number">{m.number}</div>
              <div className="lp-metric-label">{m.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--lp-text-muted)', marginTop: '4px' }}>
                {m.sub}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
