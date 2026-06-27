import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    const existing = await prisma.savedProject.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Saved project not found" }, { status: 444 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.savedProject.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Project unsaved successfully" });
  } catch (error: any) {
    console.error("DELETE Saved Project Error:", error);
    return NextResponse.json({ error: "Failed to delete saved project" }, { status: 500 });
  }
}
