'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

function QuizContent() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get('retake') === '1';

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(600);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);
  const [error, setError] = useState('');
 
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

  useEffect(() => {
    // Reset state on retake
    setQuiz(null);
    setLoading(true);
    setCurrent(0);
    setAnswers({});
    setSubmitting(false);
    setTotalTimeLeft(600);
    setQuestionTimeLeft(60);
    setError('');

    fetch(`/api/courses/${id}/modules/${moduleId}/quiz`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setQuiz(d.quiz);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load quiz'); setLoading(false); });
  }, [id, moduleId, isRetake]);

  useEffect(() => {
    if (loading || submitting || !quiz || error) return;

    const timer = setInterval(() => {
      if (submittingRef.current) return clearInterval(timer);

      setTotalTimeLeft(prev => {
        if (prev <= 1) {
           clearInterval(timer);
           handleAutoSubmit();
           return 0;
        }
        return prev - 1;
      });

      setQuestionTimeLeft(prev => {
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
      setAnswers(prev => ({ ...prev, [c]: -1 }));
    }

    if (c < qLen - 1) {
      setCurrent(c + 1); 
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

  const submitPayload = async (answerArray, timeTaken) => {
    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray, timeTaken }),
      });
      const data = await res.json();
      
      // Instant notifications for achievements unlocked during this quiz
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach(notif => {
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

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSelect = (optionIndex) => {
    setAnswers({ ...answers, [current]: optionIndex });
  };

  const handleNext = () => {
     setCurrent(p => p + 1);
     setQuestionTimeLeft(60); 
  };

  const handleSubmit = async () => {
    if (!quiz || !quiz.questions || submitting) return;
    setSubmitting(true);
    const answerArray = quiz.questions.map((_, i) => answers[i] ?? -1);
    submitPayload(answerArray, 600 - totalTimeLeft);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading quiz... AI is generating questions</p></div>;
  if (error) {
    return (
      <div className="empty-state fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '16px', color: error.includes('Locked') ? 'var(--danger)' : 'var(--text)' }}>
          {error.includes('Locked') ? '🔒 ' : '⚠️ '}{error}
        </h3>
        <button className="btn btn-primary" onClick={() => router.push(`/course/${id}`)}>
          ← Back to Course Roadmap
        </button>
      </div>
    );
  }
  if (!quiz || !quiz.questions || quiz.questions.length === 0) return <div className="empty-state"><h3>No quiz available</h3></div>;

  const question = quiz.questions[current];
  const options = typeof question?.options === 'string' ? JSON.parse(question.options) : (question?.options || []);

  return (
    <div className="quiz-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.3rem' }}>📝 Quiz</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="timer warning" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>
            🔥 Q. Timer: {formatTime(questionTimeLeft)}
          </div>
          <div className="timer" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            ⏱️ Total: {formatTime(totalTimeLeft)}
          </div>
        </div>
      </div>

      <div className="quiz-progress">
        <span>Q {current + 1}/{quiz.questions.length}</span>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question Navigation Dots - Only allowing jumping to future questions */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {quiz.questions.map((_, i) => (
          <button key={i} 
            disabled={i < current}
            onClick={() => { 
              if (i >= current) { 
                setCurrent(i); 
                setQuestionTimeLeft(60); 
              } 
            }} 
            style={{
              width: 32, height: 32, borderRadius: '50%', border: '2px solid',
              borderColor: i === current ? 'var(--primary)' : answers[i] !== undefined ? 'var(--success)' : 'var(--border)',
              background: i === current ? 'var(--primary)' : answers[i] !== undefined ? 'var(--success-bg)' : 'white',
              color: i === current ? 'white' : 'var(--text)', fontWeight: 600, fontSize: '0.8rem',
              cursor: i < current ? 'not-allowed' : 'pointer', transition: 'var(--transition)',
              opacity: i < current ? 0.6 : 1,
            }}>
            {i + 1}
          </button>
        ))}
      </div>

      <div className="question-card">
        <div className="question-text">{question.text}</div>
        <div>
          {options.map((opt, i) => (
            <div key={i} className={`option ${answers[current] === i ? 'selected' : ''}`}
              onClick={() => handleSelect(i)}>
              <div className="option-indicator">{String.fromCharCode(65 + i)}</div>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
        {current < quiz.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNext}>Next →</button>
        ) : (
          <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : '✅ Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner" /><p>Loading quiz...</p></div>}>
      <QuizContent />
    </Suspense>
  );
}
