'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseModulesPage() {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${id}`).then(r => r.json()).then(d => { setCourseData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading course...</p></div>;
  if (!courseData || !courseData.course) return <div className="empty-state"><h3>Course not found</h3></div>;

  const course = courseData.course;
  const completedCount = course.modules.filter(m => m.completed).length;
  const progress = course.modules.length > 0 ? Math.round((completedCount / course.modules.length) * 100) : 0;

  const handleEnroll = async () => {
    try {
      await fetch(`/api/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrolled: true })
      });
      setCourseData(prev => ({
        ...prev,
        course: { ...prev.course, enrolled: true }
      }));
      window.dispatchEvent(new CustomEvent('icads_toast', {
        detail: {
          id: 'enroll-' + Date.now(),
          title: 'Course Enrolled!',
          message: 'You have actively enrolled in the course.',
          type: 'success',
          read: false
        }
      }));
    } catch(err) {}
  };

  return (
    <div>
      <div className="page-header">
        <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 8, display: 'inline-block' }}>← Back to Dashboard</Link>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue">📚</div>
          <div className="stat-info"><h3>{course.modules.length}</h3><p>Modules</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><h3>{completedCount}</h3><p>Completed</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">📊</div>
          <div className="stat-info"><h3>{progress}%</h3><p>Progress</p></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">Course Progress</h3>
          <span className="badge badge-primary">{course.level}</span>
        </div>
        <div className="progress-bar" style={{ height: 12 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {course.roadmap && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="card-title" style={{ marginBottom: 12 }}>🗺️ Learning Roadmap</h3>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {(() => {
              if (typeof course.roadmap === 'string') {
                try {
                  const parsed = JSON.parse(course.roadmap);
                  if (typeof parsed === 'object' && parsed !== null) {
                    if (Array.isArray(parsed)) {
                      return parsed.map((item, idx) => <div key={idx} style={{marginBottom: 8}}>{typeof item === 'string' ? item : JSON.stringify(item)}</div>);
                    }
                    return Object.entries(parsed).map(([key, val]) => (
                      <div key={key} style={{marginBottom: 8}}>
                        <strong>{key}:</strong> {typeof val === 'string' ? val : JSON.stringify(val)}
                      </div>
                    ));
                  }
                  return course.roadmap;
                } catch (e) {
                  return course.roadmap;
                }
              }
              return course.roadmap;
            })()}
          </div>
        </div>
      )}

      {course.completed && courseData.allQuizzesTaken && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎓</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Congratulations! Course Completed!</h3>
          <p style={{ opacity: 0.9, marginBottom: 20, fontSize: '0.95rem' }}>You have successfully completed all modules and quizzes. Download your certificate now!</p>
          <Link href={`/certificate/${id}`} className="btn" style={{ background: 'white', color: '#4F46E5', fontWeight: 700, fontSize: '1rem', padding: '12px 32px', borderRadius: 12 }}>
            📄 Download Certificate (PDF)
          </Link>
        </div>
      )}
      
      {course.completed && !courseData.allQuizzesTaken && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--warning-bg)', border: '1px solid var(--warning)', textAlign: 'center', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>Missing Quizzes</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text)' }}>You must complete all module quizzes to unlock your final certificate.</p>
        </div>
      )}

      <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 16 }}>📖 Modules</h2>
      
      {!course.enrolled && (
        <div className="card" style={{ marginBottom: 24, padding: '32px', textAlign: 'center', background: 'var(--primary-bg)', border: '2px dashed var(--primary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📥</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Not Enrolled Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You must enroll in this course to unlock access to the modules and quizzes below!</p>
          <button onClick={handleEnroll} className="btn btn-primary btn-lg" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
            + Enroll Now to Access
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {course.modules.map((mod, i) => {
          const isLocked = i > 0 && !course.modules[i - 1].completed;
          const userCanAccess = course.enrolled && !isLocked;
          const Wrapper = userCanAccess ? Link : 'div';
          return (
            <Wrapper key={mod.id} href={userCanAccess ? `/course/${id}/module/${mod.id}` : '#'}
              className={`module-card ${mod.completed ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
              style={{ 
                textDecoration: 'none', 
                opacity: userCanAccess ? 1 : 0.6, 
                cursor: userCanAccess ? 'pointer' : 'not-allowed'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="module-number" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    Module {i + 1}
                    {isLocked && <span style={{ fontSize: '0.9rem' }}>🔒 Locked</span>}
                  </div>
                  <div className="module-title" style={{ color: isLocked ? 'var(--text-muted)' : 'inherit' }}>{mod.title}</div>
                  <div className="module-desc" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{mod.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`badge ${mod.difficulty === 'Easy' ? 'badge-success' : mod.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'}`} style={{ opacity: isLocked ? 0.6 : 1 }}>
                    {mod.difficulty}
                  </span>
                  {mod.completed && <div style={{ marginTop: 8, color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>✓ Completed</div>}
                  {mod.quiz && !isLocked && (
                    <div style={{ marginTop: 4, fontSize: '0.75rem', color: mod.quiz.attempts?.length > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: mod.quiz.attempts?.length > 0 ? 600 : 'normal' }}>
                      {mod.quiz.attempts?.length > 0 ? '🎯 Quiz completed' : 'Quiz available'}
                    </div>
                  )}
                  {isLocked && (
                    <div style={{ marginTop: 8, color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>
                      Complete previous<br/>module to unlock
                    </div>
                  )}
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
