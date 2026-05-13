'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AiMentor from '@/components/AiMentor';
import Mermaid from '@/components/Mermaid';

export default function LearningModulePage() {
  const { id, moduleId } = useParams();
  const router = useRouter();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [completingModule, setCompletingModule] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [loadingMindmap, setLoadingMindmap] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}/modules/${moduleId}`)
      .then(async r => {
        if (!r.ok) {
          const errData = await r.json();
          if (r.status === 403 && errData.isLocked) {
            setMod({ locked: true, error: errData.error });
            setLoading(false);
            return null;
          }
          throw new Error('Failed to fetch module');
        }
        return r.json();
      }).then(d => {
        if (d && d.module) {
          setMod(d.module);
          setBookmarked(d.module.bookmarks && d.module.bookmarks.length > 0);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [id, moduleId]);

  useEffect(() => {
    if (activeTab === 'videos' && videos.length === 0 && !loadingVideos) {
      setLoadingVideos(true);
      const searchQuery = `${mod.course?.title || ''} ${mod.title}`.trim();
      fetch(`/api/videos/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.videos && data.videos.length > 0) {
            setVideos(data.videos);
            setActiveVideo(data.videos[0]);
          }
          setLoadingVideos(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingVideos(false);
        });
    }
  }, [activeTab, mod?.title]);

  useEffect(() => {
    if (activeTab === 'mindmap' && mod && !mod.mindmap && !loadingMindmap) {
      setLoadingMindmap(true);
      fetch(`/api/courses/${id}/modules/${moduleId}/mindmap`, {
        method: 'POST',
      })
        .then(res => res.json())
        .then(data => {
          if (data.mindmap) {
            setMod(prev => ({ ...prev, mindmap: data.mindmap }));
          }
          setLoadingMindmap(false);
        })
        .catch(err => {
          console.error('Failed to load mindmap', err);
          setLoadingMindmap(false);
        });
    }
  }, [activeTab, mod, loadingMindmap, id, moduleId]);

  const handleComplete = async () => {
    setCompletingModule(true);
    const res = await fetch(`/api/courses/${id}/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    const data = await res.json();
    setCompletingModule(false);
    if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
      data.unlockedAchievements.forEach(notif => {
        window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: notif }));
      });
    }
    setMod(prev => ({ ...prev, completed: true }));
  };

  const toggleBookmark = async () => {
    const method = bookmarked ? 'DELETE' : 'POST';
    await fetch('/api/user/bookmarks', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId })
    });
    setBookmarked(!bookmarked);
  };

  const getPreferredVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const savedVoiceName = localStorage.getItem('icads_preferred_voice');

    // 1. Try saved user preference
    if (savedVoiceName) {
      const preferred = voices.find(v => v.name === savedVoiceName);
      if (preferred) return preferred;
    }

    // 2. Fallback: Prefer "Google" voices as they often sound more natural, then look for "female"
    return (
      voices.find(v => v.name.includes('Google') && v.name.includes('Female')) ||
      voices.find(v => v.name.toLowerCase().includes('female')) ||
      voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
      voices[0]
    );
  };

  const toggleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const textToRead = content[activeTab];
      if (!textToRead) return;

      // Clean markdown/HTML for better speech synthesis
      let cleanText = textToRead
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/#+\s/g, '')          // Remove headers
        .replace(/\*\*/g, '')          // Remove bold
        .replace(/`/g, '')             // Remove inline code
        .replace(/<li>/g, ' Next point: ') // Better list reading
        .replace(/<[^>]*>?/gm, '');    // Remove any remaining HTML

      // Filter out special characters but keep alphanumeric and basic punctuation for natural pauses
      cleanText = cleanText
        .replace(/[^\w\s\.,\?!\/]/gi, '') // Keep letters, numbers, spaces, and . , ? ! /
        .replace(/_/g, ' ')               // Replace underscores with spaces
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Set preferred voice
      const preferredVoice = getPreferredVoice();
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onend = () => setIsReading(false);
      utterance.onstart = () => setIsReading(true);
      utterance.onerror = () => setIsReading(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop reading when tab changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsReading(false);
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading module...</p></div>;
  if (!mod) return <div className="empty-state"><h3>Module not found</h3></div>;

  if (mod.locked) {
    return (
      <div className="empty-state fade-in" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-white)', borderRadius: '16px', border: '1px solid var(--border)', marginTop: '40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔒</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Module Locked</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {mod.error || 'Please complete the previous module first to unlock this content.'}
        </p>
        <Link href={`/course/${id}`} className="btn btn-primary btn-lg">
          ← Back to Course Roadmap
        </Link>
      </div>
    );
  }

  const tabs = ['notes', 'mindmap', 'examples', 'summary', 'exercises', 'videos'];
  const tabIcons = { notes: '📝', mindmap: '🧠', examples: '💡', summary: '📋', exercises: '🏋️', videos: '🎥' };
  const content = { notes: mod.notes, examples: mod.examples, summary: mod.summary, exercises: mod.exercises };

  const sectionMeta = {
    notes: {
      title: 'Theory & Notes',
      description: 'Core concepts and detailed explanations — read through the theory to build your foundation.',
      accentClass: 'section-accent-notes',
    },
    mindmap: {
      title: 'Visual Mind Map',
      description: 'A visual relationship structure of the core concepts generated by AI for easier understanding.',
      accentClass: 'section-accent-notes',
    },
    examples: {
      title: 'Real-World Examples',
      description: 'See how the theory works in practice with concrete demonstrations and case studies.',
      accentClass: 'section-accent-examples',
    },
    summary: {
      title: 'Quick Summary',
      description: 'A concise recap of the key takeaways from the notes — perfect for revision.',
      accentClass: 'section-accent-summary',
    },
    exercises: {
      title: 'Practice Exercises',
      description: 'Challenge yourself with these problems — solve them independently to solidify your learning.',
      accentClass: 'section-accent-exercises',
    },
    videos: {
      title: 'Related Videos',
      description: 'Hand-picked YouTube videos related to this module to enhance your understanding.',
      accentClass: 'section-accent-videos',
    },
  };

  const renderContent = (text) => {
    if (!text) return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Content not available for this section.</p>;

    // Simple markdown-to-html transformation
    const formatted = text
      // Code blocks (triple backticks) - transformed first before newline split
      .replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="code-block">$2</pre>')
      .replace(/^### (.*)/gm, '<h3>$1</h3>')
      .replace(/^## (.*)/gm, '<h2>$1</h2>')
      .replace(/^# (.*)/gm, '<h1>$1</h1>')
      .replace(/^\* (.*)/gm, '<li>$1</li>')
      .replace(/^- (.*)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*)/gm, '<li class="numbered">$1</li>')
      .replace(/(\*\*)(.*?)(\*\*)/g, '<strong>$2</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
      .split('\n');

    let inList = false;
    let inOrderedList = false;
    let finalHtml = [];

    formatted.forEach((line) => {
      const trimmedLine = line.trim();

      // Handle unordered lists
      if (line.startsWith('<li>') && !line.includes('class="numbered"') && !inList) {
        if (inOrderedList) { finalHtml.push('</ol>'); inOrderedList = false; }
        finalHtml.push('<ul>');
        inList = true;
      } else if (!line.startsWith('<li>') && inList) {
        finalHtml.push('</ul>');
        inList = false;
      }

      // Handle ordered lists
      if (line.includes('class="numbered"') && !inOrderedList) {
        if (inList) { finalHtml.push('</ul>'); inList = false; }
        finalHtml.push('<ol>');
        inOrderedList = true;
      } else if (!line.includes('class="numbered"') && inOrderedList) {
        finalHtml.push('</ol>');
        inOrderedList = false;
      }

      if (!line.startsWith('<h') && !line.startsWith('<li>') && !line.startsWith('<ul>') && !line.startsWith('</ul>') && !line.startsWith('<ol>') && !line.startsWith('</ol>') && !line.startsWith('<pre') && trimmedLine !== '') {
        finalHtml.push(`<p>${line}</p>`);
      } else {
        finalHtml.push(line);
      }
    });

    if (inList) finalHtml.push('</ul>');
    if (inOrderedList) finalHtml.push('</ol>');

    return (
      <div
        className="premium-prose-content"
        dangerouslySetInnerHTML={{ __html: finalHtml.join('\n') }}
      />
    );
  };

  const currentSection = sectionMeta[activeTab];

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link href={`/course/${id}`} className="back-link">
          <span className="back-icon">←</span> Back to Course
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div className="header-content-main">
            <h1 className="module-page-main-title">{mod.title}</h1>
            <div className="module-meta-badges">
              <span className={`badge-pill ${mod.difficulty === 'Easy' ? 'badge-pill-success' : mod.difficulty === 'Hard' ? 'badge-pill-danger' : 'badge-pill-warning'}`}>
                {mod.difficulty}
              </span>
              {mod.completed && <span className="badge-pill badge-pill-success">
                <span className="check-icon">✓</span> Completed
              </span>}
            </div>
          </div>
          <div className="header-actions-extra">
            <button className={`bookmark-btn ${bookmarked ? 'active' : ''}`} onClick={toggleBookmark} title="Bookmark Module">
              {bookmarked ? '🔖 Saved to Library' : '📑 Bookmark Module'}
            </button>
          </div>
        </div>
      </div>

      <div className="premium-tabs-container">
        <div className="tabs premium-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`tab-premium-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              <span className="tab-icon-large">{tabIcons[tab]}</span>
              <span className="tab-label-text">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={`premium-content-card ${currentSection.accentClass}`}>
        <div className="card-decoration-top"></div>
        {/* Section Header Banner */}
        <div className="section-header-banner">
          <div className="section-header-icon">{tabIcons[activeTab]}</div>
          <div>
            <h2 className="section-header-title">{currentSection.title}</h2>
            <p className="section-header-desc">{currentSection.description}</p>
          </div>
          {activeTab !== 'videos' && activeTab !== 'mindmap' && (
            <button
              onClick={toggleReadAloud}
              style={{
                marginLeft: 'auto',
                padding: '10px 20px',
                borderRadius: '12px',
                background: isReading ? 'var(--danger-bg)' : 'var(--primary-bg)',
                color: isReading ? 'var(--danger)' : 'var(--primary)',
                border: `1px solid ${isReading ? 'var(--danger)' : 'var(--primary)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: isReading ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{isReading ? '⏹️' : '🔊'}</span>
              {isReading ? 'Stop Reading' : 'Listen to Section'}
            </button>
          )}
        </div>
        <div className="card-inner-prose">
          {activeTab === 'videos' ? (
            <div className="video-section-container">
              {loadingVideos ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Finding the best related videos...</p>
                </div>
              ) : videos.length > 0 ? (
                <div className="video-player-layout" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div className="main-video-player" style={{ flex: '1 1 600px' }}>
                    <iframe
                      width="100%"
                      height="500"
                      src={`https://www.youtube.com/embed/${activeVideo?.videoId}?autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ borderRadius: '12px', border: '1px solid var(--border)', background: '#000' }}
                    ></iframe>
                    <h3 style={{ marginTop: '16px', fontSize: '1.25rem' }}>{activeVideo?.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>By {activeVideo?.author}</p>
                  </div>
                  <div className="video-playlist" style={{ flex: '0 0 300px' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-muted)' }}>More Videos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                      {videos.map(v => (
                        <div
                          key={v.videoId}
                          className={`playlist-item ${activeVideo?.videoId === v.videoId ? 'active' : ''}`}
                          onClick={() => setActiveVideo(v)}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '8px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            background: activeVideo?.videoId === v.videoId ? 'var(--primary-bg)' : 'transparent',
                            border: activeVideo?.videoId === v.videoId ? '1px solid var(--primary)' : '1px solid transparent',
                            transition: 'all 0.2s',
                            alignItems: 'center'
                          }}
                        >
                          <img
                            src={v.thumbnail}
                            alt={v.title}
                            style={{ width: '100px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2', margin: 0 }}>{v.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', margin: '4px 0 0 0' }}>{v.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No related videos found for this topic.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'mindmap' ? (
            <div className="mindmap-section-container">
              {loadingMindmap ? (
                <div style={{ padding: '80px', textAlign: 'center' }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>AI is analyzing the theory and generating your visual map...</p>
                </div>
              ) : mod?.mindmap ? (
                <Mermaid chart={mod.mindmap} id={`mindmap-${moduleId}`} />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>Mind map generation failed or is unavailable.</p>
                </div>
              )}
            </div>
          ) : (
            renderContent(content[activeTab])
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Left side: Mark as Completed */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {mod.completed ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '14px',
              background: 'var(--success-bg)', color: 'var(--success)',
              border: '1.5px solid var(--success)', fontWeight: 700, fontSize: '0.95rem'
            }}>
              ✅ Module Completed
            </span>
          ) : (
            <button
              className="btn btn-lg"
              disabled={completingModule}
              onClick={handleComplete}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {completingModule ? (
                <><span className="spinner spinner-sm" /> Saving...</>
              ) : (
                <>✅ Mark as Completed</>
              )}
            </button>
          )}
        </div>

        {/* Right side: Flashcards + Quiz actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-lg"
            onClick={() => router.push(`/course/${id}/module/${moduleId}/flashcards`)}>
            🧠 Study Flashcards
          </button>
          {mod.quiz && mod.quiz.attempts && mod.quiz.attempts.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg"
                onClick={() => router.push(`/course/${id}/module/${moduleId}/result`)}>
                📊 View Quiz Report
              </button>
              <button
                className="btn btn-lg"
                onClick={(e) => {
                  if (!mod.completed) {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: { title: '⚠️ Action Required', message: 'Please mark the module as completed first to unlock the quiz.', type: 'warning' } }));
                    return;
                  }
                  setLoadingQuiz(true);
                  router.push(`/course/${id}/module/${moduleId}/quiz?retake=1`);
                }}
                disabled={loadingQuiz}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff', border: 'none', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {loadingQuiz ? (
                  <><span className="spinner spinner-sm" /> Loading...</>
                ) : (
                  <>🔁 Re-Quiz</>
                )}
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-lg" disabled={loadingQuiz}
              onClick={async (e) => {
                if (!mod.completed) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('icmsystem_toast', { detail: { title: '⚠️ Action Required', message: 'Please mark the module as completed first to unlock the quiz.', type: 'warning' } }));
                  return;
                }
                setLoadingQuiz(true);
                router.push(`/course/${id}/module/${moduleId}/quiz`);
              }}>
              {loadingQuiz ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner spinner-sm" />
                  Loading...
                </span>
              ) : '📝 Start Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* AI ICM SYSTEM Mentor Integration */}
      <AiMentor moduleId={moduleId} moduleTitle={mod.title} />
    </div>
  );
}
