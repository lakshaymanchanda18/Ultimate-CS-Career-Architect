import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateJSON, sanitizeAIError } from '@/lib/ai-client';
import { buildAnalysisPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const { college, specialization, cgpa, techStack, experience } = await request.json();

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

    // Save to Database if user is logged in
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

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis Error:", error);
    const sanitized = sanitizeAIError(error);
    return NextResponse.json(
      { error: sanitized.userMessage, retryable: sanitized.retryable },
      { status: 500 }
    );
  }
}
