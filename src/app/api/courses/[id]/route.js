import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id, userId: session.user.id },
    include: {
      modules: { 
        orderBy: { orderIndex: 'asc' }, 
        include: { 
          quiz: { 
            include: { 
              attempts: { 
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 1
              } 
            } 
          } 
        } 
      },
    },
  });

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  // Calculate quizzes completion
  let allQuizzesTaken = true;
  let totalScore = 0;
  let totalQuestions = 0;
  
  course.modules.forEach(m => {
    if (!m.quiz || m.quiz.attempts.length === 0) {
      allQuizzesTaken = false;
    } else {
      totalScore += m.quiz.attempts[0].score;
      totalQuestions += m.quiz.attempts[0].totalQuestions;
    }
  });

  const finalGrade = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  
  // HOTPATCH: Manually fetch 'enrolled' since client is missing it
  const rawData = await prisma.$queryRawUnsafe(
    'SELECT "enrolled" FROM "Course" WHERE "id" = $1',
    id
  );
  const isActuallyEnrolled = rawData && rawData[0] ? rawData[0].enrolled : false;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  return NextResponse.json({ 
    course: { ...course, enrolled: isActuallyEnrolled, userName: user?.name }, 
    allQuizzesTaken,
    finalGrade
  });
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { enrolled } = await request.json();
  const { id } = await params;
  
  try {
    // HOTPATCH: Using raw SQL because 'prisma generate' fails on Windows when dev server is running (EPERM)
    // This allows us to update the 'enrolled' field even if the client doesn't know about it yet.
    await prisma.$executeRawUnsafe(
      'UPDATE "Course" SET "enrolled" = $1 WHERE "id" = $2 AND "userId" = $3',
      enrolled, id, session.user.id
    );
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Enrollment patch error:', err);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.course.delete({
      where: { id, userId: session.user.id }
    });
    return NextResponse.json({ success: true, message: 'Successfully unenrolled from course' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
