import React from 'react';
import Link from 'next/link';

interface NexLearnLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  clickable?: boolean;
  className?: string;
}

export default function NexLearnLogo({
  size = 'md',
  showText = true,
  clickable = true,
  className = '',
}: NexLearnLogoProps) {
  const dimensions = {
    sm: { icon: 32, text: '1.15rem', gap: 10, badge: '0.62rem' },
    md: { icon: 44, text: '1.45rem', gap: 12, badge: '0.68rem' },
    lg: { icon: 56, text: '1.9rem', gap: 14, badge: '0.75rem' },
    xl: { icon: 72, text: '2.5rem', gap: 18, badge: '0.85rem' },
  }[size];

  const content = (
    <div
      className={`nexlearn-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${dimensions.gap}px`,
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* Open Book + Rising Geometric 'N' SVG Logo */}
      <div
        style={{
          width: dimensions.icon,
          height: dimensions.icon,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          filter: 'drop-shadow(0 4px 14px rgba(99, 102, 241, 0.45))',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="nexlearn-logo-icon"
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            {/* Primary Neon Gradient (Indigo -> Violet -> Cyan) */}
            <linearGradient id="book-n-grad-primary" x1="10" y1="54" x2="54" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Left Page Gradient */}
            <linearGradient id="book-page-left" x1="10" y1="36" x2="32" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* Right Page Gradient */}
            <linearGradient id="book-page-right" x1="32" y1="56" x2="54" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* 'N' Monogram Left Pillar */}
            <linearGradient id="n-pillar-left" x1="18" y1="38" x2="26" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>

            {/* 'N' Monogram Diagonal Fold */}
            <linearGradient id="n-diagonal" x1="20" y1="14" x2="44" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* 'N' Monogram Right Pillar */}
            <linearGradient id="n-pillar-right" x1="38" y1="42" x2="46" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Ambient Glow */}
            <filter id="book-n-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================= BACKGROUND OPEN BOOK ================= */}
          {/* Base Spine & Bottom Hardcover Arc */}
          <path
            d="M32 54C22 52 14 54 8 57C7 57.5 6 56.5 6 55.5V47C13 44 22 42 32 45C42 42 51 44 58 47V55.5C58 56.5 57 57.5 56 57C50 54 42 52 32 54Z"
            fill="#1E1B4B"
            stroke="url(#book-n-grad-primary)"
            strokeWidth="1.5"
          />

          {/* Left Open Book Layered Pages */}
          <path
            d="M32 48C23 45 15 47 10 50V43C16 40 24 38 32 41V48Z"
            fill="url(#book-page-left)"
            opacity="0.9"
          />
          <path
            d="M32 43C24 40 17 41 12 44V38C18 35 25 34 32 37V43Z"
            fill="#818CF8"
            opacity="0.4"
          />

          {/* Right Open Book Layered Pages */}
          <path
            d="M32 48C41 45 49 47 54 50V43C48 40 40 38 32 41V48Z"
            fill="url(#book-page-right)"
            opacity="0.9"
          />
          <path
            d="M32 43C40 40 47 41 52 44V38C46 35 39 34 32 37V43Z"
            fill="#38BDF8"
            opacity="0.4"
          />

          {/* Spine Center Notch */}
          <path d="M32 41V54" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />

          {/* ================= RISING LETTER "N" ================= */}
          {/* Left Upright Pillar of 'N' */}
          <path
            d="M18 16C18 14.8954 18.8954 14 20 14H24C25.1046 14 26 14.8954 26 16V40C26 41.1046 25.1046 42 24 42H20C18.8954 42 18 41.1046 18 40V16Z"
            fill="url(#n-pillar-left)"
          />

          {/* Inner Highlight for Left Pillar */}
          <path
            d="M20 16H22V39H20V16Z"
            fill="#FFFFFF"
            opacity="0.4"
          />

          {/* Dynamic Diagonal Stroke of 'N' */}
          <path
            d="M22 14L42 39.5C42.8 40.5 44 40.2 44 39V16C44 14.8954 44.8954 14 46 14H46.5C47.3 14 48 14.7 48 15.5V40C48 41.1046 47.1046 42 46 42H42.5C41.4 42 40.4 41.3 39.8 40.4L20 15C19.5 14.2 20.2 13.5 21 13.8L22 14Z"
            fill="url(#n-diagonal)"
            filter="url(#book-n-glow)"
          />

          {/* Right Upright Pillar of 'N' */}
          <path
            d="M38 16C38 14.8954 38.8954 14 40 14H44C45.1046 14 46 14.8954 46 16V40C46 41.1046 45.1046 42 44 42H40C38.8954 42 38 41.1046 38 40V16Z"
            fill="url(#n-pillar-right)"
          />

          {/* Inner Highlight for Right Pillar */}
          <path
            d="M42 16H44V39H42V16Z"
            fill="#FFFFFF"
            opacity="0.4"
          />

          {/* Apex Energy Spark / Star at Top-Right of 'N' */}
          <circle cx="45" cy="12" r="3.5" fill="#38BDF8" opacity="0.4" />
          <circle cx="45" cy="12" r="2" fill="#FFFFFF" />
          <path d="M45 8L46 11L49 12L46 13L45 16L44 13L41 12L44 11L45 8Z" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: dimensions.text,
              fontWeight: 800,
              letterSpacing: '-0.035em',
              fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: 'var(--lp-text-primary, var(--text))' }}>Nex</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginLeft: '1px',
              }}
            >
              Learn
            </span>
          </span>

          <span
            style={{
              fontSize: dimensions.badge,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
              color: '#818CF8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
}
