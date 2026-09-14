import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  const [courses, quizAttempts, studySessions, achievements] = await Promise.all([
    prisma.course.findMany({
      where: { userId },
      include: {
        modules: {
          include: { quiz: { include: { attempts: { where: { userId }, take: 1 } } } }
        }
      }
    }),
    prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
  ]);

  // Calculate stats
  const totalModules = courses.reduce((sum, c) => sum + c.modules.length, 0);
  const completedModules = courses.reduce((sum, c) => sum + c.modules.filter(m => m.completed).length, 0);
  const totalQuizzes = quizAttempts.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizAttempts.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / totalQuizzes)
    : 0;

  // Study streak calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const dateSet = new Set(studySessions.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }));

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (dateSet.has(checkDate.getTime())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Weekly study time (last 7 days)
  const weeklyStudy = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const mins = studySessions
      .filter(s => new Date(s.date) >= dayStart && new Date(s.date) <= dayEnd)
      .reduce((sum, s) => sum + s.duration, 0);
    weeklyStudy.push({ day: dayNames[d.getDay()], minutes: mins });
  }

  // 365-day heatmap data
  const heatMapData = {};
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const count = studySessions.filter(s => new Date(s.date) >= dayStart && new Date(s.date) <= dayEnd).length +
      quizAttempts.filter(q => new Date(q.createdAt) >= dayStart && new Date(q.createdAt) <= dayEnd).length;

    if (count > 0) heatMapData[dateKey] = count;
  }

  // Points: 10 per module, 5 per quiz score point, 50 per achievement
  const points = (completedModules * 10) +
    quizAttempts.reduce((sum, q) => sum + q.score * 5, 0) +
    (achievements.length * 50);

  // Course completion %
  const courseCompletion = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Recommendations
  const recommendations = [];
  const incompleteCourses = courses.filter(c => !c.completed);
  if (incompleteCourses.length > 0) {
    const lastCourse = incompleteCourses[incompleteCourses.length - 1];
    const nextModule = lastCourse.modules.find(m => !m.completed);
    if (nextModule) {
      recommendations.push({
        type: 'continue', icon: '📖',
        title: 'Continue your last lesson',
        desc: `Resume "${nextModule.title}" in ${lastCourse.title}`,
        link: `/course/${lastCourse.id}/module/${nextModule.id}`,
      });
    }
  }

  if (avgScore < 70 && totalQuizzes > 0) {
    recommendations.push({
      type: 'improve', icon: '📝',
      title: 'Your quiz accuracy needs improvement',
      desc: `Current average: ${avgScore}%. Try revising weak modules.`,
      link: '/reports',
    });
  }

  if (courseCompletion > 80 && courseCompletion < 100) {
    recommendations.push({
      type: 'finish', icon: '🎯',
      title: "You're close to completing your course!",
      desc: `${courseCompletion}% done. Keep going!`,
      link: incompleteCourses[0] ? `/course/${incompleteCourses[0].id}` : '/dashboard',
    });
  }

  if (courses.length === 0) {
    recommendations.push({
      type: 'start', icon: '🤖',
      title: 'Generate your first course',
      desc: 'Enter a topic and let AI create a personalized learning path.',
      link: '/generate',
    });
  }

  return NextResponse.json({
    stats: {
      streak, totalCourses: courses.length, completedModules, totalModules,
      totalQuizzes, avgScore, points, courseCompletion,
    },
    weeklyStudy,
    achievements: achievements.map(a => a.achievement),
    recommendations,
    recentCourses: await (async () => {
      // HOTPATCH for Windows EPERM issues: Manually map 'enrolled' since client isn't generated
      const enrolledStatus = await prisma.$queryRawUnsafe(
        'SELECT "id", "enrolled" FROM "Course" WHERE "userId" = $1',
        userId
      );

      return courses.reverse().map(c => {
        let fullyCompleted = false;
        if (c.completed) {
          fullyCompleted = true;
          c.modules.forEach(m => {
            if (!m.quiz || m.quiz.attempts.length === 0) {
              fullyCompleted = false;
            }
          });
        }

        // Find the raw enrolled status
        const rawStatus = enrolledStatus.find(s => s.id === c.id);
        const isActuallyEnrolled = rawStatus ? rawStatus.enrolled : false;

        return {
          id: c.id, title: c.title, topic: c.topic, level: c.level,
          moduleCount: c.modules.length,
          completedCount: c.modules.filter(m => m.completed).length,
          completed: c.completed,
          enrolled: isActuallyEnrolled,
          fullyCompleted,
        };
      });
    })(),
    heatMapData,
  });
}
