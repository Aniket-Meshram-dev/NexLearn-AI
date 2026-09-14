'use client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const publicPaths = ['/', '/login', '/register'];

export default function AppLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicPage = publicPaths.includes(pathname);

  if (isPublicPage || status === 'loading') {
    return <>{children}</>;
  }

  if (!session) {
    return <>{children}</>;
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
