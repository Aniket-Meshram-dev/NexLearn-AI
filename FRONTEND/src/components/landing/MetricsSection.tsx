'use client';

export default function MetricsSection() {
  const metrics = [
    { number: '25,000+', label: 'Active Students & Engineers' },
    { number: '98.4%', label: 'First-Attempt Quiz Pass Rate' },
    { number: '500k+', label: 'Active Recall Flashcards Generated' },
    { number: '10x', label: 'Faster Concept Mastery Speed' },
  ];

  return (
    <section className="lp-section" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="lp-metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="lp-glass lp-glass-hover lp-metric-card">
            <div className="lp-metric-number">{m.number}</div>
            <div className="lp-metric-label">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
