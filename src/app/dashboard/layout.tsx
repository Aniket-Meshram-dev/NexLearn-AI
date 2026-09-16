import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — NexLearn',
  description: 'View your learning progress, enrolled courses, and study analytics.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
