'use client';
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface NexLearnLoaderProps {
  title?: string;
  subtitle?: string;
  steps?: string[];
  activeStep?: number;
  showProgress?: boolean;
  estimatedTime?: string;
}

export default function NexLearnLoader({
  title = 'Creating your course...',
  subtitle = 'Getting lessons, simple notes, and practice quizzes ready for you.',
  steps = [
    'Planning your lessons',
    'Writing simple notes and examples',
    'Adding practice questions and quizzes',
  ],
  activeStep,
  showProgress = true,
  estimatedTime = 'Takes about 10-15 seconds',
}: NexLearnLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (activeStep !== undefined) {
      setCurrentStepIndex(activeStep);
      return;
    }
    // Auto-advance step every 4 seconds for natural SaaS feel
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [activeStep, steps.length]);

  return (
    <div
      style={{
        position: 'relative',
        padding: '56px 36px',
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '28px',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '560px',
        margin: '0 auto',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 45%, transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
          animation: 'pulseSlow 3s ease-in-out infinite alternate',
        }}
      />

      {/* Branded Central Pulsing Logo with Dual Orbit Rings */}
      <div
        style={{
          position: 'relative',
          width: '110px',
          height: '110px',
          margin: '0 auto 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer Orbital Ring 1 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed rgba(99, 102, 241, 0.45)',
            animation: 'orbitSpin 9s linear infinite',
          }}
        />

        {/* Counter Orbital Ring 2 with glowing gradient accent */}
        <div
          style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#4F46E5',
            borderRightColor: '#06B6D4',
            animation: 'orbitSpinReverse 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            filter: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.5))',
          }}
        />

        {/* Inner Soft Gradient Disc */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.14) 0%, rgba(6, 182, 212, 0.14) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.22)',
            animation: 'logoPulse 2.2s ease-in-out infinite',
          }}
        >
          {/* NexLearn Brand Monogram Geometric Book-N SVG */}
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '40px', height: '40px', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="loader-grad-primary" x1="10" y1="54" x2="54" y2="10" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="loader-pillar-left" x1="18" y1="38" x2="26" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="loader-diagonal" x1="20" y1="14" x2="44" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="loader-pillar-right" x1="38" y1="42" x2="46" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Spine & Open Book Pages */}
            <path
              d="M32 54C22 52 14 54 8 57C7 57.5 6 56.5 6 55.5V47C13 44 22 42 32 45C42 42 51 44 58 47V55.5C58 56.5 57 57.5 56 57C50 54 42 52 32 54Z"
              fill="#1E1B4B"
              stroke="url(#loader-grad-primary)"
              strokeWidth="1.5"
            />
            <path d="M32 48C23 45 15 47 10 50V43C16 40 24 38 32 41V48Z" fill="#818CF8" opacity="0.9" />
            <path d="M32 48C41 45 49 47 54 50V43C48 40 40 38 32 41V48Z" fill="#06B6D4" opacity="0.9" />

            {/* Rising Letter 'N' */}
            <path
              d="M18 16C18 14.8954 18.8954 14 20 14H24C25.1046 14 26 14.8954 26 16V40C26 41.1046 25.1046 42 24 42H20C18.8954 42 18 41.1046 18 40V16Z"
              fill="url(#loader-pillar-left)"
            />
            <path
              d="M22 14L42 39.5C42.8 40.5 44 40.2 44 39V16C44 14.8954 44.8954 14 46 14H46.5C47.3 14 48 14.7 48 15.5V40C48 41.1046 47.1046 42 46 42H42.5C41.4 42 40.4 41.3 39.8 40.4L20 15C19.5 14.2 20.2 13.5 21 13.8L22 14Z"
              fill="url(#loader-diagonal)"
            />
            <path
              d="M38 16C38 14.8954 38.8954 14 40 14H44C45.1046 14 46 14.8954 46 16V40C46 41.1046 45.1046 42 44 42H40C38.8954 42 38 41.1046 38 40V16Z"
              fill="url(#loader-pillar-right)"
            />
            <circle cx="45" cy="12" r="2" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Main Title - Ultra Simple & Friendly */}
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          marginBottom: '8px',
          color: 'var(--text-primary)',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>

      {/* Subtitle - Plain English */}
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.94rem',
          lineHeight: 1.55,
          maxWidth: '440px',
          margin: '0 auto 28px',
        }}
      >
        {subtitle}
      </p>

      {/* Interactive Step Timeline */}
      <div
        style={{
          maxWidth: '380px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
          background: 'var(--bg-secondary)',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
        }}
      >
        {steps.map((stepText, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isDone || isCurrent ? 1 : 0.45,
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: isDone
                    ? 'var(--success, #10B981)'
                    : isCurrent
                    ? 'var(--primary)'
                    : 'var(--border)',
                  color: isDone || isCurrent ? 'white' : 'var(--text-muted)',
                  boxShadow: isCurrent ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {stepText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sleek Shimmering Progress Bar */}
      {showProgress && (
        <div style={{ marginTop: '28px' }}>
          <div
            style={{
              maxWidth: '320px',
              height: '6px',
              borderRadius: '999px',
              background: 'var(--border)',
              margin: '0 auto',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '60%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 50%, #06B6D4 100%)',
                animation: 'shimmerSweep 1.8s ease-in-out infinite',
              }}
            />
          </div>
          {estimatedTime && (
            <p
              style={{
                marginTop: '12px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {estimatedTime}
            </p>
          )}
        </div>
      )}

      {/* Global Embedded Styles for Animations */}
      <style jsx>{`
        @keyframes orbitSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbitSpinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes logoPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        @keyframes pulseSlow {
          0% {
            opacity: 0.5;
            transform: translateX(-50%) scale(0.9);
          }
          100% {
            opacity: 0.9;
            transform: translateX(-50%) scale(1.1);
          }
        }
        @keyframes shimmerSweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
