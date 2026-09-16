import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        topic: true,
        level: true,
        goal: true,
        hoursPerDay: true,
        duration: true,
        roadmap: true,
        isPublic: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        modules: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            orderIndex: true,
            subtopics: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course || course.isPublic === false) {
      return NextResponse.json({ error: 'Course not found or private' }, { status: 404 });
    }

    // Check if the current viewer is authenticated and already enrolled
    let isOwner = false;
    let isEnrolled = false;
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      const viewerCourse = await prisma.course.findFirst({
        where: { id, userId: session.user.id },
        select: { id: true, enrolled: true },
      });
      if (viewerCourse) {
        isOwner = true;
        isEnrolled = viewerCourse.enrolled;
      }
    }

    return NextResponse.json({
      course: {
        ...course,
        authorName: course.user?.name || 'NexLearn Scholar',
      },
      viewer: {
        isAuthenticated: !!session?.user,
        isOwner,
        isEnrolled,
      },
    });
  } catch (error) {
    console.error('Public course fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch public course' }, { status: 500 });
  }
}

// Clone or enroll in this public course
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to enroll' }, { status: 401 });
    }

    const { id } = await params;

    const sourceCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
            flashcards: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!sourceCourse || sourceCourse.isPublic === false) {
      return NextResponse.json({ error: 'Course not found or private' }, { status: 404 });
    }

    // If viewer is already the owner, simply ensure enrolled = true
    if (sourceCourse.userId === session.user.id) {
      await prisma.course.update({
        where: { id: sourceCourse.id },
        data: { enrolled: true },
      });
      return NextResponse.json({ success: true, courseId: sourceCourse.id });
    }

    // Otherwise, clone this public course to the new user's library
    const clonedCourse = await prisma.course.create({
      data: {
        title: sourceCourse.title,
        description: sourceCourse.description,
        topic: sourceCourse.topic,
        level: sourceCourse.level,
        goal: sourceCourse.goal,
        hoursPerDay: sourceCourse.hoursPerDay,
        duration: sourceCourse.duration,
        roadmap: sourceCourse.roadmap,
        enrolled: true,
        completed: false,
        isPublic: true,
        userId: session.user.id,
        modules: {
          create: sourceCourse.modules.map((m) => ({
            title: m.title,
            description: m.description,
            difficulty: m.difficulty,
            subtopics: m.subtopics,
            notes: m.notes,
            examples: m.examples,
            summary: m.summary,
            exercises: m.exercises,
            mindmap: m.mindmap,
            orderIndex: m.orderIndex,
            completed: false,
            ...(m.quiz
              ? {
                  quiz: {
                    create: {
                      questions: {
                        create: m.quiz.questions.map((q) => ({
                          text: q.text,
                          options: q.options,
                          correctAnswer: q.correctAnswer,
                          explanation: q.explanation,
                        })),
                      },
                    },
                  },
                }
              : {}),
            flashcards: {
              create: m.flashcards.map((f) => ({
                question: f.question,
                answer: f.answer,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json({ success: true, courseId: clonedCourse.id });
  } catch (error) {
    console.error('Clone public course error:', error);
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
  }
}
