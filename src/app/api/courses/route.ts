import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateCourse, enrichModuleNotes } from '@/lib/gemini';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { topic, level, goal, hoursPerDay, duration, preGeneratedCourse } = body;

    let courseData = preGeneratedCourse;

    if (!courseData) {
      if (!topic || !level || !goal) {
        return NextResponse.json({ error: 'Topic, level, and goal are required' }, { status: 400 });
      }
      // Generate course with AI if not pre-generated
      courseData = await generateCourse(topic, level, goal, hoursPerDay || 1, duration || '4 weeks');
    }

    // Save to database
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        topic, level, goal,
        hoursPerDay: hoursPerDay || 1,
        duration: duration || '4 weeks',
        enrolled: body.enrolled !== undefined ? Boolean(body.enrolled) : false,
        roadmap: typeof courseData.roadmap === 'string' ? courseData.roadmap : JSON.stringify(courseData.roadmap),
        userId: session.user.id,
        modules: {
          create: courseData.modules.map((mod, index) => {
            const toStr = (val) => {
              if (val === null || val === undefined) return '';
              if (typeof val === 'string') return val;
              if (Array.isArray(val)) return val.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('\n');
              if (typeof val === 'object') return JSON.stringify(val);
              return String(val);
            };
            return {
              title: mod.title || 'Untitled Module',
              description: mod.description || '',
              difficulty: mod.difficulty || 'Medium',
              subtopics: toStr(mod.subtopics),
              notes: toStr(mod.notes),
              examples: toStr(mod.examples),
              summary: toStr(mod.summary),
              exercises: toStr(mod.exercises),
              orderIndex: index,
            };
          }),
        },
      },
      include: { modules: true },
    });

    // Non-blocking background pre-enrichment for Module 1 so saving is instantaneous (<200ms)
    const firstModule = course.modules?.[0];
    if (firstModule) {
      const wCount = (firstModule.notes || '').split(/\s+/).filter(Boolean).length;
      if (wCount < 550 || !firstModule.notes?.includes('---page---')) {
        // Fire-and-forget: do not await so HTTP response returns immediately
        enrichModuleNotes(
          topic,
          level,
          firstModule.title,
          firstModule.subtopics || '',
          firstModule.notes || ''
        ).then(async (enriched) => {
          if (enriched?.notes) {
            await prisma.module.update({
              where: { id: firstModule.id },
              data: {
                notes: enriched.notes,
                ...(enriched.exercises ? { exercises: enriched.exercises } : {}),
                ...(enriched.examples ? { examples: enriched.examples } : {}),
                ...(enriched.summary ? { summary: enriched.summary } : {}),
              },
            });
          }
        }).catch((enrichErr) => {
          console.warn('Initial module 1 background auto-enrichment fallback:', enrichErr?.message || enrichErr);
        });
      }
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Course Created!',
        message: `Your course "${courseData.title}" has been generated with ${courseData.modules.length} modules.`,
        type: 'success',
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Course generation error:', error?.message, error?.stack);
    // Also log if it's a Prisma error
    if (error?.code) console.error('Prisma error code:', error.code, error?.meta);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate course',
      details: process.env.NODE_ENV === 'development' ? (error?.meta || error?.stack?.substring(0, 500)) : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    include: { modules: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ courses });
}
