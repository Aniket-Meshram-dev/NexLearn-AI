import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const [quizAttempts, courses, studySessions] = await Promise.all([
    prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { quiz: { include: { module: { select: { title: true } } } } } }),
    prisma.course.findMany({ where: { userId }, include: { modules: true } }),
    prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
  ]);

  // Quiz score trends
  const quizTrends = quizAttempts.slice(0, 10).reverse().map(a => ({
    label: a.quiz?.module?.title?.substring(0, 15) || 'Quiz',
    score: Math.round((a.score / a.totalQuestions) * 100),
    date: a.createdAt,
  }));

  // Course completion data
  const courseCompletion = courses.map(c => ({
    title: c.title.substring(0, 20),
    total: c.modules.length,
    completed: c.modules.filter(m => m.completed).length,
  }));

  // Weekly study time (last 4 weeks)
  const weeklyStudyTime = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() - w * 7);
    weekEnd.setHours(23, 59, 59);
    const mins = studySessions
      .filter(s => new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd)
      .reduce((sum, s) => sum + s.duration, 0);
    weeklyStudyTime.push({ label: `Week ${4 - w}`, minutes: mins });
  }

  // Overall accuracy
  const totalCorrect = quizAttempts.reduce((sum, a) => sum + a.score, 0);
  const totalQs = quizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const accuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;

  // Weak areas
  const moduleScores = {};
  quizAttempts.forEach(a => {
    const name = a.quiz?.module?.title || 'Unknown';
    if (!moduleScores[name]) moduleScores[name] = { total: 0, correct: 0 };
    moduleScores[name].total += a.totalQuestions;
    moduleScores[name].correct += a.score;
  });
  const weakAreas = Object.entries(moduleScores)
    .map(([name, s]) => ({ name, accuracy: Math.round((s.correct / s.total) * 100) }))
    .filter(a => a.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Course performance scores (Average of all quizzes in each completed course)
  const courseScores = courses.map(c => {
    const moduleIds = c.modules.map(m => m.id);
    const relatedAttempts = quizAttempts.filter(a => moduleIds.includes(a.quiz?.moduleId));
    const totalPossible = relatedAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalGained = relatedAttempts.reduce((sum, a) => sum + a.score, 0);
    const percentage = totalPossible > 0 ? Math.round((totalGained / totalPossible) * 100) : 0;

    return {
      id: c.id,
      title: c.title,
      score: percentage,
      completed: c.modules.every(m => m.completed)
    };
  });

  return NextResponse.json({ 
    quizTrends, 
    courseCompletion, 
    weeklyStudyTime, 
    accuracy, 
    weakAreas, 
    courseScores,
    totalQuizzes: quizAttempts.length 
  });
}
