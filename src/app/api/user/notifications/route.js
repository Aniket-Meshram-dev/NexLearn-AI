import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let notifications = await prisma.notification.findMany({
    where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50,
  });

  // Seed mock notifications for testing if empty
  if (notifications.length === 0) {
    const mockData = [
      {
        title: 'Weekly Progress Report',
        message: 'Your weekly study report is ready! You studied for 4.5 hours this week and completed 12 modules. Keep it up!',
        type: 'info'
      },
      {
        title: 'New Achievement Alert!',
        message: 'You have earned the "Quick Learner" achievement for completing 5 modules in one day.',
        type: 'success'
      },
      {
        title: 'System Update',
        message: 'We have updated the AI Course Generator for better accuracy. Try generating a new course today!',
        type: 'info'
      }
    ];

    for (const data of mockData) {
      await prisma.notification.create({
        data: { ...data, userId: session.user.id }
      });
    }

    notifications = await prisma.notification.findMany({
      where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50,
    });
  }

  return NextResponse.json({ notifications });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, readAll } = await request.json();
  if (readAll) {
    await prisma.notification.updateMany({ where: { userId: session.user.id }, data: { read: true } });
  } else if (id) {
    await prisma.notification.update({ where: { id }, data: { read: true } });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const deleteAll = url.searchParams.get('deleteAll') === 'true';

  if (deleteAll) {
    await prisma.notification.deleteMany({ where: { userId: session.user.id } });
  } else if (id) {
    await prisma.notification.delete({ where: { id, userId: session.user.id } });
  }

  return NextResponse.json({ success: true });
}
