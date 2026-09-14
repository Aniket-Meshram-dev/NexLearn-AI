import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { otp } = await request.json();

    if (!otp || otp.trim().length !== 6) {
      return NextResponse.json({ error: 'A valid 6-digit code is required.' }, { status: 400 });
    }

    // Find valid, unused OTP records for this user's email that match the code
    // Format stored is "123456|new@email.com" so we search by prefix
    const records = await prisma.passwordResetToken.findMany({
      where: {
        email: session.user.email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Find the one whose OTP prefix matches
    const record = records.find(r => r.otp.startsWith(`${otp.trim()}|`));

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired authorization code.' }, { status: 400 });
    }

    // Decode the newEmail from the stored value
    const newEmail = record.otp.split('|').slice(1).join('|'); // handles emails with '|' safely

    if (!newEmail) {
      return NextResponse.json({ error: 'Could not determine new email. Please restart the process.' }, { status: 400 });
    }

    // Mark OTP as used immediately
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    // Final check: ensure new email is still available
    const taken = await prisma.user.findUnique({ where: { email: newEmail } });
    if (taken) {
      return NextResponse.json({ error: 'This email was taken by another account during verification.' }, { status: 400 });
    }

    // Update user email
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: newEmail },
    });

    // Audit notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: '🔐 Account Security Alert',
        message: `Your primary email was successfully changed to ${newEmail}.`,
        type: 'info',
      },
    });

    return NextResponse.json({ message: 'Email address successfully updated.', newEmail });
  } catch (error) {
    console.error('Email verify-change error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
