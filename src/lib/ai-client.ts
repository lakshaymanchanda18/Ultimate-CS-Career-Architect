import { GoogleGenAI } from '@google/genai';

// ─── Model Configuration ────────────────────────────────────────
// Using models confirmed available on free-tier Google AI Studio.
// gemini-2.0-flash is the current recommended default.
// gemini-2.0-flash-lite is the lightest fallback.
const PRIMARY_MODEL = 'gemini-flash-latest';
const FALLBACK_MODEL = 'gemini-flash-lite-latest';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

// ─── Types ──────────────────────────────────────────────────────
export interface AIOptions {
  maxOutputTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
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

// ─── Error Classification ───────────────────────────────────────
function classifyError(error: unknown): {
  type: 'RATE_LIMIT' | 'MODEL_NOT_FOUND' | 'AUTH_FAILED' | 'PARSE_FAILED' | 'EMPTY_RESPONSE' | 'ABORTED' | 'UNKNOWN';
  retryable: boolean;
  switchModel: boolean;
} {
  if (!(error instanceof Error)) {
    return { type: 'UNKNOWN', retryable: true, switchModel: false };
  }

  const msg = error.message || '';
  const status = (error as any).status;

  // Aborted by user
  if (msg.includes('aborted') || msg.includes('AbortError')) {
    return { type: 'ABORTED', retryable: false, switchModel: false };
  }

  // Auth / key issues — never retry, key is dead
  if (
    status === 400 || status === 403 ||
    msg.includes('API_KEY_INVALID') ||
    msg.includes('API key not valid') ||
    msg.includes('leaked') ||
    msg.includes('PERMISSION_DENIED')
  ) {
    return { type: 'AUTH_FAILED', retryable: false, switchModel: false };
  }

  // Rate limit — retry with backoff
  if (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('Too Many Requests')
  ) {
    return { type: 'RATE_LIMIT', retryable: true, switchModel: true };
  }

  // Model not found — don't retry this model, switch
  if (
    status === 404 ||
    msg.includes('not found') ||
    msg.includes('not available') ||
    msg.includes('does not exist') ||
    msg.includes('MODEL_NOT_FOUND') ||
    msg.includes('not supported')
  ) {
    return { type: 'MODEL_NOT_FOUND', retryable: false, switchModel: true };
  }

  // Empty response
  if (msg === 'EMPTY_RESPONSE') {
    return { type: 'EMPTY_RESPONSE', retryable: true, switchModel: false };
  }

  // Parse failure
  if (msg === 'PARSE_FAILED') {
    return { type: 'PARSE_FAILED', retryable: true, switchModel: false };
  }

  return { type: 'UNKNOWN', retryable: true, switchModel: false };
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
    // Fall through
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
        try {
          return JSON.parse(fixed);
        } catch {
          // Final attempt: fix common issues
          const sanitized = fixed
            .replace(/'/g, '"')
            .replace(/(\w+):/g, '"$1":')
            .replace(/""(\w+)"":/g, '"$1":');
          return JSON.parse(sanitized);
        }
      }
    }
  }

  throw new Error('PARSE_FAILED');
}

// ─── Error Sanitizer (Public) ───────────────────────────────────
export function sanitizeAIError(error: unknown): UserFriendlyError {
  if (error instanceof Error && error.message === 'AI_API_KEY_MISSING') {
    return {
      error: 'AI_API_KEY_MISSING',
      userMessage: 'AI service is not configured. Please set AI_API_KEY in your environment.',
      retryable: false,
    };
  }

  const classified = classifyError(error);

  switch (classified.type) {
    case 'AUTH_FAILED':
      return {
        error: 'AUTH_FAILED',
        userMessage: 'Your AI API key is invalid or has been revoked. Please generate a new key from Google AI Studio and update your .env.local file.',
        retryable: false,
      };
    case 'RATE_LIMIT':
      return {
        error: 'RATE_LIMITED',
        userMessage: 'Our AI service is temporarily busy. Please wait 30 seconds and try again.',
        retryable: true,
      };
    case 'MODEL_NOT_FOUND':
      return {
        error: 'MODEL_UNAVAILABLE',
        userMessage: 'AI model is temporarily unavailable. Please try again shortly.',
        retryable: true,
      };
    case 'PARSE_FAILED':
      return {
        error: 'PARSE_FAILED',
        userMessage: 'We received an unexpected response from the AI. Please try again.',
        retryable: true,
      };
    case 'EMPTY_RESPONSE':
      return {
        error: 'EMPTY_RESPONSE',
        userMessage: 'The AI returned an empty response. Please try again.',
        retryable: true,
      };
    case 'ABORTED':
      return {
        error: 'ABORTED',
        userMessage: 'The request was cancelled.',
        retryable: false,
      };
    default:
      return {
        error: 'UNKNOWN',
        userMessage: 'Something went wrong with the AI service. Please try again later.',
        retryable: true,
      };
  }
}

// ─── Structured Logger ──────────────────────────────────────────
function logAI(level: 'INFO' | 'WARN' | 'ERROR', event: string, data: Record<string, unknown> = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'ai-client',
    event,
    ...data,
  };
  if (level === 'ERROR') {
    console.error(JSON.stringify(entry));
  } else if (level === 'WARN') {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

// ─── Core Generation with Retry ─────────────────────────────────
async function callModelWithRetry(
  prompt: string,
  model: string,
  options: AIOptions = {}
): Promise<string> {
  const client = getClient();
  const startTime = Date.now();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Check abort before each attempt
    if (options.signal?.aborted) {
      throw new Error('aborted');
    }

    try {
      logAI('INFO', 'model_request_start', { model, attempt, maxOutputTokens: options.maxOutputTokens });

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: options.maxOutputTokens,
          temperature: options.temperature ?? 0.7,
        },
      });

      const text = response.text || '';
      const latency = Date.now() - startTime;

      if (!text.trim()) {
        logAI('WARN', 'empty_response', { model, attempt, latencyMs: latency });
        throw new Error('EMPTY_RESPONSE');
      }

      logAI('INFO', 'model_request_success', { model, attempt, latencyMs: latency, responseLength: text.length });
      return text;
    } catch (error) {
      const classified = classifyError(error);
      const latency = Date.now() - startTime;

      logAI('WARN', 'model_request_failed', {
        model,
        attempt,
        latencyMs: latency,
        errorType: classified.type,
        errorMessage: error instanceof Error ? error.message.substring(0, 200) : 'unknown',
      });

      // Non-retryable errors: abort immediately
      if (!classified.retryable) {
        throw error;
      }

      // Should switch model: abort this model's retries
      if (classified.switchModel) {
        throw error;
      }

      // Last attempt: throw
      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
      logAI('INFO', 'retry_backoff', { model, attempt, delayMs: Math.round(delay) });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('MAX_RETRIES_EXCEEDED');
}

// ─── Public API ─────────────────────────────────────────────────
export async function generateAIResponse(
  prompt: string,
  options: AIOptions = {}
): Promise<{ text: string; parsed: unknown | null }> {
  let text: string;
  let lastError: unknown;

  // Try primary model
  try {
    text = await callModelWithRetry(prompt, PRIMARY_MODEL, options);
  } catch (primaryError) {
    const classified = classifyError(primaryError);
    lastError = primaryError;

    // If it's auth failure, don't bother trying fallback (same key)
    if (classified.type === 'AUTH_FAILED' || classified.type === 'ABORTED') {
      throw primaryError;
    }

    // Fallback to secondary model
    logAI('WARN', 'fallback_to_secondary', { primaryModel: PRIMARY_MODEL, fallbackModel: FALLBACK_MODEL });
    try {
      text = await callModelWithRetry(prompt, FALLBACK_MODEL, options);
    } catch (fallbackError) {
      logAI('ERROR', 'all_models_failed', {
        primaryModel: PRIMARY_MODEL,
        fallbackModel: FALLBACK_MODEL,
        primaryErrorType: classified.type,
      });
      // Throw whichever error is more informative
      const fallbackClassified = classifyError(fallbackError);
      throw fallbackClassified.type === 'AUTH_FAILED' ? fallbackError : primaryError;
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
      logAI('ERROR', 'json_parse_failed', { responsePreview: result.text.substring(0, 300) });
      throw new Error('PARSE_FAILED');
    }
  }

  return result.parsed as T;
}
