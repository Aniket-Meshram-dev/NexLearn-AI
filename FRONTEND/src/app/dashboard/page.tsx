'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  Flame,
  BookOpenCheck,
  CheckCircle2,
  Award,
  Sparkles,
  Compass,
  PieChart,
  Activity,
  CheckSquare,
  BookOpen,
  Plus,
  ArrowRight,
  Trash2,
  Play,
  FileText,
  AlertTriangle,
  Inbox,
  FolderMinus,
  Zap,
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

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetch('/api/user/stats')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && d.recentCourses) {
            setData(d);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      if (!loading && hash) {
        const timer = setTimeout(() => {
          const target = document.querySelector(hash);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    };
    handleScroll();
  }, [loading, pathname, searchParams, status]);

  if (loading || !data || !data.recentCourses) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading your learning workspace...</p>
      </div>
    );
  }

  const { stats, weeklyStudy, recommendations = [], recentCourses = [] } = data;
  const availableCourses = (recentCourses || []).filter((c: any) => !c.enrolled && !c.fullyCompleted);
  const enrolledCourses = (recentCourses || []).filter((c: any) => c.enrolled && !c.fullyCompleted);
  const completedCourses = (recentCourses || []).filter((c: any) => c.fullyCompleted);

  const handleEnrollMatch = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrolled: true }),
      });
      setData((prev: any) => ({
        ...prev,
        recentCourses: prev.recentCourses.map((c: any) => (c.id === courseId ? { ...c, enrolled: true } : c)),
      }));
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'enroll-' + Date.now(),
            title: 'Course Enrolled!',
            message: 'You have actively enrolled in the course curriculum.',
            type: 'success',
            read: false,
          },
        })
      );
    } catch (err) {}
    setEnrollingId(null);
  };

  const firstName = session?.user?.name ? session.user.name.split(' ')[0] : 'Scholar';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 🚀 Modern SaaS Hero Greeting Banner */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          padding: '32px 36px',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(147, 51, 234, 0.04) 50%, var(--bg-white) 100%)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 700,
              marginBottom: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <Sparkles size={13} />
            <span>AI Knowledge Engine Active</span>
          </div>
          <h1
            style={{
              fontSize: '1.95rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              margin: '0 0 6px 0',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
            You have maintained a <strong>{stats.streak}-day learning streak</strong>. Explore your synthesized AI modules or initiate a new deep-dive.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/discover"
            className="btn btn-secondary"
            style={{ borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Compass size={16} />
            <span>Explore Catalog</span>
          </Link>
          <Link
            href="/generate"
            className="btn btn-primary"
            style={{ borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} />
            <span>Generate Course</span>
          </Link>
        </div>
      </div>

      {/* 📊 Top 4 Metric Stat Cards */}
      <div className="grid-4">
        <div className="stat-card">
          <div className="stat-icon yellow">
            <Flame size={24} strokeWidth={2.2} />
          </div>
          <div className="stat-info">
            <h3>{stats.streak}</h3>
            <p>Day Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpenCheck size={24} strokeWidth={2.2} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={24} strokeWidth={2.2} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedModules} / {stats.totalModules}</h3>
            <p>Modules Done</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={24} strokeWidth={2.2} />
          </div>
          <div className="stat-info">
            <h3>{stats.points}</h3>
            <p>Mastery Points</p>
          </div>
        </div>
      </div>

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
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', fontFamily: "'Outfit', sans-serif" }}>
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
        </div>
      </div>

      {/* 🧠 Smart Recommendations & Quiz Performance */}
      <div className="grid-2">
        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A855F7',
                }}
              >
                <Sparkles size={18} />
              </div>
              <h3 className="card-title">AI Smart Recommendations</h3>
            </div>
          </div>
          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: '28px 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Complete activities to unlock personalized curriculum suggestions!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommendations.map((rec: any, i: number) => (
                <Link
                  key={i}
                  href={rec.link}
                  className="recommendation-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'var(--primary-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.92rem', fontWeight: 600 }}>{rec.title}</h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rec.desc}
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Stats */}
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

      {/* 📥 Available Courses -> Requires Enrollment */}
      <div id="available" style={{ scrollMarginTop: '100px' }}>
        {availableCourses.length > 0 && (
          <div
            className="card"
            style={{
              marginBottom: 24,
              border: '2px dashed var(--primary)',
              background: 'rgba(99, 102, 241, 0.03)',
            }}
          >
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <Inbox size={18} />
                </div>
                <div>
                  <h3 className="card-title">Available in Account (Not Enrolled)</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Activate enrollment to unlock modules, interactive quizzes, and certificates.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid-auto">
              {availableCourses.map((c: any) => (
                <div
                  key={c.id}
                  className="module-card"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="badge badge-primary">{c.level || 'Intermediate'}</span>
                  </div>
                  <div className="module-title" style={{ paddingRight: '28px', fontSize: '1.05rem', fontWeight: 700 }}>
                    {c.title}
                  </div>
                  <div className="module-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                    {c.topic}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '18px' }}>
                    <button
                      onClick={() => handleEnrollMatch(c.id)}
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: '0.88rem', borderRadius: '10px' }}
                      disabled={enrollingId === c.id}
                    >
                      {enrollingId === c.id ? (
                        <span className="spinner spinner-sm" />
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>Enroll to Access</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteModal({ ...c, isRemoving: true });
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title="Remove from account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 📚 Enrolled Courses */}
      <div id="courses" style={{ scrollMarginTop: '100px' }}>
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
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="card-title">Enrolled Courses (Active)</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Your active learning modules and course progress.
                </p>
              </div>
            </div>
            <Link
              href="/generate"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>New Course</span>
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <div
              className="empty-state"
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                borderRadius: '16px',
                border: '1px dashed var(--border)',
                background: 'rgba(120, 120, 120, 0.02)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'var(--primary-bg)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: '16px',
                }}
              >
                <BookOpen size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0' }}>No Active Enrollments</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto 20px auto' }}>
                Prompt our AI syllabus engine to build a custom course curriculum suited to your goals.
              </p>
              <Link
                href="/generate"
                className="btn btn-primary"
                style={{ borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={16} />
                <span>Generate Your First Course</span>
              </Link>
            </div>
          ) : (
            <div className="grid-auto">
              {enrolledCourses.map((c: any) => (
                <div
                  key={c.id}
                  className="module-card"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '22px',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <Link href={`/course/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span className="badge badge-primary">{c.level || 'Intermediate'}</span>
                      {c.completed && (
                        <span
                          className="badge"
                          style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                        >
                          Quizzes Pending
                        </span>
                      )}
                    </div>
                    <div className="module-title" style={{ paddingRight: '28px', fontSize: '1.05rem', fontWeight: 700 }}>
                      {c.title}
                    </div>
                    <div className="module-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px' }}>
                      {c.topic}
                    </div>

                    <div className="progress-bar" style={{ marginTop: 16 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${c.moduleCount > 0 ? (c.completedCount / c.moduleCount) * 100 : 0}%` }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginTop: 8,
                      }}
                    >
                      <span>
                        {c.completedCount}/{c.moduleCount} modules
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                        <span>Resume</span>
                        <Play size={12} className="fill-current" />
                      </span>
                    </div>
                  </Link>

                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteModal(c);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                      title="Unenroll / Delete Course"
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🎓 Completed Courses */}
      {completedCourses.length > 0 && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                }}
              >
                <Award size={18} />
              </div>
              <h3 className="card-title" style={{ color: '#10B981' }}>
                Completed Certifications
              </h3>
            </div>
          </div>
          <div className="grid-auto">
            {completedCourses.map((c: any) => (
              <div
                key={c.id}
                className="module-card"
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-white)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  padding: '20px',
                  borderRadius: '16px',
                }}
              >
                <Link href={`/certificate/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span
                      className="badge"
                      style={{ background: '#10B981', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Certified</span>
                    </span>
                  </div>
                  <div className="module-title" style={{ paddingRight: '24px', fontSize: '1.05rem', fontWeight: 700 }}>
                    {c.title}
                  </div>
                  <div className="module-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                    {c.topic}
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <span
                      className="btn"
                      style={{
                        width: '100%',
                        fontSize: '0.88rem',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                        textAlign: 'center',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '10px',
                        padding: '10px',
                        fontWeight: 600,
                      }}
                    >
                      <FileText size={16} />
                      <span>View Official Certificate</span>
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete / Unenroll Confirmation Modal */}
      {deleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '420px', animation: 'scaleIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: deleteModal.isRemoving ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: deleteModal.isRemoving ? 'var(--primary)' : 'var(--danger)',
                }}
              >
                {deleteModal.isRemoving ? <FolderMinus size={20} /> : <AlertTriangle size={20} />}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>
                {deleteModal.isRemoving ? 'Remove from Catalog' : 'Confirm Unenrollment'}
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px', fontSize: '0.9rem' }}>
              {deleteModal.isRemoving
                ? `This will remove "${deleteModal.title}" from your account list. You can regenerate or re-discover it anytime.`
                : `Are you sure you want to unenroll from "${deleteModal.title}"? Progress will be saved and moved to available catalog.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                style={{ borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{
                  background: deleteModal.isRemoving ? 'var(--text)' : 'var(--danger)',
                  borderColor: deleteModal.isRemoving ? 'var(--text)' : 'var(--danger)',
                  borderRadius: '8px',
                }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    if (deleteModal.isRemoving) {
                      await fetch(`/api/courses/${deleteModal.id}`, { method: 'DELETE' });
                      setData((prev: any) => ({
                        ...prev,
                        recentCourses: prev.recentCourses.filter((rc: any) => rc.id !== deleteModal.id),
                      }));

                      window.dispatchEvent(
                        new CustomEvent('icmsystem_toast', {
                          detail: {
                            id: 'delete-' + Date.now(),
                            title: 'Course Removed',
                            message: `"${deleteModal.title}" has been removed from your catalog.`,
                            type: 'success',
                            read: false,
                          },
                        })
                      );
                    } else {
                      await fetch(`/api/courses/${deleteModal.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enrolled: false }),
                      });
                      setData((prev: any) => ({
                        ...prev,
                        recentCourses: prev.recentCourses.map((c: any) =>
                          c.id === deleteModal.id ? { ...c, enrolled: false } : c
                        ),
                      }));

                      window.dispatchEvent(
                        new CustomEvent('icmsystem_toast', {
                          detail: {
                            id: 'unenroll-' + Date.now(),
                            title: 'Course Unenrolled',
                            message: `"${deleteModal.title}" moved back to your available catalog.`,
                            type: 'success',
                            read: false,
                          },
                        })
                      );
                    }
                  } catch (err) {}
                  setIsDeleting(false);
                  setDeleteModal(null);
                }}
              >
                {isDeleting ? 'Processing...' : deleteModal.isRemoving ? 'Yes, Remove' : 'Yes, Unenroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center' }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
