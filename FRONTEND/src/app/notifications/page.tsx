'use client';
import { useEffect, useState } from 'react';
import {
  Bell,
  Trash2,
  CheckCheck,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetch('/api/user/notifications')
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAsRead = async (id: string) => {
    await fetch('/api/user/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    await fetch('/api/user/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readAll: true }),
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await fetch(`/api/user/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const deleteAllNotifications = async () => {
    await fetch('/api/user/notifications?deleteAll=true', { method: 'DELETE' });
    setNotifications([]);
    setShowClearModal(false);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading notifications...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Bell size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Notifications</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              You have {unreadCount} unread system alert{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={markAllAsRead}
              style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCheck size={14} />
              <span>Mark all as read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowClearModal(true)}
              style={{
                color: 'var(--danger)',
                borderColor: 'var(--danger)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '16px' }}>
        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Inbox size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px 0' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              You have no active notifications at the moment.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => !n.read && markAsRead(n.id)}
                style={{
                  cursor: n.read ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '18px 20px',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s ease',
                  background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background:
                      n.type === 'success'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : n.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.12)'
                        : n.type === 'error'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'rgba(99, 102, 241, 0.12)',
                    color:
                      n.type === 'success'
                        ? '#10B981'
                        : n.type === 'warning'
                        ? '#F59E0B'
                        : n.type === 'error'
                        ? '#EF4444'
                        : 'var(--primary)',
                  }}
                >
                  {n.type === 'success' ? (
                    <CheckCircle2 size={18} />
                  ) : n.type === 'warning' ? (
                    <AlertTriangle size={18} />
                  ) : n.type === 'error' ? (
                    <AlertCircle size={18} />
                  ) : (
                    <Info size={18} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 4,
                    }}
                  >
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                      {n.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="notification-time" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => deleteNotification(e, n.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: '2px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete notification"
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ borderColor: 'var(--danger)', borderRadius: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger)', margin: 0 }}>
                Clear All Notifications
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to permanently delete all notifications? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1, borderRadius: 10 }}
                onClick={deleteAllNotifications}
              >
                Yes, Clear All
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, borderRadius: 10 }}
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
