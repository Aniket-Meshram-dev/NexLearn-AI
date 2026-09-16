import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface DayActivityData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  studyMinutes: number;
  sessionsCount: number;
  quizzesCount: number;
  flashcardsCount: number;
  achievementsCount: number;
  coursesCount: number;
  details: string[];
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const requestedYear = searchParams.get('year') || 'current';

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const userCreatedYear = user ? new Date(user.createdAt).getFullYear() : currentYear;

    const availableYears: string[] = ['current'];
    for (let y = currentYear; y >= userCreatedYear; y--) {
      availableYears.push(String(y));
    }

    let startDate: Date;
    let endDate: Date;

    if (requestedYear === 'current') {
      // Rolling 365 days (52 weeks + remainder)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 364);
      startDate.setHours(0, 0, 0, 0);
    } else {
      const yearNum = parseInt(requestedYear, 10);
      if (isNaN(yearNum)) {
        return NextResponse.json({ error: 'Invalid year specified' }, { status: 400 });
      }
      startDate = new Date(yearNum, 0, 1, 0, 0, 0, 0);
      endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    }

    // Fetch activities in parallel
    const [sessions, quizzes, flashcards, achievements, courses] = await Promise.all([
      prisma.studySession.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        select: { id: true, duration: true, date: true },
      }),
      prisma.quizAttempt.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          score: true,
          totalQuestions: true,
          createdAt: true,
          quiz: {
            select: {
              module: { select: { title: true } },
            },
          },
        },
      }),
      prisma.flashcardReview.findMany({
        where: {
          userId,
          lastReviewed: { gte: startDate, lte: endDate },
        },
        select: { id: true, lastReviewed: true },
      }),
      prisma.userAchievement.findMany({
        where: {
          userId,
          earnedAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          earnedAt: true,
          achievement: { select: { title: true, icon: true } },
        },
      }),
      prisma.course.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    // Map container for date aggregations
    const activityMap: Record<
      string,
      {
        date: string;
        count: number;
        studyMinutes: number;
        sessionsCount: number;
        quizzesCount: number;
        quizScores: number[];
        flashcardsCount: number;
        achievementsCount: number;
        achievementTitles: string[];
        coursesCount: number;
        courseTitles: string[];
      }
    > = {};

    const getOrInitDay = (dateStr: string) => {
      if (!activityMap[dateStr]) {
        activityMap[dateStr] = {
          date: dateStr,
          count: 0,
          studyMinutes: 0,
          sessionsCount: 0,
          quizzesCount: 0,
          quizScores: [],
          flashcardsCount: 0,
          achievementsCount: 0,
          achievementTitles: [],
          coursesCount: 0,
          courseTitles: [],
        };
      }
      return activityMap[dateStr];
    };

    const formatDateKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 1. Ingest Study Sessions
    sessions.forEach((s) => {
      const key = formatDateKey(new Date(s.date));
      const day = getOrInitDay(key);
      day.studyMinutes += s.duration || 0;
      day.sessionsCount += 1;
      day.count += 1;
    });

    // 2. Ingest Quiz Attempts
    quizzes.forEach((q) => {
      const key = formatDateKey(new Date(q.createdAt));
      const day = getOrInitDay(key);
      day.quizzesCount += 1;
      day.count += 2;
      if (q.totalQuestions > 0) {
        day.quizScores.push(Math.round((q.score / q.totalQuestions) * 100));
      }
    });

    // 3. Ingest Flashcard Reviews
    flashcards.forEach((f) => {
      const key = formatDateKey(new Date(f.lastReviewed));
      const day = getOrInitDay(key);
      day.flashcardsCount += 1;
      day.count += 1;
    });

    // 4. Ingest Unlocked Achievements
    achievements.forEach((a) => {
      const key = formatDateKey(new Date(a.earnedAt));
      const day = getOrInitDay(key);
      day.achievementsCount += 1;
      day.count += 3;
      if (a.achievement?.title) {
        day.achievementTitles.push(a.achievement.title);
      }
    });

    // 5. Ingest Courses
    courses.forEach((c) => {
      const key = formatDateKey(new Date(c.createdAt));
      const day = getOrInitDay(key);
      day.coursesCount += 1;
      day.count += 2;
      if (c.title) {
        day.courseTitles.push(c.title);
      }
    });

    // Finalize Day Activity format with details & level
    const days: Record<string, DayActivityData> = {};
    let totalContributions = 0;
    let activeDaysCount = 0;
    let peakDay = { date: '', count: 0 };

    Object.entries(activityMap).forEach(([dateStr, raw]) => {
      totalContributions += raw.count;
      if (raw.count > 0) {
        activeDaysCount++;
        if (raw.count > peakDay.count) {
          peakDay = { date: dateStr, count: raw.count };
        }
      }

      // Compute level
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (raw.count >= 10) level = 4;
      else if (raw.count >= 6) level = 3;
      else if (raw.count >= 3) level = 2;
      else if (raw.count >= 1) level = 1;

      // Construct friendly details list
      const details: string[] = [];
      if (raw.studyMinutes > 0) {
        details.push(
          `⏱️ ${raw.studyMinutes}m study session${raw.sessionsCount > 1 ? `s (${raw.sessionsCount})` : ''}`
        );
      }
      if (raw.quizzesCount > 0) {
        const avg =
          raw.quizScores.length > 0
            ? Math.round(raw.quizScores.reduce((a, b) => a + b, 0) / raw.quizScores.length)
            : 0;
        details.push(
          `${raw.quizzesCount} quiz${raw.quizzesCount > 1 ? 'zes' : ''} completed${avg ? ` (avg ${avg}%)` : ''}`
        );
      }
      if (raw.flashcardsCount > 0) {
        details.push(`${raw.flashcardsCount} flashcard review${raw.flashcardsCount > 1 ? 's' : ''}`);
      }
      if (raw.achievementsCount > 0) {
        details.push(`Unlocked ${raw.achievementTitles.join(', ')}`);
      }
      if (raw.coursesCount > 0) {
        details.push(`Enrolled in ${raw.courseTitles.join(', ')}`);
      }

      days[dateStr] = {
        date: dateStr,
        count: raw.count,
        level,
        studyMinutes: raw.studyMinutes,
        sessionsCount: raw.sessionsCount,
        quizzesCount: raw.quizzesCount,
        flashcardsCount: raw.flashcardsCount,
        achievementsCount: raw.achievementsCount,
        coursesCount: raw.coursesCount,
        details,
      };
    });

    // Calculate streaks across full chronological dataset
    const activeDatesSet = new Set(
      Object.keys(days).filter((d) => days[d].count > 0)
    );

    // 1. Current Streak
    const todayKey = formatDateKey(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    let currentStreak = 0;
    let checkDate = new Date(now);

    // If today is active, start from today. If not, start from yesterday if active
    if (!activeDatesSet.has(todayKey) && activeDatesSet.has(yesterdayKey)) {
      checkDate = yesterday;
    }

    while (activeDatesSet.has(formatDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 2. Longest Streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = Array.from(activeDatesSet).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    return NextResponse.json({
      success: true,
      requestedYear,
      availableYears,
      startDate: formatDateKey(startDate),
      endDate: formatDateKey(endDate),
      totalContributions,
      activeDaysCount,
      currentStreak,
      longestStreak,
      peakDay,
      days,
    });
  } catch (error: any) {
    console.error('Activity calendar fetch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch contribution data' },
      { status: 500 }
    );
  }
}
