import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d'; // '7d', '30d', 'all'

  const [rawQuizAttempts, courses, rawStudySessions] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        quiz: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                courseId: true,
              },
            },
          },
        },
      },
    }),
    prisma.course.findMany({ where: { userId }, include: { modules: true } }),
    prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
  ]);

  const now = new Date();
  let filterCutoff: Date | null = null;
  if (range === '7d') {
    filterCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === '30d') {
    filterCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const quizAttempts = filterCutoff
    ? rawQuizAttempts.filter((a) => new Date(a.createdAt) >= filterCutoff)
    : rawQuizAttempts;

  const studySessions = filterCutoff
    ? rawStudySessions.filter((s) => new Date(s.date) >= filterCutoff)
    : rawStudySessions;

  // Quiz score trends (last 10 attempts chronological)
  const quizTrends = quizAttempts
    .slice(0, 10)
    .reverse()
    .map((a) => ({
      label: a.quiz?.module?.title?.substring(0, 18) || 'Quiz',
      score: a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0,
      date: a.createdAt,
    }));

  // Course completion data
  const courseCompletion = courses.map((c) => ({
    id: c.id,
    title: c.title.substring(0, 24),
    total: c.modules.length,
    completed: c.modules.filter((m) => m.completed).length,
  }));

  // Weekly study time (last 4 intervals)
  const weeklyStudyTime: { label: string; minutes: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const numWeeks = range === '7d' ? 1 : 4;
  for (let w = numWeeks - 1; w >= 0; w--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const mins = studySessions
      .filter((s) => new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd)
      .reduce((sum, s) => sum + s.duration, 0);

    weeklyStudyTime.push({
      label: range === '7d' ? 'Past 7 Days' : `Week ${4 - w}`,
      minutes: mins,
    });
  }

  // Total study minutes across filtered sessions
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.duration, 0);

  // Total quizzes taken and passed (score >= 70%)
  const totalQuizzes = quizAttempts.length;
  const passedQuizzes = quizAttempts.filter(
    (a) => a.totalQuestions > 0 && a.score / a.totalQuestions >= 0.7
  ).length;

  // Overall accuracy across all questions answered
  const totalCorrect = quizAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalQs = quizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const accuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

  // Weak areas: Evaluate each module's best performance
  const moduleBestScores: Record<
    string,
    { pct: number; moduleId?: string; courseId?: string; moduleTitle: string }
  > = {};

  quizAttempts.forEach((a) => {
    const name = a.quiz?.module?.title || 'Unknown Module';
    const pct = a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0;
    if (!moduleBestScores[name] || pct > moduleBestScores[name].pct) {
      moduleBestScores[name] = {
        pct,
        moduleId: a.quiz?.moduleId,
        courseId: a.quiz?.module?.courseId,
        moduleTitle: name,
      };
    }
  });

  const weakAreas = Object.values(moduleBestScores)
    .map((s) => ({
      name: s.moduleTitle,
      accuracy: Math.round(s.pct),
      moduleId: s.moduleId,
      courseId: s.courseId,
    }))
    .filter((a) => a.accuracy < 75)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Course performance scores: calculated using best attempt per module
  const courseScores = courses.map((c) => {
    const moduleScores = c.modules
      .map((m) => {
        const attempts = rawQuizAttempts.filter((a) => a.quiz?.moduleId === m.id);
        if (attempts.length === 0) return null;
        return Math.max(
          ...attempts.map((a) => (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0))
        );
      })
      .filter((s): s is number => s !== null);

    const avgScore =
      moduleScores.length > 0
        ? Math.round(moduleScores.reduce((sum, s) => sum + s, 0) / moduleScores.length)
        : 0;

    return {
      id: c.id,
      title: c.title,
      score: avgScore,
      completed: c.modules.length > 0 && c.modules.every((m) => m.completed),
    };
  });

  return NextResponse.json({
    quizTrends,
    courseCompletion,
    weeklyStudyTime,
    totalStudyMinutes,
    accuracy,
    weakAreas,
    courseScores,
    totalQuizzes,
    passedQuizzes,
    range,
  });
}
