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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    if (!isAgentEnabled()) {
      return NextResponse.json({ error: 'Career Agent is disabled' }, { status: 403 });
    }

    try {
      const plans = await prisma.careerPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const formatted = plans.map(p => {
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(p.planJson);
        } catch {
          parsed = null;
        }
        return {
          id: p.id,
          title: p.title,
          targetRole: p.targetRole,
          status: p.status,
          plan: parsed,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      });

      return NextResponse.json({ plans: formatted });
    } catch (dbErr) {
      console.warn('[Plans API] DB read fallback:', dbErr);
      return NextResponse.json({ plans: [] });
    }
  } catch (error: unknown) {
    console.error('Fetch career plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch career plans' }, { status: 500 });
  }
}
