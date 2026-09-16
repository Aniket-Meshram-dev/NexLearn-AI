'use client';
import Link from 'next/link';
import { Target, CheckCircle2, Clock, Flame, ArrowRight } from 'lucide-react';

interface DailyTargetProps {
  dailyTarget?: {
    minutesStudied: number;
    targetMinutes: number;
    quizzesDone: number;
    targetQuizzes: number;
    percentage: number;
    achieved: boolean;
  } | null;
  streak: number;
  resumeLink?: string;
}

export default function DailyTargetWidget({ dailyTarget, streak, resumeLink }: DailyTargetProps) {
  const target = dailyTarget || {
    minutesStudied: 0,
    targetMinutes: 40,
    quizzesDone: 0,
    targetQuizzes: 1,
    percentage: 0,
    achieved: false,
  };

  const pct = Math.min(100, Math.max(0, target.percentage));
  const remainingMinutes = Math.max(0, target.targetMinutes - target.minutesStudied);

  return (
    <div
      className="card daily-target-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        background: target.achieved
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--surface-raised) 100%)',
        border: target.achieved
          ? '1px solid rgba(16, 185, 129, 0.3)'
          : '1px solid var(--border-hairline)',
        boxShadow: 'var(--shadow-l1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Left Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: target.achieved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
              color: target.achieved ? '#10b981' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {target.achieved ? <CheckCircle2 size={24} /> : <Target size={24} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                Daily Learning Target
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: target.achieved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                  color: target.achieved ? '#10b981' : 'var(--accent-primary)',
                }}
              >
                {target.achieved ? 'Goal Met!' : `${pct}% Done`}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              {target.achieved ? (
                <span>You hit your <strong>{target.targetMinutes}m target</strong> today! Keep going to maximize your knowledge mastery.</span>
              ) : (
                <span>
                  <strong>{target.minutesStudied}</strong> of <strong>{target.targetMinutes} mins</strong> studied today. {remainingMinutes}m left to secure your {streak + 1}-day streak!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Mini Stats + Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Progress Bar Mini Ring */}
          <div style={{ width: '130px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                marginBottom: '5px',
                fontWeight: 600,
              }}
            >
              <span>{target.minutesStudied}m</span>
              <span>{target.targetMinutes}m target</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '7px',
                borderRadius: '999px',
                background: 'var(--surface-sunken, rgba(0, 0, 0, 0.08))',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: target.achieved
                    ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(90deg, var(--accent-primary) 0%, #6366f1 100%)',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          {/* Quick Action Button */}
          {resumeLink && (
            <Link
              href={resumeLink}
              className="btn btn-secondary"
              style={{
                fontSize: '0.82rem',
                padding: '8px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <Clock size={13} />
              <span>{target.achieved ? 'Review More' : 'Study Now'}</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
