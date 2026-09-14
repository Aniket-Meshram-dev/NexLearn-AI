import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { duration } = await request.json();
  await prisma.studySession.create({ data: { userId: session.user.id, duration: duration || 1 } });
  return NextResponse.json({ success: true });
}
