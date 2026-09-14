import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';

export const metadata = {
  title: 'NexLearn — AI-Powered Intelligent Learning Ecosystem',
  description: 'NexLearn is an AI-native educational platform that generates structured courses, provides interactive learning, tracks performance, and delivers personalized recommendations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SessionProvider>
          <ThemeProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
