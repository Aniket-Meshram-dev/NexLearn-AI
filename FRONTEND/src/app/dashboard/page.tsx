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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') {
      fetch('/api/user/stats')
        .then(r => r.ok ? r.json() : null)
        .then(d => { 
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
        // Longer timeout to ensure complete layout rendering
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
    return <div className="loading-page"><div className="spinner" /><p>Loading dashboard...</p></div>;
  }

  const { stats, weeklyStudy, recommendations, recentCourses = [] } = data;
  const availableCourses = (recentCourses || []).filter(c => !c.enrolled && !c.fullyCompleted);
  const enrolledCourses = (recentCourses || []).filter(c => c.enrolled && !c.fullyCompleted);
  const completedCourses = (recentCourses || []).filter(c => c.fullyCompleted);

  const handleEnrollMatch = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrolled: true })
      });
      setData(prev => ({
        ...prev,
        recentCourses: prev.recentCourses.map(c => c.id === courseId ? { ...c, enrolled: true } : c)
      }));
      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
        detail: {
          id: 'enroll-' + Date.now(),
          title: 'Course Enrolled!',
          message: 'You have actively enrolled in the course.',
          type: 'success',
          read: false
        }
      }));
    } catch(err) {}
    setEnrollingId(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {session?.user?.name?.split(' ')[0]} 👋</h1>
        <p>Here&apos;s your learning progress overview</p>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon yellow">🔥</div>
          <div className="stat-info"><h3>{stats.streak}</h3><p>Day Streak</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📚</div>
          <div className="stat-info"><h3>{stats.totalCourses}</h3><p>Courses</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3>{stats.completedModules}/{stats.totalModules}</h3><p>Modules Done</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⭐</div>
          <div className="stat-info"><h3>{stats.points}</h3><p>Total Points</p></div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <h3 className="card-title">Course Completion</h3>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <div style={{ width: 140, height: 140 }}>
              <Doughnut 
                data={{
                  labels: ['Completed', 'Remaining'],
                  datasets: [{
                    data: [stats.completedModules, Math.max(0, stats.totalModules - stats.completedModules)],
                    backgroundColor: ['#4F46E5', '#E2E8F0'],
                    borderWidth: 0,
                  }]
                }}
                options={{
                  cutout: '75%',
                  plugins: { legend: { display: false }, tooltip: { enabled: true } },
                  maintainAspectRatio: false
                }}
              />
            </div>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>{stats.courseCompletion}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>{stats.completedModules} done</span>
            <span>{Math.max(0, stats.totalModules - stats.completedModules)} left</span>
          </div>
        </div>

        {/* Learning Streak Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Learning Activity</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>{stats.streak} day streak 🔥</span>
          </div>
          <div style={{ height: 160 }}>
            <Bar 
              data={{
                labels: weeklyStudy.map(d => d.day),
                datasets: [{
                  label: 'Minutes',
                  data: weeklyStudy.map(d => d.minutes),
                  backgroundColor: 'rgba(79, 70, 229, 0.8)',
                  borderRadius: 6,
                  hoverBackgroundColor: '#4F46E5',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { display: false, beginAtZero: true },
                  x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Recommendations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🧠 Smart Recommendations</h3>
          </div>
          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <p>Complete some activities to get personalized recommendations!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recommendations.map((rec, i) => (
                <Link key={i} href={rec.link} className="recommendation-card">
                  <div className="recommendation-icon" style={{ background: 'var(--primary-bg)' }}>{rec.icon}</div>
                  <div>
                    <h4>{rec.title}</h4>
                    <p>{rec.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Quiz Performance</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, background: 'var(--primary-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{stats.totalQuizzes}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quizzes Taken</div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: stats.avgScore >= 70 ? 'var(--success-bg)' : 'var(--warning-bg)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stats.avgScore >= 70 ? 'var(--success)' : 'var(--warning)' }}>{stats.avgScore}%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Courses -> Requires Enrollment */}
      <div id="available" style={{ scrollMarginTop: '100px' }}>
        {availableCourses.length > 0 && (
          <div className="card" style={{ marginBottom: 24, border: '2px dashed var(--primary)' }}>
            <div className="card-header">
              <h3 className="card-title">📥 Available in Account (Not Enrolled)</h3>
            </div>
            <div className="grid-auto">
              {availableCourses.map(c => (
                <div key={c.id} className="module-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', opacity: 0.8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge badge-primary">{c.level}</span>
                  </div>
                  <div className="module-title" style={{ paddingRight: '24px' }}>{c.title}</div>
                  <div className="module-desc">{c.topic}</div>
                  
                  <div style={{ marginTop: 16 }}>
                    <button onClick={() => handleEnrollMatch(c.id)} className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem' }} disabled={enrollingId === c.id}>
                      {enrollingId === c.id ? <span className="spinner spinner-sm" /> : '+ Enroll Now to Access'}
                    </button>
                  </div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button 
                      onClick={(e) => { e.preventDefault(); setDeleteModal({ ...c, isRemoving: true }); }} 
                      style={{ 
                        background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', 
                        width: '28px', height: '28px', borderRadius: '50%',
                        fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', opacity: 0.8,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      title="Remove from account"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enrolled Courses */}
      <div id="courses" style={{ scrollMarginTop: '100px' }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title">📚 Enrolled Courses (Active)</h3>
            <Link href="/generate" className="btn btn-primary btn-sm">+ New Course</Link>
          </div>
          {enrolledCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Active Enrollments</h3>
              <p>Generate an AI course and enroll to get started!</p>
              <Link href="/generate" className="btn btn-primary">Generate Course</Link>
            </div>
          ) : (
            <div className="grid-auto">
              {enrolledCourses.map(c => (
                <div key={c.id} className="module-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/course/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="badge badge-primary">{c.level}</span>
                      {c.completed && <span className="badge badge-success">✓ Quizzes Pending</span>}
                    </div>
                    <div className="module-title" style={{ paddingRight: '24px' }}>{c.title}</div>
                  <div className="module-desc">{c.topic}</div>
                  <div className="progress-bar" style={{ marginTop: 12 }}>
                    <div className="progress-fill" style={{ width: `${c.moduleCount > 0 ? (c.completedCount / c.moduleCount) * 100 : 0}%` }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    {c.completedCount}/{c.moduleCount} modules
                  </div>
                  </Link>
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteModal(c);
                      }} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--danger)', opacity: 0.7 }}
                      title="Unenroll / Delete Course"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className="card" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ color: 'var(--success)' }}>🎓 Completed Certificates</h3>
          </div>
          <div className="grid-auto">
            {completedCourses.map(c => (
              <div key={c.id} className="module-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg-white)', borderColor: 'var(--success)' }}>
                <Link href={`/certificate/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>✓ Fully Certified</span>
                  </div>
                  <div className="module-title" style={{ paddingRight: '24px' }}>{c.title}</div>
                  <div className="module-desc">{c.topic}</div>
                  
                  <div style={{ marginTop: 16 }}>
                    <span className="btn" style={{ width: '100%', fontSize: '0.9rem', background: 'var(--success-light)', color: 'var(--success)', textAlign: 'center', display: 'block', borderRadius: 'var(--radius)', padding: '10px' }}>
                      📄 View Certificate
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', animation: 'scaleIn 0.2s ease-out' }}>
            <h3 style={{ marginTop: 0, color: deleteModal.isRemoving ? 'var(--text)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {deleteModal.isRemoving ? '📁 Remove from Account' : '⚠️ Confirm Unenrollment'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              {deleteModal.isRemoving 
                ? `This will remove "${deleteModal.title}" from your account list. You can always generate it again later if needed.`
                : `Are you sure you want to unenroll from "${deleteModal.title}"? It will be moved to your available courses catalog.`
              }
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteModal(null)} 
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    if (deleteModal.isRemoving) {
                      // Permanent delete for items already in 'Available'
                      await fetch(`/api/courses/${deleteModal.id}`, { method: 'DELETE' });
                      setData(prev => ({ ...prev, recentCourses: prev.recentCourses.filter(rc => rc.id !== deleteModal.id) }));
                      
                      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
                        detail: {
                          id: 'delete-' + Date.now(),
                          title: 'Course Removed',
                          message: `"${deleteModal.title}" has been removed from your account.`,
                          type: 'success',
                          read: false
                        }
                      }));
                    } else {
                      // Move to available (unenroll) for active courses
                      await fetch(`/api/courses/${deleteModal.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enrolled: false })
                      });
                      setData(prev => ({
                        ...prev,
                        recentCourses: prev.recentCourses.map(c => c.id === deleteModal.id ? { ...c, enrolled: false } : c)
                      }));

                      window.dispatchEvent(new CustomEvent('icmsystem_toast', {
                        detail: {
                          id: 'unenroll-' + Date.now(),
                          title: 'Course Unenrolled',
                          message: `"${deleteModal.title}" has been moved back to your available catalog.`,
                          type: 'success',
                          read: false
                        }
                      }));
                    }
                  } catch (err) {}
                  setIsDeleting(false);
                  setDeleteModal(null);
                }}
              >
                {isDeleting ? 'Processing...' : (deleteModal.isRemoving ? 'Yes, Remove Course' : 'Yes, Unenroll')}
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
