import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { settings: true }
    });

    const defaultSettings = { 
      theme: 'system', 
      notifications: { email: true, push: true, weekly: true, achievements: true } 
    };
    
    let settings = defaultSettings;
    if (user?.settings) {
      try {
        settings = JSON.parse(user.settings);
      } catch (e) {
        settings = defaultSettings;
      }
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const newSettings = await request.json();
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { settings: JSON.stringify(newSettings) }
    });

    return NextResponse.json({ message: 'Settings saved successfully', settings: newSettings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
