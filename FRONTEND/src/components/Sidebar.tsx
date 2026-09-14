'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import NexLearnLogo from './NexLearnLogo';

const navSections = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: '📊', href: '/dashboard' },
      { label: 'Generate Course', icon: '🤖', href: '/generate' },
      { label: 'Discover', icon: '🔍', href: '/discover' },
    ],
  },
  {
    title: 'Learning',
    items: [
      { label: 'My Courses', icon: '📚', href: '/dashboard#courses' },
      { label: 'Bookmarks', icon: '🔖', href: '/bookmarks' },
      { label: 'Achievements', icon: '🏆', href: '/achievements' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Reports', icon: '📈', href: '/reports' },
      { label: 'Notifications', icon: '🔔', href: '/notifications' },
      { label: 'Profile', icon: '👤', href: '/profile' },
      { label: 'Settings', icon: '⚙️', href: '/settings' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99,
        display: 'none',
      }} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo" style={{ padding: '20px 24px' }}>
          <NexLearnLogo size="md" clickable={true} />
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </>
  );
}
