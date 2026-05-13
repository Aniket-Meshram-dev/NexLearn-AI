import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendAnalyticsReportEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pdfBase64 } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        courses: { include: { modules: true } }, 
        quizAttempts: true,
        studySessions: true
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Calculate dynamic stats
    const totalCourses = user.courses.length;
    const completedCourses = user.courses.filter(c => c.completed).length;
    const totalModules = user.courses.reduce((acc, c) => acc + c.modules.length, 0);
    const completedModules = user.courses.reduce((acc, c) => acc + c.modules.filter(m => m.completed).length, 0);
    
    let totalScore = 0;
    user.quizAttempts.forEach(a => totalScore += (a.score / a.totalQuestions) * 100);
    const avgScore = user.quizAttempts.length > 0 ? Math.round(totalScore / user.quizAttempts.length) : 0;
    
    const points = (completedModules * 10) + (completedCourses * 100) + (user.quizAttempts.filter(a => a.score === a.totalQuestions).length * 50);

    // Streak calculation (simple mock or derived from study sessions if available)
    const streak = user.studySessions.length > 0 ? Math.min(30, user.studySessions.length) : 0;

    const stats = {
      streak,
      avgScore,
      completedModules,
      points,
      totalCourses,
      completedCourses
    };

    await sendAnalyticsReportEmail(
      user.email,
      user.name || 'Scholar',
      stats,
      pdfBase64
    );

    return NextResponse.json({ message: 'Analytics report sent successfully' });
  } catch (error) {
    console.error('Error sending analytics email:', error);
    return NextResponse.json({ error: 'Failed to send analytics report' }, { status: 500 });
  }
}
