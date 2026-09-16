import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = (id || '').trim();
    const strippedPrefix = cleanId.replace(/^NXL-?/i, '');

    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { id: { startsWith: strippedPrefix, mode: 'insensitive' } },
          { certificateId: cleanId },
          { certificateId: { equals: cleanId, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        topic: true,
        level: true,
        duration: true,
        completed: true,
        grade: true,
        masteryPercentage: true,
        certificateId: true,
        updatedAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course || !course.completed) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Certificate record not found or course requirement not yet satisfied.',
        },
        { status: 404 }
      );
    }

    const certId = course.certificateId || `NXL-${course.id.substring(0, 6).toUpperCase()}`;

    return NextResponse.json({
      valid: true,
      certificate: {
        id: course.id,
        certificateId: certId,
        courseTitle: course.title,
        recipientName: course.user?.name || 'Authorized Scholar',
        grade: course.grade || 'Certified',
        masteryPercentage: course.masteryPercentage || 100,
        issueDate: course.updatedAt.toISOString(),
        level: course.level,
        duration: course.duration,
        topic: course.topic,
        registryUrl: `https://nexlearn.ai/certificate/${course.id}`,
      },
    });
  } catch (error) {
    console.error('Public certificate verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Verification system error' },
      { status: 500 }
    );
  }
}
