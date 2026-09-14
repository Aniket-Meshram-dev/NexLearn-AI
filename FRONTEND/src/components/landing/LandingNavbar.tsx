'use client';
import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import NexLearnLogo from '../NexLearnLogo';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function LandingNavbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="lp-navbar"
      style={{
        boxShadow: scrolled ? '0 10px 30px -10px rgba(0,0,0,0.3)' : 'none',
        background: scrolled
          ? (theme === 'dark' ? 'rgba(7, 9, 14, 0.92)' : 'rgba(248, 250, 252, 0.92)')
          : undefined,
      }}
    >
      <div className="lp-nav-container">
        {/* Brand Logo */}
        <NexLearnLogo size="md" clickable={true} />

        {/* Desktop Navigation Links */}
        <ul className="lp-nav-menu desktop-only" style={{ display: 'flex' }}>
          <li>
            <a href="#simulator" className="lp-nav-link">
              Interactive Demo
            </a>
          </li>
          <li>
            <a href="#features" className="lp-nav-link">
              Features
            </a>
          </li>
          <li>
            <a href="#workflow" className="lp-nav-link">
              How It Works
            </a>
          </li>
          <li>
            <a href="#testimonials" className="lp-nav-link">
              Wall of Love
            </a>
          </li>
          <li>
            <a href="#faq" className="lp-nav-link">
              FAQ
            </a>
          </li>
        </ul>

        {/* Nav Actions */}
        <div className="lp-nav-actions">
          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="lp-theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <Link href="/dashboard" className="lp-btn lp-btn-primary">
              <span>Dashboard</span>
              <span style={{ fontSize: '1.1rem' }}>→</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="lp-btn lp-btn-ghost desktop-only">
                Sign In
              </Link>

              <Link href="/register" className="lp-btn lp-btn-primary">
                <span>Get Started</span>
                <span style={{ fontSize: '1.1rem' }}>→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
