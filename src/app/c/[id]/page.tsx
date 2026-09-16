'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NexLearnLogo from '@/components/NexLearnLogo';
import {
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Layers,
  Share2,
  Check,
  ArrowRight,
  User,
  GraduationCap,
  Play,
  Copy,
} from 'lucide-react';
import { XIcon, LinkedInIcon } from '@/components/SocialIcons';

interface PublicCourseData {
  id: string;
  title: string;
  description: string;
  topic: string;
  level: string;
  goal: string;
  hoursPerDay: number;
  duration: string;
  authorName: string;
  createdAt: string;
  modules: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    orderIndex: number;
    subtopics?: string | null;
  }[];
}

export default function PublicCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [course, setCourse] = useState<PublicCourseData | null>(null);
  const [viewer, setViewer] = useState<{
    isAuthenticated: boolean;
    isOwner: boolean;
    isEnrolled: boolean;
  }>({
    isAuthenticated: false,
    isOwner: false,
    isEnrolled: false,
  });
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/public/courses/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Course not found');
        return r.json();
      })
      .then((data) => {
        setCourse(data.course);
        setViewer(data.viewer);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course:', err);
        setLoading(false);
      });
  }, [id]);

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    if (!course) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(
      `Check out this AI-generated curriculum for "${course.title}" on @NexLearnAI!`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleEnroll = async () => {
    if (!viewer.isAuthenticated) {
      router.push(`/register?callbackUrl=/c/${id}`);
      return;
    }

    if (viewer.isEnrolled) {
      router.push(`/course/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch(`/api/public/courses/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.courseId) {
        router.push(`/course/${data.courseId}`);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <BookOpen size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0' }}>Course Unavailable</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto' }}>
          This curriculum may have been made private or removed by its author.
        </p>
        <Link href="/" className="btn btn-primary" style={{ borderRadius: '10px' }}>
          Explore NexLearn AI
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Public Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-white)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
        }}
      >
        <NexLearnLogo size="sm" textSize="1.35rem" clickable={true} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {viewer.isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn btn-outline btn-sm"
              style={{ borderRadius: '8px', fontSize: '0.86rem' }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={`/login?callbackUrl=/c/${id}`}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.86rem' }}
              >
                Sign In
              </Link>
              <Link
                href={`/register?callbackUrl=/c/${id}`}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '8px', fontSize: '0.86rem' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
        {/* Course Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '24px',
            padding: '36px 40px',
            marginBottom: '36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Metadata Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {course.level}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
              }}
            >
              {course.topic}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
              <span>{course.duration} • {course.hoursPerDay}h/day</span>
            </span>
          </div>

          {/* Title & Description */}
          <h1
            style={{
              fontSize: '2.4rem',
              fontWeight: 900,
              lineHeight: 1.25,
              margin: '0 0 14px 0',
              color: 'var(--text)',
              letterSpacing: '-0.02em',
            }}
          >
            {course.title}
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px', margin: '0 0 24px 0' }}>
            {course.description}
          </p>

          {/* Author Attribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {course.authorName[0]?.toUpperCase() || 'N'}
            </div>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Curated with NexLearn AI by <strong style={{ color: 'var(--text)' }}>{course.authorName}</strong>
            </span>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {enrolling ? (
                <>
                  <span className="spinner spinner-sm" />
                  <span>Preparing Course...</span>
                </>
              ) : viewer.isEnrolled ? (
                <>
                  <Play size={18} className="fill-current" />
                  <span>Continue Learning</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{viewer.isAuthenticated ? 'Enroll in Course' : 'Start Learning Free'}</span>
                </>
              )}
            </button>

            {/* Social Share Buttons */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleShareTwitter}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Share on X (Twitter)"
                aria-label="Share on X"
              >
                <XIcon size={17} />
              </button>

              <button
                onClick={handleShareLinkedIn}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border)',
                  color: '#0a66c2',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <LinkedInIcon size={17} />
              </button>

              <button
                onClick={handleCopyLink}
                style={{
                  padding: '0 16px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border)',
                  color: copied ? '#10b981' : 'var(--text)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div style={{ padding: '18px 20px', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{course.modules.length} Full Modules</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Theory, Examples & Exercises</div>
            </div>
          </div>

          <div style={{ padding: '18px 20px', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>SM-2 Flashcards</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Spaced Repetition Active Recall</div>
            </div>
          </div>

          <div style={{ padding: '18px 20px', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Verified Credential</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>LinkedIn Certificate Included</div>
            </div>
          </div>
        </div>

        {/* Detailed Curriculum Section */}
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>Curriculum Syllabus</h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Structured step-by-step learning progression.
              </p>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 12px', borderRadius: '8px' }}>
              {course.modules.length} Modules Total
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {course.modules.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  padding: '20px 22px',
                  borderRadius: '16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  gap: '18px',
                  alignItems: 'flex-start',
                }}
              >
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
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>{m.title}</h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'var(--border)',
                        color: 'var(--text-muted)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {m.difficulty}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {m.description}
                  </p>

                  {m.subtopics && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {m.subtopics.split(',').map((st, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg-white)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {st.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div
          style={{
            marginTop: '40px',
            textAlign: 'center',
            padding: '40px 24px',
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
          }}
        >
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px 0' }}>
            Ready to master {course.title}?
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px auto', fontSize: '0.92rem' }}>
            Join thousands of scholars accelerating their careers with AI-powered personalized curriculum.
          </p>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="btn btn-primary"
            style={{ padding: '12px 32px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem' }}
          >
            {viewer.isEnrolled ? 'Open Course' : 'Start Learning with NexLearn'}
          </button>
        </div>
      </main>
    </div>
  );
}
