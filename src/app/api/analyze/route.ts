import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { college, specialization, cgpa, techStack, experience } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key in server configuration" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `Act as an elite standard software engineering recruiter checking a resume specifically targeting higher Tier-1 MNCs (Google, MSFT, etc).
Profile Context:
College: ${college}
CGPA: ${cgpa}
Target Specialization: ${specialization}
Tech Stack: ${techStack}
Raw Experience:
${experience}

Evaluate this text strictly in JSON format. Do not use markdown backticks.
Format required exactly:
{
  "atsScore": 75,
  "atsFeedback": "Short 1-sentence feedback about structure/skills",
  "primaryMatchName": "Software Development",
  "primaryMatchScore": 85,
  "secondaryMatchName": "Data Analyst",
  "secondaryMatchScore": 40,
  "keywords": ["REACT", "KUBERNETES", "AWS"], 
  "contentImpactGrade": "B+",
  "weakBullet": "Original weak bullet from the raw experience.",
  "weakIssue": "Passive, missing metrics",
  "fixedBullet": "The XYZ formulated optimized bullet",
  "fixedStrength": "Active Voice, +Quantifiable Metric"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-8b',
      contents: promptText,
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

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
  } catch (error: any) {
    console.error("Agentic Analysis Error:", error);
    
    let errorMessage = error.message || "Failed to run agentic analysis";
    if (typeof errorMessage === 'string' && (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota'))) {
      errorMessage = "AI Rate Limit Exceeded. You have made too many requests to the free tier API. Please wait a minute and try again.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
