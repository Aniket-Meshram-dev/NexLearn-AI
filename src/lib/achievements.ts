import prisma from '@/lib/prisma';

export async function syncUserAchievements(userId: string) {
  // 1. Ensure default 20 achievements exist
  const defaultAchievements = [
    { title: 'First Spark',       description: 'Complete your very first module',                        icon: 'sparkles', category: 'learning' },
    { title: 'Quiz Initiate',     description: 'Submit your first quiz attempt',                         icon: 'file-text', category: 'quiz'     },
    { title: 'Flawless',          description: 'Score a perfect 100% on any quiz',                       icon: 'check-circle', category: 'quiz'     },
    { title: 'Course Conqueror',  description: 'Complete every module in a course',                      icon: 'trophy', category: 'course'   },
    { title: 'Blazing Streak',    description: 'Study for 3 consecutive days in a row',                  icon: 'flame', category: 'streak'   },
    { title: 'Iron Will',         description: 'Study for 7 consecutive days without a break',           icon: 'zap', category: 'streak'   },
    { title: 'Legendary Grind',   description: 'Maintain an unstoppable 30-day learning streak',         icon: 'crown', category: 'streak'   },
    { title: 'Dawn Patrol',       description: 'Complete a module before 7 AM',                          icon: 'sun', category: 'learning' },
    { title: 'Night Shift',       description: 'Complete a module after 11 PM',                          icon: 'moon', category: 'learning' },
    { title: 'Weekend Grinder',   description: 'Study on both Saturday and Sunday in the same weekend',  icon: 'calendar', category: 'streak'   },
    { title: 'Module Maniac',     description: 'Complete 5 modules in a single day',                     icon: 'rocket', category: 'learning' },
    { title: 'Knowledge Hoarder', description: 'Complete a total of 10 modules',                         icon: 'book-open', category: 'learning' },
    { title: 'Quiz Sharpshooter', description: 'Score above 90% on 5 different quizzes',                 icon: 'target', category: 'quiz'     },
    { title: 'Mid-Term Machine',  description: 'Successfully pass 10 module quizzes',                    icon: 'medal', category: 'quiz'     },
    { title: 'Lightning Thinker', description: 'Complete a quiz in under 2 minutes',                     icon: 'zap', category: 'quiz'     },
    { title: 'Comeback Kid',      description: 'Retake a quiz and score higher than your previous attempt',icon: 'refresh-cw', category: 'quiz'   },
    { title: 'Triple Threat',     description: 'Complete courses in 3 different subject categories',      icon: 'award', category: 'course'  },
    { title: 'Polymath',          description: 'Complete 5 different courses end-to-end',                 icon: 'graduation-cap', category: 'course'  },
    { title: 'Marathon Learner',  description: 'Accumulate more than 20 hours of total study time',      icon: 'clock', category: 'learning' },
    { title: 'Grandmaster',       description: 'Unlock 10 other achievements',                            icon: 'star', category: 'course'  },
  ];

  for (const data of defaultAchievements) {
    await prisma.achievement.upsert({
      where: { title: data.title },
      update: { description: data.description, category: data.category },
      create: data,
    });
  }

  const canonicalTitles = defaultAchievements.map((d) => d.title);
  const allAchievements = await prisma.achievement.findMany({
    where: { title: { in: canonicalTitles } },
    orderBy: { title: 'asc' },
  });
  const achievementMap = new Map(allAchievements.map((a) => [a.title, a.id]));

  // 2. Fetch all real database records for this user
  const [existingUserAchievements, courses, quizAttempts, studySessions] = await Promise.all([
    prisma.userAchievement.findMany({ where: { userId } }),
    prisma.course.findMany({
      where: { userId },
      include: { modules: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: { quiz: true },
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    }),
  ]);

  const earnedTitles = new Set(
    existingUserAchievements
      .map((ua) => allAchievements.find((a) => a.id === ua.achievementId)?.title)
      .filter(Boolean)
  );

  const completedModules = courses.flatMap((c) => c.modules.filter((m) => m.completed));
  const completedCourses = courses.filter((c) => c.modules.length > 0 && c.modules.every((m) => m.completed));

  // Compute resilient streak from studySessions + quizAttempts + completed modules
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeDateTimestamps = new Set<number>();
  studySessions.forEach((s) => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    activeDateTimestamps.add(d.getTime());
  });
  quizAttempts.forEach((q) => {
    const d = new Date(q.createdAt);
    d.setHours(0, 0, 0, 0);
    activeDateTimestamps.add(d.getTime());
  });
  completedModules.forEach((m) => {
    const d = new Date(m.updatedAt);
    d.setHours(0, 0, 0, 0);
    activeDateTimestamps.add(d.getTime());
  });

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (activeDateTimestamps.has(checkDate.getTime())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Evaluate conditions
  const newlyEarned: { title: string; earnedAt?: Date }[] = [];

  const check = (title: string, condition: boolean, date?: Date) => {
    if (condition && !earnedTitles.has(title)) {
      newlyEarned.push({ title, earnedAt: date || new Date() });
      earnedTitles.add(title);
    }
  };

  // 1. First Spark
  check('First Spark', completedModules.length >= 1, completedModules[0]?.updatedAt);

  // 2. Quiz Initiate
  check('Quiz Initiate', quizAttempts.length >= 1, quizAttempts[0]?.createdAt);

  // 3. Flawless
  const flawlessAttempt = quizAttempts.find((q) => q.score > 0 && q.score === q.totalQuestions);
  check('Flawless', !!flawlessAttempt, flawlessAttempt?.createdAt);

  // 4. Course Conqueror
  check('Course Conqueror', completedCourses.length >= 1, completedCourses[0]?.updatedAt);

  // 5. Blazing Streak (3 days)
  check('Blazing Streak', streak >= 3);

  // 6. Iron Will (7 days)
  check('Iron Will', streak >= 7);

  // 7. Legendary Grind (30 days)
  check('Legendary Grind', streak >= 30);

  // 8. Dawn Patrol (before 7 AM, 4 AM-7 AM)
  const dawnModule = completedModules.find((m) => {
    const h = new Date(m.updatedAt).getHours();
    return h >= 4 && h < 7;
  });
  check('Dawn Patrol', !!dawnModule, dawnModule?.updatedAt);

  // 9. Night Shift (after 11 PM or before 4 AM)
  const nightModule = completedModules.find((m) => {
    const h = new Date(m.updatedAt).getHours();
    return h >= 23 || h < 4;
  });
  check('Night Shift', !!nightModule, nightModule?.updatedAt);

  // 10. Weekend Grinder (studied on Saturday and Sunday in same weekend)
  const weekendDates = Array.from(activeDateTimestamps).map((t) => new Date(t));
  let hasWeekendPair = false;
  for (const d of weekendDates) {
    if (d.getDay() === 6) {
      const sun = new Date(d);
      sun.setDate(sun.getDate() + 1);
      if (activeDateTimestamps.has(sun.getTime())) {
        hasWeekendPair = true;
        break;
      }
    }
  }
  check('Weekend Grinder', hasWeekendPair);

  // 11. Module Maniac (5 modules completed in a single day)
  const modulesByDate: Record<string, number> = {};
  completedModules.forEach((m) => {
    const dateKey = new Date(m.updatedAt).toISOString().split('T')[0];
    modulesByDate[dateKey] = (modulesByDate[dateKey] || 0) + 1;
  });
  const has5InADay = Object.values(modulesByDate).some((count) => count >= 5);
  check('Module Maniac', has5InADay);

  // 12. Knowledge Hoarder (10 modules completed)
  check('Knowledge Hoarder', completedModules.length >= 10);

  // 13. Quiz Sharpshooter (Score >= 90% on 5 different quizzes)
  const quizHighestScore = new Map<string, number>();
  quizAttempts.forEach((q) => {
    const pct = q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0;
    const currentMax = quizHighestScore.get(q.quizId) || 0;
    if (pct > currentMax) quizHighestScore.set(q.quizId, pct);
  });
  const quizzesAbove90 = Array.from(quizHighestScore.values()).filter((p) => p >= 90).length;
  check('Quiz Sharpshooter', quizzesAbove90 >= 5);

  // 14. Mid-Term Machine (Pass 10 module quizzes, score >= 70%)
  const passedQuizzesCount = Array.from(quizHighestScore.values()).filter((p) => p >= 70).length;
  check('Mid-Term Machine', passedQuizzesCount >= 10);

  // 15. Lightning Thinker (Complete quiz in under 2 minutes with passing score >= 70%)
  const fastQuiz = quizAttempts.find(
    (q) => q.timeTaken > 0 && q.timeTaken <= 120 && q.totalQuestions > 0 && q.score / q.totalQuestions >= 0.7
  );
  check('Lightning Thinker', !!fastQuiz, fastQuiz?.createdAt);

  // 16. Comeback Kid (Retake a quiz and score higher than previous attempt)
  const attemptsByQuiz: Record<string, typeof quizAttempts> = {};
  quizAttempts.forEach((q) => {
    if (!attemptsByQuiz[q.quizId]) attemptsByQuiz[q.quizId] = [];
    attemptsByQuiz[q.quizId].push(q);
  });
  let hasComeback = false;
  for (const attempts of Object.values(attemptsByQuiz)) {
    if (attempts.length >= 2) {
      for (let i = 1; i < attempts.length; i++) {
        const prevRatio = attempts[i - 1].totalQuestions > 0 ? attempts[i - 1].score / attempts[i - 1].totalQuestions : 0;
        const currentRatio = attempts[i].totalQuestions > 0 ? attempts[i].score / attempts[i].totalQuestions : 0;
        if (currentRatio > prevRatio) {
          hasComeback = true;
          break;
        }
      }
    }
    if (hasComeback) break;
  }
  check('Comeback Kid', hasComeback);

  // 17. Triple Threat (Complete courses in 3 different subject categories)
  const completedCategories = new Set(completedCourses.map((c) => c.topic?.toLowerCase().trim()).filter(Boolean));
  check('Triple Threat', completedCategories.size >= 3);

  // 18. Polymath (Complete 5 different courses end-to-end)
  check('Polymath', completedCourses.length >= 5);

  // 19. Marathon Learner (20+ hours total study time = 1200 mins)
  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  check('Marathon Learner', totalStudyMinutes >= 1200);

  // 20. Grandmaster (Unlock 10 other achievements)
  const otherUnlocked = earnedTitles.size - (earnedTitles.has('Grandmaster') ? 1 : 0);
  check('Grandmaster', otherUnlocked >= 10);

  // Persist newly earned achievements
  for (const item of newlyEarned) {
    const achievementId = achievementMap.get(item.title);
    if (achievementId) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId,
            achievementId,
          },
        },
        update: {},
        create: {
          userId,
          achievementId,
          earnedAt: item.earnedAt || new Date(),
        },
      });
    }
  }

  // Fetch final user achievements
  const finalUserAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  });

  return {
    allAchievements,
    userAchievements: finalUserAchievements,
    streak,
    newlyEarnedCount: newlyEarned.length,
    userMetrics: {
      streak,
      completedModulesCount: completedModules.length,
      completedCoursesCount: completedCourses.length,
      quizAttemptsCount: quizAttempts.length,
      quizzesAbove90Count: quizzesAbove90,
      passedQuizzesCount: passedQuizzesCount,
      totalStudyMinutes,
      distinctCategoriesCount: completedCategories.size,
    },
  };
}
