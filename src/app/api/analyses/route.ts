import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch analyses along with the user's profile to display context
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            profiles: true
          }
        }
      }
    });

    return NextResponse.json(analyses);
  } catch (error: any) {
    console.error("Fetch Analyses Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch analyses" }, { status: 500 });
  }
}
