import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAgentEnabled, hasConfiguredAIProvider, AGENT_CONFIG } from '@/lib/agent/config';
import { runAgentOrchestrator } from '@/lib/agent/orchestrator';

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    if (!isAgentEnabled()) {
      return NextResponse.json(
        { error: 'Career Agent is currently disabled.', enabled: false },
        { status: 403 }
      );
    }

    try {
      const runs = await prisma.agentRun.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          actions: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      const formatted = runs.map(run => {
        let meta: Record<string, unknown> | null = null;
        if (run.metadata) {
          try {
            meta = JSON.parse(run.metadata);
          } catch {
            meta = null;
          }
        }
        return {
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
        };
      });

      return NextResponse.json({ runs: formatted });
    } catch (dbErr) {
      console.warn('[Agent API] DB read fallback:', dbErr);
      return NextResponse.json({ runs: [] });
    }
  } catch (error: unknown) {
    console.error('Fetch agent runs error:', error);
    return NextResponse.json({ error: 'Failed to fetch agent runs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to consult Career Agent.' }, { status: 401 });
    }
    const userId = user.id;

    if (!isAgentEnabled()) {
      return NextResponse.json(
        {
          error: 'Career Agent is currently disabled via feature flag.',
          enabled: false,
          code: 'AGENT_DISABLED',
        },
        { status: 403 }
      );
    }

    if (!hasConfiguredAIProvider()) {
      return NextResponse.json(
        {
          error: 'No AI provider API key is configured. Please configure GEMINI_API_KEY or an alternative in your environment.',
          code: 'NO_PROVIDER_CONFIGURED',
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return NextResponse.json({ error: 'Career prompt is required.' }, { status: 400 });
    }

    if (prompt.length > AGENT_CONFIG.MAX_USER_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt exceeds maximum length of ${AGENT_CONFIG.MAX_USER_PROMPT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Attempt to persist initial run in DB if available
    let persistedRunId: string | null = null;
    try {
      const initialRun = await prisma.agentRun.create({
        data: {
          userId,
          userRequest: prompt,
          status: 'RUNNING',
        },
      });
      persistedRunId = initialRun.id;
    } catch (err) {
      console.warn('[Agent API] DB run creation fallback (offline/transient):', err);
      persistedRunId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Execute bounded orchestrator
    const result = await runAgentOrchestrator({
      userId,
      userPrompt: prompt,
    });

    // Persist completed status and actions
    try {
      if (persistedRunId && !persistedRunId.startsWith('run_')) {
        await prisma.agentRun.update({
          where: { id: persistedRunId },
          data: {
            status: result.status,
            finalAnswer: result.finalAnswer,
            metadata: JSON.stringify(result.metadata),
          },
        });

        // Record actions
        for (const act of result.actions) {
          const actionRecord = await prisma.agentAction.create({
            data: {
              runId: persistedRunId,
              toolName: act.toolName,
              input: JSON.stringify(act.input),
              output: act.output ? JSON.stringify(act.output) : null,
              status: act.status,
              approvalStatus: act.approvalStatus,
              thought: act.thought || null,
              latencyMs: act.latencyMs || null,
              error: act.error || null,
            },
          });

          if (result.pendingApproval && act.toolName === result.pendingApproval.toolName) {
            result.pendingApproval.actionId = actionRecord.id;
          }
        }
      }
    } catch (dbSaveErr) {
      console.warn('[Agent API] DB update fallback for actions:', dbSaveErr);
    }

    return NextResponse.json({
      id: persistedRunId,
      status: result.status,
      userRequest: prompt,
      finalAnswer: result.finalAnswer,
      planPreview: result.planPreview,
      pendingApproval: result.pendingApproval,
      actions: result.actions,
      metadata: result.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Agent run execution error:', error);
    const errMessage = error instanceof Error ? error.message : 'Agent run failed to execute.';
    return NextResponse.json(
      {
        error: errMessage,
        retryable: true,
      },
      { status: 500 }
    );
  }
}
