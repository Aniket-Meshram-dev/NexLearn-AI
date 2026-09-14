'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/bookmarks').then(r => r.json()).then(d => {
      setBookmarks(d.bookmarks);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const removeBookmark = async (moduleId) => {
    await fetch('/api/user/bookmarks', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId })
    });
    setBookmarks(bookmarks.filter(b => b.moduleId !== moduleId));
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading bookmarks...</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>🔖 Saved Bookmarks</h1>
        <p>Your saved modules for quick access</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🔖</div>
          <h3>No bookmarks yet</h3>
          <p>Save interesting modules to quickly find them later.</p>
          <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="grid-3">
          {bookmarks.map((b) => (
            <div key={b.id} className="module-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="badge badge-primary">{b.module.difficulty}</span>
                <button onClick={() => removeBookmark(b.moduleId)} style={{ color: 'var(--text-muted)', fontSize: '1.2rem', padding: 4 }} title="Remove bookmark">✖</button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 4 }}>
                {b.module.course.title}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 8, flex: 1 }}>{b.module.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {b.module.description}
              </p>
              <Link href={`/course/${b.module.course.id}/module/${b.moduleId}`} className="btn btn-outline" style={{ width: '100%' }}>
                Go to Module
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
