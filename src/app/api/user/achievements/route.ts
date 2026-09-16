import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncUserAchievements } from '@/lib/achievements';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allAchievements, userAchievements, userMetrics } = await syncUserAchievements(session.user.id);
  const earnedMap = Object.fromEntries(userAchievements.map((e) => [e.achievementId, e.earnedAt]));

  const getProgress = (title: string, earned: boolean) => {
    if (earned) return { current: 1, max: 1, label: '100% Complete' };
    const m = userMetrics;
    switch (title) {
      case 'First Spark':
        return { current: Math.min(m.completedModulesCount, 1), max: 1, label: `${m.completedModulesCount}/1 Module` };
      case 'Quiz Initiate':
        return { current: Math.min(m.quizAttemptsCount, 1), max: 1, label: `${m.quizAttemptsCount}/1 Quiz` };
      case 'Course Conqueror':
        return { current: Math.min(m.completedCoursesCount, 1), max: 1, label: `${m.completedCoursesCount}/1 Course` };
      case 'Blazing Streak':
        return { current: Math.min(m.streak, 3), max: 3, label: `${m.streak}/3 Days Streak` };
      case 'Iron Will':
        return { current: Math.min(m.streak, 7), max: 7, label: `${m.streak}/7 Days Streak` };
      case 'Legendary Grind':
        return { current: Math.min(m.streak, 30), max: 30, label: `${m.streak}/30 Days Streak` };
      case 'Knowledge Hoarder':
        return { current: Math.min(m.completedModulesCount, 10), max: 10, label: `${m.completedModulesCount}/10 Modules` };
      case 'Quiz Sharpshooter':
        return { current: Math.min(m.quizzesAbove90Count, 5), max: 5, label: `${m.quizzesAbove90Count}/5 High Score Quizzes` };
      case 'Mid-Term Machine':
        return { current: Math.min(m.passedQuizzesCount, 10), max: 10, label: `${m.passedQuizzesCount}/10 Passed Quizzes` };
      case 'Polymath':
        return { current: Math.min(m.completedCoursesCount, 5), max: 5, label: `${m.completedCoursesCount}/5 Courses` };
      case 'Triple Threat':
        return { current: Math.min(m.distinctCategoriesCount, 3), max: 3, label: `${m.distinctCategoriesCount}/3 Categories` };
      case 'Marathon Learner':
        const hours = Math.round((m.totalStudyMinutes / 60) * 10) / 10;
        return { current: Math.min(hours, 20), max: 20, label: `${hours}/20 Hours` };
      case 'Grandmaster':
        const unlockedCount = userAchievements.length;
        return { current: Math.min(unlockedCount, 10), max: 10, label: `${unlockedCount}/10 Badges` };
      default:
        return null;
    }
  };

  const achievementsWithProgress = allAchievements.map((a) => {
    const isEarned = !!earnedMap[a.id];
    return {
      ...a,
      earned: isEarned,
      earnedAt: earnedMap[a.id] || null,
      progress: getProgress(a.title, isEarned),
    };
  });

  return NextResponse.json({
    achievements: achievementsWithProgress,
    metrics: userMetrics,
  });
}
