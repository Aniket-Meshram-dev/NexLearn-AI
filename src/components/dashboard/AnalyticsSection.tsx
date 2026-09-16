'use client';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  PieChart,
  Activity,
  CheckSquare,
  Sparkles,
  BookOpenCheck,
  Flame,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface AnalyticsSectionProps {
  stats: {
    streak: number;
    completedModules: number;
    totalModules: number;
    courseCompletion: number;
    totalQuizzes: number;
    avgScore: number;
  };
  weeklyStudy: { day: string; minutes: number }[];
}

export default function AnalyticsSection({ stats, weeklyStudy }: AnalyticsSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 📈 Charts & Progress Section */}
      <div className="grid-2">
        {/* Progress Doughnut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <PieChart size={18} />
              </div>
              <h3 className="card-title">Course Completion</h3>
            </div>
          </div>
          {stats.totalModules === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                textAlign: 'center',
                padding: '24px 16px',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: 'var(--surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  marginBottom: '10px',
                }}
              >
                <BookOpenCheck size={22} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                No Modules In Progress
              </div>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  margin: '4px 0 14px',
                  maxWidth: '240px',
                  lineHeight: 1.4,
                }}
              >
                Generate an AI curriculum or enroll in courses to start tracking your completion rate.
              </p>
              <Link
                href="/generate"
                className="btn btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={13} />
                <span>Create Course</span>
              </Link>
            </div>
          ) : (
            <>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 180,
                  position: 'relative',
                }}
              >
                <div style={{ width: 140, height: 140 }}>
                  <Doughnut
                    data={{
                      labels: ['Completed', 'Remaining'],
                      datasets: [
                        {
                          data: [stats.completedModules, Math.max(0, stats.totalModules - stats.completedModules)],
                          backgroundColor: ['#6366F1', 'rgba(148, 163, 184, 0.2)'],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      cutout: '76%',
                      plugins: { legend: { display: false }, tooltip: { enabled: true } },
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>
                    {stats.courseCompletion}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Overall
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px 0',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1' }} />
                  {stats.completedModules} done
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(148, 163, 184, 0.4)' }} />
                  {Math.max(0, stats.totalModules - stats.completedModules)} remaining
                </span>
              </div>
            </>
          )}
        </div>

        {/* Learning Activity Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}
              >
                <Activity size={18} />
              </div>
              <h3 className="card-title">Learning Activity</h3>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: '#F59E0B',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.12)',
              }}
            >
              <Flame size={14} />
              <span>{stats.streak} day streak</span>
            </div>
          </div>
          <div style={{ height: 170 }}>
            <Bar
              data={{
                labels: weeklyStudy.map((d: any) => d.day),
                datasets: [
                  {
                    label: 'Minutes',
                    data: weeklyStudy.map((d: any) => d.minutes),
                    backgroundColor: 'rgba(99, 102, 241, 0.85)',
                    borderRadius: 8,
                    hoverBackgroundColor: '#6366F1',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { display: false, beginAtZero: true },
                  x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94A3B8' } },
                },
              }}
            />
          </div>
          {(weeklyStudy || []).reduce((sum: number, d: any) => sum + (d.minutes || 0), 0) === 0 && (
            <p style={{ margin: '10px 0 0 0', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Active study minutes are automatically tracked as you read modules and take quizzes.
            </p>
          )}
        </div>
      </div>

      {/* Quiz Performance Card */}
      <div className="card">
        <div className="card-header">
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
                color: '#10B981',
              }}
            >
              <CheckSquare size={18} />
            </div>
            <h3 className="card-title">Quiz Performance</h3>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div
            style={{
              textAlign: 'center',
              padding: '20px 16px',
              background: 'rgba(99, 102, 241, 0.06)',
              borderRadius: '14px',
              border: '1px solid rgba(99, 102, 241, 0.15)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: 'var(--primary)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {stats.totalQuizzes}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '4px' }}>
              Quizzes Taken
            </div>
          </div>
          <div
            style={{
              textAlign: 'center',
              padding: '20px 16px',
              background: stats.avgScore >= 70 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              borderRadius: '14px',
              border: `1px solid ${stats.avgScore >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: stats.avgScore >= 70 ? '#10B981' : '#F59E0B',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {stats.avgScore}%
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '4px' }}>
              Average Score
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
