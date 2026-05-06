import { NextResponse } from 'next/server';
import { generateJSON, sanitizeAIError } from '@/lib/ai-client';
import { buildProjectsPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const { specialization, atsScore, techStack } = await request.json();

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

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Project Generation Error:", error);
    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: 500 }
    );
  }
}
