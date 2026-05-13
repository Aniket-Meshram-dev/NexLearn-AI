import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateFlashcards } from '@/lib/gemini';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;

  // Verify access and check lock
  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
  });

  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

  // Sequental access check (per user request)
  const courseModules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, completed: true }
  });

  const currentIndex = courseModules.findIndex(m => m.id === moduleId);
  if (currentIndex > 0 && !courseModules[currentIndex - 1].completed) {
    return NextResponse.json({ error: 'Locked. Please complete the previous module first.', isLocked: true }, { status: 403 });
  }

  // Fetch flashcards and user review progress
  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { moduleId },
      include: {
        reviews: {
          where: { userId: session.user.id }
        }
      }
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Flashcard fetch error:', error);
    // If Prisma client is not updated yet, this might fail.
    return NextResponse.json({ flashcards: [], error: 'Prisma client may need regeneration' });
  }
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;

  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    include: { flashcards: true }
  });

  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

  if (module.flashcards.length > 0) {
    return NextResponse.json({ flashcards: module.flashcards });
  }

  // Generate flashcards using AI
  try {
    const aiData = await generateFlashcards(module.title, module.notes);
    
    // Save to DB using a transaction
    const savedFlashcards = await prisma.$transaction(
      aiData.flashcards.map(card => 
        prisma.flashcard.create({
          data: {
            question: card.question,
            answer: card.answer,
            moduleId: moduleId
          }
        })
      )
    );

    return NextResponse.json({ flashcards: savedFlashcards, generated: true });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
