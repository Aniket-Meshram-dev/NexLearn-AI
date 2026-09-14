'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Bookmark,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<any>(null);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const topic = search.trim();
      setSearch('');
      setShowMenu(false);
      router.push(`/generate?topic=${encodeURIComponent(topic)}`);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const handleRemoteToast = (e: any) => {
      setToast(e.detail);
      setUnreadCount((prev) => prev + 1);
      setTimeout(() => setToast(null), 6000);
    };

    window.addEventListener('icmsystem_toast', handleRemoteToast);

    const checkNotifications = async () => {
      try {
        const r = await fetch('/api/user/notifications');
        const d = await r.json();

        if (d?.notifications) {
          const unread = d.notifications.filter((n: any) => !n.read);
          setUnreadCount(unread.length);

          if (unread.length > 0) {
            const seen = JSON.parse(localStorage.getItem('icmsystem_seen_notifications') || '[]');
            const newNotifs = unread.filter((n: any) => !seen.includes(n.id));

            if (newNotifs.length > 0) {
              const latest = newNotifs[0];
              setToast(latest);

              const updatedSeen = [...seen, ...newNotifs.map((n: any) => n.id)];
              localStorage.setItem('icmsystem_seen_notifications', JSON.stringify(updatedSeen));

              setTimeout(() => setToast(null), 6000);
            }
          }
        }
      } catch (e) {}
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('icmsystem_toast', handleRemoteToast);
    };
  }, []);

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'NL';

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            className="header-btn mobile-only"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
          <form className="header-search desktop-only" onSubmit={handleSearch}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search topics, courses, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-kbd">⌘K</span>
          </form>
        </div>

        <div className="header-actions">
          <button
            className="header-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} style={{ color: '#F59E0B' }} />
            ) : (
              <Moon size={18} style={{ color: '#6366F1' }} />
            )}
          </button>

          <Link
            href="/notifications"
            className="header-btn"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-dot" />}
          </Link>

          <Link href="/bookmarks" className="header-btn" title="Saved Bookmarks" aria-label="Bookmarks">
            <Bookmark size={18} />
          </Link>

          {/* User Profile Menu */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div
              className="header-avatar"
              onClick={() => setShowMenu(!showMenu)}
              title={session?.user?.name || 'User Menu'}
              role="button"
              tabIndex={0}
            >
              {initials}
            </div>

            {showMenu && (
              <div className="header-dropdown-menu">
                <div className="dropdown-user-header">
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
                    {session?.user?.name || 'NexLearn Scholar'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {session?.user?.email}
                  </div>
                </div>

                <div style={{ padding: '6px 0' }}>
                  <Link
                    href="/profile"
                    className="dropdown-link"
                    onClick={() => setShowMenu(false)}
                  >
                    <User size={16} style={{ color: 'var(--primary)' }} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    className="dropdown-link"
                    onClick={() => setShowMenu(false)}
                  >
                    <Settings size={16} style={{ color: 'var(--text-secondary)' }} />
                    <span>Account Settings</span>
                  </Link>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="dropdown-link danger"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Floating System Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 9999,
            backgroundColor: 'var(--bg-white)',
            borderLeft: '4px solid var(--primary)',
            borderRadius: '14px',
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.05)',
            padding: '18px 22px',
            width: '360px',
            maxWidth: 'calc(100vw - 40px)',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} style={{ color: '#10B981' }} />
              ) : toast.type === 'error' ? (
                <AlertCircle size={18} style={{ color: '#EF4444' }} />
              ) : toast.type === 'warning' ? (
                <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
              ) : (
                <Bell size={18} style={{ color: 'var(--primary)' }} />
              )}
              <span>{toast.title}</span>
            </span>
            <button
              onClick={() => setToast(null)}
              style={{
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
              }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {toast.message}
          </div>
          <Link
            href="/notifications"
            onClick={() => setToast(null)}
            style={{
              fontSize: '0.82rem',
              color: 'var(--primary)',
              marginTop: '4px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
            }}
          >
            <span>View all notifications</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
