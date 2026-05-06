import { GoogleGenAI } from '@google/genai';

// ─── Model Configuration ────────────────────────────────────────
const PRIMARY_MODEL = 'gemini-2.0-flash-lite';
const FALLBACK_MODEL = 'gemini-1.5-flash-8b';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// ─── Types ──────────────────────────────────────────────────────
export interface AIOptions {
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface AIResult {
  text: string;
  parsed: unknown | null;
}

export interface UserFriendlyError {
  error: string;
  userMessage: string;
  retryable: boolean;
}

// ─── Singleton Client ───────────────────────────────────────────
let _client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (_client) return _client;

  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY_MISSING');
  }

  _client = new GoogleGenAI({ apiKey });
  return _client;
}

// ─── Rate Limit Detection ───────────────────────────────────────
function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || '';
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate') ||
    msg.includes('Too Many Requests')
  );
}

function isModelUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message || '';
  return (
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('not available') ||
    msg.includes('does not exist') ||
    msg.includes('MODEL_NOT_FOUND')
  );
}

// ─── JSON Response Parser (Robust) ──────────────────────────────
export function parseJSONResponse(text: string): unknown {
  // Strip markdown code fences
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract JSON from surrounding text
  }

  // Find first { or [ and match to last } or ]
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');

  let start = -1;
  let endChar = '';

  if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) {
    start = objStart;
    endChar = '}';
  } else if (arrStart >= 0) {
    start = arrStart;
    endChar = ']';
  }

  if (start >= 0) {
    const end = cleaned.lastIndexOf(endChar);
    if (end > start) {
      const extracted = cleaned.substring(start, end + 1);
      try {
        return JSON.parse(extracted);
      } catch {
        // Try fixing trailing commas
        const fixed = extracted.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(fixed);
      }
    }
  }

  throw new Error('PARSE_FAILED');
}

// ─── Error Sanitizer ────────────────────────────────────────────
export function sanitizeAIError(error: unknown): UserFriendlyError {
  if (error instanceof Error && error.message === 'AI_API_KEY_MISSING') {
    return {
      error: 'AI_API_KEY_MISSING',
      userMessage: 'AI service is not configured. Please contact support.',
      retryable: false,
    };
  }

  if (isRateLimitError(error)) {
    return {
      error: 'RATE_LIMITED',
      userMessage:
        'Our AI service is temporarily busy. Please wait a moment and try again.',
      retryable: true,
    };
  }

  if (isModelUnavailableError(error)) {
    return {
      error: 'MODEL_UNAVAILABLE',
      userMessage:
        'AI service is temporarily unavailable. Please try again shortly.',
      retryable: true,
    };
  }

  if (error instanceof Error && error.message === 'PARSE_FAILED') {
    return {
      error: 'PARSE_FAILED',
      userMessage:
        'We received an unexpected response from the AI. Please try again.',
      retryable: true,
    };
  }

  return {
    error: 'UNKNOWN',
    userMessage: 'Something went wrong. Please try again later.',
    retryable: true,
  };
}

// ─── Core Generation with Retry + Fallback ──────────────────────
async function callModelWithRetry(
  prompt: string,
  model: string,
  options: AIOptions = {}
): Promise<string> {
  const client = getClient();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: options.maxOutputTokens,
          temperature: options.temperature ?? 0.7,
        },
      });

      const text = response.text || '';
      if (!text.trim()) {
        throw new Error('Empty response from AI');
      }

      return text;
    } catch (error) {
      // Don't retry if aborted
      if (options.signal?.aborted) {
        throw new Error('REQUEST_ABORTED');
      }

      // Don't retry on model-not-found (will fallback instead)
      if (isModelUnavailableError(error)) {
        throw error;
      }

      // On rate limit or last attempt, throw
      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }

      // Exponential backoff
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('MAX_RETRIES_EXCEEDED');
}

// ─── Public API ─────────────────────────────────────────────────
export async function generateAIResponse(
  prompt: string,
  options: AIOptions = {}
): Promise<AIResult> {
  let text: string;

  try {
    // Try primary model
    text = await callModelWithRetry(prompt, PRIMARY_MODEL, options);
  } catch (primaryError) {
    // Fallback to secondary model
    try {
      text = await callModelWithRetry(prompt, FALLBACK_MODEL, options);
    } catch {
      // Both models failed — throw the primary error for better diagnostics
      throw primaryError;
    }
  }

  // Attempt JSON parse (non-fatal if it fails)
  let parsed: unknown | null = null;
  try {
    parsed = parseJSONResponse(text);
  } catch {
    // Caller can handle raw text if JSON parse fails
  }

  return { text, parsed };
}

/**
 * Generate AI response and return parsed JSON.
 * Throws sanitized errors if parsing fails.
 */
export async function generateJSON<T = unknown>(
  prompt: string,
  options: AIOptions = {}
): Promise<T> {
  const result = await generateAIResponse(prompt, options);

  if (result.parsed === null) {
    // Try one more parse attempt on the raw text
    try {
      return parseJSONResponse(result.text) as T;
    } catch {
      throw new Error('PARSE_FAILED');
    }
  }

  return result.parsed as T;
}
