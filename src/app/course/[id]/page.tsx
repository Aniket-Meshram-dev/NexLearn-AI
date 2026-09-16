'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Share2,
  Copy,
  Check,
  X,
  Globe,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Calendar,
  GraduationCap,
  FileCheck,
  Layers,
  BookmarkPlus,
  Lock,
  Clock,
  Download,
  HardDrive,
} from 'lucide-react';
import { XIcon, LinkedInIcon } from '@/components/SocialIcons';
import {
  saveCourseOffline,
  getOfflineCourse,
  downloadFullCourseForOffline,
  isCourseSavedOffline,
} from '@/lib/offlineStorage';

function parseRoadmap(roadmapRaw: string | any) {
  if (!roadmapRaw) return [];
  if (typeof roadmapRaw !== 'string') {
    if (Array.isArray(roadmapRaw)) {
      return roadmapRaw.map((r, i) => ({
        title: 'Milestone ' + (i + 1),
        duration: '',
        details: typeof r === 'string' ? r : JSON.stringify(r),
        items: [] as string[],
      }));
    }
    if (typeof roadmapRaw === 'object') {
      return Object.entries(roadmapRaw).map(([k, v]) => ({
        title: k,
        duration: '',
        details: typeof v === 'string' ? v : JSON.stringify(v),
        items: [] as string[],
      }));
    }
    return [];
  }

  // 1. Try JSON parsing
  try {
    const parsed = JSON.parse(roadmapRaw);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => {
          if (typeof item === 'string') return parseLine(item, idx);
          return {
            title: item.title || item.week || item.phase || ('Milestone ' + (idx + 1)),
            duration: item.duration || item.days || '',
            details: item.details || item.description || '',
            items: (item.topics || item.items || []) as string[],
          };
        });
      }
      return Object.entries(parsed).map(([key, val], idx) => {
        if (typeof val === 'string') return parseLine(key + ': ' + val, idx);
        return {
          title: key,
          duration: (val as any).duration || '',
          details: (val as any).description || (val as any).details || JSON.stringify(val),
          items: ((val as any).items || []) as string[],
        };
      });
    }
  } catch {}

  // 2. Normalize escaped newlines and linebreaks
  let text = roadmapRaw
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // Also handle cases where weeks follow each other inline
  text = text.replace(/([.!?])\s*(?=(?:Week|Phase|Month|Stage|Day|Milestone)\s*\d+)/gi, '$1\n');

  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const sections: { title: string; duration: string; details: string; items: string[] }[] = [];
  let current: { title: string; duration: string; details: string; items: string[] } | null = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const headerMatch =
      line.match(/^#+\s*(.*)$/) ||
      line.match(/^(?:[-*•\d.]+\s*)?((?:Week|Day|Phase|Month|Stage|Step|Milestone)\s*[\d\w\s–—\-]*?)(?:\s*\(([^)]+)\))?(?::\s*(.*))?$/i);

    if (headerMatch) {
      if (current) sections.push(current);
      const isHash = line.startsWith('#');
      if (isHash) {
        current = { title: headerMatch[1].trim(), duration: '', details: '', items: [] };
      } else {
        const title = headerMatch[1].trim();
        const duration = headerMatch[2]?.trim() || '';
        const details = headerMatch[3]?.trim() || '';
        current = { title, duration, details, items: [] };
      }
    } else if (current) {
      const cleanItem = line.replace(/^[-*•\d.]+\s*/, '').trim();
      if (cleanItem) current.items.push(cleanItem);
    } else {
      current = { title: 'Overview', duration: '', details: line, items: [] };
    }
  }
  if (current) sections.push(current);
  return sections;

  function parseLine(l: string, i: number) {
    const m = l.match(/^(?:[-*•\d.]+\s*)?((?:Week|Day|Phase|Month|Stage|Step|Milestone)\s*[\d\w\s–—\-]*?)(?:\s*\(([^)]+)\))?(?::\s*(.*))?$/i);
    if (m) {
      return {
        title: m[1].trim(),
        duration: m[2]?.trim() || '',
        details: m[3]?.trim() || '',
        items: [] as string[],
      };
    }
    return { title: 'Milestone ' + (i + 1), duration: '', details: l, items: [] as string[] };
  }
}

function renderRoadmap(roadmapRaw: string | any) {
  if (!roadmapRaw) return null;

  const sections = parseRoadmap(roadmapRaw);
  if (!sections || sections.length === 0) {
    return (
      <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {typeof roadmapRaw === 'string' ? roadmapRaw : JSON.stringify(roadmapRaw, null, 2)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', marginTop: 4 }}>
      {sections.map((sec, idx) => {
        const isLast = idx === sections.length - 1;
        return (
          <div key={idx} style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Stepper Node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  zIndex: 2,
                }}
              >
                {idx + 1}
              </div>
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.35), var(--border))',
                    margin: '6px 0',
                  }}
                />
              )}
            </div>

            {/* Content Card */}
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 14,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                marginBottom: isLast ? 0 : 16,
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: sec.details || (sec.items && sec.items.length > 0) ? 8 : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)' }}>
                    {sec.title}
                  </h4>
                </div>
                {sec.duration && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <Clock size={12} />
                    <span>{sec.duration}</span>
                  </span>
                )}
              </div>

              {sec.details && (
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {sec.details}
                </p>
              )}

              {sec.items && sec.items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                  {sec.items.map((it, itemIdx) => {
                    const dayMatch = it.match(/^\*\*(Day\s*\d+[^*]*)\*\*:\s*(.*)$/i) || it.match(/^(Day\s*\d+):\s*(.*)$/i);
                    if (dayMatch) {
                      return (
                        <div key={itemIdx} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: '0.88rem', lineHeight: 1.5 }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: 'var(--text)',
                              background: 'var(--bg)',
                              padding: '2px 8px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              flexShrink: 0,
                              fontSize: '0.78rem',
                            }}
                          >
                            {dayMatch[1].replace(/\*\*/g, '')}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>{dayMatch[2]}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={itemIdx} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, lineHeight: 1 }}>•</span>
                        <span>{it.replace(/\*\*/g, '')}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CourseModulesPage() {
  const { id } = useParams();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Offline Learning Mode State
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [downloadingOffline, setDownloadingOffline] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    isCourseSavedOffline(String(id)).then(setIsSavedOffline);

    fetch(`/api/courses/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then((d) => {
        if (d && d.course) {
          setCourseData(d);
          saveCourseOffline(d.course); // Auto-cache course outline
        }
        setLoading(false);
      })
      .catch(async () => {
        // Seamless Offline Fallback from IndexedDB
        const offlineCourse = await getOfflineCourse(String(id));
        if (offlineCourse) {
          setCourseData({ course: offlineCourse });
          setIsOfflineMode(true);
        }
        setLoading(false);
      });
  }, [id]);

  const handleDownloadFullCourse = async () => {
    if (downloadingOffline) return;
    setDownloadingOffline(true);
    setDownloadProgress({ current: 0, total: 1 });
    try {
      await downloadFullCourseForOffline(String(id), (current, total) => {
        setDownloadProgress({ current, total });
      });
      setIsSavedOffline(true);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'offline-dl-' + Date.now(),
            title: 'Course Downloaded Offline!',
            message: 'All module notes, code & exercises are saved in local storage for offline study.',
            type: 'success',
          },
        })
      );
    } catch (err) {
      console.warn('Full course download error:', err);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'offline-err-' + Date.now(),
            title: 'Download Notice',
            message: 'Course outline cached. Connect to internet to refresh remote updates.',
            type: 'info',
          },
        })
      );
    } finally {
      setDownloadingOffline(false);
    }
  };

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

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/c/${id}`
      : `/c/${id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Check out this AI-generated curriculum for "${course.title}" on @NexLearnAI!`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Link href="/dashboard" style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 8, display: 'inline-block' }}>
              ← Back to Dashboard
            </Link>
            <h1 style={{ margin: '0 0 6px 0' }}>{course.title}</h1>
            <p style={{ margin: 0 }}>{course.description}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadFullCourse}
              disabled={downloadingOffline}
              className="btn btn-outline"
              style={{
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.88rem',
                borderColor: isSavedOffline ? '#10B981' : undefined,
                color: isSavedOffline ? '#10B981' : undefined,
                background: isSavedOffline ? 'rgba(16, 185, 129, 0.08)' : undefined,
                cursor: downloadingOffline ? 'wait' : 'pointer',
              }}
              title="Download entire course and all modules for offline learning"
            >
              {isSavedOffline ? <HardDrive size={16} /> : <Download size={16} />}
              <span>
                {downloadingOffline
                  ? `Downloading (${downloadProgress.current}/${downloadProgress.total})...`
                  : isSavedOffline
                  ? 'Saved Offline ✓'
                  : 'Download Offline'}
              </span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="btn btn-outline"
              style={{ borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}
            >
              <Share2 size={16} />
              <span>Share Course</span>
            </button>
          </div>
        </div>

        {isOfflineMode && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              color: '#F59E0B',
              fontWeight: 600,
            }}
          >
            <HardDrive size={18} />
            <span>
              <strong>Offline Mode:</strong> You are studying from local cache. Full curriculum outline & notes are available without internet.
            </span>
          </div>
        )}
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={22} />
          </div>
          <div className="stat-info"><h3>{course.modules.length}</h3><p>Modules</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info"><h3>{completedCount}</h3><p>Completed</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <TrendingUp size={22} />
          </div>
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
          <h3 className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <span>Learning Roadmap</span>
          </h3>
          {renderRoadmap(course.roadmap)}
        </div>
      )}

      {course.completed && courseData.allQuizzesTaken && (
        <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', textAlign: 'center', padding: '32px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <GraduationCap size={52} style={{ color: 'white' }} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Congratulations! Course Completed!</h3>
          <p style={{ opacity: 0.9, marginBottom: 20, fontSize: '0.95rem' }}>You have successfully completed all modules and quizzes. Download your certificate now!</p>
          <Link href={`/certificate/${id}`} className="btn" style={{ background: 'white', color: '#4F46E5', fontWeight: 700, fontSize: '1rem', padding: '12px 32px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FileCheck size={18} />
            <span>Download Certificate (PDF)</span>
          </Link>
        </div>
      )}
      
      {course.completed && !courseData.allQuizzesTaken && (
        <div className="card" style={{ marginBottom: 24, background: 'var(--warning-bg)', border: '1px solid var(--warning)', textAlign: 'center', padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>Missing Quizzes</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text)' }}>You must complete all module quizzes to unlock your final certificate.</p>
        </div>
      )}

      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Layers size={20} style={{ color: 'var(--primary)' }} />
        <span>Course Modules</span>
      </h2>
      
      {!course.enrolled && (
        <div className="card" style={{ marginBottom: 24, padding: '32px', textAlign: 'center', background: 'var(--primary-bg)', border: '2px dashed var(--primary)', borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <BookmarkPlus size={44} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Start this Course</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Enroll to access all lessons, practice questions, and quizzes.</p>
          <button onClick={handleEnroll} className="btn btn-primary btn-lg" style={{ padding: '12px 32px', fontSize: '1.05rem', borderRadius: 12 }}>
            Start Learning Now
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {course.modules.map((mod: any, i: number) => {
          const isLocked = i > 0 && !course.modules[i - 1].completed;
          const userCanAccess = course.enrolled && !isLocked;
          const Wrapper: any = userCanAccess ? Link : 'div';
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
                    {isLocked && (
                      <span style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <Lock size={12} />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <div className="module-title" style={{ color: isLocked ? 'var(--text-muted)' : 'inherit' }}>{mod.title}</div>
                  <div className="module-desc" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{mod.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`badge ${mod.difficulty === 'Easy' ? 'badge-success' : mod.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'}`} style={{ opacity: isLocked ? 0.6 : 1 }}>
                    {mod.difficulty}
                  </span>
                  {mod.completed && (
                    <div style={{ marginTop: 8, color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <CheckCircle2 size={13} />
                      <span>Completed</span>
                    </div>
                  )}
                  {mod.quiz && !isLocked && (
                    <div style={{ marginTop: 4, fontSize: '0.75rem', color: mod.quiz.attempts?.length > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: mod.quiz.attempts?.length > 0 ? 600 : 'normal' }}>
                      {mod.quiz.attempts?.length > 0 ? 'Quiz completed' : 'Quiz ready'}
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

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Share Public Course</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Anyone with this public link can view your course syllabus, explore the curriculum outline, and clone it into their own workspace.
            </p>

            {/* Link Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '12px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                marginBottom: '20px',
              }}
            >
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                }}
              />
              <button
                onClick={handleCopyLink}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Social Sharing Row */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleShareTwitter}
                className="btn btn-outline"
                style={{ flex: 1, borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <XIcon size={16} />
                <span>Share on X</span>
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="btn btn-outline"
                style={{ flex: 1, borderRadius: '10px', color: '#0a66c2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <LinkedInIcon size={16} />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
