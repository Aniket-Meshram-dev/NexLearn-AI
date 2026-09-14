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
    sm: { icon: 30, text: '1.1rem', gap: 10, badge: '0.62rem' },
    md: { icon: 42, text: '1.4rem', gap: 12, badge: '0.68rem' },
    lg: { icon: 52, text: '1.85rem', gap: 14, badge: '0.75rem' },
    xl: { icon: 68, text: '2.4rem', gap: 18, badge: '0.85rem' },
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
      {/* 3D Möbius Infinity Ribbon "N" SVG Icon */}
      <div
        style={{
          width: dimensions.icon,
          height: dimensions.icon,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          filter: 'drop-shadow(0 6px 16px rgba(99, 102, 241, 0.4))',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
            {/* Ribbon Gradient 1: Deep Indigo to Bright Violet */}
            <linearGradient id="mobius-grad-left" x1="12" y1="52" x2="28" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#312E81" />
              <stop offset="40%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>

            {/* Ribbon Gradient 2: The Dimensional Crossover Twist */}
            <linearGradient id="mobius-grad-twist" x1="18" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="35%" stopColor="#A855F7" />
              <stop offset="70%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Ribbon Gradient 3: Ascending Energy Pillar & Cyan Apex */}
            <linearGradient id="mobius-grad-right" x1="36" y1="52" x2="54" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="90%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Ambient Shading Shadow for Under-Loop */}
            <linearGradient id="mobius-shadow-gradient" x1="26" y1="28" x2="38" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Glowing Aura Filter */}
            <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Underlay Shadow Path for the Diagonal Fold */}
          <path
            d="M24 24L38 42C35 44 31 43 28 39L20 28C22 25 24 24 24 24Z"
            fill="url(#mobius-shadow-gradient)"
          />

          {/* 1. Left Pillar & Bottom Infinity Loop (Ascending) */}
          <path
            d="M14 46C11.5 41 12 28 17 18C20.5 11 28 9.5 32 14L23 27C19 23 17 25 16 32C15.2 37.5 17 42 20 44C23.5 46.5 28 44 31 40L28 35C26 38 23 39 21 37C18.5 35 18 30 20 25L27 15C22 11 15 13 11 20C7 27 6.5 42 11 48C13.5 51.5 18 53 22 51L24 45C20.5 47 16 48 14 46Z"
            fill="url(#mobius-grad-left)"
          />

          {/* 2. Continuous Möbius Infinity Diagonal Ribbon Forming 'N' */}
          <path
            d="M23 13.5C28 9 35 11 38 16L20 42C17 46.5 12 47 8.5 43C5 39 6 31 10 24L16 28C13 33 12 37 14 39C16 41 19 40 21 37L39 12C34 6 25 5 19 10C16 12.5 14 16 13 20L19 22C19.5 18.5 21 15.5 23 13.5Z"
            fill="url(#mobius-grad-twist)"
          />

          {/* 3. Right Pillar & Upward Breakthrough Flow */}
          <path
            d="M37 38L45 22C47.5 17 50.5 14 54 16C57 18 57.5 23 56 29C54 37 49 46 42 51C36 55 29 54 26 49L32 45C33.5 48 37 49 41 46C46 42 49.5 35 51 28C52 23 51 20 49 20C47 20 45 22 43 26L35 42C33 46 30 48.5 26 49L24 43C27 43 29 41 31 38L37 26C39 22 41 18 44 15L48 18C45 22 43 27 41 32L37 38Z"
            fill="url(#mobius-grad-right)"
          />

          {/* Glowing Neural Node Spark at Top Apex (Knowledge Burst) */}
          <circle cx="48" cy="14" r="5" fill="#38BDF8" opacity="0.3" filter="url(#logo-glow)" />
          <circle cx="48" cy="14" r="3" fill="#22D3EE" />
          <circle cx="48" cy="14" r="1.5" fill="#FFFFFF" />

          {/* Micro-sparkle Star Accent */}
          <path
            d="M48 9L49 13L53 14L49 15L48 19L47 15L43 14L47 13L48 9Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Typography Wordmark */}
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
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)',
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
