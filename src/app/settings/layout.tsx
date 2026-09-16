import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings — NexLearn',
  description: 'Manage your account settings, security, and preferences.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
