import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { enrichModuleNotes, expandModuleSections } from '@/lib/gemini';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, moduleId } = await params;
    const body = await request.json().catch(() => ({}));
    const expandSectionsOnly = Boolean(body?.expandSectionsOnly);

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId: id,
        course: { userId: session.user.id },
      },
      include: {
        course: { select: { title: true, level: true, topic: true } },
      },
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const topic = module.course?.topic || module.course?.title || 'General Subject';
    const level = module.course?.level || module.difficulty || 'Intermediate';

    let updateData: Record<string, string> = {};

    if (expandSectionsOnly) {
      const sections = await expandModuleSections(
        topic,
        level,
        module.title,
        module.subtopics || '',
        module.notes || ''
      );
      updateData = {
        examples: sections.examples,
        summary: sections.summary,
      };
    } else {
      const enriched = await enrichModuleNotes(
        topic,
        level,
        module.title,
        module.subtopics || '',
        module.notes || ''
      );
      updateData = {
        notes: enriched.notes,
        ...(enriched.exercises ? { exercises: enriched.exercises } : {}),
        ...(enriched.examples ? { examples: enriched.examples } : {}),
        ...(enriched.summary ? { summary: enriched.summary } : {}),
      };
    }

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: updateData,
      include: {
        course: { select: { title: true, level: true, topic: true } },
        quiz: { include: { questions: true, attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 } } },
      },
    });

    return NextResponse.json({
      success: true,
      message: expandSectionsOnly ? 'Module examples and summary expanded successfully' : 'Module notes enriched successfully',
      module: updatedModule,
    });
  } catch (err: any) {
    console.error('Module enrichment failed:', err?.message || err);
    return NextResponse.json(
      { error: err?.message || 'Failed to enrich module notes' },
      { status: 500 }
    );
  }
}
