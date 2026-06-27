import { GoogleGenAI } from '@google/genai';

// ─── Interfaces & Configuration ────────────────────────────────
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

const PROVIDERS = {
  groq: {
    name: "Groq",
    model: "llama-3.1-8b-instant",
    url: "https://api.groq.com/openai/v1/chat/completions",
    envKey: "GROQ_API_KEY",
    timeout: 3500, // 3.5s
  },
  google: {
    name: "Google AI Studio",
    model: "gemini-1.5-flash",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    envKey: "GEMINI_API_KEY", // fallback to AI_API_KEY if not specified
    timeout: 8000, // 8s
  },
  mistral: {
    name: "Mistral AI",
    model: "open-mistral-7b",
    url: "https://api.mistral.ai/v1/chat/completions",
    envKey: "MISTRAL_API_KEY",
    timeout: 8000, // 8s
  },
  cerebras: {
    name: "Cerebras",
    model: "llama3.1-8b",
    url: "https://api.cerebras.ai/v1/chat/completions",
    envKey: "CEREBRAS_API_KEY",
    timeout: 5000, // 5s
  },
  openrouter: {
    name: "OpenRouter",
    model: "meta-llama/llama-3-8b-instruct:free",
    url: "https://openrouter.ai/api/v1/chat/completions",
    envKey: "OPENROUTER_API_KEY",
    timeout: 10000, // 10s
  }
};

const DEFAULT_ROUTING_ORDER = ["groq", "google", "mistral", "cerebras", "openrouter"] as const;

function getRoutingOrder(): string[] {
  if (process.env.AI_ROUTING_ORDER) {
    return process.env.AI_ROUTING_ORDER.split(",").map(p => p.trim().toLowerCase());
  }
  return [...DEFAULT_ROUTING_ORDER];
}

// ─── Logger ────────────────────────────────────────────────────
function logAI(level: 'INFO' | 'WARN' | 'ERROR', event: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    service: 'ai-client-router',
    event,
    ...data,
  }));
}

// ─── JSON Robust Parser ─────────────────────────────────────────
export function parseJSONResponse(text: string): unknown {
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback parsing heuristics
  }

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
        const fixed = extracted.replace(/,\s*([}\]])/g, '$1');
        try {
          return JSON.parse(fixed);
        } catch {
          // Final replacements for common invalid JSON formatting
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

// ─── Error Sanitizer (Matches Previous Exports) ──────────────────
export function sanitizeAIError(error: unknown): UserFriendlyError {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('ALL_PROVIDERS_FAILED')) {
    return {
      error: 'ALL_PROVIDERS_FAILED',
      userMessage: 'All AI engine backup options are temporarily busy or exhausted. Please try again in a few seconds.',
      retryable: true
    };
  }
  if (message.includes('aborted') || message.includes('AbortError')) {
    return {
      error: 'ABORTED',
      userMessage: 'The request was cancelled.',
      retryable: false
    };
  }
  return {
    error: 'UNKNOWN',
    userMessage: 'Something went wrong with the AI service. Please try again.',
    retryable: true
  };
}

// ─── HTTP Client with Timeout & Abort Signal ─────────────────────
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, parentSignal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortHandler = () => {
    controller.abort();
  };

  if (parentSignal) {
    parentSignal.addEventListener('abort', abortHandler);
  }

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
    if (parentSignal) {
      parentSignal.removeEventListener('abort', abortHandler);
    }
  }
}

// ─── Prompt Translators ─────────────────────────────────────────
function translateToOpenAI(prompt: string) {
  return {
    messages: [
      {
        role: "system",
        content: "You are a professional CS career counselor and resume auditor. You must respond ONLY with valid JSON. Do not include markdown wraps other than raw text, or explanations outside the JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    response_format: { type: "json_object" }
  };
}

function translateToGoogle(prompt: string) {
  return {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };
}

// ─── Provider Specific Callers ──────────────────────────────────
async function callOpenAICompatible(provider: typeof PROVIDERS[keyof typeof PROVIDERS], apiKey: string, prompt: string, options: AIOptions): Promise<string> {
  const payload = {
    model: provider.model,
    ...translateToOpenAI(prompt),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxOutputTokens
  };

  const response = await fetchWithTimeout(provider.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  }, provider.timeout, options.signal);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP_${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content || "";
  if (!text.trim()) {
    throw new Error("EMPTY_RESPONSE");
  }
  return text;
}

async function callGoogle(provider: typeof PROVIDERS['google'], apiKey: string, prompt: string, options: AIOptions): Promise<string> {
  const payload = {
    ...translateToGoogle(prompt),
    generationConfig: {
      responseMimeType: "application/json",
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens
    }
  };

  const url = `${provider.url}?key=${apiKey}`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }, provider.timeout, options.signal);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP_${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text.trim()) {
    throw new Error("EMPTY_RESPONSE");
  }
  return text;
}

export interface ChatMessage {
  role: string;
  content: string;
}

function translateChatToOpenAI(messages: ChatMessage[], systemPrompt?: string) {
  const result: any[] = [];
  if (systemPrompt) {
    result.push({ role: "system", content: systemPrompt });
  }
  messages.forEach(m => {
    let role = m.role;
    if (role === 'assistant' || role === 'model') {
      role = 'assistant';
    } else {
      role = 'user';
    }
    result.push({ role, content: m.content });
  });
  return { messages: result };
}

function translateChatToGoogle(messages: ChatMessage[], systemPrompt?: string) {
  const contents = messages.map(m => {
    let role = m.role;
    if (role === 'assistant' || role === 'model') {
      role = 'model';
    } else {
      role = 'user';
    }
    return {
      role,
      parts: [{ text: m.content }]
    };
  });
  return {
    contents,
    ...(systemPrompt ? {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    } : {})
  };
}

export async function generateChatResponse(
  messages: ChatMessage[],
  options: AIOptions = {},
  systemPrompt?: string
): Promise<string> {
  const routingOrder = getRoutingOrder();
  let lastError: unknown = null;
  let attempts = 0;

  for (const providerKey of routingOrder) {
    const provider = PROVIDERS[providerKey as keyof typeof PROVIDERS];
    if (!provider) continue;

    if (options.signal?.aborted) {
      throw new Error('aborted');
    }

    let apiKey = process.env[provider.envKey];
    if (providerKey === 'google' && !apiKey) {
      apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    }

    if (!apiKey || apiKey.trim() === "") {
      logAI('WARN', 'provider_key_missing', { provider: provider.name });
      continue;
    }

    attempts++;
    const startTime = Date.now();
    logAI('INFO', 'provider_try_chat_start', { provider: provider.name, model: provider.model, attempt: attempts });

    try {
      let text = "";
      if (providerKey === 'google') {
        const payload = {
          ...translateChatToGoogle(messages, systemPrompt),
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxOutputTokens
          }
        };
        const url = `${provider.url}?key=${apiKey}`;
        const response = await fetchWithTimeout(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }, provider.timeout, options.signal);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP_${response.status}: ${errorText}`);
        }

        const result = await response.json();
        text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        const payload = {
          model: provider.model,
          ...translateChatToOpenAI(messages, systemPrompt),
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxOutputTokens
        };

        const response = await fetchWithTimeout(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(payload)
        }, provider.timeout, options.signal);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP_${response.status}: ${errorText}`);
        }

        const result = await response.json();
        text = result?.choices?.[0]?.message?.content || "";
      }

      if (!text.trim()) {
        throw new Error("EMPTY_RESPONSE");
      }

      const latency = Date.now() - startTime;
      logAI('INFO', 'provider_try_chat_success', { provider: provider.name, latencyMs: latency, attempts });
      return text;
    } catch (error: any) {
      const latency = Date.now() - startTime;
      lastError = error;

      logAI('WARN', 'provider_try_chat_failed', {
        provider: provider.name,
        latencyMs: latency,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  }

  logAI('ERROR', 'all_chat_providers_failed', { totalAttempts: attempts });
  throw new Error(`ALL_PROVIDERS_FAILED: Last error: ${lastError instanceof Error ? lastError.message : lastError}`);
}

// ─── Public Main Generation with Failover ────────────────────────
export async function generateAIResponse(
  prompt: string,
  options: AIOptions = {}
): Promise<{ text: string; parsed: unknown | null }> {
  const routingOrder = getRoutingOrder();
  let lastError: unknown = null;
  let attempts = 0;

  for (const providerKey of routingOrder) {
    const provider = PROVIDERS[providerKey as keyof typeof PROVIDERS];
    if (!provider) continue;

    // Check parent signal abort
    if (options.signal?.aborted) {
      throw new Error('aborted');
    }

    // Resolve API Key
    let apiKey = process.env[provider.envKey];
    if (providerKey === 'google' && !apiKey) {
      // Fallback for Google key naming variations
      apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    }

    if (!apiKey || apiKey.trim() === "") {
      logAI('WARN', 'provider_key_missing', { provider: provider.name });
      continue; // Skip if key is not configured
    }

    // Context-Aware Routing Suggestion:
    // If prompt is large (e.g. over 15k characters), skip Groq and Cerebras due to free-tier TPM and context caps
    if (prompt.length > 15000 && (providerKey === 'groq' || providerKey === 'cerebras')) {
      logAI('INFO', 'context_size_skip', { provider: provider.name, promptLength: prompt.length });
      continue;
    }

    attempts++;
    const startTime = Date.now();
    logAI('INFO', 'provider_try_start', { provider: provider.name, model: provider.model, attempt: attempts });

    try {
      let text = "";
      if (providerKey === 'google') {
        text = await callGoogle(provider, apiKey, prompt, options);
      } else {
        text = await callOpenAICompatible(provider, apiKey, prompt, options);
      }

      const latency = Date.now() - startTime;
      logAI('INFO', 'provider_try_success', { provider: provider.name, latencyMs: latency, attempts });

      let parsed: unknown | null = null;
      try {
        parsed = parseJSONResponse(text);
      } catch {
        // Safe JSON parsing fallbacks
      }

      return { text, parsed };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      lastError = error;

      logAI('WARN', 'provider_try_failed', {
        provider: provider.name,
        latencyMs: latency,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  }

  logAI('ERROR', 'all_providers_failed', { totalAttempts: attempts });
  throw new Error(`ALL_PROVIDERS_FAILED: Last error: ${lastError instanceof Error ? lastError.message : lastError}`);
}

/**
 * Public drop-in export matching legacy codebase usage.
 */
export async function generateJSON<T = unknown>(
  prompt: string,
  options: AIOptions = {}
): Promise<T> {
  const result = await generateAIResponse(prompt, options);

  if (result.parsed === null) {
    try {
      return parseJSONResponse(result.text) as T;
    } catch {
      throw new Error('PARSE_FAILED');
    }
  }

  return result.parsed as T;
}
