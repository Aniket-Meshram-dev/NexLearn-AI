'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, Wifi, HardDrive, X } from 'lucide-react';
import { getAllOfflineCourses, OfflineCourse } from '@/lib/offlineStorage';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Initial status
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setDismissed(false);
      // Check how many courses are available offline
      getAllOfflineCourses()
        .then((courses) => setOfflineCount(courses.length))
        .catch(() => setOfflineCount(0));
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Initial count
    getAllOfflineCourses()
      .then((courses) => setOfflineCount(courses.length))
      .catch(() => {});

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Back online toast
  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '999px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          animation: 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Wifi size={16} />
        <span>Connection Restored • Synchronizing with Cloud</span>
      </div>
    );
  }

  // Offline banner
  if (!isOffline || dismissed) return null;

  return (
    <aside
      role="region"
      aria-label="Offline Mode Notification"
      style={{
        position: 'fixed',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99998,
        width: 'calc(100% - 32px)',
        maxWidth: '680px',
        background: 'rgba(24, 28, 39, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.4), 0 0 24px rgba(245, 158, 11, 0.15)',
        borderRadius: '16px',
        padding: '12px 18px',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        animation: 'fadeInDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px', flex: '1 1 auto' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <WifiOff size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FCD34D' }}>
              Offline Mode Active
            </span>
            {offlineCount > 0 && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'rgba(99, 102, 241, 0.25)',
                  color: '#A5B4FC',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                {offlineCount} Course{offlineCount > 1 ? 's' : ''} Cached
              </span>
            )}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
            No internet connection. You can continue reading saved modules & practicing flashcards.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <Link
          href="/discover?tab=offline"
          style={{
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818CF8',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 12px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease',
          }}
        >
          <HardDrive size={13} />
          <span>Saved Courses</span>
        </Link>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Dismiss banner"
          aria-label="Dismiss offline banner"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
