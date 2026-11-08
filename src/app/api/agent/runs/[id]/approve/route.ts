import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAgentEnabled } from '@/lib/agent/config';
import { CareerPlanData } from '@/lib/agent/types';

interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
}

function isValidPlanSchema(data: unknown): data is CareerPlanData {
  if (!data || typeof data !== 'object') return false;
  const plan = data as Record<string, unknown>;
  if (typeof plan.title !== 'string' || !plan.title.trim()) return false;
  if (!Array.isArray(plan.milestones) || plan.milestones.length === 0) return false;

  for (const m of plan.milestones) {
    if (!m || typeof m !== 'object') return false;
    const milestone = m as Record<string, unknown>;
    if (typeof milestone.title !== 'string' || !milestone.title.trim()) return false;
    if (!Array.isArray(milestone.tasks)) return false;
  }
  return true;
}

export async function POST(
  req: Request,
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
        { error: 'Career Agent is currently disabled via feature flag.', code: 'AGENT_DISABLED' },
        { status: 403 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { plan?: CareerPlanData };

    // Check if run exists in DB
    const run = await prisma.agentRun.findFirst({
      where: { id: runId, userId },
      include: { actions: true },
    });

    if (!run && !runId.startsWith('run_')) {
      return NextResponse.json(
        { error: 'Agent run not found or does not belong to you.' },
        { status: 404 }
      );
    }

    // ─── Idempotency Check: Prevent duplicate writes on repeated approval ───
    if (run) {
      // 1. Check if run is cancelled or failed
      if (run.status === 'CANCELLED' || run.status === 'FAILED') {
        return NextResponse.json(
          { error: `Cannot approve a run with status: ${run.status}. Please start a new consultation.` },
          { status: 400 }
        );
      }

      // 2. Check if already approved
      const alreadyApprovedAction = run.actions.find(
        a => a.approvalStatus === 'APPROVED' && a.output
      );
      if (alreadyApprovedAction?.output) {
        try {
          const out = JSON.parse(alreadyApprovedAction.output);
          if (out?.savedPlanId) {
            const existingPlan = await prisma.careerPlan.findFirst({
              where: { id: out.savedPlanId, userId },
            });
            if (existingPlan) {
              let parsedExisting: unknown = null;
              try {
                parsedExisting = JSON.parse(existingPlan.planJson);
              } catch {}
              return NextResponse.json({
                success: true,
                message: 'Plan has already been approved and saved.',
                alreadyApproved: true,
                plan: {
                  id: existingPlan.id,
                  title: existingPlan.title,
                  targetRole: existingPlan.targetRole,
                  status: existingPlan.status,
                  plan: parsedExisting,
                  createdAt: existingPlan.createdAt,
                },
              });
            }
          }
        } catch {}
      }
    }

    // Resolve plan payload from pending action or fallback body
    let planData: CareerPlanData | null = null;
    let pendingActionId: string | null = null;

    if (run) {
      const pendingAction = run.actions.find(
        a =>
          a.approvalStatus === 'PENDING' ||
          a.toolName === 'save_career_plan' ||
          a.status === 'WAITING_APPROVAL'
      );
      if (pendingAction) {
        pendingActionId = pendingAction.id;
        try {
          planData = JSON.parse(pendingAction.input) as CareerPlanData;
        } catch {}
      }
    }

    if (!planData && body.plan) {
      planData = body.plan;
    }

    if (!isValidPlanSchema(planData)) {
      return NextResponse.json(
        {
          error: 'Invalid or incomplete career plan schema. A title and at least one milestone with tasks is required.',
        },
        { status: 400 }
      );
    }

    // Execute atomic persistence
    let createdPlan: { id: string; title: string; targetRole: string; status: string; createdAt: Date };

    if (run) {
      const result = await prisma.$transaction(async tx => {
        const plan = await tx.careerPlan.create({
          data: {
            userId,
            title: planData!.title.slice(0, 150),
            targetRole: (planData!.targetRole || 'Software Development Engineer').slice(0, 100),
            planJson: JSON.stringify(planData),
            status: 'ACTIVE',
          },
        });

        await tx.agentRun.update({
          where: { id: run.id },
          data: { status: 'COMPLETED' },
        });

        if (pendingActionId) {
          await tx.agentAction.update({
            where: { id: pendingActionId },
            data: {
              approvalStatus: 'APPROVED',
              status: 'APPROVED',
              output: JSON.stringify({ savedPlanId: plan.id }),
            },
          });
        }

        return plan;
      });
      createdPlan = result;
    } else {
      // Ephemeral fallback (e.g. transient dev run without DB run row)
      createdPlan = await prisma.careerPlan.create({
        data: {
          userId,
          title: planData.title.slice(0, 150),
          targetRole: (planData.targetRole || 'Software Development Engineer').slice(0, 100),
          planJson: JSON.stringify(planData),
          status: 'ACTIVE',
        },
      });
    }

    return NextResponse.json({
      success: true,
      plan: {
        id: createdPlan.id,
        title: createdPlan.title,
        targetRole: createdPlan.targetRole,
        status: createdPlan.status,
        plan: planData,
        createdAt: createdPlan.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Approve plan error:', error);
    return NextResponse.json(
      { error: 'Failed to approve and save career plan. Please try again.' },
      { status: 500 }
    );
  }
}
