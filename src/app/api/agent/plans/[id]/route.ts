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

export async function DELETE(
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

    const existing = await prisma.careerPlan.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Career plan not found' }, { status: 404 });
    }

    await prisma.careerPlan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Delete career plan error:', error);
    return NextResponse.json({ error: 'Failed to delete career plan' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { id } = await params;

    if (!isAgentEnabled()) {
      return NextResponse.json({ error: 'Career Agent is disabled' }, { status: 403 });
    }

    const body = (await req.json()) as { status?: string };
    const { status } = body;

    const validStatuses = ['ACTIVE', 'ARCHIVED', 'COMPLETED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await prisma.careerPlan.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Career plan not found' }, { status: 404 });
    }

    const updated = await prisma.careerPlan.update({
      where: { id },
      data: {
        status: status || existing.status,
      },
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error: unknown) {
    console.error('Update career plan error:', error);
    return NextResponse.json({ error: 'Failed to update career plan' }, { status: 500 });
  }
}
