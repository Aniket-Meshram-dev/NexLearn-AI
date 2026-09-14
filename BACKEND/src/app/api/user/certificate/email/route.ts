import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendCertificateEmail } from '@/lib/mailer';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId, pdfBase64 } = await request.json();
    console.log(`[API] Certificate request for course ${courseId}. PDF received: ${!!pdfBase64} (${pdfBase64?.length || 0} chars)`);
    if (!courseId) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

    const course = await prisma.course.findUnique({
      where: { id: courseId, userId: session.user.id },
      include: { user: { select: { email: true, name: true } } }
    });

    if (!course || !course.completed) {
      return NextResponse.json({ error: 'Course not completed or not found' }, { status: 404 });
    }

    const certId = course.certificateId || `ICD-${Math.floor(100000 + Math.random() * 900000)}-${course.id.substring(0, 4).toUpperCase()}`;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const certUrl = `${baseUrl}/certificate/${course.id}`;

    await sendCertificateEmail(
      course.user.email,
      course.user.name || 'Scholar',
      course.title,
      certId,
      certUrl,
      pdfBase64
    );

    return NextResponse.json({ message: 'Certificate sent successfully' });
  } catch (error) {
    console.error('Error sending certificate email:', error);
    return NextResponse.json({ error: 'Failed to send certificate email' }, { status: 500 });
  }
}
