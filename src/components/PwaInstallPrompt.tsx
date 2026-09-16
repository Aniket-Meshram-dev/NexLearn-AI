'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Download, Sparkles, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Never show on certificate or standalone verification pages
    if (pathname?.startsWith('/certificate/') || pathname?.startsWith('/c/') || pathname?.startsWith('/verify')) {
      return;
    }

    // 2. Check if user already dismissed permanently
    const isDismissed =
      localStorage.getItem('nexlearn_pwa_dismissed') === 'true' ||
      sessionStorage.getItem('nexlearn_pwa_dismissed') === 'true';

    if (isDismissed) return;

    // 3. Check if app is already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 4. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIos(true);
      const timer = setTimeout(() => {
        if (localStorage.getItem('nexlearn_pwa_dismissed') !== 'true') {
          setShowPrompt(true);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }

    // 5. Standard Chromium / Android / Desktop prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (localStorage.getItem('nexlearn_pwa_dismissed') !== 'true') {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [pathname]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        permanentlyDismiss();
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Installation prompt error:', err);
    }
  };

  const permanentlyDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    try {
      localStorage.setItem('nexlearn_pwa_dismissed', 'true');
      sessionStorage.setItem('nexlearn_pwa_dismissed', 'true');
    } catch {}
  };

  // Hide on certificate or credential inspection pages
  if (!showPrompt || pathname?.startsWith('/certificate/') || pathname?.startsWith('/c/') || pathname?.startsWith('/verify')) {
    return null;
  }

  return (
    <>
      {/* Sleek, Compact Micro-Pill Toast (Non-intrusive) */}
      <aside
        role="dialog"
        aria-label="Install App"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99990,
          maxWidth: '330px',
          background: 'rgba(18, 21, 30, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
          borderRadius: '999px',
          padding: '6px 10px 6px 14px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <Sparkles size={13} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Install NexLearn App
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
            Fast offline learning
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          style={{
            background: '#4F46E5',
            color: '#ffffff',
            border: 'none',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <Download size={12} />
          <span>Install</span>
        </button>

        <button
          onClick={permanentlyDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            flexShrink: 0,
          }}
          title="Don't show again"
          aria-label="Permanently dismiss"
        >
          <X size={14} />
        </button>
      </aside>

      {/* iOS Modal (Only if iOS user clicks install) */}
      {showIosGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99995,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={permanentlyDismiss}
        >
          <div
            style={{
              maxWidth: '360px',
              width: '100%',
              background: '#12151E',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '20px',
              padding: '22px',
              color: '#ffffff',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800 }}>
              Add to Home Screen
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.45 }}>
              In Safari, tap <strong>Share</strong> <Share size={14} style={{ display: 'inline' }} /> then tap <strong>Add to Home Screen</strong> <PlusSquare size={14} style={{ display: 'inline' }} />.
            </p>

            <button
              onClick={permanentlyDismiss}
              style={{
                width: '100%',
                background: '#4F46E5',
                color: '#ffffff',
                border: 'none',
                padding: '10px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              Done (Don't Show Again)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
