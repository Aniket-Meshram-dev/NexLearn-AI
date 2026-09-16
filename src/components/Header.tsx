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
  CheckCheck,
  Inbox,
  Trash2,
  Info,
  Sparkles,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';

export default function Header({
  onToggleSidebar,
  onOpenPalette,
}: {
  onToggleSidebar?: () => void;
  onOpenPalette?: () => void;
}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [notifTab, setNotifTab] = useState<'all' | 'unread'>('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const topic = search.trim();
      setSearch('');
      setShowMenu(false);
      setShowNotifs(false);
      router.push(`/generate?topic=${encodeURIComponent(topic)}`);
    }
  };

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkNotifications = async () => {
    try {
      const r = await fetch('/api/user/notifications');
      const d = await r.json();

      if (d?.notifications) {
        setNotifications(d.notifications);
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

  useEffect(() => {
    const handleRemoteToast = (e: any) => {
      setToast(e.detail);
      setNotifications((prev) => [e.detail, ...prev]);
      setUnreadCount((prev) => prev + 1);
      setTimeout(() => setToast(null), 6000);
    };

    window.addEventListener('icmsystem_toast', handleRemoteToast);
    checkNotifications();
    const interval = setInterval(checkNotifications, 15000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('icmsystem_toast', handleRemoteToast);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/user/notifications?id=${id}`, { method: 'DELETE' });
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (e) {}
  };

  const deleteAllNotifications = async () => {
    try {
      await fetch('/api/user/notifications?deleteAll=true', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {}
  };

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
            className="header-btn mobile-menu-btn mobile-only"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
          <div
            className="header-search desktop-only"
            onClick={onOpenPalette}
            role="button"
            tabIndex={0}
            aria-label="Open Command Palette"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenPalette?.();
              }
            }}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', flex: 1 }}>
              Search courses, modules, flashcards...
            </span>
            <span className="search-kbd">⌘K</span>
          </div>
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

          {/* 🔔 Notifications Panel */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className={`header-btn ${showNotifs ? 'active' : ''}`}
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowMenu(false);
                setShowClearConfirm(false);
                setNotifSearch('');
              }}
              title="Notifications"
              aria-label="Notifications"
              aria-haspopup="dialog"
              aria-expanded={showNotifs}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="badge-dot" />}
            </button>

            {showNotifs && (() => {
              const searchLower = notifSearch.toLowerCase();
              const filteredNotifications = notifications.filter((n) => {
                if (notifTab === 'unread' && n.read) return false;
                if (notifSearch && !n.title?.toLowerCase().includes(searchLower) && !n.message?.toLowerCase().includes(searchLower)) return false;
                return true;
              });

              return (
                <div className="notification-popover" role="dialog" aria-label="Notifications" tabIndex={-1}>
                  {/* Header */}
                  <div className="notification-popover-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={15} style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifs(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '2px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label="Close notifications"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="notification-tabs">
                    <button
                      className={`notification-tab-btn ${notifTab === 'all' ? 'active' : ''}`}
                      onClick={() => setNotifTab('all')}
                    >
                      <Inbox size={13} />
                      All
                      {notifications.length > 0 && (
                        <span className="notification-tab-badge">{notifications.length}</span>
                      )}
                    </button>
                    <button
                      className={`notification-tab-btn ${notifTab === 'unread' ? 'active' : ''}`}
                      onClick={() => setNotifTab('unread')}
                    >
                      <Filter size={13} />
                      Unread
                      {unreadCount > 0 && (
                        <span className="notification-tab-badge">{unreadCount}</span>
                      )}
                    </button>
                  </div>

                  {/* Search */}
                  {notifications.length > 3 && (
                    <div className="notification-search-wrapper">
                      <Search size={13} style={{ position: 'absolute', left: '22px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        className="notification-search-input"
                        type="text"
                        placeholder="Search notifications…"
                        value={notifSearch}
                        onChange={(e) => setNotifSearch(e.target.value)}
                        data-lenis-prevent
                      />
                      {notifSearch && (
                        <button
                          onClick={() => setNotifSearch('')}
                          style={{ position: 'absolute', right: '22px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline Clear-All Confirmation */}
                  {showClearConfirm && (
                    <div className="notification-confirm-banner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)' }}>Delete all notifications?</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>This action cannot be undone.</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => { deleteAllNotifications(); setShowClearConfirm(false); }}
                          style={{
                            flex: 1, padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: 'var(--danger)', color: '#fff', fontWeight: 700, fontSize: '0.76rem',
                          }}
                        >
                          Yes, clear all
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          style={{
                            flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)',
                            cursor: 'pointer', background: 'var(--surface-raised)', color: 'var(--text-secondary)',
                            fontWeight: 600, fontSize: '0.76rem',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notification List */}
                  <div className="notification-popover-list" data-lenis-prevent>
                    {filteredNotifications.length === 0 ? (
                      <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div
                          style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'var(--surface-subtle)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 10px', color: 'var(--text-muted)',
                          }}
                        >
                          <Inbox size={22} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {notifSearch ? 'No matches found' : notifTab === 'unread' ? 'No unread notifications' : 'All caught up!'}
                        </div>
                        <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                          {notifSearch ? 'Try a different search term.' : notifTab === 'unread' ? 'All notifications have been read.' : 'No notifications to display right now.'}
                        </div>
                      </div>
                    ) : (
                      filteredNotifications.map((n) => {
                        const isUnread = !n.read;
                        return (
                          <div
                            key={n.id}
                            className={`notification-item-row ${isUnread ? 'unread' : ''}`}
                            style={{ cursor: isUnread ? 'pointer' : 'default' }}
                            onClick={() => isUnread && markAsRead(n.id)}
                          >
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                              {n.type === 'success' ? (
                                <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                              ) : n.type === 'warning' ? (
                                <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                              ) : n.type === 'error' ? (
                                <AlertCircle size={16} style={{ color: '#EF4444' }} />
                              ) : (
                                <Info size={16} style={{ color: 'var(--accent-primary)' }} />
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <div
                                  style={{
                                    fontWeight: isUnread ? 700 : 600,
                                    fontSize: '0.82rem',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {n.title}
                                </div>
                                {isUnread && (
                                  <span
                                    style={{
                                      width: 6, height: 6, borderRadius: '50%',
                                      background: 'var(--accent-primary)',
                                      boxShadow: '0 0 6px var(--accent-primary)',
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.76rem', color: 'var(--text-secondary)',
                                  marginTop: '2px', lineHeight: 1.35,
                                  display: '-webkit-box', WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}
                              >
                                {n.message}
                              </div>
                              {n.createdAt && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Per-item actions */}
                            <div className="notification-item-actions">
                              {isUnread ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                  title="Mark as read"
                                >
                                  <Eye size={13} />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Mark as unread (re-set read to false)
                                    fetch('/api/user/notifications', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: n.id, read: false }),
                                    }).catch(() => {});
                                    setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, read: false } : item));
                                    setUnreadCount((c) => c + 1);
                                  }}
                                  title="Mark as unread"
                                >
                                  <EyeOff size={13} />
                                </button>
                              )}
                              <button
                                className="delete-btn"
                                onClick={(e) => deleteNotification(e, n.id)}
                                title="Delete notification"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="notification-popover-footer">
                    {unreadCount > 0 ? (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontSize: '0.76rem', fontWeight: 600, color: 'var(--accent-primary)',
                          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                        title="Mark all notifications as read"
                      >
                        <CheckCheck size={13} />
                        Mark all read
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>No unread</span>
                    )}

                    {notifications.length > 0 && (
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontSize: '0.74rem', fontWeight: 500, color: 'var(--text-muted)',
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        <Trash2 size={12} />
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

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
            bottom: '102px',
            right: '28px',
            zIndex: 9998,
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
          <button
            onClick={() => { setToast(null); setShowNotifs(true); }}
            style={{
              fontSize: '0.82rem',
              color: 'var(--primary)',
              marginTop: '4px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span>View all notifications</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
