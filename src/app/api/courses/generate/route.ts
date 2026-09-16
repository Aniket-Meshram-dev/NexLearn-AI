import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCourse } from '@/lib/gemini';
import { applyRateLimit, rateLimitResponse } from '@/lib/ratelimit';

const VALID_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const VALID_GOALS = ['Skill Development', 'Career Growth', 'Academic', 'Hobby', 'Certification'];
const MAX_TOPIC_LENGTH = 200;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit: 5 requests per 10 minutes per user
  const rl = await applyRateLimit('courseGen', session.user.id);
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const body = await request.json();
    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, MAX_TOPIC_LENGTH) : '';
    const level = VALID_LEVELS.includes(body.level) ? body.level : 'Beginner';
    const goal = VALID_GOALS.includes(body.goal) ? body.goal : 'Skill Development';
    const hoursPerDay = Math.min(Math.max(Number(body.hoursPerDay) || 1, 1), 12);
    const duration = typeof body.duration === 'string' ? body.duration.trim().slice(0, 50) : '4 weeks';

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Generate course with AI but DO NOT save to DB yet
    const courseData = await generateCourse(topic, level, goal, hoursPerDay, duration);

    return NextResponse.json({ course: courseData, coursePreview: courseData });
  } catch (error: any) {
    console.error('Course preview generation error:', error?.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate course preview'
    }, { status: 500 });
  }
}

