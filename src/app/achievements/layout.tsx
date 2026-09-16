import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achievements — NexLearn',
  description: 'Track your earned achievements and learning milestones.',
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
