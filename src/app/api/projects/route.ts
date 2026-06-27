import { NextResponse } from 'next/server';
import { generateJSON, sanitizeAIError } from '@/lib/ai-client';
import { buildProjectsPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 10);

  try {
    const { specialization, atsScore, techStack } = await request.json();

    console.log(`[AI:${requestId}] Project generation started`, { specialization, atsScore });

    const prompt = buildProjectsPrompt({
      specialization: specialization || 'Software Engineering',
      atsScore,
      techStack,
    });

    const result = await generateJSON<any>(prompt, { maxOutputTokens: 1200, temperature: 0.8 });

    let projectsArray = result;
    if (!Array.isArray(result) && typeof result === 'object' && result !== null) {
      const arrayKey = Object.keys(result).find(key => Array.isArray(result[key]));
      if (arrayKey) {
        projectsArray = result[arrayKey];
      }
    }

    // Validate it's an array
    if (!Array.isArray(projectsArray)) {
      console.error(`[AI:${requestId}] Projects result is not an array`, result);
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.', retryable: true },
        { status: 500 }
      );
    }

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
