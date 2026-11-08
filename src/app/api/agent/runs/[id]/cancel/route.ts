import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAgentEnabled } from '@/lib/agent/config';

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const { id: runId } = await params;

    if (!isAgentEnabled()) {
      return NextResponse.json(
        { error: 'Career Agent is currently disabled.', code: 'AGENT_DISABLED' },
        { status: 403 }
      );
    }

    const run = await prisma.agentRun.findFirst({
      where: { id: runId, userId },
      include: { actions: true },
    });

    if (!run) {
      return NextResponse.json({ error: 'Agent run not found' }, { status: 404 });
    }

    if (run.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a run that is already completed.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.agentRun.update({
        where: { id: run.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.agentAction.updateMany({
        where: {
          runId: run.id,
          approvalStatus: 'PENDING',
        },
        data: {
          approvalStatus: 'REJECTED',
          status: 'REJECTED',
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Run successfully cancelled.' });
  } catch (error: unknown) {
    console.error('Cancel run error:', error);
    return NextResponse.json({ error: 'Failed to cancel agent run.' }, { status: 500 });
  }
}

