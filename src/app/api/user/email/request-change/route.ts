import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmailChangeAuthEmail } from '@/lib/mailer';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { newEmail } = await request.json();

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (newEmail.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json({ error: 'The new email is the same as your current email.' }, { status: 400 });
    }

    // Block Google-only users (no password set)
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
    if (!user?.password) {
      return NextResponse.json({ error: 'Email changes are not available for Google sign-in accounts.' }, { status: 403 });
    }

    // Check if new email is already taken
    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      return NextResponse.json({ error: 'This email address is already in use by another account.' }, { status: 400 });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate any existing unused OTPs for this user
    await prisma.passwordResetToken.updateMany({
      where: { email: session.user.email, used: false },
      data: { used: true },
    });

    // Store OTP with newEmail encoded: "123456|new@email.com"
    const encodedOtp = `${otp}|${newEmail}`;

    await prisma.passwordResetToken.create({
      data: {
        email: session.user.email,
        otp: encodedOtp,
        expiresAt,
      },
    });

    await sendEmailChangeAuthEmail(session.user.email, otp, newEmail);

    return NextResponse.json({ message: 'A 6-digit authorization code has been sent to your current email address.' });
  } catch (error) {
    console.error('Email change request error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
