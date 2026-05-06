import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { title, techStack } = await request.json();

    if (!title || !techStack) {
      return NextResponse.json({ error: "Missing title or techStack" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key in server configuration" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const promptText = `Act as an elite Staff Software Engineer designing a high-impact project for a junior developer.
Project Title: ${title}
Tech Stack: ${techStack}

Generate a project blueprint consisting of two parts:
1. A Mermaid.js architecture diagram (valid mermaid syntax, use "graph TD").
2. A list of 5-8 step-by-step implementation tasks.

Return the response STRICTLY as a JSON object with this exact structure (no markdown backticks around the json):
{
  "architecture": "graph TD\\n  A[Frontend] --> B[Backend]\\n...",
  "tasks": [
    "Set up the project repository and install dependencies",
    "Implement the authentication system",
    ...
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: promptText,
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

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
  } catch (error: any) {
    console.error("Blueprint Generation Error:", error);
    
    let errorMessage = error.message || "Failed to generate project blueprint";
    if (typeof errorMessage === 'string' && (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota'))) {
      errorMessage = "AI Rate Limit Exceeded. You have made too many requests to the free tier API. Please wait a minute and try again.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
