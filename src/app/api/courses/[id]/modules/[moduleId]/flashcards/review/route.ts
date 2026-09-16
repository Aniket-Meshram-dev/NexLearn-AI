import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const { flashcardId, quality } = await request.json(); // quality 0: Again, 1: Hard, 2: Good, 3: Easy

  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
  });
  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId, moduleId: moduleId }
  });

  if (!flashcard) return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });

  let review = await prisma.flashcardReview.findUnique({
    where: { userId_flashcardId: { userId: session.user.id, flashcardId } }
  });

  // Default values for a new review
  let interval = review?.interval || 0;
  let easeFactor = review?.easeFactor || 2.5;
  let repetitions = review?.repetitions || 0;

  // SM-2 Algorithm Adaptation
  if (quality < 2) {
    // Fail: Again or Hard (too difficult)
    repetitions = 0;
    interval = 1; // Try again tomorrow
  } else {
    // Success
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.ceil(interval * easeFactor);
    }
    repetitions++;
  }

  // Adjust ease factor based on quality (0-3 scale)
  // Normalized to 0-5 scale for traditional SM-2 would be roughly (quality * 1.6)
  // Here we use a more direct adjustment
  const qualityAdjustment = 0.1 - (3 - quality) * (0.12 + (3 - quality) * 0.05);
  easeFactor = easeFactor + qualityAdjustment;
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  await prisma.flashcardReview.upsert({
    where: { userId_flashcardId: { userId: session.user.id, flashcardId } },
    update: {
      interval,
      easeFactor,
      repetitions,
      dueDate,
      lastReviewed: new Date(),
      status: quality < 2 ? 'relearning' : 'review'
    },
    create: {
      userId: session.user.id,
      flashcardId,
      interval,
      easeFactor,
      repetitions,
      dueDate,
      status: quality < 2 ? 'relearning' : 'learning'
    }
  });

  return NextResponse.json({ 
    success: true, 
    nextReviewDate: dueDate,
    interval: interval
  });
}
