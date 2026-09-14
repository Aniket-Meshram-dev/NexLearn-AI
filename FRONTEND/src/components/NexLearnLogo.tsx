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
    sm: { icon: 28, text: '1.05rem', gap: 8, badge: '0.6rem' },
    md: { icon: 38, text: '1.35rem', gap: 10, badge: '0.65rem' },
    lg: { icon: 48, text: '1.75rem', gap: 12, badge: '0.75rem' },
    xl: { icon: 64, text: '2.25rem', gap: 16, badge: '0.85rem' },
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
      {/* SVG Emblem */}
      <div
        style={{
          width: dimensions.icon,
          height: dimensions.icon,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="nexlearn-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="nexlearn-grad-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="60%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="nexlearn-grad-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.2" />
            </linearGradient>
            <filter id="nexlearn-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background rounded squircle with subtle border */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="12"
            fill="url(#nexlearn-grad-primary)"
            filter="url(#nexlearn-shadow)"
          />

          {/* Inner subtle glow border */}
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="11"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Stylized 'N' Vector Mesh */}
          {/* Left Vertical Pillar */}
          <path
            d="M13 14C13 12.8954 13.8954 12 15 12H16.5C17.6046 12 18.5 12.8954 18.5 14V34C18.5 35.1046 17.6046 36 16.5 36H15C13.8954 36 13 35.1046 13 34V14Z"
            fill="#FFFFFF"
          />

          {/* Diagonal Energy Arc connecting Left Pillar to Right Pillar */}
          <path
            d="M16 13.5L32 34.5C32.6 35.3 33.7 35.5 34.5 35C34.8 34.8 35 34.4 35 34V14C35 12.8954 34.1046 12 33 12H31.5C30.3954 12 29.5 12.8954 29.5 14V27.5L18.2 12.8C17.6 12 16.5 11.8 15.7 12.4C15.2 12.7 15 13.1 15 13.5H16Z"
            fill="url(#nexlearn-grad-secondary)"
          />

          {/* Right Pillar Upper Highlight */}
          <path
            d="M29.5 14C29.5 12.8954 30.3954 12 31.5 12H33C34.1046 12 35 12.8954 35 14V24H29.5V14Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* AI Neural Spark / Star Node at Apex */}
          <circle cx="34" cy="12.5" r="3.5" fill="#38BDF8" />
          <circle cx="34" cy="12.5" r="2" fill="#FFFFFF" />
          <circle cx="34" cy="12.5" r="5" stroke="#FFFFFF" strokeWidth="0.75" strokeOpacity="0.6" />
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: dimensions.text,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
              lineHeight: 1,
            }}
          >
            <span style={{ color: 'var(--text)' }}>Nex</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Learn
            </span>
          </span>
          <span
            style={{
              fontSize: dimensions.badge,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
              color: '#6366F1',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              letterSpacing: '0.04em',
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
