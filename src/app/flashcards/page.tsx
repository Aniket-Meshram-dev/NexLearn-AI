'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  RotateCw,
  BookOpen,
  ArrowRight,
  Brain,
  Calendar,
  Zap,
  ChevronRight,
  X,
  Award,
  BarChart2,
} from 'lucide-react';

interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  review?: {
    interval: number;
    repetitions: number;
    status: string;
    dueDate: string;
  } | null;
}

interface Stats {
  totalCards: number;
  dueCount: number;
  masteredCount: number;
  learningCount: number;
  dueTomorrowCount: number;
  dueThisWeekCount: number;
  retentionRate: number;
}

interface CourseGroup {
  id: string;
  title: string;
  level: string;
  totalCards: number;
  dueCards: number;
  modules: {
    id: string;
    title: string;
    totalCards: number;
    dueCards: number;
  }[];
}

export default function FlashcardsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    dueCount: 0,
    masteredCount: 0,
    learningCount: 0,
    dueTomorrowCount: 0,
    dueThisWeekCount: 0,
    retentionRate: 0,
  });
  const [courses, setCourses] = useState<CourseGroup[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<FlashcardData[]>([]);

  // Study Session State
  const [activeSession, setActiveSession] = useState<{
    title: string;
    cards: FlashcardData[];
    currentIndex: number;
    isFlipped: boolean;
    reviewedCount: number;
    isComplete: boolean;
  } | null>(null);

  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/flashcards');
      if (!res.ok) throw new Error('Failed to load flashcards');
      const data = await res.json();
      setStats(data.stats || stats);
      setCourses(data.courses || []);
      setDueFlashcards(data.dueFlashcards || []);
    } catch (err) {
      console.error('Failed to load flashcard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Start study session for all due cards or a specific module
  const startSession = (title: string, cards: FlashcardData[]) => {
    if (!cards || cards.length === 0) return;
    setActiveSession({
      title,
      cards,
      currentIndex: 0,
      isFlipped: false,
      reviewedCount: 0,
      isComplete: false,
    });
  };

  // Handle rating submission
  const handleRateCard = async (quality: number) => {
    if (!activeSession || submittingRating) return;
    const currentCard = activeSession.cards[activeSession.currentIndex];
    if (!currentCard) return;

    setSubmittingRating(true);
    try {
      await fetch('/api/user/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          quality,
        }),
      });

      const nextIndex = activeSession.currentIndex + 1;
      const isComplete = nextIndex >= activeSession.cards.length;

      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              currentIndex: nextIndex,
              isFlipped: false,
              reviewedCount: prev.reviewedCount + 1,
              isComplete,
            }
          : null
      );

      if (isComplete) {
        fetchFlashcards();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Keyboard navigation for active session
  useEffect(() => {
    if (!activeSession || activeSession.isComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setActiveSession((prev) => (prev ? { ...prev, isFlipped: !prev.isFlipped } : null));
      } else if (activeSession.isFlipped && !submittingRating) {
        if (e.key === '1') handleRateCard(0);
        if (e.key === '2') handleRateCard(1);
        if (e.key === '3') handleRateCard(2);
        if (e.key === '4') handleRateCard(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSession, submittingRating]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="spinner" style={{ width: '42px', height: '42px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Loading flashcard decks & SM-2 memory schedule...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '32px 36px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '620px', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
            <Brain size={14} />
            <span>SM-2 SPACED REPETITION ENGINE</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Flashcard Retention Hub
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Master core concepts permanently. NexLearn uses the scientific SuperMemo SM-2 algorithm to schedule reviews precisely before you forget.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', zIndex: 1 }}>
          {stats.dueCount > 0 ? (
            <button
              onClick={() => startSession('All Due Cards', dueFlashcards)}
              className="btn btn-primary"
              style={{
                padding: '14px 26px',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Flame size={20} style={{ color: '#fcd34d' }} />
              <span>Review {stats.dueCount} Due Cards</span>
            </button>
          ) : (
            <div
              style={{
                padding: '12px 20px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '14px',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>All caught up for today!</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        {/* Due Today */}
        <div
          style={{
            background: 'var(--bg-white)',
            border: stats.dueCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border)',
            borderRadius: '18px',
            padding: '20px 22px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Due Today
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: stats.dueCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: stats.dueCount > 0 ? '#ef4444' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: stats.dueCount > 0 ? '#ef4444' : 'var(--text)' }}>
            {stats.dueCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {stats.dueCount > 0 ? 'Requires immediate recall' : 'Deck fully up to date'}
          </span>
        </div>

        {/* Mastered */}
        <div
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '20px 22px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mastered
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>
            {stats.masteredCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Interval ≥ 21 days (long term)
          </span>
        </div>

        {/* In Progress / Learning */}
        <div
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '20px 22px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Learning
            </span>
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
              <RotateCw size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>
            {stats.learningCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Active memory consolidation
          </span>
        </div>

        {/* Retention Rate */}
        <div
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '20px 22px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Mastery Rate
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)' }}>
            {stats.retentionRate}%
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {stats.totalCards} total flashcards created
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {courses.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-white)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}
          >
            <Layers size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>
            No Flashcard Decks Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px auto', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Flashcards are generated automatically when you study course modules. Start or generate a course to begin spaced repetition learning.
          </p>
          <Link href="/generate" className="btn btn-primary" style={{ display: 'inline-flex', gap: '8px', borderRadius: '12px' }}>
            <Sparkles size={16} />
            <span>Generate a New Course</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Upcoming Schedule Row */}
          <div
            style={{
              background: 'var(--bg-white)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              padding: '24px 28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Spaced Repetition Schedule</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
              }}
            >
              <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Due Today</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stats.dueCount > 0 ? '#ef4444' : 'var(--text)' }}>
                  {stats.dueCount} cards
                </div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Due Tomorrow</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                  {stats.dueTomorrowCount} cards
                </div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Due This Week</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                  {stats.dueThisWeekCount} cards
                </div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mastered</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {stats.masteredCount} cards
                </div>
              </div>
            </div>
          </div>

          {/* Courses & Decks List */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              <span>Your Course Decks</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {courses.map((course) => (
                <div
                  key={course.id}
                  style={{
                    background: 'var(--bg-white)',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '18px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {course.level}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)' }}>
                          {course.title}
                        </h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        {course.totalCards} flashcards across {course.modules.length} modules
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {course.dueCards > 0 && (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          {course.dueCards} due
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Module Cards Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '14px',
                    }}
                  >
                    {course.modules.map((mod) => (
                      <div
                        key={mod.id}
                        style={{
                          padding: '16px 18px',
                          borderRadius: '14px',
                          background: 'var(--bg)',
                          border: mod.dueCards > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {mod.totalCards} cards
                            </span>
                            {mod.dueCards > 0 ? (
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {mod.dueCards} due
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
                                Ready
                              </span>
                            )}
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
                            {mod.title}
                          </h4>
                        </div>

                        <Link
                          href={`/course/${course.id}/module/${mod.id}/flashcards`}
                          className="btn btn-outline"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '0.84rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>Study Module Deck</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Interactive Study Session Modal */}
      {activeSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(11, 13, 19, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '680px',
              maxWidth: '100%',
              background: 'var(--bg-white)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Session Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {activeSession.title}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  Active Spaced Repetition Review
                </h3>
              </div>
              <button
                onClick={() => setActiveSession(null)}
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Completion Screen */}
            {activeSession.isComplete ? (
              <div style={{ padding: '44px 28px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 12px 28px rgba(16, 185, 129, 0.35)',
                    animation: 'pulse 2s infinite ease-in-out',
                  }}
                >
                  <Award size={38} />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 10px 0', fontFamily: "'Outfit', sans-serif" }}>
                  Session Mastered!
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', maxWidth: '440px', margin: '0 auto 26px auto', lineHeight: 1.6 }}>
                  Outstanding focus! You completed <strong>{activeSession.reviewedCount} cards</strong> in this study run. Next intervals have been logged into your SM-2 cognitive schedule.
                </p>

                {/* Quick Stats Grid Recap */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '440px', margin: '0 auto 28px auto' }}>
                  <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Reviewed</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{activeSession.reviewedCount}</div>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Retention</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', marginTop: 4 }}>95%</div>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Next Run</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginTop: 6 }}>Tomorrow</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setActiveSession(null)}
                    className="btn btn-primary"
                    style={{ padding: '12px 32px', borderRadius: '12px', fontWeight: 700 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Flashcard Active View */
              <div style={{ padding: '24px 28px' }}>
                {/* Progress Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                    <span>Card {activeSession.currentIndex + 1} of {activeSession.cards.length}</span>
                    <span>{Math.round(((activeSession.currentIndex) / activeSession.cards.length) * 100)}% Complete</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary), #a855f7)',
                        width: `${((activeSession.currentIndex) / activeSession.cards.length) * 100}%`,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Card Container */}
                {(() => {
                  const card = activeSession.cards[activeSession.currentIndex];
                  if (!card) return null;
                  return (
                    <div>
                      {/* Context breadcrumb */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
                        {card.courseTitle} • {card.moduleTitle}
                      </div>

                      {/* Flip Card */}
                      <div
                        onClick={() => setActiveSession((p) => (p ? { ...p, isFlipped: !p.isFlipped } : null))}
                        style={{
                          minHeight: '230px',
                          borderRadius: '18px',
                          border: '2px solid var(--border)',
                          background: activeSession.isFlipped
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%)'
                            : 'var(--bg)',
                          padding: '28px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: activeSession.isFlipped ? 'var(--primary)' : 'var(--text-muted)',
                            }}
                          >
                            {activeSession.isFlipped ? 'Answer' : 'Question'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Press <kbd style={{ background: 'var(--surface-sunken, rgba(0,0,0,0.1))', padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)' }}>Space</kbd> to {activeSession.isFlipped ? 'show question' : 'flip'}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            lineHeight: 1.6,
                            color: 'var(--text)',
                            margin: '18px 0',
                            textAlign: 'center',
                          }}
                        >
                          {activeSession.isFlipped ? card.answer : card.question}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <RotateCw size={12} />
                            <span>Flip card</span>
                          </span>

                          {/* Ask AI Mentor Contextual Button */}
                          {activeSession.isFlipped && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(
                                  new CustomEvent('open_ai_mentor', {
                                    detail: {
                                      query: `Please explain this flashcard concept in detail with practical examples:\nTopic: ${card.courseTitle} - ${card.moduleTitle}\nQuestion: "${card.question}"\nAnswer: "${card.answer}"`,
                                    },
                                  })
                                );
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                background: 'rgba(99, 102, 241, 0.12)',
                                color: 'var(--primary)',
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Sparkles size={13} />
                              <span>Ask AI Mentor to Explain</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rating Buttons (Shown when flipped) */}
                      {activeSession.isFlipped ? (
                        <div style={{ marginTop: '22px' }}>
                          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
                            Rate your recall quality:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                            <button
                              disabled={submittingRating}
                              onClick={() => handleRateCard(0)}
                              style={{
                                padding: '12px 8px',
                                borderRadius: '12px',
                                border: '1px solid #ef4444',
                                background: 'rgba(239, 68, 68, 0.08)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.86rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>Again</span>
                                <kbd style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0 4px', borderRadius: 3, fontSize: '0.70rem' }}>1</kbd>
                              </div>
                              <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>&lt; 1 day</span>
                            </button>

                            <button
                              disabled={submittingRating}
                              onClick={() => handleRateCard(1)}
                              style={{
                                padding: '12px 8px',
                                borderRadius: '12px',
                                border: '1px solid #f59e0b',
                                background: 'rgba(245, 158, 11, 0.08)',
                                color: '#f59e0b',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.86rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>Hard</span>
                                <kbd style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0 4px', borderRadius: 3, fontSize: '0.70rem' }}>2</kbd>
                              </div>
                              <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>1 day</span>
                            </button>

                            <button
                              disabled={submittingRating}
                              onClick={() => handleRateCard(2)}
                              style={{
                                padding: '12px 8px',
                                borderRadius: '12px',
                                border: '1px solid #10b981',
                                background: 'rgba(16, 185, 129, 0.08)',
                                color: '#10b981',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.86rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>Good</span>
                                <kbd style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0 4px', borderRadius: 3, fontSize: '0.70rem' }}>3</kbd>
                              </div>
                              <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>Standard</span>
                            </button>

                            <button
                              disabled={submittingRating}
                              onClick={() => handleRateCard(3)}
                              style={{
                                padding: '12px 8px',
                                borderRadius: '12px',
                                border: '1px solid var(--primary)',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.86rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>Easy</span>
                                <kbd style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0 4px', borderRadius: 3, fontSize: '0.70rem' }}>4</kbd>
                              </div>
                              <span style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 500 }}>Bonus</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: '22px', textAlign: 'center' }}>
                          <button
                            onClick={() => setActiveSession((p) => (p ? { ...p, isFlipped: true } : null))}
                            className="btn btn-primary"
                            style={{ padding: '12px 32px', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                          >
                            <span>Reveal Answer</span>
                            <kbd style={{ background: 'rgba(255,255,255,0.25)', color: 'white', padding: '1px 6px', borderRadius: 4, fontSize: '0.74rem' }}>Space</kbd>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
