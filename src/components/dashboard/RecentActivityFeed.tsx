'use client';
import Link from 'next/link';
import { Activity, Award, BrainCircuit, BookCheck, Clock, ExternalLink } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'quiz' | 'achievement' | 'course' | string;
  title: string;
  subtitle: string;
  timestamp: string | Date;
  badge?: string;
  badgeColor?: 'green' | 'yellow' | 'red' | 'purple' | 'blue' | string;
  link?: string;
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
}

function timeAgo(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSec) || diffInSec < 0) return 'Just now';
  if (diffInSec < 60) return `${diffInSec}s ago`;
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function RecentActivityFeed({ activities = [] }: RecentActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <BrainCircuit size={16} />;
      case 'achievement':
        return <Award size={16} />;
      case 'course':
        return <BookCheck size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'green':
        return { background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' };
      case 'yellow':
        return { background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'red':
        return { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' };
      case 'purple':
        return { background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.25)' };
      case 'blue':
      default:
        return { background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' };
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <h3 className="card-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Recent Activity Stream
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Live record of learning milestones & quiz scores
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#10b981',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span>Live Pulse</span>
          </div>
        </div>
      </div>

      {activities.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--surface-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}
          >
            <Clock size={20} />
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            No recent activity recorded today. Complete a module or take a quiz to see your milestones appear here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map((act) => {
            const content = (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--surface-sunken, rgba(255, 255, 255, 0.02))',
                  border: '1px solid var(--border-hairline)',
                  gap: '12px',
                  transition: 'background 0.15s ease, transform 0.15s ease',
                  cursor: act.link ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9px',
                      background: 'rgba(99, 102, 241, 0.08)',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(act.type)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: '0 0 2px 0',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {act.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.76rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {act.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {act.badge && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        ...getBadgeStyle(act.badgeColor),
                      }}
                    >
                      {act.badge}
                    </span>
                  )}
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {timeAgo(act.timestamp)}
                  </span>
                  {act.link && <ExternalLink size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />}
                </div>
              </div>
            );

            return act.link ? (
              <Link key={act.id} href={act.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </div>
      )}
    </div>
  );
}
