import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let all = await prisma.achievement.findMany();

  const defaultAchievements = [
    { title: 'First Spark',       description: 'Complete your very first module',                        icon: '✨', category: 'learning' },
    { title: 'Quiz Initiate',     description: 'Submit your first quiz attempt',                         icon: '📝', category: 'quiz'     },
    { title: 'Flawless',          description: 'Score a perfect 100% on any quiz',                       icon: '💯', category: 'quiz'     },
    { title: 'Course Conqueror',  description: 'Complete every module in a course',                      icon: '🏆', category: 'course'   },
    { title: 'Blazing Streak',    description: 'Study for 3 consecutive days in a row',                  icon: '🔥', category: 'streak'   },
    { title: 'Iron Will',         description: 'Study for 7 consecutive days without a break',           icon: '⚡', category: 'streak'   },
    { title: 'Legendary Grind',   description: 'Maintain an unstoppable 30-day learning streak',         icon: '👑', category: 'streak'   },
    { title: 'Dawn Patrol',       description: 'Complete a module before 7 AM',                          icon: '🌅', category: 'learning' },
    { title: 'Night Shift',       description: 'Complete a module after 11 PM',                          icon: '🌙', category: 'learning' },
    { title: 'Weekend Grinder',   description: 'Study on both Saturday and Sunday in the same weekend',  icon: '📅', category: 'streak'   },
    { title: 'Module Maniac',     description: 'Complete 5 modules in a single day',                     icon: '🚀', category: 'learning' },
    { title: 'Knowledge Hoarder', description: 'Complete a total of 10 modules',                         icon: '📚', category: 'learning' },
    { title: 'Quiz Sharpshooter', description: 'Score above 90% on 5 different quizzes',                 icon: '🎯', category: 'quiz'     },
    { title: 'Mid-Term Machine',  description: 'Successfully pass 10 module quizzes',                    icon: '🏅', category: 'quiz'     },
    { title: 'Lightning Thinker', description: 'Complete a quiz in under 2 minutes',                     icon: '⚡', category: 'quiz'     },
    { title: 'Comeback Kid',      description: 'Retake a quiz and score higher than your previous attempt',icon: '🔄', category: 'quiz'   },
    { title: 'Triple Threat',     description: 'Complete courses in 3 different subject categories',      icon: '🎖️', category: 'course'  },
    { title: 'Polymath',          description: 'Complete 5 different courses end-to-end',                 icon: '🎓', category: 'course'  },
    { title: 'Marathon Learner',  description: 'Accumulate more than 20 hours of total study time',      icon: '⏱️', category: 'learning' },
    { title: 'Grandmaster',       description: 'Unlock 10 other achievements',                            icon: '🌟', category: 'course'  },
  ];
  for (const data of defaultAchievements) {
    await prisma.achievement.upsert({
      where: { title: data.title },
      update: { description: data.description, icon: data.icon, category: data.category },
      create: data
    });
  }
  all = await prisma.achievement.findMany();

  const earned = await prisma.userAchievement.findMany({ where: { userId: session.user.id }, select: { achievementId: true, earnedAt: true } });
  const earnedMap = Object.fromEntries(earned.map(e => [e.achievementId, e.earnedAt]));
  return NextResponse.json({
    achievements: all.map(a => ({ ...a, earned: !!earnedMap[a.id], earnedAt: earnedMap[a.id] || null })),
  });
}
