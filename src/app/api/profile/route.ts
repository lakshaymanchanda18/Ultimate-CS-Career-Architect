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

    const profile = await prisma.profile.findFirst({
      where: { userId }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (!profile) {
      return NextResponse.json({
        name: user?.name || "",
        college: "",
        specialization: "",
        cgpa: "",
        techStack: "",
        experience: ""
      });
    }

    return NextResponse.json({
      ...profile,
      name: user?.name || ""
    });
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
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
    const { name, college, specialization, cgpa, techStack, experience } = body;

    // Update user's name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name || null }
      });
    }

    let profile;
    const existingProfile = await prisma.profile.findFirst({ where: { userId } });

    if (existingProfile) {
      profile = await prisma.profile.update({
        where: { id: existingProfile.id },
        data: {
          college: college || "",
          specialization: specialization || "",
          cgpa: cgpa || "",
          techStack: techStack || "",
          experience: experience || ""
        }
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          userId,
          college: college || "",
          specialization: specialization || "",
          cgpa: cgpa || "",
          techStack: techStack || "",
          experience: experience || ""
        }
      });
    }

    return NextResponse.json({
      ...profile,
      name: name || ""
    });
  } catch (error: any) {
    console.error("Save Profile Error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
