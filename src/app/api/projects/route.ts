import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { specialization, atsScore, techStack } = await request.json();
    const spec = (specialization || '').toLowerCase();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Gemini API Key in server configuration" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    let promptText = `You are a high-tier Indian CS Career Architect. Suggest 3 highly advanced projects for a "${spec}" student aiming for 50 LPA+ roles at Tier-1 MNCs.`;
    
    if (atsScore && techStack) {
       promptText += `\nYou just evaluated their resume and gave an ATS score of ${atsScore}. Their current tech stack is: ${techStack}. Give highly-specific projects that utilize their existing stack, but also introduce 1 or 2 new cutting-edge technologies to boost their score past 90+.`;
    }

    promptText += `\nReturn strictly in JSON format as an array of exactly 3 objects. Do not wrap in markdown blocks like \`\`\`json. Return the raw string array.
Format of each object:
{
  "title": "Project Title",
  "demand": "Target (e.g. Zomato / Google)",
  "description": "Short project description solving a real world Indian problem.",
  "stack": ["TECH", "TECH", "TECH"],
  "hook": "Unique hook",
  "lpaTip": "Pro Tip",
  "killerQuestion": "Difficult technical interview question"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptText,
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Project Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate projects" }, { status: 500 });
  }
}
