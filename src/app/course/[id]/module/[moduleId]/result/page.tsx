'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  Award,
  Filter,
  CheckCheck,
  AlertCircle,
  Compass,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
} from 'lucide-react';

/**
 * Formats question/explanation text with inline code badges if backticks are detected
 */
function FormattedReviewText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = part.slice(1, -1);
          return (
            <code
              key={idx}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.90em',
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary, #4f46e5)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                margin: '0 2px',
              }}
            >
              {code}
            </code>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

export default function QuizResultPage() {
  const { id, moduleId } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const [nextModuleId, setNextModuleId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  useEffect(() => {
    let resultData: any = null;
    let nextModId: string | null = null;

    const fetchResult = async () => {
      const stored = sessionStorage.getItem('quizResult');
      if (stored) {
        resultData = JSON.parse(stored);
        sessionStorage.removeItem('quizResult');
      } else {
        try {
          const r = await fetch(`/api/courses/${id}/modules/${moduleId}/quiz`);
          const d = await r.json();
          if (d.lastResult) resultData = d.lastResult;
        } catch (e) {
          console.error(e);
        }
      }
    };

    const fetchCourse = async () => {
      try {
        const r = await fetch(`/api/courses/${id}`);
        const d = await r.json();
        if (d.course) {
          if (d.course.title) setCourseTitle(d.course.title);
          if (d.course.modules) {
            const index = d.course.modules.findIndex((m: any) => m.id === moduleId);
            if (index !== -1) {
              if (d.course.modules[index].title) {
                setModuleTitle(d.course.modules[index].title);
              }
              if (index < d.course.modules.length - 1) {
                nextModId = d.course.modules[index + 1].id;
              }
            }

            // Check if the entire course is newly finished
            const allModulesDone = d.course.modules.every((m: any) => m.completed);
            const allQuizzesDone = d.course.modules.every(
              (m: any) => m.quiz && (m.quiz.attempts.length > 0 || m.id === moduleId)
            );
            if (allModulesDone && allQuizzesDone) {
              setIsCourseComplete(true);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    Promise.all([fetchResult(), fetchCourse()]).then(() => {
      setResult(resultData);
      setNextModuleId(nextModId);
      setLoading(false);
    });
  }, [id, moduleId]);

  const filteredQuestions = useMemo(() => {
    if (!result || !result.results) return [];
    if (activeFilter === 'correct') {
      return result.results
        .map((r: any, idx: number) => ({ ...r, originalIndex: idx }))
        .filter((r: any) => r.isCorrect);
    }
    if (activeFilter === 'incorrect') {
      return result.results
        .map((r: any, idx: number) => ({ ...r, originalIndex: idx }))
        .filter((r: any) => !r.isCorrect);
    }
    return result.results.map((r: any, idx: number) => ({ ...r, originalIndex: idx }));
  }, [result, activeFilter]);

  if (loading) {
    return (
      <div className="loading-page" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
          Calculating mastery score & solution breakdown...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--primary)" style={{ marginBottom: 16 }} />
        <h3 style={{ margin: '0 0 12px' }}>No quiz results found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
          Take the assessment to test your comprehension and earn course XP.
        </p>
        <Link href={`/course/${id}/module/${moduleId}/quiz`} className="btn btn-primary">
          Start Assessment
        </Link>
      </div>
    );
  }

  const isPassed = result.percentage >= 70;
  const incorrectCount = result.total - result.score;
  const xpEarned = result.score * 10;

  const headerTitle =
    result.percentage >= 90
      ? 'Outstanding Mastery!'
      : result.percentage >= 70
      ? 'Assessment Passed!'
      : result.percentage >= 50
      ? 'Good Effort, Keep Practicing!'
      : 'Review & Retake Recommended';

  const headerSubtitle = isPassed
    ? `You have demonstrated strong proficiency across the core principles of this module.`
    : `You scored ${result.percentage}%. Review the explanations below and retake to achieve 70%+ mastery.`;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '70px' }}>
      {/* Top Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" style={{ marginBottom: '20px' }}>
        <ol
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '0.84rem',
            color: 'var(--text-muted, #64748b)',
            fontWeight: 600,
            flexWrap: 'wrap',
          }}
        >
          <li>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
          </li>
          <li>
            <Link
              href={`/course/${id}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                verticalAlign: 'bottom',
              }}
            >
              {courseTitle || 'Course'}
            </Link>
          </li>
          <li>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
          </li>
          <li>
            <Link
              href={`/course/${id}/module/${moduleId}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                verticalAlign: 'bottom',
              }}
            >
              {moduleTitle || 'Module'}
            </Link>
          </li>
          <li>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
          </li>
          <li style={{ color: 'var(--primary, #6366f1)', fontWeight: 750 }}>
            Quiz Results
          </li>
        </ol>
      </nav>

      {/* Hero Score & Performance Card */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          marginBottom: '28px',
          padding: '40px 32px',
          borderRadius: '24px',
          background: 'var(--bg-white, #ffffff)',
          border: '1.5px solid var(--border, #e2e8f0)',
          boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '180px',
            borderRadius: '50%',
            background: isPassed
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Dynamic Icon Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: isPassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            color: isPassed ? '#10B981' : 'var(--primary, #6366f1)',
            marginBottom: '16px',
            boxShadow: isPassed
              ? '0 10px 25px rgba(16, 185, 129, 0.25)'
              : '0 10px 25px rgba(99, 102, 241, 0.25)',
          }}
        >
          {result.percentage >= 90 ? (
            <Trophy size={40} />
          ) : result.percentage >= 70 ? (
            <CheckCheck size={40} />
          ) : result.percentage >= 50 ? (
            <Sparkles size={40} />
          ) : (
            <BookOpen size={40} />
          )}
        </div>

        {/* Status Pill */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 12px',
              borderRadius: '20px',
              background: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isPassed ? '#047857' : '#b91c1c',
              border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {isPassed ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            <span>{isPassed ? 'Benchmark Achieved' : 'Retake Required'}</span>
          </span>
        </div>

        <h1
          style={{
            fontSize: '1.85rem',
            marginBottom: '6px',
            fontWeight: 850,
            letterSpacing: '-0.02em',
            color: 'var(--text, #0f172a)',
          }}
        >
          {headerTitle}
        </h1>
        <p
          style={{
            color: 'var(--text-secondary, #64748b)',
            marginBottom: '28px',
            fontSize: '0.94rem',
            maxWidth: '520px',
            margin: '0 auto 28px',
            lineHeight: 1.5,
          }}
        >
          {headerSubtitle}
        </p>

        {/* 4-Column Performance Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            maxWidth: '620px',
            margin: '0 auto 32px',
          }}
        >
          {/* Accuracy Score */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--bg, #f8fafc)',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 850,
                color: isPassed ? '#10b981' : '#f59e0b',
                lineHeight: 1.1,
              }}
            >
              {result.percentage}%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, marginTop: '4px' }}>
              Final Score
            </div>
          </div>

          {/* Correct Answers */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--bg, #f8fafc)',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 850,
                color: '#10b981',
                lineHeight: 1.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <span>{result.score}</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/{result.total}</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, marginTop: '4px' }}>
              Correct
            </div>
          </div>

          {/* Incorrect Answers */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--bg, #f8fafc)',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 850,
                color: incorrectCount > 0 ? '#ef4444' : '#10b981',
                lineHeight: 1.1,
              }}
            >
              {incorrectCount}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, marginTop: '4px' }}>
              Incorrect
            </div>
          </div>

          {/* XP Gained */}
          <div
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--bg, #f8fafc)',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 850,
                color: 'var(--primary, #6366f1)',
                lineHeight: 1.1,
              }}
            >
              +{xpEarned}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 700, marginTop: '4px' }}>
              XP Earned
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href={`/course/${id}`}
            className="btn btn-outline"
            style={{
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontWeight: 650,
            }}
          >
            <ChevronLeft size={15} />
            <span>Back to Course</span>
          </Link>

          <Link
            href={`/course/${id}/module/${moduleId}`}
            className="btn btn-secondary"
            style={{
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontWeight: 650,
            }}
          >
            <BookOpen size={15} />
            <span>Back to Module</span>
          </Link>

          <Link
            href={`/course/${id}/module/${moduleId}/quiz?retake=1`}
            className="btn btn-outline"
            style={{
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontWeight: 650,
            }}
          >
            <RotateCcw size={15} />
            <span>Retake Quiz</span>
          </Link>

          {isCourseComplete ? (
            <Link
              href={`/certificate/${id}?autoSend=true`}
              className="btn btn-primary"
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                border: 'none',
                boxShadow: '0 8px 20px rgba(16,185,129,0.25)',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 750,
              }}
            >
              <GraduationCap size={18} />
              <span>View Verified Certificate</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            nextModuleId && (
              <Link
                href={`/course/${id}/module/${nextModuleId}`}
                className="btn btn-primary"
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 750,
                  boxShadow: '0 8px 20px rgba(99,102,241,0.25)',
                }}
              >
                <span>Next Module</span>
                <ArrowRight size={16} />
              </Link>
            )
          )}
        </div>
      </div>

      {/* Quick Jump Question Performance Matrix */}
      {result.results && result.results.length > 0 && (
        <div
          style={{
            background: 'var(--bg-white, #ffffff)',
            border: '1.5px solid var(--border, #e2e8f0)',
            borderRadius: '18px',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '0.84rem',
                fontWeight: 750,
                color: 'var(--text, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Compass size={16} color="var(--primary, #6366f1)" />
              <span>Question Quick Jump</span>
            </span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)' }}>
              Click any question to jump directly to its full solution
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {result.results.map((r: any, idx: number) => {
              const isCorrect = r.isCorrect;
              return (
                <a
                  key={idx}
                  href={`#question-${idx + 1}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.80rem',
                    fontWeight: 750,
                    textDecoration: 'none',
                    background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    color: isCorrect ? '#047857' : '#b91c1c',
                    border: `1.5px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                  ) : (
                    <XCircle size={13} style={{ color: '#ef4444' }} />
                  )}
                  <span>Q{idx + 1}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Answer Review Section Header & Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: '0 0 4px',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Award size={20} color="var(--primary, #6366f1)" />
            <span>Comprehensive Answer Review</span>
          </h2>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)' }}>
            Examine solution rationales and reinforce conceptual mastery
          </span>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-white, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeFilter === 'all' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeFilter === 'all' ? '#ffffff' : 'var(--text-secondary, #64748b)',
              transition: 'all 0.15s ease',
            }}
          >
            All ({result.total})
          </button>

          <button
            onClick={() => setActiveFilter('incorrect')}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: activeFilter === 'incorrect' ? '#ef4444' : 'transparent',
              color: activeFilter === 'incorrect' ? '#ffffff' : '#b91c1c',
              transition: 'all 0.15s ease',
            }}
          >
            <XCircle size={14} />
            <span>Incorrect ({incorrectCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('correct')}
            style={{
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: activeFilter === 'correct' ? '#10b981' : 'transparent',
              color: activeFilter === 'correct' ? '#ffffff' : '#047857',
              transition: 'all 0.15s ease',
            }}
          >
            <CheckCircle2 size={14} />
            <span>Correct ({result.score})</span>
          </button>
        </div>
      </div>

      {/* Review Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredQuestions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'var(--bg-white, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border, #e2e8f0)',
            }}
          >
            <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '8px' }} />
            <h4 style={{ margin: 0, fontWeight: 750 }}>No questions in this filter</h4>
          </div>
        ) : (
          filteredQuestions.map((r: any) => {
            const qNum = r.originalIndex + 1;

            return (
              <div
                key={r.originalIndex}
                id={`question-${qNum}`}
                style={{
                  background: 'var(--bg-white, #ffffff)',
                  borderRadius: '18px',
                  border: `1.5px solid ${r.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderLeft: `5px solid ${r.isCorrect ? '#10b981' : '#ef4444'}`,
                  padding: '24px 26px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                  animation: 'fadeIn 0.2s ease-out',
                  scrollMarginTop: '90px',
                }}
              >
                {/* Question Header Status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {r.isCorrect ? (
                      <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                    ) : (
                      <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    )}
                    <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text, #0f172a)' }}>
                      Question {qNum}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 750,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: r.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: r.isCorrect ? '#047857' : '#b91c1c',
                      border: `1px solid ${r.isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    }}
                  >
                    {r.isCorrect ? 'Correct (+10 XP)' : 'Incorrect (0 XP)'}
                  </span>
                </div>

                {/* Question Prompt */}
                <div style={{ marginBottom: '18px' }}>
                  <FormattedReviewText text={r.text} />
                </div>

                {/* Options Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {r.options?.map((opt: string, j: number) => {
                    const isOptionCorrect = j === r.correctAnswer;
                    const isOptionSelected = j === r.selectedAnswer;
                    const letter = String.fromCharCode(65 + j);

                    let borderColor = 'var(--border, #e2e8f0)';
                    let bg = 'var(--bg, #f8fafc)';
                    let textColor = 'var(--text, #0f172a)';

                    if (isOptionCorrect) {
                      borderColor = '#10b981';
                      bg = 'rgba(16, 185, 129, 0.08)';
                      textColor = '#047857';
                    } else if (isOptionSelected && !r.isCorrect) {
                      borderColor = '#ef4444';
                      bg = 'rgba(239, 68, 68, 0.08)';
                      textColor = '#b91c1c';
                    }

                    return (
                      <div
                        key={j}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '11px 16px',
                          borderRadius: '12px',
                          background: bg,
                          border: `1.5px solid ${borderColor}`,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.76rem',
                              fontWeight: 750,
                              background: isOptionCorrect
                                ? '#10b981'
                                : isOptionSelected && !r.isCorrect
                                ? '#ef4444'
                                : 'rgba(148, 163, 184, 0.15)',
                              color: isOptionCorrect || (isOptionSelected && !r.isCorrect) ? '#ffffff' : 'var(--text-secondary, #64748b)',
                            }}
                          >
                            {letter}
                          </span>
                          <span style={{ fontSize: '0.92rem', fontWeight: isOptionCorrect || isOptionSelected ? 700 : 500, color: textColor }}>
                            {opt}
                          </span>
                        </div>

                        {/* Status Label on Right */}
                        <div>
                          {isOptionCorrect && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 750,
                                color: '#047857',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              <Check size={13} strokeWidth={3} />
                              <span>Correct Answer</span>
                            </span>
                          )}
                          {isOptionSelected && !r.isCorrect && (
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 750,
                                color: '#b91c1c',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                padding: '3px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              <X size={13} strokeWidth={3} />
                              <span>Your Choice</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {r.explanation && (
                  <div
                    style={{
                      padding: '14px 18px',
                      background: 'rgba(99, 102, 241, 0.06)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <Lightbulb size={18} color="var(--primary, #6366f1)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '0.86rem', color: 'var(--text, #0f172a)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--primary, #4f46e5)', display: 'block', marginBottom: '3px' }}>
                        Explanation & Concept Insight:
                      </strong>
                      <FormattedReviewText text={r.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
