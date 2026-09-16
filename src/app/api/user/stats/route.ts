import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { syncUserAchievements } from '@/lib/achievements';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;

  // Run achievement sync to ensure real-time badges & points are up to date
  const { userAchievements, streak: calculatedStreak } = await syncUserAchievements(userId);

  const [courses, quizAttempts, studySessions] = await Promise.all([
    prisma.course.findMany({
      where: { userId },
      include: {
        modules: {
          include: { quiz: { include: { attempts: { where: { userId }, take: 1 } } } },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                courseId: true,
                course: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.studySession.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
  ]);

  // Calculate core stats
  const totalModules = courses.reduce((sum, c) => sum + c.modules.length, 0);
  const completedModules = courses.reduce((sum, c) => sum + c.modules.filter((m) => m.completed).length, 0);
  const totalQuizzes = quizAttempts.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizAttempts.reduce((sum, q) => sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0), 0) / totalQuizzes)
      : 0;

  // Weekly study time (last 7 days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeklyStudy: { day: string; minutes: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    const mins = studySessions
      .filter((s) => new Date(s.date) >= dayStart && new Date(s.date) <= dayEnd)
      .reduce((sum, s) => sum + s.duration, 0);
    weeklyStudy.push({ day: dayNames[d.getDay()], minutes: mins });
  }

  // 365-day activity heatmap data
  const heatMapData: Record<string, number> = {};
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const count =
      studySessions.filter((s) => new Date(s.date) >= dayStart && new Date(s.date) <= dayEnd).length +
      quizAttempts.filter((q) => new Date(q.createdAt) >= dayStart && new Date(q.createdAt) <= dayEnd).length;

    if (count > 0) heatMapData[dateKey] = count;
  }

  // Points: 10 per module, 5 per quiz score point, 50 per achievement
  const points =
    completedModules * 10 +
    quizAttempts.reduce((sum, q) => sum + q.score * 5, 0) +
    userAchievements.length * 50;

  // Course completion %
  const courseCompletion = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Real-time recommendations based on user's current progress
  const recommendations: { type: string; icon: string; title: string; desc: string; link: string }[] = [];
  const incompleteCourses = courses.filter((c) => !c.completed);
  if (incompleteCourses.length > 0) {
    const lastCourse = incompleteCourses[incompleteCourses.length - 1];
    const nextModule = lastCourse.modules.find((m) => !m.completed);
    if (nextModule) {
      recommendations.push({
        type: 'continue',
        icon: 'book-open',
        title: 'Continue your last lesson',
        desc: `Resume "${nextModule.title}" in ${lastCourse.title}`,
        link: `/course/${lastCourse.id}/module/${nextModule.id}`,
      });
    }
  }

  if (avgScore < 70 && totalQuizzes > 0) {
    recommendations.push({
      type: 'improve',
      icon: 'file-text',
      title: 'Your quiz accuracy needs improvement',
      desc: `Current average: ${avgScore}%. Try revising weak modules.`,
      link: '/reports',
    });
  }

  if (courseCompletion > 80 && courseCompletion < 100) {
    recommendations.push({
      type: 'finish',
      icon: 'target',
      title: "You're close to completing your course!",
      desc: `${courseCompletion}% done. Keep going!`,
      link: incompleteCourses[0] ? `/course/${incompleteCourses[0].id}` : '/dashboard',
    });
  }

  if (courses.length === 0) {
    recommendations.push({
      type: 'start',
      icon: 'bot',
      title: 'Generate your first course',
      desc: 'Enter a topic and let AI create a personalized learning path.',
      link: '/generate',
    });
  }

  // Fetch enrollment status
  let enrolledStatus: any[] = [];
  try {
    enrolledStatus = await prisma.$queryRawUnsafe(
      'SELECT "id", "enrolled" FROM "Course" WHERE "userId" = $1',
      userId
    );
  } catch {
    enrolledStatus = [];
  }

  const recentCourses = courses.reverse().map((c) => {
    let fullyCompleted = false;
    if (c.completed || (c.modules.length > 0 && c.modules.every((m) => m.completed))) {
      fullyCompleted = true;
      c.modules.forEach((m) => {
        if (!m.quiz || m.quiz.attempts.length === 0) {
          fullyCompleted = false;
        }
      });
    }

    const rawStatus = enrolledStatus.find((s: any) => s.id === c.id);
    const isActuallyEnrolled = rawStatus ? Boolean(rawStatus.enrolled) : Boolean((c as any).enrolled);

    return {
      id: c.id,
      title: c.title,
      topic: c.topic,
      level: c.level,
      moduleCount: c.modules.length,
      completedCount: c.modules.filter((m) => m.completed).length,
      completed: c.completed || (c.modules.length > 0 && c.modules.every((m) => m.completed)),
      enrolled: isActuallyEnrolled,
      fullyCompleted,
      grade: c.grade || undefined,
    };
  });

  // Calculate Resume Lesson CTA
  const enrolledIncomplete = courses.filter((c) => {
    const rawStatus = enrolledStatus.find((s: any) => s.id === c.id);
    const isEnrolled = rawStatus ? Boolean(rawStatus.enrolled) : Boolean((c as any).enrolled);
    return isEnrolled && !c.completed && c.modules.some((m) => !m.completed);
  });
  const targetCourseForResume = enrolledIncomplete[0] || incompleteCourses[0] || null;
  let resumeLesson: any = null;
  if (targetCourseForResume) {
    const nextMod = targetCourseForResume.modules.find((m) => !m.completed) || targetCourseForResume.modules[0];
    if (nextMod) {
      resumeLesson = {
        courseId: targetCourseForResume.id,
        courseTitle: targetCourseForResume.title,
        moduleId: nextMod.id,
        moduleTitle: nextMod.title,
        difficulty: nextMod.difficulty || 'Core',
        link: `/course/${targetCourseForResume.id}/module/${nextMod.id}`,
      };
    }
  }

  // Daily Study Target Calculation
  const todaySessions = studySessions.filter((s) => new Date(s.date) >= today);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const targetMinutes = 40;
  const todayQuizzes = quizAttempts.filter((q) => new Date(q.createdAt) >= today).length;
  const targetQuizzes = 1;
  const dailyTarget = {
    minutesStudied: todayMinutes,
    targetMinutes,
    quizzesDone: todayQuizzes,
    targetQuizzes,
    percentage: Math.min(100, Math.round((todayMinutes / targetMinutes) * 100)),
    achieved: todayMinutes >= targetMinutes,
  };

  // Live Recent Activities Feed
  const recentActivities: any[] = [];
  for (const qa of quizAttempts.slice(0, 6)) {
    const percent = qa.totalQuestions > 0 ? Math.round((qa.score / qa.totalQuestions) * 100) : 0;
    const mod = (qa as any).quiz?.module;
    recentActivities.push({
      id: `quiz-${qa.id}`,
      type: 'quiz',
      title: `Completed Quiz: ${percent}% Accuracy`,
      subtitle: mod ? `${mod.course?.title || 'Course'} • ${mod.title}` : 'Quiz Assessment',
      timestamp: qa.createdAt,
      badge: `${qa.score}/${qa.totalQuestions} Correct`,
      badgeColor: percent >= 80 ? 'green' : percent >= 60 ? 'yellow' : 'red',
      link: mod?.courseId ? `/course/${mod.courseId}/module/${mod.id}/quiz` : '/reports',
    });
  }

  for (const ua of userAchievements.slice(0, 4)) {
    recentActivities.push({
      id: `achieve-${ua.id}`,
      type: 'achievement',
      title: `Unlocked "${ua.achievement.title}"`,
      subtitle: ua.achievement.description,
      timestamp: ua.earnedAt,
      badge: 'Milestone',
      badgeColor: 'purple',
      link: '/achievements',
    });
  }

  for (const c of courses.filter((c) => c.completed).slice(0, 3)) {
    recentActivities.push({
      id: `course-${c.id}`,
      type: 'course',
      title: `Mastered Course: ${c.title}`,
      subtitle: `${c.modules.length} Modules Completed • Grade ${c.grade || 'A'}`,
      timestamp: c.updatedAt,
      badge: 'Certified',
      badgeColor: 'blue',
      link: c.certificateId ? `/certificate/${c.certificateId}` : `/course/${c.id}`,
    });
  }

  recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json({
    stats: {
      streak: calculatedStreak,
      totalCourses: courses.length,
      completedModules,
      totalModules,
      totalQuizzes,
      avgScore,
      points,
      courseCompletion,
    },
    weeklyStudy,
    dailyTarget,
    resumeLesson,
    recentActivities: recentActivities.slice(0, 8),
    achievements: userAchievements.map((a) => a.achievement),
    recommendations,
    recentCourses,
    heatMapData,
  });
}
