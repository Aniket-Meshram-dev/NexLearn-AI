import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports — NexLearn',
  description: 'Detailed learning analytics, quiz performance, and study session insights.',
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
