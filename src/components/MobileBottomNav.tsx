'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sparkles, Compass, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Create', href: '/generate', icon: Sparkles, highlight: true },
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      role="navigation"
    >
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''} ${
                item.highlight ? 'highlight' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="mobile-bottom-nav-icon-wrap">
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                {item.highlight && !isActive && <span className="mobile-nav-spark" />}
              </div>
              <span className="mobile-bottom-nav-label">{item.label}</span>
              {isActive && <span className="mobile-nav-active-pill" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
