import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { generateVisionResponse, generateAIResponse } from '@/lib/ai-client';

// Polyfill browser globals for node environment to prevent pdfjs/pdf-parse from crashing during build
if (typeof global !== 'undefined') {
  if (typeof (global as any).DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  if (typeof (global as any).ImageData === 'undefined') {
    (global as any).ImageData = class ImageData {};
  }
  if (typeof (global as any).Path2D === 'undefined') {
    (global as any).Path2D = class Path2D {};
  }
}

export async function POST(request: Request) {
  try {
    const pdf = require('pdf-parse');
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

    let replyText = "";

    if (mimeType === 'application/pdf') {
      try {
        const pdfBuffer = Buffer.from(buffer);
        let textContent = "";

        if (pdf && typeof pdf.PDFParse === 'function') {
          const parser = new pdf.PDFParse({ data: pdfBuffer });
          await parser.load();
          const parsedResult = await parser.getText();
          textContent = parsedResult.text || "";
          await parser.destroy();
        } else if (typeof pdf === 'function') {
          if (pdf.toString().startsWith('class ')) {
            const parser = new (pdf as any)({ data: pdfBuffer });
            await parser.load();
            const parsedResult = await parser.getText();
            textContent = parsedResult.text || "";
            await parser.destroy();
          } else {
            const parsed = await (pdf as any)(pdfBuffer);
            textContent = parsed.text || "";
          }
        } else {
          throw new Error("Unsupported pdf-parse library structure");
        }

        if (!textContent.trim()) {
          throw new Error("PDF text content is empty, falling back to vision parsing.");
        }

        const promptText = `You are a premium resume parsing SDE recruiter.
Analyze this resume text and extract the candidate profile data. 
You MUST return a valid JSON block containing the following keys (do not wrap in markdown tags or prefix with text):
{
  "type": "profile_sync",
  "college": "<college or university name>",
  "specialization": "<specialization or degree major>",
  "cgpa": "<cgpa, or empty string>",
  "techStack": "<comma separated list of languages, frameworks, databases, tools>",
  "experience": "<exactly 3 high-impact software engineering resume bullet points describing projects/experience, separated by double newlines or standard bullets>"
}

Resume Text Content:
${textContent}`;

        const { text } = await generateAIResponse(promptText, {
          temperature: 0.2
        });
        replyText = text;
      } catch (pdfErr) {
        console.warn("PDF text extraction failed or was empty, trying vision parser:", pdfErr);
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
        replyText = await generateVisionResponse(base64Data, mimeType, promptText, {
          temperature: 0.2
        });
      }
    } else {
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

      replyText = await generateVisionResponse(base64Data, mimeType, promptText, {
        temperature: 0.2
      });
    }

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
