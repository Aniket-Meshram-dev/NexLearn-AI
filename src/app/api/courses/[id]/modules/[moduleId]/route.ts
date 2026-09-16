import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { enrichModuleNotes, expandModuleSections } from '@/lib/gemini';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  let module = await prisma.module.findFirst({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    include: { 
      course: { select: { title: true, level: true, topic: true } },
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

  // Auto-enrich on load if module notes or sections are thin
  const currentNotes = module.notes || '';
  const totalWords = currentNotes.split(/\s+/).filter(Boolean).length;
  const hasPageBreak = currentNotes.includes('---page---');
  const examplesWords = (module.examples || '').split(/\s+/).filter(Boolean).length;
  const summaryWords = (module.summary || '').split(/\s+/).filter(Boolean).length;

  const topic = module.course?.topic || module.course?.title || 'General Subject';
  const level = module.course?.level || module.difficulty || 'Intermediate';

  // If notes are thin, enrich everything (notes, exercises, examples, summary)
  if (totalWords < 550 || !hasPageBreak) {
    enrichModuleNotes(
      topic,
      level,
      module.title,
      module.subtopics || '',
      module.notes || ''
    ).then(async (enriched) => {
      if (enriched?.notes && enriched.notes.trim().length > 100) {
        await prisma.module.update({
          where: { id: moduleId },
          data: {
            notes: enriched.notes,
            ...(enriched.exercises ? { exercises: enriched.exercises } : {}),
            ...(enriched.examples ? { examples: enriched.examples } : {}),
            ...(enriched.summary ? { summary: enriched.summary } : {}),
          },
        });
      }
    }).catch((autoEnrichErr) => {
      console.warn('Auto-enrichment on GET module fallback:', autoEnrichErr?.message || autoEnrichErr);
    });
  } else if (examplesWords < 50 || summaryWords < 50) {
    // Notes are healthy (>= 550 words), but examples or summary are thin 1-liners: expand sections in background
    expandModuleSections(
      topic,
      level,
      module.title,
      module.subtopics || '',
      module.notes || ''
    ).then(async (sections) => {
      if (sections?.examples || sections?.summary) {
        await prisma.module.update({
          where: { id: moduleId },
          data: {
            ...(sections.examples ? { examples: sections.examples } : {}),
            ...(sections.summary ? { summary: sections.summary } : {}),
          },
        });
      }
    }).catch((sectionErr) => {
      console.warn('Section expansion on GET module fallback:', sectionErr?.message || sectionErr);
    });
  }

  return NextResponse.json({ module });
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  const { completed } = await request.json();

  const updateResult = await prisma.module.updateMany({
    where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    data: { completed },
  });

  if (updateResult.count === 0) {
    return NextResponse.json({ error: 'Module not found or unauthorized' }, { status: 404 });
  }

  // Check if all modules in course are completed
  const unlockedAchievements = [];
  const course = await prisma.course.findUnique({
    where: { id, userId: session.user.id },
    include: { modules: true },
  });

  if (course && course.modules.every(m => m.completed || (m.id === moduleId && completed))) {
    if (!course.completed) {
      await prisma.course.update({ where: { id, userId: session.user.id }, data: { completed: true } });
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

  return NextResponse.json({ success: true, unlockedAchievements });
}
