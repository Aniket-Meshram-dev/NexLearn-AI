import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  BookOpen,
  Plus,
  Inbox,
  Award,
  Play,
  Trash2,
  CheckCircle2,
  FileText,
  Search,
  X,
  Clock,
  Download,
} from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  topic: string;
  level: string;
  enrolled: boolean;
  fullyCompleted?: boolean;
  moduleCount: number;
  completedCount: number;
  grade?: string;
}

interface CourseTabsSectionProps {
  recentCourses: CourseItem[];
  enrolledCourses: CourseItem[];
  availableCourses: CourseItem[];
  completedCourses: CourseItem[];
  activeCourseTab: 'enrolled' | 'available' | 'completed';
  setActiveCourseTab: (tab: 'enrolled' | 'available' | 'completed') => void;
  enrollingId: string | null;
  onEnroll: (courseId: string) => void;
  onOpenDeleteModal: (course: any) => void;
}

export default function CourseTabsSection({
  recentCourses,
  enrolledCourses,
  availableCourses,
  completedCourses,
  activeCourseTab,
  setActiveCourseTab,
  enrollingId,
  onEnroll,
  onOpenDeleteModal,
}: CourseTabsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filterCourses = (list: CourseItem[]) => {
    return list.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.topic.toLowerCase().includes(q);
      const matchesLevel = filterLevel === 'all' || (c.level || '').toLowerCase() === filterLevel.toLowerCase();
      return matchesSearch && matchesLevel;
    });
  };

  const displayedEnrolled = filterCourses(enrolledCourses);
  const displayedAvailable = filterCourses(availableCourses);
  const displayedCompleted = filterCourses(completedCourses);
  return (
    <div
      id="courses-section"
      className="card"
      style={{
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        scrollMarginTop: '88px',
      }}
    >
      {recentCourses.length === 0 ? (
        /* 🌟 FTUX (First-Time User Experience) when 0 courses exist */
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            maxWidth: '620px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
            }}
          >
            <Sparkles size={32} />
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 10px 0',
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Start Your AI Learning Journey
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.98rem',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            You haven&apos;t enrolled in any courses yet. Synthesize your first custom AI curriculum with structured theory, code examples, interactive quizzes, and verified certificates.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/generate"
              className="btn btn-primary btn-lg"
              style={{ borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px' }}
            >
              <Sparkles size={18} />
              <span>Synthesize First Course</span>
            </Link>
            <Link
              href="/discover"
              className="btn btn-secondary btn-lg"
              style={{ borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px' }}
            >
              <Compass size={18} />
              <span>Browse Pathways</span>
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Header with Title and Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '22px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Learning Pathways
              </h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Manage your active studies, synthesized catalog, and earned credentials.
              </p>
            </div>
            <Link
              href="/generate"
              className="btn btn-primary btn-sm"
              style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>New Course</span>
            </Link>
          </div>

          {/* Controls Bar: Segmented Tabs + Quick Search & Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            {/* Segmented Control Pill Tabs */}
            <div
              style={{
                display: 'inline-flex',
                padding: '4px',
                borderRadius: '12px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-hairline)',
                gap: '4px',
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              <button
                onClick={() => setActiveCourseTab('enrolled')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: activeCourseTab === 'enrolled' ? 700 : 500,
                  background: activeCourseTab === 'enrolled' ? 'var(--primary)' : 'transparent',
                  color: activeCourseTab === 'enrolled' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.18s ease',
                }}
              >
                <BookOpen size={15} />
                <span>Active Learning</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: activeCourseTab === 'enrolled' ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.1)',
                    color: activeCourseTab === 'enrolled' ? '#fff' : 'var(--primary)',
                  }}
                >
                  {displayedEnrolled.length}
                </span>
              </button>

              <button
                onClick={() => setActiveCourseTab('available')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: activeCourseTab === 'available' ? 700 : 500,
                  background: activeCourseTab === 'available' ? 'var(--primary)' : 'transparent',
                  color: activeCourseTab === 'available' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.18s ease',
                }}
              >
                <Inbox size={15} />
                <span>Available Catalog</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: activeCourseTab === 'available' ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.1)',
                    color: activeCourseTab === 'available' ? '#fff' : 'var(--primary)',
                  }}
                >
                  {displayedAvailable.length}
                </span>
              </button>

              <button
                onClick={() => setActiveCourseTab('completed')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: activeCourseTab === 'completed' ? 700 : 500,
                  background: activeCourseTab === 'completed' ? '#10B981' : 'transparent',
                  color: activeCourseTab === 'completed' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.18s ease',
                }}
              >
                <Award size={15} />
                <span>Completed & Certified</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: activeCourseTab === 'completed' ? 'rgba(255,255,255,0.25)' : 'rgba(16, 185, 129, 0.1)',
                    color: activeCourseTab === 'completed' ? '#fff' : '#10B981',
                  }}
                >
                  {displayedCompleted.length}
                </span>
              </button>
            </div>

            {/* Instant Search & Level Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: 30,
                    paddingRight: searchQuery ? 28 : 10,
                    paddingTop: 6,
                    paddingBottom: 6,
                    fontSize: '0.82rem',
                    borderRadius: 8,
                    height: 34,
                    width: '100%',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 2,
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{
                  height: 34,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-white)',
                  color: 'var(--text)',
                  fontSize: '0.80rem',
                  padding: '0 8px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Tab 1: Active Learning */}
          {activeCourseTab === 'enrolled' && (
            <div>
              {displayedEnrolled.length === 0 ? (
                <div
                  className="empty-state"
                  style={{
                    padding: '44px 20px',
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '1px dashed var(--border)',
                    background: 'var(--surface-raised)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'var(--primary-bg)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '14px',
                    }}
                  >
                    <BookOpen size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                    {searchQuery ? 'No Matching Active Courses' : 'No Active Enrollments'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 18px auto' }}>
                    {searchQuery
                      ? `No active course matched "${searchQuery}". Try a different search or clear the filter.`
                      : 'Activate a course from your available catalog or synthesize a new topic with AI.'}
                  </p>
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Clear Search Filter
                    </button>
                  ) : availableCourses.length > 0 ? (
                    <button
                      onClick={() => setActiveCourseTab('available')}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Inbox size={14} />
                      <span>View Available Catalog ({availableCourses.length})</span>
                    </button>
                  ) : (
                    <Link
                      href="/generate"
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sparkles size={14} />
                      <span>Generate Course</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid-auto">
                  {displayedEnrolled.map((c) => {
                    const pct = c.moduleCount > 0 ? Math.round((c.completedCount / c.moduleCount) * 100) : 0;
                    const remainingModules = Math.max(0, c.moduleCount - c.completedCount);
                    const estHours = Math.round(remainingModules * 0.5 * 10) / 10;
                    return (
                      <div
                        key={c.id}
                        className="module-card card-hover"
                        style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '22px',
                          borderRadius: '16px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-white)',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <Link href={`/course/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: '36px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="badge badge-primary">{c.level || 'Intermediate'}</span>
                              {remainingModules > 0 && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.72rem',
                                    color: 'var(--text-muted)',
                                    background: 'var(--surface-sunken, rgba(0, 0, 0, 0.05))',
                                    padding: '2px 7px',
                                    borderRadius: '6px',
                                  }}
                                >
                                  <Clock size={11} />
                                  <span>~{estHours}h left</span>
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                              {pct}% Done
                            </span>
                          </div>

                          <div className="module-title" style={{ paddingRight: '28px', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.title}
                          </div>
                          <div className="module-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px' }}>
                            {c.topic}
                          </div>

                          {/* Linear Progress Bar */}
                          <div className="progress-bar" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                            <div
                              className="progress-fill"
                              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--primary) 0%, #8B5CF6 100%)' }}
                            />
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.8rem',
                              color: 'var(--text-muted)',
                              marginTop: 10,
                            }}
                          >
                            <span>
                              {c.completedCount} of {c.moduleCount} modules
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                background: 'rgba(99, 102, 241, 0.08)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              <span>Continue</span>
                              <Play size={11} className="fill-current" />
                            </span>
                          </div>
                        </Link>

                        {/* Delete Action */}
                        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenDeleteModal(c);
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
                            title="Delete Course"
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Available Catalog (Requires Enrollment) */}
          {activeCourseTab === 'available' && (
            <div>
              {displayedAvailable.length === 0 ? (
                <div
                  className="empty-state"
                  style={{
                    padding: '44px 20px',
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '1px dashed var(--border)',
                    background: 'var(--surface-raised)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '14px',
                    }}
                  >
                    <Inbox size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0' }}>
                    {searchQuery ? 'No Matching Courses in Catalog' : 'Catalog Empty'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '360px', margin: '0 auto 18px auto' }}>
                    {searchQuery
                      ? `No available course matched "${searchQuery}". Clear your search or create a new course.`
                      : 'All generated courses are currently enrolled. Generate a new course anytime to expand your syllabus queue.'}
                  </p>
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Clear Search Filter
                    </button>
                  ) : (
                    <Link
                      href="/generate"
                      className="btn btn-primary btn-sm"
                      style={{ borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Sparkles size={14} />
                      <span>Create New Course</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid-auto">
                  {displayedAvailable.map((c) => (
                    <div
                      key={c.id}
                      className="module-card card-hover"
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '22px',
                        borderRadius: '16px',
                        border: '1px dashed rgba(99, 102, 241, 0.35)',
                        background: 'var(--bg-white)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: '36px' }}>
                        <span className="badge badge-primary">{c.level || 'Intermediate'}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {c.moduleCount} Modules
                        </span>
                      </div>
                      <div className="module-title" style={{ paddingRight: '28px', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {c.title}
                      </div>
                      <div className="module-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '6px' }}>
                        {c.topic}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
                        <button
                          onClick={() => onEnroll(c.id)}
                          disabled={enrollingId === c.id}
                          className="btn btn-primary"
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          {enrollingId === c.id ? (
                            <>
                              <span className="spinner spinner-sm" style={{ width: 14, height: 14 }} />
                              <span>Enrolling...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={15} />
                              <span>Enroll in Course</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Delete Action */}
                      <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenDeleteModal(c);
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
                          title="Remove from Catalog"
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
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
          )}

          {/* Tab 3: Completed & Certified */}
          {activeCourseTab === 'completed' && (
            <div>
              {displayedCompleted.length === 0 ? (
                <div
                  className="empty-state"
                  style={{
                    padding: '44px 20px',
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '1px dashed rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.03)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                      marginBottom: '14px',
                    }}
                  >
                    <Award size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                    {searchQuery ? 'No Matching Completed Courses' : 'No Certificates Yet'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 18px auto' }}>
                    {searchQuery
                      ? `No completed course matched "${searchQuery}". Clear your search query.`
                      : 'Complete all modules and interactive quizzes in a course to earn official verified credentials.'}
                  </p>
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      Clear Search Filter
                    </button>
                  ) : enrolledCourses.length > 0 ? (
                    <button
                      onClick={() => setActiveCourseTab('enrolled')}
                      className="btn btn-sm"
                      style={{
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                        fontWeight: 700,
                        border: 'none',
                      }}
                    >
                      Resume Active Studies
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="grid-auto">
                  {displayedCompleted.map((c) => (
                    <div
                      key={c.id}
                      className="module-card card-hover"
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--bg-white)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        padding: '22px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span
                          className="badge"
                          style={{ background: '#10B981', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Certified Graduate</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Grade: {c.grade || 'Passed'}
                        </span>
                      </div>
                      <div className="module-title" style={{ paddingRight: '24px', fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {c.title}
                      </div>
                      <div className="module-desc" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                        {c.topic}
                      </div>

                      {/* Dual Action Buttons: View Certificate & Download PDF */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: 20 }}>
                        <Link
                          href={`/certificate/${c.id}`}
                          className="btn"
                          style={{
                            flex: 1,
                            fontSize: '0.86rem',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            textAlign: 'center',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <FileText size={15} />
                          <span>View Credential</span>
                        </Link>
                        <Link
                          href={`/certificate/${c.id}?print=true`}
                          className="btn"
                          style={{
                            fontSize: '0.86rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            textAlign: 'center',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                          title="Download Verified PDF"
                        >
                          <Download size={15} />
                          <span>PDF</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
