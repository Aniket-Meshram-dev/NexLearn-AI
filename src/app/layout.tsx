import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Fira_Code, Inter, Outfit } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import SmoothScroll from '@/components/SmoothScroll';
import PwaRegister from '@/components/PwaRegister';
import OfflineIndicator from '@/components/OfflineIndicator';
import PwaInstallPrompt from '@/components/PwaInstallPrompt';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0D13' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'NexLearn — AI-Powered Intelligent Learning Ecosystem',
  description: 'NexLearn is an AI-native educational platform that generates structured courses, provides interactive learning, tracks performance, and delivers personalized recommendations.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NexLearn',
  },
  applicationName: 'NexLearn',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${firaCode.variable}`} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${outfit.variable} ${firaCode.variable}`}>
        <SessionProvider>
          <ThemeProvider>
            <SmoothScroll>
              <AppLayout>
                {children}
              </AppLayout>
            </SmoothScroll>
            <PwaRegister />
            <OfflineIndicator />
            <PwaInstallPrompt />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

