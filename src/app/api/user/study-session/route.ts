import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const durationToAdd = Math.max(1, Math.min(120, Number(body.duration) || 1));

    // Consolidate recent session if active within last 15 minutes
    const recentSession = await prisma.studySession.findFirst({
      where: {
        userId: session.user.id,
        date: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      orderBy: { date: 'desc' },
    });

    if (recentSession) {
      await prisma.studySession.update({
        where: { id: recentSession.id },
        data: {
          duration: recentSession.duration + durationToAdd,
          date: new Date(),
        },
      });
    } else {
      await prisma.studySession.create({
        data: {
          userId: session.user.id,
          duration: durationToAdd,
          date: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Study session log error:', err);
    return NextResponse.json({ error: 'Failed to record study session' }, { status: 500 });
  }
}
