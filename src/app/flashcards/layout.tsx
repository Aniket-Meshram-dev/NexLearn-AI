import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spaced Repetition Flashcards — NexLearn',
  description: 'Review and master your learning material with spaced repetition flashcards.',
};

export default function FlashcardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
