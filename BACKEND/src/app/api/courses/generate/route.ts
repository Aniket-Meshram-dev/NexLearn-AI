import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCourse } from '@/lib/gemini';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { topic, level, goal, hoursPerDay, duration } = await request.json();

    if (!topic || !level || !goal) {
      return NextResponse.json({ error: 'Topic, level, and goal are required' }, { status: 400 });
    }

    // Generate course with AI but DO NOT save to DB yet
    const courseData = await generateCourse(topic, level, goal, hoursPerDay || 1, duration || '4 weeks');

    return NextResponse.json({ coursePreview: courseData });
  } catch (error) {
    console.error('Course preview generation error:', error?.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate course preview'
    }, { status: 500 });
  }
}
