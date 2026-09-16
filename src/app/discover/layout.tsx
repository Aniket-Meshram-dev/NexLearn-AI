import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover — NexLearn',
  description: 'Explore popular topics and generate AI-powered courses on any subject.',
};

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
