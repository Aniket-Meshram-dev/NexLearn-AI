'use client';
import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import NexLearnLogo from '../NexLearnLogo';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Sun, Moon, ArrowRight, Menu, X, ShieldCheck, FileText, Sparkles } from 'lucide-react';

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

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav
      className="lp-navbar"
      style={{
        boxShadow: scrolled ? '0 10px 30px -10px rgba(0,0,0,0.3)' : 'none',
        background: scrolled
          ? (theme === 'dark' ? 'rgba(7, 9, 14, 0.94)' : 'rgba(248, 250, 252, 0.94)')
          : undefined,
      }}
    >
      <div className="lp-nav-container">
        {/* Brand Logo */}
        <NexLearnLogo size="md" clickable={true} />

        {/* Desktop Navigation Links */}
        <ul className="lp-nav-menu desktop-nav-menu">
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
            <Link href="/verify" className="lp-nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <ShieldCheck size={14} color="#10B981" />
              <span>Verify Portal</span>
            </Link>
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
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Desktop Auth Buttons */}
          <div className="lp-desktop-auth">
            {isAuthenticated ? (
              <Link href="/dashboard" className="lp-btn lp-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" className="lp-btn lp-btn-ghost">
                  Sign In
                </Link>

                <Link href="/register" className="lp-btn lp-btn-primary">
                  <span>Get Started</span>
                  <span style={{ fontSize: '1.1rem' }}>→</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lp-mobile-toggle"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lp-mobile-drawer">
          <ul className="lp-mobile-menu">
            <li>
              <a href="#simulator" onClick={closeMobile} className="lp-mobile-link">
                <Sparkles size={16} color="#818CF8" />
                <span>Interactive Demo</span>
              </a>
            </li>
            <li>
              <a href="#features" onClick={closeMobile} className="lp-mobile-link">
                <span>Features &amp; Capabilities</span>
              </a>
            </li>
            <li>
              <a href="#workflow" onClick={closeMobile} className="lp-mobile-link">
                <span>How It Works</span>
              </a>
            </li>
            <li>
              <Link href="/verify" onClick={closeMobile} className="lp-mobile-link">
                <ShieldCheck size={16} color="#10B981" />
                <span>Verify Credentials Portal</span>
              </Link>
            </li>
            <li>
              <Link href="/reports" onClick={closeMobile} className="lp-mobile-link">
                <FileText size={16} color="#06B6D4" />
                <span>Academic Reports</span>
              </Link>
            </li>
            <li>
              <a href="#testimonials" onClick={closeMobile} className="lp-mobile-link">
                <span>Wall of Love</span>
              </a>
            </li>
            <li>
              <a href="#faq" onClick={closeMobile} className="lp-mobile-link">
                <span>FAQ</span>
              </a>
            </li>
          </ul>

          <div className="lp-mobile-actions">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={closeMobile} className="lp-btn lp-btn-primary" style={{ width: '100%' }}>
                <span>Go to Workspace Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={closeMobile} className="lp-btn lp-btn-outline" style={{ width: '100%' }}>
                  Sign In
                </Link>
                <Link href="/register" onClick={closeMobile} className="lp-btn lp-btn-primary" style={{ width: '100%' }}>
                  <span>Create Free Account</span>
                  <span>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
