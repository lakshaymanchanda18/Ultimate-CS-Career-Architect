// ─── Career Architect Agent Configuration & Guardrails ──────────

function parseBoundedInt(envVal: string | undefined, fallback: number, min: number, max: number): number {
  if (!envVal) return fallback;
  const parsed = parseInt(envVal, 10);
  if (isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export const AGENT_CONFIG = {
  // Bounded iteration limits to protect quotas and latency (configurable via env with safe clamps)
  get MAX_TOOL_CALLS_PER_RUN(): number {
    return parseBoundedInt(process.env.AGENT_MAX_TOOL_CALLS, 4, 1, 8);
  },
  get MAX_PLANNING_TURNS(): number {
    return parseBoundedInt(process.env.AGENT_MAX_PLANNING_TURNS, 2, 1, 5);
  },
  get MAX_USER_PROMPT_LENGTH(): number {
    return parseBoundedInt(process.env.AGENT_MAX_USER_PROMPT_LENGTH, 2000, 100, 5000);
  },
  get EXECUTION_TIMEOUT_MS(): number {
    return parseBoundedInt(process.env.AGENT_TIMEOUT_MS, 45000, 10000, 120000);
  },
  get MAX_OUTPUT_TOKENS_PER_CALL(): number {
    return parseBoundedInt(process.env.AGENT_MAX_OUTPUT_TOKENS, 1500, 500, 3000);
  },

  // Tool specific bounds
  MAX_RECENT_ANALYSES: 3,
  MAX_RECENT_INTERVIEWS: 5,
  MAX_SAVED_PROJECTS: 5,
  MAX_JOB_APPLICATIONS: 15,
} as const;

/**
 * Returns whether the Career Agent feature flag is active.
 * Default is false for safe progressive rollout.
 */
export function isAgentEnabled(): boolean {
  return process.env.CAREER_AGENT_ENABLED === 'true';
}

/**
 * Checks if at least one AI provider key is configured in the environment.
 */
export function hasConfiguredAIProvider(): boolean {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.AI_API_KEY,
    process.env.GROQ_API_KEY,
    process.env.OPENROUTER_API_KEY,
    process.env.MISTRAL_API_KEY,
    process.env.CEREBRAS_API_KEY,
  ];
  return keys.some(k => typeof k === 'string' && k.trim().length > 0);
}
