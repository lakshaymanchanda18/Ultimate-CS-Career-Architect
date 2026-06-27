import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const saved = await prisma.savedProject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Parse stack strings back to arrays
    const formatted = saved.map(p => {
      let stackArray = [];
      try {
        stackArray = typeof p.stack === 'string' ? JSON.parse(p.stack) : p.stack;
      } catch (e) {
        stackArray = [];
      }
      return {
        ...p,
        stack: stackArray
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET Saved Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch saved projects" }, { status: 500 });
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
    
    const { title, demand, description, stack, hook, lpaTip, killerQuestion } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields (title, description)" }, { status: 400 });
    }

    // Check for existing saved project to avoid duplicate save actions
    const existing = await prisma.savedProject.findFirst({
      where: { userId, title }
    });

    if (existing) {
      let stackArray = [];
      try {
        stackArray = typeof existing.stack === 'string' ? JSON.parse(existing.stack) : existing.stack;
      } catch (e) {
        stackArray = [];
      }
      return NextResponse.json({
        ...existing,
        stack: stackArray,
        alreadySaved: true
      });
    }

    const saved = await prisma.savedProject.create({
      data: {
        userId,
        title,
        demand: demand || "General",
        description,
        stack: Array.isArray(stack) ? JSON.stringify(stack) : JSON.stringify([]),
        hook: hook || "",
        lpaTip: lpaTip || "",
        killerQuestion: killerQuestion || ""
      }
    });

    return NextResponse.json({
      ...saved,
      stack: Array.isArray(stack) ? stack : []
    });
  } catch (error: any) {
    console.error("POST Saved Project Error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}
