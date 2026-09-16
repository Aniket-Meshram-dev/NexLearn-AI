import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile — NexLearn',
  description: 'View and edit your NexLearn learner profile.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
