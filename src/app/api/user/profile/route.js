import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id }, 
    select: { 
      id: true, name: true, email: true, learningGoal: true, avatar: true, 
      createdAt: true, twoFactorEnabled: true,
      dob: true, gender: true, bio: true, country: true, state: true, city: true, educationLevel: true
    } 
  });
  // Also query achievements the user has unlocked!
  const unlockedAchievements = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
  });

  const courseCount = await prisma.course.count({ where: { userId: session.user.id } });
  
  // Only consider courses completely finished if all modules and quizzes are done
  const candidateCourses = await prisma.course.findMany({ 
    where: { userId: session.user.id, completed: true }, 
    include: { 
      modules: { 
        include: { 
          quiz: { include: { attempts: { where: { userId: session.user.id }, take: 1 } } } 
        } 
      } 
    } 
  });

  const completedCoursesList = [];
  candidateCourses.forEach(course => {
    let allQuizzesTaken = true;
    course.modules.forEach(m => {
      if (!m.quiz || m.quiz.attempts.length === 0) {
        allQuizzesTaken = false;
      }
    });

    if (allQuizzesTaken) {
      completedCoursesList.push({ id: course.id, title: course.title });
    }
  });

  const completedCourses = completedCoursesList.length;

  // Real Skill Breakdown for Radar Chart
  const categories = { Frontend: 0, AI: 0, Backend: 0, Design: 0, Science: 0 };
  const allCourses = await prisma.course.findMany({ where: { userId: session.user.id }, select: { title: true } });
  allCourses.forEach(c => {
    const t = c.title.toLowerCase();
    if (t.includes('react') || t.includes('css') || t.includes('html') || t.includes('frontend')) categories.Frontend++;
    else if (t.includes('ai') || t.includes('model') || t.includes('intelligence') || t.includes('generative')) categories.AI++;
    else if (t.includes('node') || t.includes('sql') || t.includes('backend') || t.includes('express')) categories.Backend++;
    else if (t.includes('ui') || t.includes('ux') || t.includes('design') || t.includes('figma')) categories.Design++;
    else categories.Science++;
  });

  // Real Recent Activity for Timeline
  const recentActivities = [];
  const courses = await prisma.course.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 3 });
  courses.forEach(c => recentActivities.push({ title: `Started ${c.title}`, date: c.createdAt, icon: '📚' }));
  unlockedAchievements.slice(0, 3).forEach(ua => recentActivities.push({ title: `Earned: ${ua.achievement.title}`, date: ua.earnedAt, icon: ua.achievement.icon }));

  return NextResponse.json({ 
    user, courseCount, completedCourses, completedCoursesList, unlockedAchievements, 
    skillStats: categories,
    recentActivity: recentActivities.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 4)
  });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, learningGoal, avatar, dob, gender, bio, country, state, city, educationLevel } = await request.json();
  const data = { name, learningGoal, gender, bio, country, state, city, educationLevel };
  if (dob) {
    data.dob = new Date(dob);
  }
  if (avatar !== undefined) data.avatar = avatar;
  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ user });
}
