import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify OTP
    if (user.twoFactorCode !== otp || !user.twoFactorExpires || new Date() > user.twoFactorExpires) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Update isVerified status
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    // Generate a temporary bypass token for automatic login
    const crypto = await import('crypto');
    const bypassToken = `vtk_${crypto.randomBytes(16).toString('hex')}`;
    const bypassExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorCode: null,
        twoFactorSecret: bypassToken, 
        twoFactorExpires: bypassExpires 
      }
    });

    return NextResponse.json({ 
      message: 'Email verified successfully', 
      userId: user.id, 
      bypassToken 
    });
  } catch (error) {
    console.error('Verify account error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
