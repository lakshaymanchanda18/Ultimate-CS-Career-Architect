import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

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
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Agentic Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run agentic analysis" }, { status: 500 });
  }
}
