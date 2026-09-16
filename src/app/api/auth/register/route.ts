import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/mailer';
import crypto from 'crypto';
import { registerSchema, parseBody } from '@/lib/validators';

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const learningGoal = typeof body.learningGoal === 'string' ? body.learningGoal.trim().slice(0, 500) : null;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        learningGoal: learningGoal || null,
        isVerified: false,
        twoFactorCode: otp,
        twoFactorExpires: otpExpires,
      },
    });

    // Seed default achievements
    const defaultAchievements = [
      { title: 'First Steps', description: 'Complete your first module', icon: 'target', category: 'learning' },
      { title: 'Quiz Rookie', description: 'Complete your first quiz', icon: 'file-text', category: 'quiz' },
      { title: 'Perfect Score', description: 'Score 100% on a quiz', icon: 'check-circle', category: 'quiz' },
      { title: '5-Day Streak', description: 'Study for 5 consecutive days', icon: 'flame', category: 'streak' },
      { title: '10-Day Streak', description: 'Study for 10 consecutive days', icon: 'zap', category: 'streak' },
      { title: 'Course Champion', description: 'Complete an entire course', icon: 'trophy', category: 'course' },
      { title: 'Bookworm', description: 'Study for 10+ hours total', icon: 'book-open', category: 'learning' },
      { title: 'High Achiever', description: 'Score above 80% on 5 quizzes', icon: 'star', category: 'quiz' },
      { title: 'Early Bird', description: 'Complete a module before 8 AM', icon: 'sun', category: 'learning' },
      { title: 'Night Owl', description: 'Complete a module after 10 PM', icon: 'moon', category: 'learning' },
      { title: 'Weekend Warrior', description: 'Study on a Saturday or Sunday', icon: 'calendar', category: 'streak' },
      { title: 'Speed Reader', description: 'Finish a module in under 5 minutes', icon: 'zap', category: 'learning' },
      { title: 'Deep Thinker', description: 'Spend over 15 minutes on a single quiz', icon: 'brain', category: 'quiz' },
      { title: 'Flawless Victory', description: 'Perfect score on 5 consecutive quizzes', icon: 'crown', category: 'quiz' },
      { title: 'Master of Basics', description: 'Complete 3 beginner level courses', icon: 'sprout', category: 'course' },
      { title: 'Advanced Scholar', description: 'Complete 3 advanced level courses', icon: 'graduation-cap', category: 'course' },
      { title: '30-Day Legend', description: 'Maintain a 30-day learning streak', icon: 'flame', category: 'streak' },
      { title: 'Quiz Master', description: 'Pass 20 individual module quizzes', icon: 'medal', category: 'quiz' },
      { title: 'Polyglot', description: 'Complete courses on 3 different programming languages', icon: 'terminal', category: 'course' },
      { title: 'Fast Learner', description: 'Complete an entire course within 24 hours', icon: 'rocket', category: 'learning' },
    ];

    for (const achievement of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { title: achievement.title },
        update: {},
        create: achievement,
      });
    }

    // Generate a temporary bypass token for automatic login (skip verify)
    const bypassToken = `vtk_${crypto.randomBytes(16).toString('hex')}`;
    const bypassExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorCode: otp,
        twoFactorSecret: bypassToken, 
        twoFactorExpires: bypassExpires 
      }
    });

    // Send verification email & Welcome email
    (async () => {
      try {
        await sendVerificationEmail(email, otp);
        await sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Failed to send onboarding emails:', emailError);
      }
    })();

    return NextResponse.json(
      { 
        message: 'Account created successfully. Please verify your email.', 
        userId: user.id, 
        email: user.email,
        bypassToken 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
