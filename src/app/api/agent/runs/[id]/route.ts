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

export async function GET(
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
    const { id } = await params;

    if (!isAgentEnabled()) {
      return NextResponse.json({ error: 'Career Agent is disabled' }, { status: 403 });
    }

    const run = await prisma.agentRun.findFirst({
      where: { id, userId },
      include: {
        actions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ error: 'Agent run not found' }, { status: 404 });
    }

    let meta: Record<string, unknown> | null = null;
    if (run.metadata) {
      try {
        meta = JSON.parse(run.metadata);
      } catch {}
    }

    return NextResponse.json({
      id: run.id,
      status: run.status,
      userRequest: run.userRequest,
      finalAnswer: run.finalAnswer,
      metadata: meta,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      actions: run.actions.map(a => {
        let inputParsed = {};
        let outputParsed = null;
        try {
          inputParsed = JSON.parse(a.input);
        } catch {}
        if (a.output) {
          try {
            outputParsed = JSON.parse(a.output);
          } catch {}
        }
        return {
          id: a.id,
          toolName: a.toolName,
          input: inputParsed,
          output: outputParsed,
          status: a.status,
          approvalStatus: a.approvalStatus,
          thought: a.thought,
          latencyMs: a.latencyMs,
          error: a.error,
          createdAt: a.createdAt,
        };
      }),
    });
  } catch (error: unknown) {
    console.error('Fetch single run error:', error);
    return NextResponse.json({ error: 'Failed to fetch run details' }, { status: 500 });
  }
}
