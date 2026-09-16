'use client';
import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker active:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration error:', err);
          });
      });
    }
  }, []);

  return null;
}
