'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  Volume2,
  Square,
  CheckCircle2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Zap,
  BookOpen,
  AlertTriangle,
  Check,
  Star,
} from 'lucide-react';

export default function FlashcardStudyPage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [reviewHistory, setReviewHistory] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

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

  // Read card aloud using Web Speech API
  const speakCard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const clean = text.replace(/[*_`#]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech on card change or flip
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentIndex, isFlipped]);

  const handleReview = async (quality: number) => {
    if (currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    if (!card) return;

    setIsFlipped(false);

    // Track review metrics
    const keyMap = ['again', 'hard', 'good', 'easy'] as const;
    const selectedKey = keyMap[quality] || 'good';
    setReviewHistory(prev => ({ ...prev, [selectedKey]: prev[selectedKey] + 1 }));

    // Send review score to backend
    fetch(`/api/courses/${id}/modules/${moduleId}/flashcards/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcardId: card.id, quality })
    }).catch(err => console.error('Review sync failed:', err));

    setTimeout(() => {
      if (currentIndex + 1 >= cards.length) {
        setIsComplete(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 350);
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else if (currentIndex === cards.length - 1) {
      setIsComplete(true);
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setReviewHistory({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  // Keyboard navigation: Space to flip, 1-4 to rate, Left/Right to turn cards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete || cards.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleReview(0);
        else if (e.key === '2') handleReview(1);
        else if (e.key === '3') handleReview(2);
        else if (e.key === '4') handleReview(3);
      } else {
        if (e.key === 'ArrowLeft') handlePrevCard();
        else if (e.key === 'ArrowRight') handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, cards.length, isComplete]);

  // Loading Screen matching NexLearn SaaS aesthetic
  if (loading || generating) {
    return (
      <div className="flashcards-loading-screen fade-in">
        <div className="loading-card-box">
          <div className="loading-glow-orb" />
          <div className="loading-cards-stack">
            <div className="stacked-card card-back-2" />
            <div className="stacked-card card-back-1" />
            <div className="stacked-card card-front-active">
              <div className="card-center-icon">
                {generating ? <Sparkles size={32} className="spin-slow" /> : <Layers size={32} className="float-pulse" />}
              </div>
            </div>
          </div>

          <h3 className="loading-title">
            {generating ? 'AI is Crafting Your Flashcards...' : 'Preparing Study Flashcards...'}
          </h3>
          <p className="loading-desc">
            {generating
              ? 'Extracting high-yield concepts from your module notes into memory cards.'
              : 'Calibrating spaced repetition intervals for maximum recall.'}
          </p>

          <div className="loading-stepper">
            <div className="stepper-item done">
              <span className="stepper-dot" />
              <span>Notes Analyzed</span>
            </div>
            <div className="stepper-item in-progress">
              <span className="stepper-dot pulse" />
              <span>{generating ? 'Synthesizing Cards' : 'Loading Deck'}</span>
            </div>
            <div className="stepper-item">
              <span className="stepper-dot" />
              <span>Ready to Practice</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .flashcards-loading-screen {
            min-height: 75vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .loading-card-box {
            position: relative;
            background: var(--bg-white);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 48px 36px;
            max-width: 480px;
            width: 100%;
            text-align: center;
            box-shadow: var(--shadow-lg);
            overflow: hidden;
          }
          .loading-glow-orb {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%);
            pointer-events: none;
          }
          .loading-cards-stack {
            position: relative;
            width: 110px;
            height: 120px;
            margin: 0 auto 24px auto;
          }
          .stacked-card {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 16px;
            border: 1.5px solid var(--border);
            transition: all 0.3s ease;
          }
          .card-back-2 {
            top: -12px;
            left: 10px;
            transform: rotate(10deg);
            background: rgba(99, 102, 241, 0.1);
            opacity: 0.5;
          }
          .card-back-1 {
            top: -6px;
            left: -8px;
            transform: rotate(-6deg);
            background: rgba(99, 102, 241, 0.2);
            opacity: 0.75;
          }
          .card-front-active {
            top: 0;
            left: 0;
            background: linear-gradient(135deg, var(--bg-white), var(--primary-bg));
            border-color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
          }
          .card-center-icon {
            color: var(--primary);
          }
          .loading-title {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--text);
            margin: 0 0 8px 0;
            letter-spacing: -0.01em;
          }
          .loading-desc {
            font-size: 0.88rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin: 0 0 28px 0;
          }
          .loading-stepper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding-top: 18px;
            border-top: 1px solid var(--border-light);
          }
          .stepper-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--text-muted);
          }
          .stepper-item.done {
            color: var(--success);
          }
          .stepper-item.in-progress {
            color: var(--primary);
          }
          .stepper-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--border);
          }
          .stepper-item.done .stepper-dot {
            background: var(--success);
          }
          .stepper-item.in-progress .stepper-dot {
            background: var(--primary);
          }
          .stepper-dot.pulse {
            animation: pulseDot 1.5s infinite;
          }
          @keyframes pulseDot {
            0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
            100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-slow {
            animation: spinSlow 6s linear infinite;
          }
          @keyframes floatPulse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .float-pulse {
            animation: floatPulse 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="empty-state fade-in" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-white)', borderRadius: '20px', border: '1px solid var(--border)', maxWidth: '540px', margin: '40px auto' }}>
        <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Layers size={32} />
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>No Flashcards Available</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.92rem', lineHeight: 1.5 }}>
          Could not find flashcards for this module yet. Head back to the module to study the notes!
        </p>
        <Link href={`/course/${id}/module/${moduleId}`} className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft size={16} />
          <span>Back to Module</span>
        </Link>
      </div>
    );
  }

  const displayIndex = Math.min(currentIndex, cards.length - 1);
  const activeCard = cards[displayIndex] || { question: '...', answer: '...' };
  const progress = Math.min(100, ((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="flashcard-experience fade-in">
      {/* Top Header Bar */}
      <div className="experience-header">
        <Link href={`/course/${id}/module/${moduleId}`} className="back-link-pill">
          <ArrowLeft size={15} />
          <span>Back to Module</span>
        </Link>

        {/* Progress Tracker */}
        <div className="progress-tracker-box">
          <div className="progress-labels">
            <span className="card-counter-badge">
              Card {displayIndex + 1} of {cards.length}
            </span>
            <span className="percent-text">{Math.round(progress)}% Completed</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <span className="progress-glow-head" />
            </div>
          </div>
        </div>

        <button
          onClick={restartSession}
          className="reset-deck-btn"
          title="Restart flashcard session"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* 3D Flashcard Arena */}
      <div className="card-arena-outer">
        <div
          className={`card-arena ${isFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlipped(prev => !prev)}
          role="button"
          tabIndex={0}
          aria-label="Flashcard - Click or press Space to flip"
        >
          {/* Question Side (Front) */}
          <div className="card card-front">
            <div className="card-top-bar">
              <div className="card-face-badge question-badge">
                <BookOpen size={14} />
                <span>Question</span>
              </div>
              <div className="card-action-icons">
                <button
                  onClick={(e) => speakCard(activeCard.question, e)}
                  className={`card-tts-btn ${isSpeaking ? 'active' : ''}`}
                  title="Listen to question"
                >
                  {isSpeaking ? <Square size={14} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
                <span className="flip-hint-pill">
                  <RotateCcw size={13} />
                  <span>Flip card</span>
                </span>
              </div>
            </div>

            <div className="card-content-area">
              <p className="card-text question-text">{activeCard.question}</p>
            </div>

            <div className="card-bottom-bar">
              <span className="card-footer-tip">
                Press <strong>Space</strong> or click card to reveal answer
              </span>
            </div>
          </div>

          {/* Answer Side (Back) */}
          <div className="card card-back">
            <div className="card-top-bar">
              <div className="card-face-badge answer-badge">
                <CheckCircle2 size={14} />
                <span>Answer & Explanation</span>
              </div>
              <div className="card-action-icons">
                <button
                  onClick={(e) => speakCard(activeCard.answer, e)}
                  className={`card-tts-btn ${isSpeaking ? 'active' : ''}`}
                  title="Listen to answer"
                >
                  {isSpeaking ? <Square size={14} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
                <span className="flip-hint-pill">
                  <RotateCcw size={13} />
                  <span>Flip back</span>
                </span>
              </div>
            </div>

            <div className="card-content-area">
              <div className="card-text answer-text">{activeCard.answer}</div>
            </div>

            <div className="card-bottom-bar">
              <span className="card-footer-tip answer-tip">
                Rate your recall below to calibrate spaced repetition:
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls & Navigation Area */}
      <div className="study-controls">
        {!isFlipped ? (
          <div className="unflipped-controls">
            <button
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className="btn btn-outline nav-btn"
              style={{ opacity: currentIndex === 0 ? 0.35 : 1 }}
              title="Previous card (Left Arrow)"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <button
              className="btn btn-primary btn-lg btn-reveal"
              onClick={() => setIsFlipped(true)}
            >
              <RotateCcw size={18} />
              <span>Reveal Answer</span>
              <span className="kbd">Space</span>
            </button>

            <button
              onClick={handleNextCard}
              className="btn btn-outline nav-btn"
              title="Next card (Right Arrow)"
            >
              <span>{currentIndex === cards.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="rating-controls-container fade-in">
            <div className="rating-buttons-grid">
              <button
                className="rate-card-btn rate-again"
                onClick={() => handleReview(0)}
                title="Review this again soon"
              >
                <div className="rate-icon-box"><RotateCcw size={16} /></div>
                <div className="rate-text-box">
                  <span className="rate-name">Again</span>
                  <span className="rate-desc">Review soon</span>
                </div>
                <span className="kbd-badge">1</span>
              </button>

              <button
                className="rate-card-btn rate-hard"
                onClick={() => handleReview(1)}
                title="Tough question, need more practice"
              >
                <div className="rate-icon-box"><AlertTriangle size={16} /></div>
                <div className="rate-text-box">
                  <span className="rate-name">Hard</span>
                  <span className="rate-desc">Tricky</span>
                </div>
                <span className="kbd-badge">2</span>
              </button>

              <button
                className="rate-card-btn rate-good"
                onClick={() => handleReview(2)}
                title="Good recall"
              >
                <div className="rate-icon-box"><Check size={16} strokeWidth={3} /></div>
                <div className="rate-text-box">
                  <span className="rate-name">Good</span>
                  <span className="rate-desc">Remembered</span>
                </div>
                <span className="kbd-badge">3</span>
              </button>

              <button
                className="rate-card-btn rate-easy"
                onClick={() => handleReview(3)}
                title="Instant recall, mastered concept"
              >
                <div className="rate-icon-box"><Star size={16} fill="currentColor" /></div>
                <div className="rate-text-box">
                  <span className="rate-name">Easy</span>
                  <span className="rate-desc">Mastered</span>
                </div>
                <span className="kbd-badge">4</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint Legend */}
      <div className="shortcuts-legend">
        <span>Keyboard shortcuts:</span>
        <span className="shortcut-item"><kbd>Space</kbd> Flip</span>
        <span className="shortcut-item"><kbd>1</kbd>–<kbd>4</kbd> Rate</span>
        <span className="shortcut-item"><kbd>←</kbd> / <kbd>→</kbd> Navigate</span>
      </div>

      {/* Celebratory Completion Dialog (Replaces Windows Toast) */}
      {isComplete && (
        <div className="completion-modal-backdrop fade-in">
          <div className="completion-dialog slide-up">
            <div className="dialog-celebration-badge">
              <Trophy size={40} className="trophy-bounce" />
            </div>

            <h2 className="dialog-title">Flashcards Completed!</h2>
            <p className="dialog-subtitle">
              Outstanding work! You&apos;ve actively reviewed all <strong>{cards.length}</strong> cards in this module.
            </p>

            {/* Session Summary Cards */}
            <div className="dialog-stats-row">
              <div className="stat-pill">
                <div className="stat-icon"><Layers size={16} /></div>
                <div>
                  <span className="stat-num">{cards.length}</span>
                  <span className="stat-label">Cards Studied</span>
                </div>
              </div>

              <div className="stat-pill success">
                <div className="stat-icon"><CheckCircle2 size={16} /></div>
                <div>
                  <span className="stat-num">{reviewHistory.good + reviewHistory.easy}</span>
                  <span className="stat-label">Mastered</span>
                </div>
              </div>

              <div className="stat-pill xp">
                <div className="stat-icon"><Zap size={16} /></div>
                <div>
                  <span className="stat-num">+25 XP</span>
                  <span className="stat-label">Knowledge XP</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="dialog-actions">
              <button
                onClick={restartSession}
                className="btn btn-outline btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={16} />
                <span>Practice Again</span>
              </button>

              <Link
                href={`/course/${id}/module/${moduleId}`}
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowLeft size={16} />
                <span>Back to Module Roadmap</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .flashcard-experience {
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
          padding: 24px 20px 60px;
          min-height: 85vh;
        }

        .experience-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .back-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 12px;
          background: var(--bg-white);
          border: 1px solid var(--border);
          color: var(--text);
          font-weight: 600;
          font-size: 0.88rem;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .back-link-pill:hover {
          background: var(--primary-bg);
          border-color: var(--primary);
          color: var(--primary);
          transform: translateX(-2px);
        }

        .progress-tracker-box {
          flex: 1;
          min-width: 260px;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
        }

        .card-counter-badge {
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-bg);
          padding: 2px 8px;
          border-radius: 8px;
        }

        .percent-text {
          color: var(--text-muted);
          font-weight: 600;
        }

        .progress-track {
          height: 8px;
          background: var(--border-light);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), #818cf8);
          border-radius: 6px;
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .progress-glow-head {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 8px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 8px white;
        }

        .reset-deck-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .reset-deck-btn:hover {
          color: var(--text);
          background: var(--bg);
        }

        /* 3D Card Arena */
        .card-arena-outer {
          perspective: 1400px;
          height: 420px;
          width: 100%;
        }

        .card-arena {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          cursor: pointer;
          outline: none;
        }

        .card-arena.flipped {
          transform: rotateY(180deg);
        }

        .card {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.07);
          box-sizing: border-box;
          border: 1.5px solid var(--border);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .card-front {
          background: var(--bg-white);
        }

        .card-back {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, var(--bg-white) 0%, #f0fdf4 100%);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .card:hover {
          box-shadow: 0 20px 50px rgba(99, 102, 241, 0.12);
        }

        .card-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .card-face-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .question-badge {
          background: var(--primary-bg);
          color: var(--primary);
        }

        .answer-badge {
          background: var(--success-bg);
          color: var(--success);
        }

        .card-action-icons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-tts-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .card-tts-btn:hover {
          color: var(--primary);
          border-color: var(--primary);
        }
        .card-tts-btn.active {
          background: var(--danger-bg);
          color: var(--danger);
          border-color: var(--danger);
        }

        .flip-hint-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--bg);
          padding: 6px 10px;
          border-radius: 8px;
        }

        .card-content-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 36px;
          overflow-y: auto;
        }

        .card-text {
          font-size: 1.5rem;
          line-height: 1.45;
          text-align: center;
          margin: 0;
          max-width: 680px;
        }

        .question-text {
          font-weight: 700;
          color: var(--text);
        }

        .answer-text {
          font-weight: 500;
          color: var(--text);
          font-size: 1.25rem;
          line-height: 1.6;
        }

        .card-bottom-bar {
          padding: 16px 24px;
          border-top: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.015);
        }

        .card-footer-tip {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .answer-tip {
          color: var(--success);
          font-weight: 600;
        }

        /* Controls */
        .study-controls {
          display: flex;
          justify-content: center;
          min-height: 90px;
        }

        .unflipped-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          justify-content: space-between;
        }

        .nav-btn {
          border-radius: 12px;
          padding: 12px 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .btn-reveal {
          flex: 1;
          max-width: 320px;
          padding: 14px 28px;
          font-size: 1.05rem;
          font-weight: 700;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }

        .kbd {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.25);
          padding: 2px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .rating-controls-container {
          width: 100%;
        }

        .rating-buttons-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          width: 100%;
        }

        .rate-card-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          border-radius: 16px;
          background: var(--bg-white);
          border: 1.5px solid var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-shadow: var(--shadow-sm);
        }

        .rate-card-btn:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .rate-icon-box {
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .rate-text-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .rate-name {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .rate-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .kbd-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.65rem;
          color: var(--text-muted);
          background: var(--bg);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          border: 1px solid var(--border-light);
        }

        .rate-again:hover {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
          color: #dc2626;
        }
        .rate-again .rate-icon-box { color: #dc2626; }

        .rate-hard:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
          color: #d97706;
        }
        .rate-hard .rate-icon-box { color: #d97706; }

        .rate-good:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
          color: #059669;
        }
        .rate-good .rate-icon-box { color: #059669; }

        .rate-easy:hover {
          border-color: #6366f1;
          background: rgba(99, 102, 241, 0.05);
          color: #4f46e5;
        }
        .rate-easy .rate-icon-box { color: #4f46e5; }

        .shortcuts-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-size: 0.8rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }
        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .shortcut-item kbd {
          background: var(--bg-white);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.72rem;
          font-family: inherit;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        /* Celebration Modal Backdrop & Dialog */
        .completion-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .completion-dialog {
          background: var(--bg-white);
          border-radius: 28px;
          padding: 40px 36px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          border: 1.5px solid var(--border);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .dialog-celebration-badge {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #d97706;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
        }

        .trophy-bounce {
          animation: trophyBounce 1.5s infinite ease-in-out;
        }
        @keyframes trophyBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); }
        }

        .dialog-title {
          font-size: 1.7rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        }

        .dialog-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 28px 0;
        }

        .dialog-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 14px;
          background: var(--bg);
          border: 1px solid var(--border-light);
          text-align: left;
        }
        .stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-bg);
          color: var(--primary);
          flex-shrink: 0;
        }
        .stat-pill.success .stat-icon {
          background: var(--success-bg);
          color: var(--success);
        }
        .stat-pill.xp .stat-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .stat-num {
          display: block;
          font-size: 1rem;
          font-weight: 800;
          color: var(--text);
        }
        .stat-label {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .rating-buttons-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .card-arena-outer {
            height: 380px;
          }
          .card-text {
            font-size: 1.25rem;
          }
          .dialog-stats-row {
            grid-template-columns: 1fr;
          }
          .unflipped-controls {
            flex-direction: column;
          }
          .btn-reveal {
            max-width: 100%;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
