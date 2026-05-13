import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/mailer';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    include: { 
      course: { select: { title: true } },
      quiz: { include: { questions: true, attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 } } } 
    },
  });

  if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

  // Enforce sequential progression
  const courseModules = await prisma.module.findMany({
    where: { courseId: id },
    orderBy: { orderIndex: 'asc' },
    select: { id: true, completed: true }
  });

  const currentIndex = courseModules.findIndex(m => m.id === moduleId);
  if (currentIndex > 0 && !courseModules[currentIndex - 1].completed) {
    return NextResponse.json({ error: 'Locked. Please complete the previous module first.', isLocked: true }, { status: 403 });
  }

  return NextResponse.json({ module });
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const { completed } = await request.json();

  const module = await prisma.module.updateMany({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    data: { completed },
  });

  // Check if all modules in course are completed
  const unlockedAchievements = [];
  const course = await prisma.course.findUnique({
    where: { id },
    include: { modules: true },
  });

  if (course && course.modules.every(m => m.completed || (m.id === moduleId && completed))) {
    if (!course.completed) {
      await prisma.course.update({ where: { id }, data: { completed: true } });
    }
  }

  // Award first module achievement
  if (completed) {
    const achievement = await prisma.achievement.findUnique({ where: { title: 'First Spark' } });
    if (achievement) {
      const existing = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId: session.user.id, achievementId: achievement.id } }
      });
      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId: session.user.id, achievementId: achievement.id },
        });
        const notif = await prisma.notification.create({
          data: {
            userId: session.user.id,
            title: '✨ Achievement Unlocked: First Spark!',
            message: 'You completed your very first module — the spark has been lit. Keep going!',
            type: 'success'
          }
        });
        unlockedAchievements.push(notif);
      }
    }
  }

  // Trigger emails for unlocked achievements
  if (unlockedAchievements.length > 0) {
    (async () => {
      try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, name: true } });
        if (user && user.email) {
          for (const notif of unlockedAchievements) {
            await sendNotificationEmail(user.email, notif.title, notif.message, user.name || 'Scholar');
          }
        }
      } catch (err) {
        console.error('Achievement email failed:', err);
      }
    })();
  }

  return NextResponse.json({ success: true, unlockedAchievements });
}
