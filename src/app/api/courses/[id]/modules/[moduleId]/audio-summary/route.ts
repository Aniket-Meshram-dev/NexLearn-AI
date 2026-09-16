import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateAudioBriefing, MentorPersonaId, MENTOR_PERSONAS } from '@/lib/audio-script';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, moduleId } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const rawPersona = body?.persona as string;
    const persona: MentorPersonaId =
      rawPersona && MENTOR_PERSONAS[rawPersona as MentorPersonaId]
        ? (rawPersona as MentorPersonaId)
        : 'elena';

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId: id,
      },
      include: {
        course: {
          select: {
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Ensure user has access (course owner)
    if (module.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!module.notes && !module.summary) {
      return NextResponse.json(
        { error: 'Module notes missing, cannot generate audio briefing.' },
        { status: 400 }
      );
    }

    const briefing = await generateAudioBriefing(
      module.title,
      module.course.title,
      module.notes || '',
      module.summary || '',
      persona
    );

    return NextResponse.json({
      success: true,
      briefing,
      persona: MENTOR_PERSONAS[persona],
    });
  } catch (error: any) {
    console.error('Audio briefing generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate audio briefing' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, moduleId } = await params;
  const { searchParams } = new URL(request.url);
  const rawPersona = searchParams.get('persona') || 'elena';
  const persona: MentorPersonaId =
    rawPersona && MENTOR_PERSONAS[rawPersona as MentorPersonaId]
      ? (rawPersona as MentorPersonaId)
      : 'elena';

  try {
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId: id,
      },
      include: {
        course: {
          select: {
            title: true,
            userId: true,
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (module.course.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const briefing = await generateAudioBriefing(
      module.title,
      module.course.title,
      module.notes || '',
      module.summary || '',
      persona
    );

    return NextResponse.json({
      success: true,
      briefing,
      persona: MENTOR_PERSONAS[persona],
    });
  } catch (error: any) {
    console.error('Audio briefing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio briefing' },
      { status: 500 }
    );
  }
}
