import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookmarks — NexLearn',
  description: 'View your bookmarked modules and learning materials.',
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
