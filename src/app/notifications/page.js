'use client';
import { useEffect, useState } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    fetch('/api/user/notifications').then(r => r.json()).then(d => {
      setNotifications(d.notifications);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markAsRead = async (id) => {
    await fetch('/api/user/notifications', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await fetch('/api/user/notifications', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ readAll: true })
    });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    await fetch(`/api/user/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const deleteAllNotifications = async () => {
    await fetch('/api/user/notifications?deleteAll=true', { method: 'DELETE' });
    setNotifications([]);
    setShowClearModal(false);
  };

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading notifications...</p></div>;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>🔔 Notifications</h1>
          <p>You have {unreadCount} unread messages</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>Mark all as read</button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={() => setShowClearModal(true)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>🗑️ Clear All</button>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>All caught up!</h3>
            <p>You have no notifications at the moment.</p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => !n.read && markAsRead(n.id)} style={{ cursor: n.read ? 'default' : 'pointer' }}>
                <div className="notification-dot" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                      {n.type === 'success' ? '✅ ' : n.type === 'warning' ? '⚠️ ' : n.type === 'error' ? '❌ ' : 'ℹ️ '}
                      {n.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="notification-time">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={(e) => deleteNotification(e, n.id)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, padding: 0 }}
                        title="Delete notification"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Modal */}
      {showClearModal && (
        <div className="modal-overlay">
          <div className="modal-window" style={{ borderColor: 'var(--danger)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--danger)', marginBottom: 8 }}>Clear All Notifications</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Are you sure you want to permanently delete all notifications? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button 
                className="btn btn-danger" style={{ flex: 1, borderRadius: 12 }} 
                onClick={deleteAllNotifications}
              >
                Yes, Clear All
              </button>
              <button 
                className="btn btn-ghost" style={{ flex: 1, borderRadius: 12 }} 
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
