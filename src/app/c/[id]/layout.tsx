import type { Metadata } from 'next';
import prisma from '@/lib/prisma';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        topic: true,
        level: true,
        user: { select: { name: true } },
      },
    });

    if (!course) {
      return {
        title: 'Course Not Found — NexLearn AI',
        description: 'The requested learning curriculum is unavailable or private.',
      };
    }

    const author = course.user?.name || 'NexLearn Scholar';
    const title = `${course.title} — AI Learning Pathway`;
    const description =
      course.description || `Study ${course.title}, synthesized by ${author} on NexLearn AI.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        siteName: 'NexLearn AI',
        authors: [author],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'NexLearn AI — Intelligent Learning Ecosystem',
      description: 'Explore AI-generated courses with interactive notes, flashcards, and quizzes.',
    };
  }
}

export default function PublicCourseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
