import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    const existingAnalysis = await prisma.analysis.findUnique({ where: { id } });
    if (!existingAnalysis || existingAnalysis.userId !== userId) {
      return NextResponse.json({ error: "Analysis not found or unauthorized" }, { status: 404 });
    }

    await prisma.analysis.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Analysis Error:", error);
    return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 });
  }
}
