'use client';
import { useEffect, useState, useMemo } from 'react';
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
  Share2,
  Check,
  Filter,
} from 'lucide-react';

const XIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

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
  const [data, setData] = useState<{ achievements: any[]; metrics?: any }>({ achievements: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/achievements')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const earnedAchievements = useMemo(() => {
    return data.achievements.filter((a) => a.earned);
  }, [data.achievements]);

  // Points & Tier Calculation
  const totalEarned = earnedAchievements.length;
  const xpPerBadge = 100;
  const totalXp = totalEarned * xpPerBadge;

  // Levels: 0-300: L1 Novice, 300-600: L2 Apprentice, 600-1000: L3 Scholar, 1000-1500: L4 Master, 1500+: L5 Grandmaster
  const getTierInfo = (xp: number) => {
    if (xp < 300) {
      return { level: 1, title: 'Novice Learner', nextXp: 300, currentTierBase: 0 };
    } else if (xp < 700) {
      return { level: 2, title: 'Autonomous Apprentice', nextXp: 700, currentTierBase: 300 };
    } else if (xp < 1200) {
      return { level: 3, title: 'Elite Scholar', nextXp: 1200, currentTierBase: 700 };
    } else if (xp < 1700) {
      return { level: 4, title: 'Master of AI Systems', nextXp: 1700, currentTierBase: 1200 };
    } else {
      return { level: 5, title: 'Curriculum Grandmaster', nextXp: 2000, currentTierBase: 1700 };
    }
  };

  const tier = getTierInfo(totalXp);
  const tierProgress =
    tier.level === 5
      ? 100
      : Math.min(100, Math.round(((totalXp - tier.currentTierBase) / (tier.nextXp - tier.currentTierBase)) * 100));

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return data.achievements.filter((a) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'UNLOCKED' && a.earned) ||
        (statusFilter === 'LOCKED' && !a.earned);

      const matchesCat = categoryFilter === 'ALL' || a.category === categoryFilter;

      return matchesStatus && matchesCat;
    });
  }, [data.achievements, statusFilter, categoryFilter]);

  const handleShare = (achievement: any, platform: 'x' | 'linkedin' | 'copy') => {
    const text = `Unlocked the "${achievement.title}" mastery milestone on NexLearn AI! ${achievement.description}. Building verifiable deep tech skills with autonomous AI learning. #NexLearn #AIEdTech`;
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://nexlearn.ai';

    if (platform === 'x') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${text} — Check it out at ${url}`);
      setCopiedId(achievement.id);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading mastery achievements...</p>
      </div>
    );
  }

  const overallPercent = data.achievements.length > 0 ? (totalEarned / data.achievements.length) * 100 : 0;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Executive Mastery Tier & Level Header */}
      <div
        style={{
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(99, 102, 241, 0.06) 50%, rgba(168, 85, 247, 0.08) 100%)',
          border: '1px solid var(--border)',
          padding: '36px 32px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow ambient circle */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 340px' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 28px -6px rgba(245, 158, 11, 0.45)',
                flexShrink: 0,
              }}
            >
              <Trophy size={38} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#F59E0B',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  Tier {tier.level} • {tier.title}
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  {totalXp} XP
                </span>
              </div>
              <h1
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  margin: '0 0 6px 0',
                  color: 'var(--text-primary)',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Mastery Badges & Achievements
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
                Unlocked <strong>{totalEarned}</strong> of <strong>{data.achievements.length}</strong> mastery milestones
                ({Math.round(overallPercent)}% completion)
              </p>
            </div>
          </div>

          {/* Level Progress Gauge */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '16px 20px',
              minWidth: '280px',
              flex: '0 1 340px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '0.82rem',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                Level {tier.level} Progress
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {tier.level === 5 ? 'Max Level' : `${tier.nextXp - totalXp} XP to Level ${tier.level + 1}`}
              </span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: '999px',
                background: 'var(--bg-secondary)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${tierProgress}%`,
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                  transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>{totalXp} XP earned</span>
              <span>{tier.nextXp} XP target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Status Segmented Buttons */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: statusFilter === 'ALL' ? 'var(--primary)' : 'transparent',
              color: statusFilter === 'ALL' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            All ({data.achievements.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNLOCKED')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: statusFilter === 'UNLOCKED' ? '#10B981' : 'transparent',
              color: statusFilter === 'UNLOCKED' ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Unlocked ({totalEarned})
          </button>
          <button
            onClick={() => setStatusFilter('LOCKED')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: statusFilter === 'LOCKED' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: statusFilter === 'LOCKED' ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Locked ({data.achievements.length - totalEarned})
          </button>
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'streak', label: 'Streak' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'learning', label: 'Learning' },
            { id: 'course', label: 'Courses' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: categoryFilter === cat.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: categoryFilter === cat.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                color: categoryFilter === cat.id ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid-auto" style={{ gap: '20px' }}>
        {filteredAchievements.map((a) => {
          const IconComponent = getAchievementIcon(a.title, a.category);
          const isCopied = copiedId === a.id;
          const progress = a.progress;
          const pct = progress ? Math.min(100, Math.round((progress.current / progress.max) * 100)) : 0;

          return (
            <div
              key={a.id}
              className={`badge-card ${a.earned ? 'earned' : 'locked'}`}
              style={{
                position: 'relative',
                padding: '24px 20px',
                borderRadius: '18px',
                border: a.earned ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)',
                background: a.earned
                  ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, var(--bg-card) 100%)'
                  : 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: a.earned ? '0 4px 20px rgba(245, 158, 11, 0.08)' : 'none',
              }}
            >
              {/* Badge Icon */}
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '16px',
                  background: a.earned
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)'
                    : 'var(--bg-secondary)',
                  color: a.earned ? '#F59E0B' : 'var(--text-muted)',
                  border: `1px solid ${a.earned ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  boxShadow: a.earned ? '0 6px 18px rgba(245, 158, 11, 0.25)' : 'none',
                }}
              >
                <IconComponent size={28} />
              </div>

              {/* Title & XP Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    color: a.earned ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {a.title}
                </h4>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '6px',
                    background: a.earned ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
                    color: a.earned ? '#F59E0B' : 'var(--text-muted)',
                  }}
                >
                  +100 XP
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  margin: 0,
                  fontSize: '0.83rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  flex: 1,
                  marginBottom: '16px',
                }}
              >
                {a.description}
              </p>

              {/* Status / Progress Bar */}
              {a.earned ? (
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: '#10B981',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Unlocked: {new Date(a.earnedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Share Intent Actions */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleShare(a, 'x')}
                      title="Share on X / Twitter"
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <XIcon size={12} />
                      <span>Post</span>
                    </button>

                    <button
                      onClick={() => handleShare(a, 'linkedin')}
                      title="Share on LinkedIn"
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#0077B5')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <LinkedinIcon size={12} />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => handleShare(a, 'copy')}
                      title="Copy celebration message"
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: isCopied ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: isCopied ? '#10B981' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                      }}
                    >
                      {isCopied ? <Check size={12} /> : <Share2 size={12} />}
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  {progress ? (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginBottom: '4px',
                        }}
                      >
                        <span>{progress.label}</span>
                        <span>{pct}%</span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '999px',
                          background: 'var(--bg-secondary)',
                          overflow: 'hidden',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: '999px',
                            background: 'var(--primary)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '4px',
                    }}
                  >
                    <Lock size={12} />
                    <span>Locked</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
