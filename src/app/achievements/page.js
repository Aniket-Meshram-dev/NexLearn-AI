'use client';
import { useEffect, useState } from 'react';

export default function AchievementsPage() {
  const [data, setData] = useState({ achievements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/achievements').then(r => r.json()).then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading achievements...</p></div>;

  const earned = data.achievements.filter(a => a.earned).length;

  return (
    <div>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏆 Achievements</h1>
        <p>You&apos;ve unlocked {earned} out of {data.achievements.length} badges!</p>
        <div className="progress-bar" style={{ maxWidth: 400, margin: '20px auto 0', height: 10 }}>
          <div className="progress-fill warning" style={{ width: `${(earned / data.achievements.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid-auto">
        {data.achievements.map((a) => (
          <div key={a.id} className={`badge-card ${a.earned ? 'earned' : 'locked'}`}>
            <span className="badge-icon">{a.icon}</span>
            <h4>{a.title}</h4>
            <p>{a.description}</p>
            {a.earned ? (
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                Unlocked: {new Date(a.earnedAt).toLocaleDateString()}
              </div>
            ) : (
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Locked
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
