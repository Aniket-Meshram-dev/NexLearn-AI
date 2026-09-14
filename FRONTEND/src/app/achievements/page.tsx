'use client';
import { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Crown,
  Sun,
  Moon,
  Calendar,
  Rocket,
  BookOpen,
  Target,
  Medal,
  RefreshCw,
  Award,
  GraduationCap,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';

const getAchievementIcon = (title: string, category: string) => {
  const t = title.toLowerCase();
  if (t.includes('streak') || t.includes('blazing')) return Flame;
  if (t.includes('iron') || t.includes('lightning')) return Zap;
  if (t.includes('legendary') || t.includes('grandmaster')) return Crown;
  if (t.includes('dawn')) return Sun;
  if (t.includes('night')) return Moon;
  if (t.includes('weekend')) return Calendar;
  if (t.includes('maniac')) return Rocket;
  if (t.includes('hoarder')) return BookOpen;
  if (t.includes('quiz') || t.includes('sharpshooter')) return Target;
  if (t.includes('mid-term')) return Medal;
  if (t.includes('comeback')) return RefreshCw;
  if (t.includes('triple')) return Award;
  if (t.includes('polymath')) return GraduationCap;
  if (t.includes('marathon')) return Clock;
  if (category === 'streak') return Flame;
  if (category === 'quiz') return Target;
  if (category === 'course') return Trophy;
  return Sparkles;
};

export default function AchievementsPage() {
  const [data, setData] = useState<{ achievements: any[] }>({ achievements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/achievements')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading achievements...</p>
      </div>
    );
  }

  const earned = data.achievements.filter((a) => a.earned).length;
  const progressPercent = data.achievements.length > 0 ? (earned / data.achievements.length) * 100 : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)',
          border: '1px solid var(--border)',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)',
          }}
        >
          <Trophy size={32} />
        </div>
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '0 0 8px 0',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Mastery Badges & Achievements
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 20px 0' }}>
          You&apos;ve unlocked <strong>{earned}</strong> out of <strong>{data.achievements.length}</strong> mastery milestones!
        </p>
        <div className="progress-bar" style={{ maxWidth: 420, margin: '0 auto', height: 10 }}>
          <div className="progress-fill warning" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid-auto">
        {data.achievements.map((a) => {
          const IconComponent = getAchievementIcon(a.title, a.category);
          return (
            <div
              key={a.id}
              className={`badge-card ${a.earned ? 'earned' : 'locked'}`}
              style={{
                position: 'relative',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--bg-white)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: a.earned ? 1 : 0.65,
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: a.earned
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.2) 100%)'
                    : 'var(--secondary)',
                  color: a.earned ? '#F59E0B' : 'var(--text-muted)',
                  border: `1px solid ${a.earned ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  boxShadow: a.earned ? '0 4px 14px rgba(245, 158, 11, 0.2)' : 'none',
                }}
              >
                <IconComponent size={26} />
              </div>

              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                {a.title}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
                {a.description}
              </p>

              {a.earned ? (
                <div
                  style={{
                    marginTop: 14,
                    fontSize: '0.75rem',
                    color: '#10B981',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>Unlocked: {new Date(a.earnedAt).toLocaleDateString()}</span>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 14,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Lock size={12} />
                  <span>Locked</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
