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

    const result = await generateJSON<Array<{
      title: string;
      demand: string;
      description: string;
      stack: string[];
      hook: string;
      lpaTip: string;
      killerQuestion: string;
    }>>(prompt, { maxOutputTokens: 800, temperature: 0.8 });

    // Validate it's an array
    if (!Array.isArray(result)) {
      console.error(`[AI:${requestId}] Projects result is not an array`);
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.', retryable: true },
        { status: 500 }
      );
    }

    console.log(`[AI:${requestId}] Generated ${result.length} projects`);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error(`[AI:${requestId}] Project generation failed`, error);
    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: sanitized.retryable ? 503 : 500 }
    );
  }
}
