import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.twoFactorEnabled) {
      return NextResponse.json({ error: 'User not found or 2FA not required.' }, { status: 400 });
    }

    // Validate OTP
    if (!user.twoFactorCode || user.twoFactorCode !== otp) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    if (!user.twoFactorExpires || new Date() > user.twoFactorExpires) {
      return NextResponse.json({ error: 'Verification code has expired. Please sign in again.' }, { status: 400 });
    }

    // OTP is valid — clear it and issue a short-lived bypass token (2 min)
    const bypassToken = `btk_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorCode: bypassToken,
        twoFactorExpires: new Date(Date.now() + 2 * 60 * 1000),
      },
    });

    return NextResponse.json({ userId: user.id, bypassToken, verified: true });
  } catch (err) {
    console.error('Google 2FA verify error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
