'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  Clock,
  BookOpen,
  Star,
  Users,
  Eye,
  CheckCircle2,
  HardDrive,
  Filter,
  X,
  Layers,
  Zap,
  Code2,
  BrainCircuit,
  Terminal,
  Shield,
  Palette,
  Cloud,
  Download,
} from 'lucide-react';
import {
  getAllOfflineCourses,
  OfflineCourse,
  isCourseSavedOffline,
  downloadFullCourseForOffline,
} from '@/lib/offlineStorage';

const CATEGORIES = [
  { id: 'all', label: 'All Pathways', icon: Compass },
  { id: 'ai', label: 'AI & Machine Learning', icon: BrainCircuit },
  { id: 'web', label: 'Web Development', icon: Code2 },
  { id: 'cloud', label: 'Cloud & DevOps', icon: Cloud },
  { id: 'cs', label: 'CS Core & Systems', icon: Terminal },
  { id: 'cyber', label: 'Cybersecurity', icon: Shield },
  { id: 'design', label: 'UI/UX & Design', icon: Palette },
  { id: 'offline', label: 'Saved Offline', icon: HardDrive },
];

const TRENDING_SEARCH_TAGS = [
  'Generative AI',
  'Next.js 15',
  'Rust Systems',
  'Kubernetes',
  'Penetration Testing',
  'Design Systems',
];

interface CourseCardData {
  id: string;
  title: string;
  description: string;
  topic: string;
  level: string;
  duration: string;
  hoursPerDay: number;
  rating: number;
  learnersCount: number;
  modulesCount: number;
  authorName: string;
  modulesSummary: string[];
  isMasterclass?: boolean;
  isDbCourse?: boolean;
}

function DiscoverInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'modules' | 'duration'>('popular');

  // Offline Courses cache state
  const [offlineCourses, setOfflineCourses] = useState<OfflineCourse[]>([]);
  const [savedCourseIds, setSavedCourseIds] = useState<Set<string>>(new Set());

  // Quick Preview Modal State
  const [previewCourse, setPreviewCourse] = useState<CourseCardData | null>(null);
  const [downloadingCourseId, setDownloadingCourseId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Load URL queries & fetch
  useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('tab') || searchParams.get('category');
    if (q) setSearch(q);
    if (cat && (cat === 'offline' || CATEGORIES.some((c) => c.id === cat))) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  // Load Offline Courses from IndexedDB
  const refreshOfflineCourses = async () => {
    try {
      const offline = await getAllOfflineCourses();
      setOfflineCourses(offline);
      setSavedCourseIds(new Set(offline.map((c) => c.id)));
    } catch (err) {
      console.warn('Failed to load offline courses:', err);
    }
  };

  useEffect(() => {
    refreshOfflineCourses();
  }, []);

  // Fetch Public Courses
  useEffect(() => {
    if (activeCategory === 'offline') {
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (difficulty !== 'all') params.set('difficulty', difficulty);
    if (search.trim()) params.set('search', search.trim());
    params.set('sort', sortBy === 'duration' ? 'modules' : sortBy);

    fetch(`/api/public/courses?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Discover fetch error:', err);
        setLoading(false);
      });
  }, [activeCategory, difficulty, search, sortBy]);

  // If activeCategory is offline, display cached offline courses
  const displayedCourses = useMemo(() => {
    let list = courses;
    if (activeCategory === 'offline') {
      list = offlineCourses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description || 'Saved in local browser memory for offline learning.',
        topic: c.topic || 'General',
        level: c.level || 'Intermediate',
        duration: c.duration || `${c.totalModules} Units`,
        hoursPerDay: c.hoursPerDay || 1,
        rating: 5.0,
        learnersCount: 1,
        modulesCount: c.totalModules,
        authorName: 'Local Scholar',
        modulesSummary: c.modules.map((m) => m.title).slice(0, 5),
        isMasterclass: false,
        isDbCourse: true,
      }));
    }

    if (sortBy === 'duration') {
      return [...list].sort((a, b) => (a.modulesCount || 0) - (b.modulesCount || 0));
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'modules') {
      return [...list].sort((a, b) => (b.modulesCount || 0) - (a.modulesCount || 0));
    }
    return list;
  }, [activeCategory, offlineCourses, courses, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // If user typed a search that has no match, offer course generation
      router.push(`/generate?topic=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleDownloadCourse = async (courseId: string) => {
    if (downloadingCourseId) return;
    setDownloadingCourseId(courseId);
    setDownloadProgress({ current: 0, total: 1 });

    try {
      await downloadFullCourseForOffline(courseId, (current, total) => {
        setDownloadProgress({ current, total });
      });

      await refreshOfflineCourses();

      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'offline-saved-' + Date.now(),
            title: 'Course Downloaded Offline!',
            message: 'All module notes, code & exercises are now available without internet.',
            type: 'success',
          },
        })
      );
    } catch (err: any) {
      console.error('Download offline error:', err);
      window.dispatchEvent(
        new CustomEvent('icmsystem_toast', {
          detail: {
            id: 'offline-err-' + Date.now(),
            title: 'Download Incomplete',
            message: 'Could not complete offline caching. Please ensure you are logged in.',
            type: 'warning',
          },
        })
      );
    } finally {
      setDownloadingCourseId(null);
    }
  };

  return (
    <div className="discover-wrapper fade-in" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 16px 60px' }}>
      {/* --- 1. HERO SECTION WITH AURORA GRADIENT --- */}
      <section
        className="discover-hero-aurora"
        style={{
          position: 'relative',
          padding: 'clamp(36px, 6vw, 64px) 24px',
          borderRadius: '32px',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.16) 0%, rgba(124, 58, 237, 0.14) 50%, rgba(236, 72, 153, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          textAlign: 'center',
          marginBottom: '36px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Ambient background glow dots */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '20%',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            right: '15%',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--primary)',
            fontSize: '0.84rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '18px',
          }}
        >
          <Sparkles size={14} />
          <span>Global AI Curriculum Directory</span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            fontFamily: "'Outfit', var(--font-display), sans-serif",
            color: 'var(--text)',
            margin: '0 auto 14px',
            maxWidth: '820px',
            lineHeight: 1.15,
          }}
        >
          Explore Pathways or{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 50%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Synthesize Custom Roadmaps
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.96rem, 2vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
          }}
        >
          Join thousands of scholars mastering cutting-edge engineering, AI architectures, systems, and design.
        </p>

        {/* Dynamic Search & AI Synthesize Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-white)',
            borderRadius: '999px',
            padding: '6px 8px 6px 20px',
            maxWidth: '660px',
            margin: '0 auto 20px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12), inset 0 0 0 1px var(--border)',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search curricula or type any skill to synthesize..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              border: 'none',
              background: 'transparent',
              padding: '10px 4px',
              fontSize: '1rem',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              borderRadius: '999px',
              padding: '12px 24px',
              fontSize: '0.92rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
            }}
          >
            <Zap size={15} />
            <span>Synthesize with AI</span>
          </button>
        </form>

        {/* Quick Trending Keyword Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={14} color="#F59E0B" /> Trending:
          </span>
          {TRENDING_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearch(tag)}
              style={{
                background: search === tag ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                color: search === tag ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* --- 2. DOMAIN CATEGORY PILLS & CONTROLS --- */}
      <section style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '16px',
          }}
        >
          {/* Scrollable Category Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
              maxWidth: '100%',
            }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const isOfflineCat = cat.id === 'offline';
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '9px 16px',
                    borderRadius: '999px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: isActive
                      ? '1px solid var(--primary)'
                      : '1px solid var(--border)',
                    background: isActive
                      ? 'var(--primary)'
                      : isOfflineCat && offlineCourses.length > 0
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'var(--bg-white)',
                    color: isActive ? '#ffffff' : isOfflineCat ? '#10B981' : 'var(--text)',
                    boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none',
                  }}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                  {isOfflineCat && offlineCourses.length > 0 && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        background: isActive ? '#ffffff' : '#10B981',
                        color: isActive ? 'var(--primary)' : '#ffffff',
                        fontWeight: 800,
                        marginLeft: '2px',
                      }}
                    >
                      {offlineCourses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Difficulty & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  style={{
                    border: 'none',
                    background: difficulty === lvl ? 'var(--primary-bg)' : 'transparent',
                    color: difficulty === lvl ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: difficulty === lvl ? 700 : 500,
                    fontSize: '0.76rem',
                    padding: '5px 10px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveCategory(activeCategory === 'offline' ? 'all' : 'offline')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: activeCategory === 'offline' ? '1px solid #10b981' : '1px solid var(--border)',
                background: activeCategory === 'offline' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-white)',
                color: activeCategory === 'offline' ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Show courses saved offline"
            >
              <HardDrive size={13} />
              <span>Offline ({offlineCourses.length})</span>
            </button>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              aria-label="Sort courses"
              style={{
                padding: '7px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-white)',
                color: 'var(--text)',
                fontSize: '0.82rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="modules">Module Count</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>
      </section>

      {/* --- 3. CURRICULUMS GRID --- */}
      {loading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem' }}>
            Querying curriculum knowledge pathways...
          </p>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'var(--bg-white)',
            border: '1px dashed var(--border)',
          }}
        >
          <Compass size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>
            {activeCategory === 'offline' ? 'No Offline Courses Cached Yet' : 'No matching curriculums found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            {activeCategory === 'offline'
              ? 'Open any course and click "Save Offline" to study anytime without internet.'
              : `Want to learn "${search || 'this topic'}"? Synthesize a personalized syllabus using our AI engine in 15 seconds.`}
          </p>
          <button
            onClick={() => router.push(`/generate?topic=${encodeURIComponent(search || 'New Curriculum')}`)}
            className="btn btn-primary"
            style={{ borderRadius: '12px', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} />
            <span>Synthesize Course Now</span>
          </button>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '22px' }}>
          {displayedCourses.map((course) => {
            const isSavedOffline = savedCourseIds.has(course.id);
            return (
              <div
                key={course.id}
                className="card discover-course-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '24px',
                  background: 'var(--bg-white)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  padding: '24px',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Top Badge Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background:
                        course.level.toLowerCase() === 'beginner'
                          ? 'rgba(16, 185, 129, 0.12)'
                          : course.level.toLowerCase() === 'advanced'
                          ? 'rgba(239, 68, 68, 0.12)'
                          : 'rgba(99, 102, 241, 0.12)',
                      color:
                        course.level.toLowerCase() === 'beginner'
                          ? '#10B981'
                          : course.level.toLowerCase() === 'advanced'
                          ? '#EF4444'
                          : 'var(--primary)',
                    }}
                  >
                    {course.level}
                  </span>

                  {isSavedOffline ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                      title="Available completely offline"
                    >
                      <HardDrive size={12} />
                      <span>Cached Offline</span>
                    </span>
                  ) : course.isMasterclass ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#F59E0B',
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      <Sparkles size={12} />
                      <span>Masterclass</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      By {course.authorName}
                    </span>
                  )}
                </div>

                {/* Course Title */}
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    margin: '0 0 8px',
                    color: 'var(--text)',
                    lineHeight: 1.35,
                    fontFamily: "'Outfit', var(--font-display), sans-serif",
                  }}
                >
                  {course.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    margin: '0 0 16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {course.description}
                </p>

                {/* Key Metrics Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg)',
                    marginBottom: '16px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <BookOpen size={13} color="var(--primary)" />
                    <span>{course.modulesCount} Modules</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} color="var(--primary)" />
                    <span>{course.duration}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
                    <Star size={13} fill="#F59E0B" />
                    <span>{course.rating.toFixed(1)}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                    <Users size={13} />
                    <span>{course.learnersCount}</span>
                  </span>
                </div>

                {/* Module Topic Tags Sneak Peek */}
                {course.modulesSummary && course.modulesSummary.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {course.modulesSummary.slice(0, 3).map((modTitle, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {idx + 1}. {modTitle}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setPreviewCourse(course)}
                    className="btn btn-outline"
                    style={{
                      flex: 1,
                      borderRadius: '12px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      padding: '10px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Eye size={14} />
                    <span>Quick Preview</span>
                  </button>

                  {course.isDbCourse ? (
                    <Link
                      href={`/course/${course.id}`}
                      className="btn btn-primary"
                      style={{
                        borderRadius: '12px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        padding: '10px 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Study</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href={`/generate?topic=${encodeURIComponent(course.title)}&level=${course.level}`}
                      className="btn btn-primary"
                      style={{
                        borderRadius: '12px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        padding: '10px 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                      }}
                    >
                      <Zap size={14} />
                      <span>Enroll AI</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- 4. QUICK SYLLABUS RIGHT SLIDE-OVER DRAWER --- */}
      {previewCourse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setPreviewCourse(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              background: 'var(--bg-white)',
              borderLeft: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-16px 0 48px rgba(0, 0, 0, 0.35)',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Header */}
            <div
              style={{
                padding: '24px 28px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                background: 'var(--bg-white)',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                    background: 'var(--primary-bg)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  {previewCourse.topic} • {previewCourse.level}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px', fontFamily: "'Outfit', sans-serif" }}>
                  {previewCourse.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>By {previewCourse.authorName}</span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: '#f59e0b', fontWeight: 600 }}>
                    <Star size={13} fill="#f59e0b" /> {previewCourse.rating}
                  </span>
                  <span>•</span>
                  <span>{previewCourse.learnersCount} enrolled</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                style={{
                  background: 'var(--surface-subtle, rgba(255, 255, 255, 0.08))',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '22px' }}>
                {previewCourse.description}
              </p>

              {/* Course Meta Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Duration</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>{previewCourse.duration}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Daily Time</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>{previewCourse.hoursPerDay} hr/day</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Units</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: 2 }}>{previewCourse.modulesCount} Modules</div>
                </div>
              </div>

              {/* Syllabus Breakdown */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} color="var(--primary)" />
                    <span>Syllabus Breakdown ({previewCourse.modulesCount} Units)</span>
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {previewCourse.modulesSummary.map((title, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border-hairline)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '8px',
                          background: 'var(--primary-bg)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', flexShrink: 0 }}>Theory + Lab</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Sticky Bottom Footer */}
            <div
              style={{
                padding: '20px 28px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-white)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              {previewCourse.isDbCourse && (
                <button
                  onClick={() => handleDownloadCourse(previewCourse.id)}
                  disabled={Boolean(downloadingCourseId)}
                  style={{
                    background: savedCourseIds.has(previewCourse.id) ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.1)',
                    color: savedCourseIds.has(previewCourse.id) ? '#10B981' : 'var(--primary)',
                    border: '1px solid currentColor',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: downloadingCourseId ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={16} />
                  <span>
                    {downloadingCourseId === previewCourse.id
                      ? `Caching (${downloadProgress.current}/${downloadProgress.total})...`
                      : savedCourseIds.has(previewCourse.id)
                      ? 'Re-Download Offline'
                      : 'Download Offline'}
                  </span>
                </button>
              )}

              <Link
                href={
                  previewCourse.isDbCourse
                    ? `/course/${previewCourse.id}`
                    : `/generate?topic=${encodeURIComponent(previewCourse.title)}&level=${previewCourse.level}`
                }
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px 22px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                }}
              >
                <span>{previewCourse.isDbCourse ? 'Start Course' : 'Enroll & Synthesize'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading Discover Pathways...</p>
        </div>
      }
    >
      <DiscoverInner />
    </Suspense>
  );
}
