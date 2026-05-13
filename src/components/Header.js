'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Header({ onToggleSidebar }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const topic = search.trim();
      setSearch(''); // Clear input
      setShowMenu(false);
      router.push(`/generate?topic=${encodeURIComponent(topic)}`);
    }
  };

  useEffect(() => {
    const handleRemoteToast = (e) => {
      setToast(e.detail);
      setUnreadCount(prev => prev + 1);
      setTimeout(() => setToast(null), 6000);
    };

    window.addEventListener('icmsystem_toast', handleRemoteToast);

    const checkNotifications = async () => {
      try {
        const r = await fetch('/api/user/notifications');
        const d = await r.json();

        if (d?.notifications) {
          const unread = d.notifications.filter(n => !n.read);
          setUnreadCount(unread.length);

          if (unread.length > 0) {
            const seen = JSON.parse(localStorage.getItem('icmsystem_seen_notifications') || '[]');
            const newNotifs = unread.filter(n => !seen.includes(n.id));

            if (newNotifs.length > 0) {
              const latest = newNotifs[0];
              setToast(latest);

              const updatedSeen = [...seen, ...newNotifs.map(n => n.id)];
              localStorage.setItem('icmsystem_seen_notifications', JSON.stringify(updatedSeen));

              setTimeout(() => setToast(null), 6000);
            }
          }
        }
      } catch (e) { }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('icmsystem_toast', handleRemoteToast);
    };
  }, []);

  const initials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="header-btn mobile-only" onClick={onToggleSidebar}>
            ☰
          </button>
          <form className="header-search desktop-only" onSubmit={handleSearch}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="header-actions">
          <button className="header-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/notifications" className="header-btn">
            🔔
            {unreadCount > 0 && <span className="badge-dot" />}
          </Link>
          <Link href="/bookmarks" className="header-btn">
            🔖
          </Link>

          <div style={{ position: 'relative' }}>
            <div className="header-avatar" onClick={() => setShowMenu(!showMenu)}>
              {initials}
            </div>
            {showMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)', minWidth: '200px', zIndex: 200,
                animation: 'scaleIn 0.2s ease-out', overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{session?.user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{session?.user?.email}</div>
                </div>
                <Link href="/profile" style={{ display: 'block', padding: '10px 16px', fontSize: '0.9rem' }}
                  onClick={() => setShowMenu(false)}>
                  👤 Profile
                </Link>
                <Link href="/settings" style={{ display: 'block', padding: '10px 16px', fontSize: '0.9rem' }}
                  onClick={() => setShowMenu(false)}>
                  ⚙️ Settings
                </Link>
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: '0.9rem', color: 'var(--danger)',
                    borderTop: '1px solid var(--border-light)',
                  }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          backgroundColor: 'var(--card-bg, #ffffff)', borderLeft: '4px solid var(--primary)',
          borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '20px 24px', width: '360px', maxWidth: 'calc(100vw - 48px)',
          animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1), fadeIn 0.3s ease-out',
          display: 'flex', flexDirection: 'column', gap: '8px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '🔔'}</span>
              <span>{toast.title}</span>
            </span>
            <button onClick={() => setToast(null)} style={{
              opacity: 0.5, fontSize: '1.2rem', background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '0 4px', lineHeight: 1, marginTop: '-2px'
            }}>✕</button>
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.5, opacity: 0.9 }}>
            {toast.message}
          </div>
          <Link href="/notifications" onClick={() => setToast(null)} style={{
            fontSize: '0.85rem', color: 'var(--primary)', marginTop: '8px',
            fontWeight: 600, display: 'inline-block', textDecoration: 'none'
          }}>
            View all notifications &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
