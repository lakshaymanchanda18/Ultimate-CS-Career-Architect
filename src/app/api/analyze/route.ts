import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateJSON, sanitizeAIError } from '@/lib/ai-client';
import { buildAnalysisPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  const requestStart = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);

  try {
    const body = await request.json();
    const { college, specialization, cgpa, techStack, experience } = body;

    // Input validation
    if (!college || !experience) {
      return NextResponse.json(
        { error: 'College and experience are required fields.', retryable: false },
        { status: 400 }
      );
    }

    console.log(`[AI:${requestId}] Analysis request started`, {
      college: college.substring(0, 30),
      specialization: specialization?.substring(0, 30),
      hasExperience: !!experience,
      experienceLength: experience?.length,
    });

    const prompt = buildAnalysisPrompt({ college, specialization, cgpa, techStack, experience });

    const result = await generateJSON<{
      atsScore: number;
      atsFeedback: string;
      primaryMatchName: string;
      primaryMatchScore: number;
      secondaryMatchName: string;
      secondaryMatchScore: number;
      keywords: string[];
      contentImpactGrade: string;
      weakBullet: string;
      weakIssue: string;
      fixedBullet: string;
      fixedStrength: string;
    }>(prompt, { maxOutputTokens: 500, temperature: 0.6 });

    // Validate result shape
    if (typeof result.atsScore !== 'number' || !result.atsFeedback) {
      console.error(`[AI:${requestId}] Invalid result shape`, { resultKeys: Object.keys(result) });
      return NextResponse.json(
        { error: 'AI returned an incomplete analysis. Please try again.', retryable: true },
        { status: 500 }
      );
    }

    const latency = Date.now() - requestStart;
    console.log(`[AI:${requestId}] Analysis completed in ${latency}ms`, {
      atsScore: result.atsScore,
      grade: result.contentImpactGrade,
    });

    // Save to Database if user is logged in
    try {
      const session = await getServerSession(authOptions);
      if (session?.user && (session.user as any).id) {
        const userId = (session.user as any).id;

        // Upsert profile
        const existingProfile = await prisma.profile.findFirst({ where: { userId } });
        if (existingProfile) {
          await prisma.profile.update({
            where: { id: existingProfile.id },
            data: { college, specialization, cgpa, techStack, experience }
          });
        } else {
          await prisma.profile.create({
            data: { userId, college, specialization, cgpa, techStack, experience }
          });
        }

        // Save analysis
        await prisma.analysis.create({
          data: {
            userId,
            atsScore: result.atsScore,
            atsFeedback: result.atsFeedback,
            primaryMatchName: result.primaryMatchName,
            primaryMatchScore: result.primaryMatchScore,
            secondaryMatchName: result.secondaryMatchName,
            secondaryMatchScore: result.secondaryMatchScore,
            keywords: JSON.stringify(result.keywords),
            contentImpactGrade: result.contentImpactGrade,
            weakBullet: result.weakBullet,
            weakIssue: result.weakIssue,
            fixedBullet: result.fixedBullet,
            fixedStrength: result.fixedStrength
          }
        });
      }
    } catch (dbError) {
      // Database save failure should NOT block the response
      console.error(`[AI:${requestId}] DB save failed (non-blocking)`, dbError);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const latency = Date.now() - requestStart;
    console.error(`[AI:${requestId}] Analysis failed after ${latency}ms`, error);

    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: sanitized.retryable ? 503 : 500 }
    );
  }
}
