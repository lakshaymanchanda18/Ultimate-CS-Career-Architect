import { generateJSON } from '../ai-client';
import { buildBlueprintPrompt } from '../prompts';

export interface BlueprintResult {
  architecture: string;
  tasks: string[];
}

export interface DraftBlueprintInput {
  title: string;
  techStack: string;
}

/**
 * Reusable server-side function to generate a technical architecture blueprint.
 * Used by /api/projects/blueprint and the Career Agent draft_blueprint tool.
 */
export async function draftBlueprintService(
  input: DraftBlueprintInput,
  options: { signal?: AbortSignal } = {}
): Promise<BlueprintResult> {
  if (!input.title || !input.techStack) {
    throw new Error('Project title and tech stack are required.');
  }

  const prompt = buildBlueprintPrompt({
    title: input.title,
    techStack: input.techStack,
  });

  const result = await generateJSON<BlueprintResult>(prompt, {
    maxOutputTokens: 600,
    temperature: 0.7,
    signal: options.signal,
  });

  if (!result || typeof result.architecture !== 'string' || !Array.isArray(result.tasks)) {
    throw new Error('AI returned an incomplete blueprint format.');
  }

  return {
    architecture: result.architecture,
    tasks: result.tasks,
  };
}

