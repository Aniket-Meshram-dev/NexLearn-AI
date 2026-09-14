'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function QuizResultPage() {
  const { id, moduleId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCourseComplete, setIsCourseComplete] = useState(false);
  const [nextModuleId, setNextModuleId] = useState(null);

  useEffect(() => {
    let resultData = null;
    let nextModId = null;

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
        if (d.course && d.course.modules) {
          const index = d.course.modules.findIndex(m => m.id === moduleId);
          if (index !== -1 && index < d.course.modules.length - 1) {
            nextModId = d.course.modules[index + 1].id;
          }
          
          // Check if the entire course is newly finished
          const allModulesDone = d.course.modules.every(m => m.completed);
          const allQuizzesDone = d.course.modules.every(m => m.quiz && (m.quiz.attempts.length > 0 || m.id === moduleId));
          if (allModulesDone && allQuizzesDone) {
            setIsCourseComplete(true);
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

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  if (!result) return (
    <div className="empty-state">
      <h3>No quiz results found</h3>
      <Link href={`/course/${id}/module/${moduleId}/quiz`} className="btn btn-primary">Take Quiz</Link>
    </div>
  );

  const emoji = result.percentage >= 90 ? '🏆' : result.percentage >= 70 ? '🎉' : result.percentage >= 50 ? '👍' : '📚';
  const message = result.percentage >= 90 ? 'Excellent!' : result.percentage >= 70 ? 'Great Job!' : result.percentage >= 50 ? 'Good Effort!' : 'Keep Studying!';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', marginBottom: 24, padding: 40 }}>
        <div style={{ fontSize: '4rem', marginBottom: 12 }}>{emoji}</div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{message}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Here are your quiz results</p>

        <div className="grid-3" style={{ maxWidth: 400, margin: '0 auto', marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: result.percentage >= 70 ? 'var(--success)' : 'var(--warning)' }}>
              {result.percentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{result.score}/{result.total}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{result.total - result.score}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wrong</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={`/course/${id}`} className="btn btn-outline">Back to Course</Link>
          <Link href={`/course/${id}/module/${moduleId}`} className="btn btn-secondary">← Back to Module</Link>
          {isCourseComplete ? (
            <Link href={`/certificate/${id}?autoSend=true`} className="btn btn-primary" style={{ padding: '12px 24px', background: 'var(--success)', border: 'none', boxShadow: '0 8px 20px rgba(16,185,129,0.2)' }}>
               🎓 View & Email Certificate →
            </Link>
          ) : nextModuleId && (
            <Link href={`/course/${id}/module/${nextModuleId}`} className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Proceed to Next Module →
            </Link>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 16 }}>📋 Answer Review</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {result.results?.map((r, i) => (
          <div key={i} className="card" style={{ borderLeft: `4px solid ${r.isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '1.2rem' }}>{r.isCorrect ? '✅' : '❌'}</span>
              <span style={{ fontWeight: 600 }}>Question {i + 1}</span>
            </div>
            <p style={{ fontWeight: 500, marginBottom: 12 }}>{r.text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.options?.map((opt, j) => (
                <div key={j} style={{
                  padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem',
                  background: j === r.correctAnswer ? 'var(--success-bg)' : j === r.selectedAnswer && !r.isCorrect ? 'var(--danger-bg)' : 'var(--secondary)',
                  border: `1px solid ${j === r.correctAnswer ? 'var(--success)' : j === r.selectedAnswer && !r.isCorrect ? 'var(--danger)' : 'transparent'}`,
                }}>
                  {String.fromCharCode(65 + j)}. {opt}
                  {j === r.correctAnswer && ' ✓'}
                  {j === r.selectedAnswer && j !== r.correctAnswer && ' ✗'}
                </div>
              ))}
            </div>
            {r.explanation && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--primary-bg)', borderRadius: 8, fontSize: '0.85rem' }}>
                💡 <strong>Explanation:</strong> {r.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
