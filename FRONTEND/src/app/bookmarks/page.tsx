'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight, BookOpen } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/bookmarks')
      .then((r) => r.json())
      .then((d) => {
        setBookmarks(d.bookmarks || []);
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
    setBookmarks(bookmarks.filter((b) => b.moduleId !== moduleId));
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Bookmark size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Saved Bookmarks</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Your saved learning modules and topics for quick access
            </p>
          </div>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div
          className="card empty-state"
          style={{
            padding: '50px 20px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed var(--border)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--primary-bg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '16px',
            }}
          >
            <Bookmark size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0' }}>No bookmarks saved yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 20px auto' }}>
            Bookmark key modules while browsing or generating courses to revisit them whenever you need a quick refresher.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ borderRadius: '10px' }}>
            Explore Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="module-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '22px',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--bg-white)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}
              >
                <span className="badge badge-primary">{b.module?.difficulty || 'Intermediate'}</span>
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
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {b.module?.course?.title}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8, flex: 1 }}>{b.module?.title}</h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginBottom: 18,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}
              >
                {b.module?.description}
              </p>
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
                }}
              >
                <span>Launch Module</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
