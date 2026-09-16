import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { flashcardReviewSchema, parseBody } from '@/lib/validators';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const courses = await prisma.course.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        level: true,
        modules: {
          select: {
            id: true,
            title: true,
            orderIndex: true,
            flashcards: {
              select: {
                id: true,
                question: true,
                answer: true,
                reviews: {
                  where: { userId },
                  select: {
                    interval: true,
                    easeFactor: true,
                    repetitions: true,
                    dueDate: true,
                    lastReviewed: true,
                    status: true,
                  },
                },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    let totalCards = 0;
    let dueCount = 0;
    let masteredCount = 0;
    let learningCount = 0;
    let dueTomorrowCount = 0;
    let dueThisWeekCount = 0;

    const dueFlashcards: any[] = [];
    const courseSummaries: any[] = [];

    for (const course of courses) {
      let courseTotal = 0;
      let courseDue = 0;
      const moduleSummaries = [];

      for (const mod of course.modules) {
        let modDue = 0;
        const modTotal = mod.flashcards.length;
        courseTotal += modTotal;
        totalCards += modTotal;

        for (const card of mod.flashcards) {
          const review = card.reviews[0] || null;

          if (!review) {
            // New, never studied -> due immediately
            dueCount++;
            modDue++;
            dueFlashcards.push({
              id: card.id,
              question: card.question,
              answer: card.answer,
              courseId: course.id,
              courseTitle: course.title,
              moduleId: mod.id,
              moduleTitle: mod.title,
              review: null,
            });
          } else {
            const dueDate = new Date(review.dueDate);

            if (dueDate <= now) {
              dueCount++;
              modDue++;
              dueFlashcards.push({
                id: card.id,
                question: card.question,
                answer: card.answer,
                courseId: course.id,
                courseTitle: course.title,
                moduleId: mod.id,
                moduleTitle: mod.title,
                review: {
                  interval: review.interval,
                  repetitions: review.repetitions,
                  status: review.status,
                  dueDate: review.dueDate,
                },
              });
            } else if (dueDate <= endOfToday) {
              dueCount++;
              modDue++;
            } else if (dueDate.getTime() <= now.getTime() + 2 * 24 * 60 * 60 * 1000) {
              dueTomorrowCount++;
            } else if (dueDate <= in7Days) {
              dueThisWeekCount++;
            }

            if (review.interval >= 21 || review.repetitions >= 4) {
              masteredCount++;
            } else {
              learningCount++;
            }
          }
        }

        courseDue += modDue;

        if (modTotal > 0) {
          moduleSummaries.push({
            id: mod.id,
            title: mod.title,
            totalCards: modTotal,
            dueCards: modDue,
          });
        }
      }

      if (courseTotal > 0) {
        courseSummaries.push({
          id: course.id,
          title: course.title,
          level: course.level,
          totalCards: courseTotal,
          dueCards: courseDue,
          modules: moduleSummaries,
        });
      }
    }

    const retentionRate = totalCards > 0 
      ? Math.round((masteredCount / totalCards) * 100) 
      : 0;

    return NextResponse.json({
      stats: {
        totalCards,
        dueCount,
        masteredCount,
        learningCount,
        dueTomorrowCount,
        dueThisWeekCount,
        retentionRate,
      },
      courses: courseSummaries,
      dueFlashcards,
    });
  } catch (error) {
    console.error('Error fetching user flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = parseBody(flashcardReviewSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { flashcardId, quality } = parsed.data;

    // Verify ownership of the card via Course -> Module -> Flashcard
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!flashcard || flashcard.module.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    const review = await prisma.flashcardReview.findUnique({
      where: {
        userId_flashcardId: {
          userId: session.user.id,
          flashcardId,
        },
      },
    });

    let interval = review?.interval || 0;
    let easeFactor = review?.easeFactor || 2.5;
    let repetitions = review?.repetitions || 0;

    // SM-2 Algorithm
    if (quality < 2) {
      // Fail: Again (0) or Hard (1)
      repetitions = 0;
      interval = 1;
    } else {
      // Success: Good (2) or Easy (3)
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.ceil(interval * easeFactor);
      }
      repetitions++;
    }

    // Adjust ease factor
    const qualityAdjustment = 0.1 - (3 - quality) * (0.12 + (3 - quality) * 0.05);
    easeFactor = Math.max(1.3, easeFactor + qualityAdjustment);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);

    const updated = await prisma.flashcardReview.upsert({
      where: {
        userId_flashcardId: {
          userId: session.user.id,
          flashcardId,
        },
      },
      update: {
        interval,
        easeFactor,
        repetitions,
        dueDate,
        lastReviewed: new Date(),
        status: quality < 2 ? 'relearning' : 'review',
      },
      create: {
        userId: session.user.id,
        flashcardId,
        interval,
        easeFactor,
        repetitions,
        dueDate,
        lastReviewed: new Date(),
        status: quality < 2 ? 'relearning' : 'learning',
      },
    });

    return NextResponse.json({
      success: true,
      nextReviewDate: updated.dueDate,
      interval: updated.interval,
      repetitions: updated.repetitions,
      status: updated.status,
    });
  } catch (error) {
    console.error('Error reviewing flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to record review' },
      { status: 500 }
    );
  }
}
