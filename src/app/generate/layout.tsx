import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generate Course — NexLearn',
  description: 'Create an AI-powered course on any topic with personalized modules, quizzes, and flashcards.',
};

export default function GenerateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
