import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const sessions = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Fetch interview history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { mode, role, level, overallScore, feedback } = body;

    const newSession = await prisma.interviewSession.create({
      data: {
        userId,
        mode,
        role,
        level,
        overallScore: overallScore ? parseInt(overallScore) : null,
        feedback: feedback ? JSON.stringify(feedback) : null
      }
    });

    return NextResponse.json({ session: newSession });
  } catch (error: any) {
    console.error('Save interview history error:', error);
    return NextResponse.json({ error: 'Failed to save session history' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const body = await request.json();
    const { sessionId, deleteAll } = body;

    if (deleteAll) {
      // Delete all sessions for the current user
      const deleteResult = await prisma.interviewSession.deleteMany({
        where: { userId }
      });
      return NextResponse.json({ success: true, count: deleteResult.count });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID or deleteAll flag is required.' }, { status: 400 });
    }

    // Verify session exists and belongs to the user
    const existing = await prisma.interviewSession.findUnique({
      where: { id: sessionId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized deletion request.' }, { status: 403 });
    }

    await prisma.interviewSession.delete({
      where: { id: sessionId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete interview history error:', error);
    return NextResponse.json({ error: 'Failed to delete session history' }, { status: 500 });
  }
}
