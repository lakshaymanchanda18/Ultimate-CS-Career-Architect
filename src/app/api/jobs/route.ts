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

    const jobs = await prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Fetch Jobs Error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { company, role, status, appliedDate, notes } = body;

    if (!company || !role) {
      return NextResponse.json({ error: "Company and role are required" }, { status: 400 });
    }

    const job = await prisma.jobApplication.create({
      data: {
        userId,
        company,
        role,
        status: status || 'WISHLIST',
        appliedDate: appliedDate ? new Date(appliedDate) : null,
        notes: notes || null
      }
    });

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Create Job Error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
