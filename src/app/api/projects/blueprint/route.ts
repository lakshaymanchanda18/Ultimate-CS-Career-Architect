import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateJSON, sanitizeAIError } from '@/lib/ai-client';
import { buildBlueprintPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const { title, techStack } = await request.json();

    if (!title || !techStack) {
      return NextResponse.json({ error: "Project title and tech stack are required." }, { status: 400 });
    }

    const prompt = buildBlueprintPrompt({ title, techStack });

    const result = await generateJSON<{
      architecture: string;
      tasks: string[];
    }>(prompt, { maxOutputTokens: 600, temperature: 0.7 });

    // Save to Database if user is logged in
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

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Blueprint Generation Error:", error);
    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: 500 }
    );
  }
}
