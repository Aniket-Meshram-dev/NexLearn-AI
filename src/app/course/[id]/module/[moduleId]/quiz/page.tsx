'use client';
import { useEffect, useState, useRef, Suspense, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HelpCircle,
  Clock,
  Timer,
  Lock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Brain,
  Trophy,
  Lightbulb,
  Check,
  AlertCircle,
  X,
  Keyboard,
} from 'lucide-react';
import './quiz.css';

/**
 * Modern AI Quiz Calibration & Preparation Loading Screen
 */
function QuizLoadingScreen({ moduleTitle }: { moduleTitle?: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Scanning module notes & key conceptual principles...',
    'Calibrating 10 adaptive questions with explanations...',
    'Setting up timers, answer keys, and difficulty weights...',
    'Finalizing interactive assessment workspace...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      style={{
        maxWidth: '740px',
        margin: '36px auto',
        padding: '40px 32px',
        borderRadius: '24px',
        background: 'var(--bg-white, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Top Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary, #4f46e5)',
          fontSize: '0.74rem',
          fontWeight: 750,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}
      >
        <Sparkles size={13} />
        <span>NexLearn AI Assessment Engine</span>
      </div>

      {/* Central Pulsing Animated Orb */}
      <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            opacity: 0.25,
            animation: 'pulseGlow 2s infinite',
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.35)',
          }}
        >
          <Brain size={38} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text, #0f172a)' }}>
        Calibrating Your Adaptive Assessment
      </h2>
      {moduleTitle && (
        <p style={{ fontSize: '0.9rem', color: 'var(--primary, #6366f1)', fontWeight: 650, margin: '0 0 16px' }}>
          {moduleTitle}
        </p>
      )}

      {/* Animated Step cycling */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 18px',
          borderRadius: '12px',
          background: 'var(--bg, #f8fafc)',
          border: '1px solid var(--border, #e2e8f0)',
          marginBottom: '28px',
        }}
      >
        <div className="spinner" style={{ width: '15px', height: '15px', borderWidth: '2px' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
          {steps[step]}
        </span>
      </div>

      {/* Skeleton Question Preview Card */}
      <div
        style={{
          padding: '24px',
          borderRadius: '18px',
          border: '1px dashed var(--border, #e2e8f0)',
          background: 'var(--bg, #f8fafc)',
          marginBottom: '28px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div className="quiz-skeleton" style={{ width: '130px', height: '18px' }} />
          <div className="quiz-skeleton" style={{ width: '80px', height: '18px' }} />
        </div>
        <div className="quiz-skeleton" style={{ width: '92%', height: '24px', marginBottom: '8px' }} />
        <div className="quiz-skeleton" style={{ width: '65%', height: '24px', marginBottom: '20px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--bg-white, #ffffff)',
                border: '1px solid var(--border, #e2e8f0)',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'var(--border, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted, #94a3b8)',
                }}
              >
                {String.fromCharCode(65 + i)}
              </div>
              <div className="quiz-skeleton" style={{ width: `${60 + i * 8}%`, height: '16px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Meta Stats Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '0.82rem',
          color: 'var(--text-muted, #94a3b8)',
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <CheckCircle2 size={14} color="#10b981" /> 10 Questions
        </span>
        <span>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Timer size={14} color="#6366f1" /> 60s / Question • 10m Exam
        </span>
        <span>•</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Trophy size={14} color="#f59e0b" /> Passing Grade: 70%
        </span>
      </div>
    </div>
  );
}

/**
 * Formats question text with inline code badges if backticks are detected
 */
function FormattedQuestionText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <div
      style={{
        fontSize: '1.14rem',
        fontWeight: 650,
        color: 'var(--text, #0f172a)',
        lineHeight: 1.55,
        letterSpacing: '-0.01em',
      }}
    >
      {parts.map((part, idx) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = part.slice(1, -1);
          return (
            <code
              key={idx}
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.92em',
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
    </div>
  );
}

function QuizContent() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get('retake') === '1';

  const [quiz, setQuiz] = useState<any>(null);
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(600);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentRef = useRef(current);
  const answersRef = useRef(answers);
  const quizRef = useRef(quiz);
  const submittingRef = useRef(submitting);
  const totalTimeLeftRef = useRef(totalTimeLeft);

  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { quizRef.current = quiz; }, [quiz]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { totalTimeLeftRef.current = totalTimeLeft; }, [totalTimeLeft]);

  // Load quiz data
  useEffect(() => {
    setQuiz(null);
    setLoading(true);
    setCurrent(0);
    setAnswers({});
    setSubmitting(false);
    setTotalTimeLeft(600);
    setQuestionTimeLeft(60);
    setError('');
    setShowHint(false);

    fetch(`/api/courses/${id}/modules/${moduleId}/quiz`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          setLoading(false);
          return;
        }
        setQuiz(d.quiz);
        if (d.moduleTitle) setModuleTitle(d.moduleTitle);
        if (d.courseTitle) setCourseTitle(d.courseTitle);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load quiz');
        setLoading(false);
      });
  }, [id, moduleId, isRetake]);

  // Exam and Question Timers
  useEffect(() => {
    if (loading || submitting || !quiz || error) return;

    const timer = setInterval(() => {
      if (submittingRef.current) return clearInterval(timer);

      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUpForQuestion();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quiz, error]);

  const handleTimeUpForQuestion = () => {
    const qLen = quizRef.current?.questions?.length || 0;
    const c = currentRef.current;

    if (answersRef.current[c] === undefined) {
      setAnswers((prev) => ({ ...prev, [c]: -1 }));
    }

    if (c < qLen - 1) {
      setCurrent(c + 1);
      setShowHint(false);
    } else {
      handleAutoSubmit();
    }
  };

  const handleAutoSubmit = () => {
    if (submittingRef.current) return;
    setSubmitting(true);
    const qLen = quizRef.current?.questions?.length || 0;
    const answerArray = Array.from({ length: qLen }).map((_, i) => answersRef.current[i] ?? -1);
    submitPayload(answerArray, 600 - totalTimeLeftRef.current);
  };

  const submitPayload = async (answerArray: number[], timeTaken: number) => {
    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray, timeTaken }),
      });
      const data = await res.json();

      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach((notif: any) => {
          window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: notif }));
        });
      }

      sessionStorage.setItem('quizResult', JSON.stringify(data));
      router.push(`/course/${id}/module/${moduleId}/result`);
    } catch {
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [current]: optionIndex }));
  };

  const handleNext = () => {
    if (quiz && current < quiz.questions.length - 1) {
      setCurrent((p) => p + 1);
      setQuestionTimeLeft(60);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent((p) => p - 1);
      setQuestionTimeLeft(60);
      setShowHint(false);
    }
  };

  const handleInitiateSubmit = () => {
    if (!quiz || !quiz.questions || submitting) return;
    const totalQ = quiz.questions.length;
    const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)] !== undefined && answers[Number(k)] !== -1).length;
    const unanswered = totalQ - answeredCount;

    if (unanswered > 0) {
      setShowConfirmModal(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = () => {
    if (!quiz || !quiz.questions || submitting) return;
    setShowConfirmModal(false);
    setSubmitting(true);
    const answerArray = quiz.questions.map((_: any, i: number) => answers[i] ?? -1);
    submitPayload(answerArray, 600 - totalTimeLeft);
  };

  // Keyboard navigation listener (A, B, C, D / 1, 2, 3, 4 / Enter / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in chat or input
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const key = e.key.toLowerCase();
      if (key === '1' || key === 'a') {
        handleSelect(0);
      } else if (key === '2' || key === 'b') {
        handleSelect(1);
      } else if (key === '3' || key === 'c') {
        handleSelect(2);
      } else if (key === '4' || key === 'd') {
        handleSelect(3);
      } else if (key === 'enter' || key === 'arrowright') {
        if (current < (quiz?.questions?.length || 0) - 1) {
          handleNext();
        }
      } else if (key === 'arrowleft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, quiz, answers]);

  // Loading state
  if (loading) {
    return <QuizLoadingScreen moduleTitle={moduleTitle} />;
  }

  // Error state
  if (error) {
    return (
      <div
        className="empty-state fade-in"
        style={{
          maxWidth: '600px',
          margin: '60px auto',
          padding: '40px 32px',
          textAlign: 'center',
          background: 'var(--bg-white, #ffffff)',
          borderRadius: '24px',
          border: '1px solid var(--border, #e2e8f0)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          {error.includes('Locked') ? (
            <Lock size={26} style={{ color: 'var(--danger, #ef4444)' }} />
          ) : (
            <AlertTriangle size={26} style={{ color: 'var(--warning, #f59e0b)' }} />
          )}
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: error.includes('Locked') ? 'var(--danger, #ef4444)' : 'var(--text, #0f172a)' }}>
            {error}
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)', marginBottom: '24px' }}>
          {error.includes('Locked')
            ? 'Complete previous module milestones to unlock this assessment.'
            : 'An unexpected issue occurred while loading this quiz.'}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => router.push(`/course/${id}/module/${moduleId}`)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: '12px' }}
        >
          <ArrowLeft size={16} />
          <span>Return to Module Notes</span>
        </button>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <HelpCircle size={40} color="var(--primary)" style={{ marginBottom: 16 }} />
        <h3>No quiz questions available for this module</h3>
        <button className="btn btn-primary" onClick={() => router.push(`/course/${id}/module/${moduleId}`)}>
          Back to Module
        </button>
      </div>
    );
  }

  const question = quiz.questions[current];
  const options =
    typeof question?.options === 'string'
      ? JSON.parse(question.options)
      : question?.options || [];

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] !== undefined && answers[Number(k)] !== -1
  ).length;

  const totalQuestions = quiz.questions.length;
  const progressPercent = Math.round(((current + 1) / totalQuestions) * 100);

  // Timer alerts
  const isQuestionTimeWarning = questionTimeLeft <= 15;
  const isQuestionTimeAlert = questionTimeLeft <= 5;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header & Breadcrumb Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <Link
            href={`/course/${id}/module/${moduleId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: 'var(--text-muted, #64748b)',
              textDecoration: 'none',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Module Notes</span>
          </Link>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 850,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            <HelpCircle size={22} style={{ color: 'var(--primary, #6366f1)' }} />
            <span>{moduleTitle ? `${moduleTitle} • Assessment` : 'Module Quiz Assessment'}</span>
          </h1>
        </div>

        {/* Timers Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Question 60s Countdown Timer */}
          <div
            className={isQuestionTimeAlert ? 'timer-alert' : ''}
            style={{
              fontSize: '0.84rem',
              fontWeight: 750,
              color: isQuestionTimeAlert ? '#dc2626' : isQuestionTimeWarning ? '#d97706' : 'var(--text, #0f172a)',
              background: isQuestionTimeAlert
                ? 'rgba(239, 68, 68, 0.15)'
                : isQuestionTimeWarning
                ? 'rgba(245, 158, 11, 0.12)'
                : 'var(--bg, #f8fafc)',
              border: `1.5px solid ${
                isQuestionTimeAlert
                  ? 'rgba(239, 68, 68, 0.4)'
                  : isQuestionTimeWarning
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'var(--border, #e2e8f0)'
              }`,
              borderRadius: '10px',
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            title="Time remaining for this question"
          >
            <Timer size={15} />
            <span>Question: {formatTime(questionTimeLeft)}</span>
          </div>

          {/* Total 10:00 Exam Timer */}
          <div
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: 'var(--text-secondary, #64748b)',
              background: 'var(--bg, #f8fafc)',
              border: '1.5px solid var(--border, #e2e8f0)',
              borderRadius: '10px',
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Total time remaining for the quiz"
          >
            <Clock size={15} />
            <span>Total: {formatTime(totalTimeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress Metric & Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 750, color: 'var(--text, #0f172a)' }}>
            Question {current + 1} of {totalQuestions}
          </span>
          <span style={{ fontSize: '0.80rem', fontWeight: 650, color: 'var(--text-secondary, #64748b)' }}>
            {answeredCount} / {totalQuestions} Answered ({progressPercent}%)
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: 'var(--border, #e2e8f0)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
            }}
          />
        </div>
      </div>

      {/* Free Interactive Question Navigator Grid (1 - 10) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '22px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {quiz.questions.map((_: any, i: number) => {
          const isCurrent = i === current;
          const isAnswered = answers[i] !== undefined && answers[i] !== -1;

          return (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setQuestionTimeLeft(60);
                setShowHint(false);
              }}
              title={`Jump to Question ${i + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
              className={`quiz-nav-pill ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
            >
              {isAnswered && !isCurrent ? <Check size={14} strokeWidth={3} /> : i + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div
        style={{
          background: 'var(--bg-white, #ffffff)',
          borderRadius: '20px',
          border: '1.5px solid var(--border, #e2e8f0)',
          padding: '30px 28px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Question Header Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px 10px',
              borderRadius: '6px',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary, #4f46e5)',
            }}
          >
            Multiple Choice • 1 Pt
          </span>

          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
            Select 1 option
          </span>
        </div>

        {/* Formatted Question Text */}
        <div style={{ marginBottom: '24px' }}>
          <FormattedQuestionText text={question.text} />
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {options.map((opt: string, i: number) => {
            const isSelected = answers[current] === i;
            const letter = String.fromCharCode(65 + i);

            return (
              <div
                key={i}
                className={`quiz-opt-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(i)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div className="quiz-opt-indicator">
                    {isSelected ? <Check size={16} strokeWidth={3} /> : letter}
                  </div>
                  <span
                    style={{
                      fontSize: '0.94rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--primary, #4f46e5)' : 'var(--text, #0f172a)',
                      lineHeight: 1.45,
                    }}
                  >
                    {opt}
                  </span>
                </div>

                {/* Keyboard Shortcut Hint */}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg, #f1f5f9)',
                    color: isSelected ? 'var(--primary, #4f46e5)' : 'var(--text-muted, #94a3b8)',
                    border: '1px solid var(--border, #e2e8f0)',
                  }}
                >
                  {letter} / {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Optional AI Hint Drawer */}
        {showHint && question.explanation && (
          <div
            style={{
              marginTop: '20px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <Lightbulb size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                Conceptual Clue
              </span>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#92400e', lineHeight: 1.45 }}>
                {question.explanation.split('.')[0]}. (Think carefully about access boundaries and keywords).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Previous Button & Hint Toggle */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={current === 0}
            className="btn btn-outline"
            style={{
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: current === 0 ? 0.45 : 1,
              cursor: current === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          {question.explanation && (
            <button
              onClick={() => setShowHint((prev) => !prev)}
              style={{
                borderRadius: '12px',
                padding: '8px 14px',
                background: showHint ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg, #f8fafc)',
                border: '1px solid var(--border, #e2e8f0)',
                color: showHint ? '#b45309' : 'var(--text-secondary, #64748b)',
                fontSize: '0.84rem',
                fontWeight: 650,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Lightbulb size={15} color={showHint ? '#d97706' : '#94a3b8'} />
              <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
            </button>
          )}
        </div>

        {/* Right: Next or Submit Button */}
        <div>
          {current < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{
                borderRadius: '12px',
                padding: '10px 22px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
              }}
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleInitiateSubmit}
              disabled={submitting}
              className="btn btn-success"
              style={{
                borderRadius: '12px',
                padding: '10px 24px',
                fontWeight: 750,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)',
              }}
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  <span>Submitting Assessment...</span>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  <span>Submit Assessment ({answeredCount}/{totalQuestions})</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Helper Bar */}
      <div
        style={{
          marginTop: '28px',
          padding: '10px 16px',
          borderRadius: '12px',
          background: 'var(--bg, #f8fafc)',
          border: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.78rem',
          color: 'var(--text-muted, #94a3b8)',
          fontWeight: 600,
        }}
      >
        <Keyboard size={15} />
        <span>Keyboard shortcuts: Press 1-4 or A-D to choose • Enter / → for Next • ← for Previous</span>
      </div>

      {/* Confirmation Modal If Unanswered Questions Exist */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'var(--bg-white, #ffffff)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <AlertCircle size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text, #0f172a)' }}>
              Unanswered Questions Detected
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 24px', lineHeight: 1.5 }}>
              You have answered <strong>{answeredCount}</strong> out of <strong>{totalQuestions}</strong> questions. 
              Submitting now will grade the remaining {totalQuestions - answeredCount} unanswered question(s) as incorrect.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-outline"
                style={{ borderRadius: '10px', padding: '10px 18px', fontWeight: 650 }}
              >
                Review Questions
              </button>
              <button
                onClick={executeSubmit}
                className="btn btn-primary"
                style={{ borderRadius: '10px', padding: '10px 20px', fontWeight: 700 }}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoadingScreen />}>
      <QuizContent />
    </Suspense>
  );
}
