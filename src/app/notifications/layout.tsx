import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications — NexLearn',
  description: 'View your course updates, reminders, and learning notifications.',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
