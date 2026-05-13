'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FlashcardStudyPage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ learned: 0, total: 0 });

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/flashcards`);
      if (res.status === 403) {
        return router.push(`/course/${id}/module/${moduleId}`);
      }
      const data = await res.json();

      if (data.flashcards && data.flashcards.length > 0) {
        setCards(data.flashcards);
        setStats({ learned: 0, total: data.flashcards.length });
        setLoading(false);
      } else {
        await generateCards();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  }, [id, moduleId, router]);

  const generateCards = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/courses/${id}/modules/${moduleId}/flashcards`, { method: 'POST' });
      const data = await res.json();
      if (data.flashcards) {
        setCards(data.flashcards);
        setStats({ learned: 0, total: data.flashcards.length });
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleReview = async (quality) => {
    if (currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    if (!card) return;

    setIsFlipped(false);

    setStats(prev => ({ ...prev, learned: Math.min(prev.total, prev.learned + 1) }));

    fetch(`/api/courses/${id}/modules/${moduleId}/flashcards/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcardId: card.id, quality })
    }).catch(err => console.error('Review sync failed:', err));

    setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= cards.length) {
          setIsComplete(true);
          setTimeout(() => {
            router.push(`/course/${id}/module/${moduleId}`);
          }, 2500);
        }
        return next;
      });
    }, 400);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentIndex >= cards.length) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      }
      if (isFlipped) {
        if (e.key === '1') handleReview(0);
        if (e.key === '2') handleReview(1);
        if (e.key === '3') handleReview(2);
        if (e.key === '4') handleReview(3);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, cards.length]);

  if (loading || generating) {
    return (
      <div className="study-loading-state">
        <div className="spinner"></div>
        <h3>{generating ? 'AI is Crafting Your Flashcards...' : 'Loading Session...'}</h3>
        <p>Turning module knowledge into memory anchors.</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Flashcards Available</h3>
        <p>The AI couldn't generate cards for this module. Try adding more notes!</p>
        <Link href={`/course/${id}/module/${moduleId}`} className="btn btn-primary">Back to Module</Link>
      </div>
    );
  }

  const displayIndex = Math.min(currentIndex, cards.length - 1);
  const activeCard = cards[displayIndex] || { question: '...', answer: '...' };
  const progress = Math.min(100, (currentIndex / cards.length) * 100);

  return (
    <div className="flashcard-experience fade-in">
      <div className="experience-header">
        <Link href={`/course/${id}/module/${moduleId}`} className="back-link">
          ← Back to Module
        </Link>
        <div className="progress-container">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">
            {currentIndex >= cards.length ? 'Mastery Achieved' : `Card ${currentIndex + 1} of ${cards.length}`}
          </span>
        </div>
      </div>

      <div className="card-arena-outer">
        <div className={`card-arena ${isFlipped ? 'flipped' : ''}`}>
          <div className="card card-front">
            <div className="card-badge">Question</div>
            <div className="card-text">{activeCard.question}</div>
          </div>
          <div className="card card-back">
            <div className="card-badge">Answer</div>
            <div className="card-text">{activeCard.answer}</div>
          </div>
        </div>
      </div>

      <div className="study-controls">
        {!isFlipped ? (
          <button className="btn btn-primary btn-lg btn-reveal" onClick={() => setIsFlipped(true)}>
            Reveal Answer <span className="kbd">Space</span>
          </button>
        ) : (
          <div className="rating-buttons fade-in">
            <button className="rate-btn again" onClick={() => handleReview(0)}>
              <span className="icon">↺</span>
              <span className="label">Again</span>
              <span className="kbd">1</span>
            </button>
            <button className="rate-btn hard" onClick={() => handleReview(1)}>
              <span className="icon">⚠</span>
              <span className="label">Hard</span>
              <span className="kbd">2</span>
            </button>
            <button className="rate-btn good" onClick={() => handleReview(2)}>
              <span className="icon">✓</span>
              <span className="label">Good</span>
              <span className="kbd">3</span>
            </button>
            <button className="rate-btn easy" onClick={() => handleReview(3)}>
              <span className="icon">★</span>
              <span className="label">Easy</span>
              <span className="kbd">4</span>
            </button>
          </div>
        )}
      </div>

      {isComplete && (
        <div className="windows-toast slide-in-right">
          <div className="toast-icon">🏆</div>
          <div className="toast-body">
            <div className="toast-title">FlashCards Completed!</div>
            <div className="toast-msg">Back to Module </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .flashcard-experience {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 20px;
          min-height: 80vh;
        }

        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .progress-container {
          flex: 1;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar-bg {
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: right;
        }

        .card-arena-outer {
          perspective: 1500px;
          height: 400px;
          width: 100%;
        }

        .card-arena {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .card-arena.flipped {
          transform: rotateY(180deg);
        }

        .card {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: var(--bg-white);
          border: 1px solid var(--border);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
        }

        .card-back {
          transform: rotateY(180deg);
          border-color: var(--primary-light);
          background: linear-gradient(135deg, white, #f8faff);
        }

        .card-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .card-text {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.4;
          text-align: center;
        }

        .study-controls {
          display: flex;
          justify-content: center;
          min-height: 100px;
        }

        .rating-buttons {
          display: grid;
          grid-template-columns: repeat(4, 150px);
          gap: 16px;
        }

        .rate-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          border-radius: 16px;
          background: var(--bg-white);
          border: 1px solid var(--border);
          transition: all 0.2s;
          position: relative;
        }

        .rate-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .icon { font-size: 1.5rem; margin-bottom: 4px; }
        .label { font-size: 0.85rem; font-weight: 600; }
        .kbd { font-size: 0.65rem; color: var(--text-muted); background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; margin-top: 4px; }

        .again:hover { border-color: #ef4444; color: #ef4444; }
        .hard:hover { border-color: #f59e0b; color: #f59e0b; }
        .good:hover { border-color: #10b981; color: #10b981; }
        .easy:hover { border-color: #3b82f6; color: #3b82f6; }

        .btn-reveal { padding: 16px 40px; font-size: 1.2rem; display: flex; align-items: center; gap: 12px; }

        .study-loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          gap: 16px;
        }

        .windows-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #1f1f1f;
          color: white;
          padding: 16px 20px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          z-index: 10000;
          min-width: 300px;
          border-left: 4px solid #3b82f6;
          animation: slideInRight 0.5s cubic-bezier(0.1, 0.9, 0.2, 1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .toast-icon { font-size: 1.5rem; }
        .toast-body { display: flex; flex-direction: column; gap: 2px; }
        .toast-title { font-size: 0.9rem; font-weight: 700; color: white; }
        .toast-msg { font-size: 0.8rem; color: #a1a1aa; }
      `}</style>
    </div>
  );
}
