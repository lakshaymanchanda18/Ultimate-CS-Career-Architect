// ─── Prompt Templates ───────────────────────────────────────────
// Optimized for minimum token consumption while maintaining output quality.
// All prompts use terse instructions and compact JSON schema definitions.

interface AnalysisInput {
  college: string;
  specialization: string;
  cgpa: string;
  techStack: string;
  experience: string;
}

interface ProjectsInput {
  specialization: string;
  atsScore?: number;
  techStack?: string;
}

interface BlueprintInput {
  title: string;
  techStack: string;
}

/**
 * Resume ATS analysis prompt — targets ~300 input tokens.
 */
export function buildAnalysisPrompt(data: AnalysisInput): string {
  return `You are an elite Tier-1 MNC recruiter (Google, Microsoft level). Evaluate this resume profile strictly.

College: ${data.college}
CGPA: ${data.cgpa}
Specialization: ${data.specialization}
Stack: ${data.techStack}
Experience: ${data.experience}

Return ONLY valid JSON (no markdown, no backticks):
{"atsScore":number,"atsFeedback":"1-sentence","primaryMatchName":"string","primaryMatchScore":number,"secondaryMatchName":"string","secondaryMatchScore":number,"keywords":["TOP","4","KEYWORDS"],"contentImpactGrade":"letter grade","weakBullet":"exact weak line from experience","weakIssue":"issue","fixedBullet":"XYZ-formula optimized version","fixedStrength":"why it's better"}`;
}

/**
 * Project suggestions prompt — targets ~250 input tokens.
 */
export function buildProjectsPrompt(data: ProjectsInput): string {
  let prompt = `You are a senior CS career architect. Suggest 3 advanced projects for a "${data.specialization}" student targeting 50 LPA+ roles at Tier-1 MNCs.`;

  if (data.atsScore && data.techStack) {
    prompt += ` Their ATS score is ${data.atsScore}, stack: ${data.techStack}. Use their stack plus 1-2 cutting-edge technologies.`;
  }

  prompt += `

Return ONLY a JSON array of exactly 3 objects (no markdown, no backticks):
[{"title":"string","demand":"target company","description":"short description solving real problem","stack":["TECH","TECH","TECH"],"hook":"unique hook","lpaTip":"pro tip","killerQuestion":"hard interview question"}]`;

  return prompt;
}

/**
 * Project blueprint prompt — targets ~200 input tokens.
 */
export function buildBlueprintPrompt(data: BlueprintInput): string {
  return `You are a Staff Software Engineer designing a project blueprint.
Project: ${data.title}
Stack: ${data.techStack}

Generate: 1) A Mermaid.js architecture diagram (valid syntax, use "graph TD"). 2) 5-8 implementation tasks.

Return ONLY valid JSON (no markdown, no backticks):
{"architecture":"graph TD\\n  A[Frontend] --> B[Backend]\\n...","tasks":["task 1","task 2","..."]}`;
}
