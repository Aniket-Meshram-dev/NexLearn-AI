import Link from 'next/link';
import { Sparkles, Compass, Play, ArrowRight } from 'lucide-react';

interface ResumeLessonInfo {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  difficulty?: string;
  link: string;
}

interface DashboardHeroProps {
  firstName: string;
  streak: number;
  resumeLesson?: ResumeLessonInfo | null;
  onExploreCatalog?: () => void;
}

export default function DashboardHero({ firstName, streak, resumeLesson, onExploreCatalog }: DashboardHeroProps) {
  const handleCatalogClick = (e: React.MouseEvent) => {
    if (onExploreCatalog) {
      e.preventDefault();
      onExploreCatalog();
      const el = document.getElementById('courses-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="dashboard-hero-banner"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.09) 0%, rgba(139, 92, 246, 0.04) 50%, var(--surface-raised) 100%)',
        border: '1px solid var(--border-hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-l1)',
      }}
    >
      {/* Subtle Ambient Mesh Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-30px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '30%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ maxWidth: '620px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--accent-primary)',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '12px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <Sparkles size={13} />
          <span>AI Learning Ready</span>
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Welcome back, {firstName}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', margin: 0, lineHeight: 1.55 }}>
          You have maintained a <strong style={{ color: 'var(--text-primary)' }}>{streak}-day learning streak</strong>. Continue your lessons or start a new course anytime.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {resumeLesson && (
          <Link
            href={resumeLesson.link}
            className="btn btn-primary"
            style={{
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #6366f1 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={11} fill="white" color="white" style={{ marginLeft: 1 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <span style={{ fontSize: '0.86rem', lineHeight: 1.2 }}>
                Resume: {resumeLesson.moduleTitle.length > 22 ? resumeLesson.moduleTitle.substring(0, 22) + '…' : resumeLesson.moduleTitle}
              </span>
              <span style={{ fontSize: '0.70rem', opacity: 0.85, fontWeight: 400 }}>
                {resumeLesson.courseTitle.length > 25 ? resumeLesson.courseTitle.substring(0, 25) + '…' : resumeLesson.courseTitle}
              </span>
            </div>
            <ArrowRight size={14} style={{ opacity: 0.8 }} />
          </Link>
        )}
        <Link
          href="/dashboard?tab=available#courses-section"
          onClick={handleCatalogClick}
          className="btn btn-secondary"
          style={{ borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Compass size={16} />
          <span>Available Catalog</span>
        </Link>
        <Link
          href="/generate"
          className="btn btn-secondary"
          style={{
            borderRadius: 'var(--radius-sm)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            borderColor: 'rgba(99, 102, 241, 0.3)',
          }}
        >
          <Sparkles size={16} color="var(--accent-primary)" />
          <span>Create Course</span>
        </Link>
      </div>
    </div>
  );
}
