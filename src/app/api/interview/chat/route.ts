import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai-client';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const PROFILE_BUILDER_SYSTEM_PROMPT = `You are a professional CS career coach helping a student build their resume profile.
Your goal is to conduct a short conversational interview to collect the following:
1. College or University name and Specialization/Major (and CGPA if they want to share).
2. Tech Stack they are comfortable with (languages, frameworks).
3. A single key project or experience they want on their resume (ask them what they built, what tech they used, and what it achieved).

RULES:
- Acknowledge their response warmly but briefly.
- Ask exactly ONE short, conversational question at a time. Do not dump a list of questions.
- Maintain a professional, encouraging tone.
- When you have collected all three pieces of information, you MUST generate three professional, high-impact software engineering resume bullets (using action verbs and metrics where possible) based on the project/experience they described.
- Immediately when you finish, you must output a single valid JSON block and NOTHING else. Do not wrap it in markdown block. It must look EXACTLY like this:
{
  "type": "profile_sync",
  "college": "<university name>",
  "specialization": "<specialization>",
  "cgpa": "<cgpa or empty string>",
  "techStack": "<comma separated technologies>",
  "experience": "<the 3 professional resume bullet points, separated by double newlines or bullets>"
}`;

const MOCK_INTERVIEW_SYSTEM_PROMPT = (role: string, level: string) => `You are a seasoned SDE technical interviewer conducting a mock interview.
The candidate has selected the track: "${role}" and level: "${level}".
Your goal is to ask a total of 5 technical and system design questions relevant to this role and level, one at a time.

RULES:
- Ask exactly ONE question at a time. Keep it concise.
- Challenge the candidate on technical concepts (e.g. databases, caching, algos, performance, APIs, CSS, etc.).
- Acknowledge the candidate's previous response briefly (e.g. "Good explanation", "Correct", or "That would work, but...") before presenting the next question.
- If the candidate asks for a hint, provide a small, helpful hint. Do not deduct points or show frustration.
- Do not state "Question X of 5" in your text response. Just ask the question naturally.
- After the candidate answers the 5th question, you must finish the interview.
- When finishing, you must output a single valid JSON block and NOTHING else. Do not wrap it in markdown block. It must look EXACTLY like this:
{
  "type": "evaluation",
  "overallScore": <number 0-100>,
  "scores": {
    "technicalDepth": <number 0-100>,
    "problemSolving": <number 0-100>,
    "communication": <number 0-100>
  },
  "feedback": {
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"]
  },
  "qaBreakdown": [
    {
      "question": "Question 1 text...",
      "userAnswer": "Candidate answer...",
      "recruiterAnalysis": "Detailed constructive feedback on candidate response...",
      "idealAnswer": "Exemplary answer explaining the correct concepts..."
    },
    ... (for all 5 questions)
  ]
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, mode, role, level } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required and must be an array.' }, { status: 400 });
    }

    let systemPrompt = '';
    if (mode === 'profile-builder') {
      systemPrompt = PROFILE_BUILDER_SYSTEM_PROMPT;
    } else {
      systemPrompt = MOCK_INTERVIEW_SYSTEM_PROMPT(role || 'Fullstack', level || 'Mid');
    }

    const replyText = await generateChatResponse(
      messages, 
      { maxOutputTokens: 2500, temperature: 0.7 }, 
      systemPrompt
    );

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Interview API error:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred during the interview session.',
      retryable: true 
    }, { status: 500 });
  }
}
