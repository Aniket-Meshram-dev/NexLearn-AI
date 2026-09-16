'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Trash2,
  ArrowRight,
  BookOpen,
  Search,
  Filter,
  FileText,
  Clock,
  Sparkles,
  X,
  Edit3,
  Check,
  Tag,
  Compass,
} from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [onlyWithNotes, setOnlyWithNotes] = useState(false);

  // Quick notes storage: map of moduleId -> note string
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

  useEffect(() => {
    fetch('/api/user/bookmarks')
      .then((r) => r.json())
      .then((d) => {
        const bList = d.bookmarks || [];
        setBookmarks(bList);

        // Load local notes
        if (typeof window !== 'undefined') {
          const loadedNotes: Record<string, string> = {};
          bList.forEach((b: any) => {
            const saved = localStorage.getItem(`nexlearn_note_${b.moduleId}`);
            if (saved) loadedNotes[b.moduleId] = saved;
          });
          setNotes(loadedNotes);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const removeBookmark = async (moduleId: string) => {
    await fetch('/api/user/bookmarks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId }),
    });
    setBookmarks((prev) => prev.filter((b) => b.moduleId !== moduleId));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`nexlearn_note_${moduleId}`);
      setNotes((prev) => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
    }
  };

  const saveNote = (moduleId: string) => {
    const trimmed = tempNoteText.trim();
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem(`nexlearn_note_${moduleId}`, trimmed);
        setNotes((prev) => ({ ...prev, [moduleId]: trimmed }));
      } else {
        localStorage.removeItem(`nexlearn_note_${moduleId}`);
        setNotes((prev) => {
          const next = { ...prev };
          delete next[moduleId];
          return next;
        });
      }
    }
    setEditingNoteId(null);
    setTempNoteText('');
  };

  // Distinct courses for filtering
  const distinctCourses = useMemo(() => {
    const coursesMap = new Map<string, string>();
    bookmarks.forEach((b) => {
      if (b.module?.course?.id && b.module?.course?.title) {
        coursesMap.set(b.module.course.id, b.module.course.title);
      }
    });
    return Array.from(coursesMap.entries()).map(([id, title]) => ({ id, title }));
  }, [bookmarks]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const title = b.module?.title || '';
      const courseTitle = b.module?.course?.title || '';
      const desc = b.module?.description || '';
      const diff = b.module?.difficulty || 'Intermediate';
      const userNote = notes[b.moduleId] || '';

      const matchesSearch =
        !searchQuery ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userNote.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = selectedCourse === 'ALL' || b.module?.course?.id === selectedCourse;
      const matchesDifficulty =
        selectedDifficulty === 'ALL' || diff.toLowerCase() === selectedDifficulty.toLowerCase();
      const matchesNotes = !onlyWithNotes || Boolean(userNote);

      return matchesSearch && matchesCourse && matchesDifficulty && matchesNotes;
    });
  }, [bookmarks, searchQuery, selectedCourse, selectedDifficulty, onlyWithNotes, notes]);

  const totalNotesCount = Object.keys(notes).length;

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Bookmark size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Saved Bookmarks</h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary)',
                }}
              >
                {bookmarks.length} Saved
              </span>
            </div>
            <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Your personal library of key topics, essential lesson units, and revision notes
            </p>
          </div>
        </div>

        {/* Header Stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-card)',
            padding: '8px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ textAlign: 'center', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {distinctCourses.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Courses</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{totalNotesCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Notes</div>
          </div>
        </div>
      </div>

      {bookmarks.length > 0 && (
        /* Filter and Search Bar */
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 240px',
                minWidth: '220px',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search bookmarks, topics, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Course Filter */}
            {distinctCourses.length > 1 && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '160px',
                }}
              >
                <option value="ALL">All Courses ({bookmarks.length})</option>
                {distinctCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Has Notes Filter */}
            <button
              onClick={() => setOnlyWithNotes(!onlyWithNotes)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: onlyWithNotes ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: onlyWithNotes ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                color: onlyWithNotes ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <FileText size={14} />
              <span>With Notes ({totalNotesCount})</span>
            </button>
          </div>

          {/* Active Filter Indicators */}
          {(searchQuery || selectedCourse !== 'ALL' || selectedDifficulty !== 'ALL' || onlyWithNotes) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Showing {filteredBookmarks.length} of {bookmarks.length} bookmarks:
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourse('ALL');
                  setSelectedDifficulty('ALL');
                  setOnlyWithNotes(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Display */}
      {bookmarks.length === 0 ? (
        <div
          className="card empty-state"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            borderRadius: '20px',
            border: '1px dashed var(--border)',
            background: 'var(--bg-card)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '18px',
            }}
          >
            <Bookmark size={30} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            No bookmarks saved yet
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
              maxWidth: '440px',
              margin: '0 auto 24px auto',
              lineHeight: 1.5,
            }}
          >
            Bookmark key lessons and complex units while reading course modules. You can also write personal quick notes
            and revision takeaways here!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link href="/discover" className="btn btn-primary" style={{ borderRadius: '10px', gap: '8px' }}>
              <Compass size={16} />
              <span>Discover Courses</span>
            </Link>
            <Link href="/dashboard" className="btn btn-outline" style={{ borderRadius: '10px' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
            background: 'var(--bg-card)',
          }}
        >
          <Search size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            No matching bookmarks found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Try adjusting your search query or removing active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCourse('ALL');
              setSelectedDifficulty('ALL');
              setOnlyWithNotes(false);
            }}
            className="btn btn-outline"
            style={{ borderRadius: '10px' }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: '20px' }}>
          {filteredBookmarks.map((b) => {
            const hasNote = Boolean(notes[b.moduleId]);
            const isEditingThisNote = editingNoteId === b.moduleId;

            return (
              <div
                key={b.id}
                className="module-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '22px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Card Top: Badges & Delete */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                      {b.module?.difficulty || 'Intermediate'}
                    </span>
                    {hasNote && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <FileText size={11} />
                        Note
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeBookmark(b.moduleId)}
                    style={{
                      color: 'var(--text-muted)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s',
                    }}
                    title="Remove bookmark"
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Course Name */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 700,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {b.module?.course?.title}
                </div>

                {/* Module Title */}
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    lineHeight: 1.4,
                    color: 'var(--text-primary)',
                  }}
                >
                  {b.module?.title}
                </h3>

                {/* Module Description */}
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                  }}
                >
                  {b.module?.description}
                </p>

                {/* Personal Notes Section */}
                <div
                  style={{
                    marginTop: 'auto',
                    marginBottom: '16px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {isEditingThisNote ? (
                    <div>
                      <textarea
                        value={tempNoteText}
                        onChange={(e) => setTempNoteText(e.target.value)}
                        placeholder="Write a key formula, takeaway, or exam reminder..."
                        rows={3}
                        style={{
                          width: '100%',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          marginBottom: '8px',
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setEditingNoteId(null);
                            setTempNoteText('');
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveNote(b.moduleId)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: 'var(--primary)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={12} />
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : hasNote ? (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Tag size={10} />
                          Quick Note
                        </span>
                        <button
                          onClick={() => {
                            setEditingNoteId(b.moduleId);
                            setTempNoteText(notes[b.moduleId] || '');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                          }}
                        >
                          <Edit3 size={11} />
                          Edit
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)',
                          margin: 0,
                          lineHeight: 1.45,
                          fontStyle: 'italic',
                        }}
                      >
                        "{notes[b.moduleId]}"
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNoteId(b.moduleId);
                        setTempNoteText('');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        width: '100%',
                      }}
                    >
                      <Edit3 size={13} />
                      <span>+ Add quick personal note / tag</span>
                    </button>
                  )}
                </div>

                {/* Launch Button */}
                <Link
                  href={`/course/${b.module?.course?.id}/module/${b.moduleId}`}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                  }}
                >
                  <span>Launch Module</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
