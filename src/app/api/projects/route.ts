import { NextResponse } from 'next/server';
import { sanitizeAIError } from '@/lib/ai-client';
import { recommendProjectsService } from '@/lib/services/project-service';

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);

  try {
    const { specialization, atsScore, techStack } = await request.json();

    console.log(`[AI:${requestId}] Project generation started`, { specialization, atsScore });

    const projectsArray = await recommendProjectsService({
      specialization: specialization || 'Software Engineering',
      atsScore,
      techStack,
    });

    console.log(`[AI:${requestId}] Generated ${projectsArray.length} projects`);
    return NextResponse.json(projectsArray);
  } catch (error: unknown) {
    console.error(`[AI:${requestId}] Project generation failed`, error);
    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: sanitized.retryable ? 503 : 500 }
    );
  }
}
