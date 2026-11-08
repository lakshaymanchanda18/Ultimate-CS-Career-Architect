import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeAIError } from '@/lib/ai-client';
import { draftBlueprintService } from '@/lib/services/blueprint-service';

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);

  try {
    const { title, techStack } = await request.json();

    if (!title || !techStack) {
      return NextResponse.json(
        { error: 'Project title and tech stack are required.', retryable: false },
        { status: 400 }
      );
    }

    console.log(`[AI:${requestId}] Blueprint generation started`, { title });

    const result = await draftBlueprintService({ title, techStack });

    console.log(`[AI:${requestId}] Blueprint generated with ${result.tasks.length} tasks`);

    // Save to Database if user is logged in (non-blocking)
    try {
      const session = await getServerSession(authOptions);
      if (session?.user && (session.user as any).id) {
        const userId = (session.user as any).id;

        const blueprint = await prisma.projectBlueprint.create({
          data: {
            userId,
            title,
            techStack,
            architecture: result.architecture,
            tasks: JSON.stringify(result.tasks.map((task: string) => ({ text: task, completed: false })))
          }
        });

        return NextResponse.json({ ...result, id: blueprint.id });
      }
    } catch (dbError) {
      console.error(`[AI:${requestId}] DB save failed (non-blocking)`, dbError);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error(`[AI:${requestId}] Blueprint generation failed`, error);
    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: sanitized.retryable ? 503 : 500 }
    );
  }
}
