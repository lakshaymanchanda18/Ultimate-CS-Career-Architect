import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existingJob = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existingJob || existingJob.userId !== userId) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    const updatedJob = await prisma.jobApplication.update({
      where: { id },
      data: {
        status: body.status !== undefined ? body.status : existingJob.status,
        company: body.company !== undefined ? body.company : existingJob.company,
        role: body.role !== undefined ? body.role : existingJob.role,
        notes: body.notes !== undefined ? body.notes : existingJob.notes,
        appliedDate: body.appliedDate !== undefined ? new Date(body.appliedDate) : existingJob.appliedDate,
      }
    });

    return NextResponse.json(updatedJob);
  } catch (error: any) {
    console.error("Update Job Error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    const existingJob = await prisma.jobApplication.findUnique({ where: { id } });
    if (!existingJob || existingJob.userId !== userId) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    await prisma.jobApplication.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Job Error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
