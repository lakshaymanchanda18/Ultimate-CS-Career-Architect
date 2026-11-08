import { generateJSON } from '../ai-client';
import { buildProjectsPrompt } from '../prompts';

export interface ProjectSuggestion {
  title: string;
  demand: string;
  description: string;
  stack: string[];
  hook: string;
  lpaTip: string;
  killerQuestion: string;
}

export interface RecommendProjectsInput {
  specialization?: string;
  atsScore?: number;
  techStack?: string;
}

/**
 * Reusable server-side function to generate targeted project ideas.
 * Used by both /api/projects and the Career Agent recommend_projects tool.
 */
export async function recommendProjectsService(
  input: RecommendProjectsInput,
  options: { signal?: AbortSignal } = {}
): Promise<ProjectSuggestion[]> {
  const prompt = buildProjectsPrompt({
    specialization: input.specialization || 'Software Engineering',
    atsScore: input.atsScore,
    techStack: input.techStack,
  });

  const result = await generateJSON<unknown>(prompt, {
    maxOutputTokens: 1200,
    temperature: 0.8,
    signal: options.signal,
  });

  let projectsArray: unknown = result;
  if (!Array.isArray(result) && typeof result === 'object' && result !== null) {
    const arrayKey = Object.keys(result as Record<string, unknown>).find(key =>
      Array.isArray((result as Record<string, unknown>)[key])
    );
    if (arrayKey) {
      projectsArray = (result as Record<string, unknown>)[arrayKey];
    }
  }

  if (!Array.isArray(projectsArray)) {
    throw new Error('AI returned an unexpected format for projects.');
  }

  return projectsArray.slice(0, 3) as ProjectSuggestion[];
}

