import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateMindmap } from '@/lib/gemini';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, moduleId } = await params;
  
  try {
    const module = await prisma.module.findFirst({
      where: { id: moduleId, courseId: id, course: { userId: session.user.id } },
    });

    if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });

    // If mindmap already exists, return it
    if (module.mindmap) {
      return NextResponse.json({ mindmap: module.mindmap });
    }

    // Otherwise, generate it
    if (!module.notes) {
      return NextResponse.json({ error: 'Module notes missing, cannot generate mindmap.' }, { status: 400 });
    }

    const generatedMindmap = await generateMindmap(module.title, module.notes);

    // Save to database
    await prisma.module.update({
      where: { id: moduleId },
      data: { mindmap: generatedMindmap }
    });

    return NextResponse.json({ mindmap: generatedMindmap });
  } catch (error) {
    console.error('Mindmap generation error:', error);
    return NextResponse.json({ error: 'Failed to generate mindmap' }, { status: 500 });
  }
}
