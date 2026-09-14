'use client';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-account',
  '/auth/2fa',
];

export default function AppLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicPage = publicPaths.includes(pathname) || pathname?.startsWith('/certificate/');

  useEffect(() => {
    if (!isPublicPage && status === 'unauthenticated') {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const fullPath = pathname + search;
      // Route course generator directly to registration with return intent, other protected pages to login
      if (pathname === '/generate') {
        router.push(`/register?callbackUrl=${encodeURIComponent(fullPath)}`);
      } else {
        router.push(`/login?callbackUrl=${encodeURIComponent(fullPath)}`);
      }
    }
  }, [isPublicPage, status, pathname, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: '16px'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading NexLearn...</span>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="page-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

