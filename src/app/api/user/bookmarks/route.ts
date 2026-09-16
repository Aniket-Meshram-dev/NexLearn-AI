import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: { module: { include: { course: { select: { id: true, title: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ bookmarks });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { moduleId } = await request.json();
  const bookmark = await prisma.bookmark.upsert({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
    update: {},
    create: { userId: session.user.id, moduleId },
  });
  return NextResponse.json({ bookmark }, { status: 201 });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { moduleId } = await request.json();
  await prisma.bookmark.deleteMany({ where: { userId: session.user.id, moduleId } });
  return NextResponse.json({ success: true });
}
