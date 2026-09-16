'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NexLearnLogo from './NexLearnLogo';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  BookOpen,
  Layers,
  Bookmark,
  Trophy,
  ShieldCheck,
  BarChart3,
  User,
  Settings,
  Zap,
} from 'lucide-react';

const navSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { label: 'Generate Course', icon: Sparkles, href: '/generate', highlight: true },
      { label: 'Discover', icon: Compass, href: '/discover' },
    ],
  },
  {
    title: 'Learning',
    items: [
      { label: 'My Courses', icon: BookOpen, href: '/dashboard#courses-section' },
      { label: 'Flashcards', icon: Layers, href: '/flashcards' },
      { label: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
      { label: 'Achievements', icon: Trophy, href: '/achievements' },
      { label: 'Verify Credential', icon: ShieldCheck, href: '/verify' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Reports', icon: BarChart3, href: '/reports' },
      { label: 'Profile', icon: User, href: '/profile' },
      { label: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/user/flashcards')
      .then((r) => r.json())
      .then((d) => {
        if (isMounted && typeof d.stats?.dueCount === 'number') {
          setDueCount(d.stats.dueCount);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onClose) onClose();

    if (href.includes('#courses-section')) {
      if (pathname === '/dashboard') {
        e.preventDefault();
        const el = document.getElementById('courses-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', '#courses-section');
          window.dispatchEvent(new Event('hashchange'));
        }
      }
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 99,
            display: 'none',
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} data-lenis-prevent>
        <div className="sidebar-logo" style={{ padding: '20px 20px' }}>
          <NexLearnLogo size="md" textSize="1.75rem" badgeSize="0.8rem" clickable={true} />
        </div>

        <nav className="sidebar-nav" data-lenis-prevent>
          {navSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => {
                const IconComponent = item.icon;
                let isActive = false;
                if (item.href.includes('#courses-section')) {
                  isActive =
                    pathname === '/dashboard' &&
                    (currentHash === '#courses-section' || currentHash === '#courses');
                } else if (item.href === '/dashboard') {
                  isActive =
                    pathname === '/dashboard' &&
                    currentHash !== '#courses-section' &&
                    currentHash !== '#courses';
                } else {
                  isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <span className="nav-icon">
                      <IconComponent size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.highlight && !isActive && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                          color: 'var(--primary)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        AI
                      </span>
                    )}
                    {item.href === '/flashcards' && dueCount !== null && dueCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                          color: 'white',
                          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {dueCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom SaaS Workspace Card */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                <Zap size={14} className="fill-current" />
                AI Learning Suite
              </span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 6px #10B981',
                }}
              />
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Unlimited AI syllabus & real-time adaptive quiz generator.
            </p>
            <Link
              href="/generate"
              style={{
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <Sparkles size={12} />
              Create Course
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
