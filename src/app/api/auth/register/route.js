import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendVerificationEmail, sendWelcomeEmail, sendNotificationEmail } from '@/lib/mailer';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { name, email, password, learningGoal } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

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
      { title: 'First Steps', description: 'Complete your first module', icon: '🎯', category: 'learning' },
      { title: 'Quiz Rookie', description: 'Complete your first quiz', icon: '📝', category: 'quiz' },
      { title: 'Perfect Score', description: 'Score 100% on a quiz', icon: '💯', category: 'quiz' },
      { title: '5-Day Streak', description: 'Study for 5 consecutive days', icon: '🔥', category: 'streak' },
      { title: '10-Day Streak', description: 'Study for 10 consecutive days', icon: '⚡', category: 'streak' },
      { title: 'Course Champion', description: 'Complete an entire course', icon: '🏆', category: 'course' },
      { title: 'Bookworm', description: 'Study for 10+ hours total', icon: '📚', category: 'learning' },
      { title: 'High Achiever', description: 'Score above 80% on 5 quizzes', icon: '⭐', category: 'quiz' },
      { title: 'Early Bird', description: 'Complete a module before 8 AM', icon: '🌅', category: 'learning' },
      { title: 'Night Owl', description: 'Complete a module after 10 PM', icon: '🦉', category: 'learning' },
      { title: 'Weekend Warrior', description: 'Study on a Saturday or Sunday', icon: '📅', category: 'streak' },
      { title: 'Speed Reader', description: 'Finish a module in under 5 minutes', icon: '⚡', category: 'learning' },
      { title: 'Deep Thinker', description: 'Spend over 15 minutes on a single quiz', icon: '🧠', category: 'quiz' },
      { title: 'Flawless Victory', description: 'Perfect score on 5 consecutive quizzes', icon: '👑', category: 'quiz' },
      { title: 'Master of Basics', description: 'Complete 3 beginner level courses', icon: '🌱', category: 'course' },
      { title: 'Advanced Scholar', description: 'Complete 3 advanced level courses', icon: '🎓', category: 'course' },
      { title: '30-Day Legend', description: 'Maintain a 30-day learning streak', icon: '🔥', category: 'streak' },
      { title: 'Quiz Master', description: 'Pass 20 individual module quizzes', icon: '🏅', category: 'quiz' },
      { title: 'Polyglot', description: 'Complete courses on 3 different programming languages', icon: '💻', category: 'course' },
      { title: 'Fast Learner', description: 'Complete an entire course within 24 hours', icon: '🚀', category: 'learning' },
    ];

    for (const achievement of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { title: achievement.title },
        update: {},
        create: achievement,
      });
    }

    // Generate a temporary bypass token for automatic login (skip verify)
    const bypassToken = `vtk_${Math.random().toString(36).substring(2, 15)}`;
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
