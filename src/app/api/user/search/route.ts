import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { searchSchema, parseBody } from '@/lib/validators';

const STATIC_ACTIONS = [
  { id: 'dash', title: 'Dashboard', subtitle: 'View learning progress & active courses', href: '/dashboard', type: 'navigation', icon: 'LayoutDashboard' },
  { id: 'gen', title: 'Generate Course', subtitle: 'Create an AI-customized learning curriculum', href: '/generate', type: 'action', icon: 'Sparkles' },
  { id: 'flash', title: 'Spaced Repetition Flashcards', subtitle: 'Review cards due today & memory retention', href: '/flashcards', type: 'navigation', icon: 'Layers' },
  { id: 'disc', title: 'Discover Courses', subtitle: 'Explore trending technologies & study paths', href: '/discover', type: 'navigation', icon: 'Compass' },
  { id: 'rep', title: 'Analytics & Reports', subtitle: 'Inspect quiz accuracy & study hours', href: '/reports', type: 'navigation', icon: 'BarChart3' },
  { id: 'book', title: 'Bookmarks', subtitle: 'Quick access to saved learning modules', href: '/bookmarks', type: 'navigation', icon: 'Bookmark' },
  { id: 'ach', title: 'Achievements', subtitle: 'View your badges & study milestones', href: '/achievements', type: 'navigation', icon: 'Trophy' },
  { id: 'prof', title: 'Profile', subtitle: 'Learner profile & personal details', href: '/profile', type: 'navigation', icon: 'User' },
  { id: 'sett', title: 'Settings', subtitle: 'Account security, 2FA, & preferences', href: '/settings', type: 'navigation', icon: 'Settings' },
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawQ = searchParams.get('q') || '';
    const q = rawQ.trim();

    if (!q) {
      // Return top navigation items and top 3 courses as quick suggestions
      const recentCourses = await prisma.course.findMany({
        where: { userId: session.user.id },
        select: { id: true, title: true, level: true, duration: true },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      });

      return NextResponse.json({
        navigation: STATIC_ACTIONS.slice(0, 5),
        courses: recentCourses.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: `${c.level} • ${c.duration}`,
          href: `/course/${c.id}`,
          type: 'course',
        })),
        modules: [],
      });
    }

    const queryLower = q.toLowerCase();

    // Filter navigation & actions
    const matchedNavigation = STATIC_ACTIONS.filter(
      (a) => a.title.toLowerCase().includes(queryLower) || a.subtitle.toLowerCase().includes(queryLower)
    );

    // Search courses in DB
    const matchedCourses = await prisma.course.findMany({
      where: {
        userId: session.user.id,
        title: {
          contains: q,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        level: true,
        duration: true,
      },
      take: 6,
    });

    // Search modules in DB
    const matchedModules = await prisma.module.findMany({
      where: {
        course: {
          userId: session.user.id,
        },
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        courseId: true,
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: 8,
    });

    return NextResponse.json({
      navigation: matchedNavigation,
      courses: matchedCourses.map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: `${c.level} • ${c.duration}`,
        href: `/course/${c.id}`,
        type: 'course',
      })),
      modules: matchedModules.map((m) => ({
        id: m.id,
        title: m.title,
        subtitle: `Course: ${m.course.title}`,
        href: `/course/${m.course.id}/module/${m.id}`,
        type: 'module',
      })),
    });
  } catch (error) {
    console.error('Command palette search error:', error);
    return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
  }
}
