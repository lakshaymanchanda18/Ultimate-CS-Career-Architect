import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Check file type
    const mimeType = file.type;
    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or an Image (PNG, JPG).' }, { status: 400 });
    }

    // Read file as ArrayBuffer and convert to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    // Call Gemini 1.5 Flash API directly
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 });
    }

    const promptText = `You are a premium resume parsing SDE recruiter.
Analyze this resume document/image and extract the candidate profile data. 
You MUST return a valid JSON block containing the following keys (do not wrap in markdown tags or prefix with text):
{
  "type": "profile_sync",
  "college": "<college or university name>",
  "specialization": "<specialization or degree major>",
  "cgpa": "<cgpa, or empty string>",
  "techStack": "<comma separated list of languages, frameworks, databases, tools>",
  "experience": "<exactly 3 high-impact software engineering resume bullet points describing projects/experience, separated by double newlines or standard bullets>"
}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini upload parse error response:", errText);
      return NextResponse.json({ error: 'Failed to process resume parsing. Gemini returned: ' + response.status }, { status: 500 });
    }

    const result = await response.json();
    const replyText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      return NextResponse.json({ error: 'Empty response from resume parsing model.' }, { status: 500 });
    }

    // Try to parse the reply to verify it's valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(replyText.trim());
    } catch {
      // Try string cleaning fallback
      const start = replyText.indexOf('{');
      const end = replyText.lastIndexOf('}');
      if (start >= 0 && end > start) {
        parsedData = JSON.parse(replyText.substring(start, end + 1));
      } else {
        throw new Error("Could not parse json");
      }
    }

    return NextResponse.json({ parsedData });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process resume upload.' }, { status: 500 });
  }
}
