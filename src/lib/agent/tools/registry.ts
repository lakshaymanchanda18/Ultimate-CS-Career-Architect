import { prisma } from '../../prisma';
import { AGENT_CONFIG } from '../config';
import {
  ToolDefinition,
  ExecutableToolDefinition,
  KnownToolName,
  CareerPlanData,
} from '../types';
import { recommendProjectsService } from '../../services/project-service';
import { draftBlueprintService } from '../../services/blueprint-service';
import { generateJSON } from '../../ai-client';
import { buildCareerPlanPrompt } from '../../prompts';

// ─── Tool 1: get_profile ──────────────────────────────────────────
const getProfileTool: ToolDefinition<Record<string, never>, Record<string, unknown>> = {
  name: 'get_profile',
  description: 'Retrieve the candidate’s saved profile: college, specialization, CGPA, current tech stack, and experience.',
  requiresApproval: false,
  validateInput: () => ({ valid: true, data: {} }),
  execute: async (_input, ctx) => {
    const [profile, user] = await Promise.all([
      prisma.profile.findFirst({
        where: { userId: ctx.userId },
      }),
      prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { name: true, email: true },
      }),
    ]);

    return {
      name: user?.name || '',
      college: profile?.college || 'Not specified',
      specialization: profile?.specialization || 'Not specified',
      cgpa: profile?.cgpa || 'Not specified',
      techStack: profile?.techStack || 'Not specified',
      experience: profile?.experience || 'Not specified',
      hasProfile: Boolean(profile),
    };
  },
};

// ─── Tool 2: get_recent_resume_analysis ───────────────────────────
const getRecentResumeAnalysisTool: ToolDefinition<{ limit?: number }, Record<string, unknown>> = {
  name: 'get_recent_resume_analysis',
  description: 'Retrieve the candidate’s recent resume ATS scores, keyword matches, and bullet-point evaluations.',
  requiresApproval: false,
  validateInput: (input: unknown) => {
    const raw = input as Record<string, unknown> | undefined;
    const limit = typeof raw?.limit === 'number' && raw.limit > 0 ? Math.min(raw.limit, AGENT_CONFIG.MAX_RECENT_ANALYSES) : 2;
    return { valid: true, data: { limit } };
  },
  execute: async (input, ctx) => {
    const analyses = await prisma.analysis.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      take: input.limit || 2,
      select: {
        id: true,
        atsScore: true,
        atsFeedback: true,
        primaryMatchName: true,
        primaryMatchScore: true,
        secondaryMatchName: true,
        secondaryMatchScore: true,
        keywords: true,
        contentImpactGrade: true,
        weakBullet: true,
        weakIssue: true,
        fixedBullet: true,
        createdAt: true,
      },
    });

    const parsedAnalyses = analyses.map(a => {
      let keywords: string[] = [];
      try {
        keywords = JSON.parse(a.keywords);
      } catch {
        keywords = [];
      }
      return {
        ...a,
        keywords,
      };
    });

    return {
      count: analyses.length,
      analyses: parsedAnalyses,
      latestAtsScore: analyses[0]?.atsScore ?? null,
    };
  },
};

// ─── Tool 3: get_interview_feedback ──────────────────────────────
const getInterviewFeedbackTool: ToolDefinition<{ limit?: number }, Record<string, unknown>> = {
  name: 'get_interview_feedback',
  description: 'Retrieve past mock interview sessions, overall scores, and feedback for the candidate.',
  requiresApproval: false,
  validateInput: (input: unknown) => {
    const raw = input as Record<string, unknown> | undefined;
    const limit = typeof raw?.limit === 'number' && raw.limit > 0 ? Math.min(raw.limit, AGENT_CONFIG.MAX_RECENT_INTERVIEWS) : 3;
    return { valid: true, data: { limit } };
  },
  execute: async (input, ctx) => {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      take: input.limit || 3,
      select: {
        id: true,
        mode: true,
        role: true,
        level: true,
        overallScore: true,
        feedback: true,
        createdAt: true,
      },
    });

    const parsedSessions = sessions.map(s => {
      let feedbackSummary = 'Session recorded';
      if (s.feedback) {
        try {
          const parsed = JSON.parse(s.feedback);
          if (typeof parsed?.summary === 'string') {
            feedbackSummary = parsed.summary;
          } else if (Array.isArray(parsed?.strengths) && parsed.strengths.length > 0) {
            feedbackSummary = String(parsed.strengths[0]);
          }
        } catch {
          feedbackSummary = s.feedback;
        }
      }
      return {
        id: s.id,
        mode: s.mode,
        role: s.role,
        level: s.level,
        overallScore: s.overallScore,
        summary: feedbackSummary,
        createdAt: s.createdAt,
      };
    });

    return {
      count: sessions.length,
      sessions: parsedSessions,
    };
  },
};

// ─── Tool 4: get_saved_projects ──────────────────────────────────
const getSavedProjectsTool: ToolDefinition<Record<string, never>, Record<string, unknown>> = {
  name: 'get_saved_projects',
  description: 'Retrieve saved portfolio project ideas and technical blueprints generated by the candidate.',
  requiresApproval: false,
  validateInput: () => ({ valid: true, data: {} }),
  execute: async (_input, ctx) => {
    const [savedProjects, blueprints] = await Promise.all([
      prisma.savedProject.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: 'desc' },
        take: AGENT_CONFIG.MAX_SAVED_PROJECTS,
        select: {
          id: true,
          title: true,
          demand: true,
          stack: true,
          hook: true,
        },
      }),
      prisma.projectBlueprint.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: 'desc' },
        take: AGENT_CONFIG.MAX_SAVED_PROJECTS,
        select: {
          id: true,
          title: true,
          techStack: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      savedProjects: savedProjects.map(p => ({
        ...p,
        stack: (() => {
          try {
            return JSON.parse(p.stack);
          } catch {
            return [p.stack];
          }
        })(),
      })),
      blueprints: blueprints.map(b => ({
        id: b.id,
        title: b.title,
        techStack: b.techStack,
      })),
    };
  },
};

// ─── Tool 5: get_job_pipeline_summary ────────────────────────────
const getJobPipelineSummaryTool: ToolDefinition<Record<string, never>, Record<string, unknown>> = {
  name: 'get_job_pipeline_summary',
  description: 'Retrieve the status breakdown and counts of the candidate’s tracked job applications.',
  requiresApproval: false,
  validateInput: () => ({ valid: true, data: {} }),
  execute: async (_input, ctx) => {
    const jobs = await prisma.jobApplication.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
      take: AGENT_CONFIG.MAX_JOB_APPLICATIONS,
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        appliedDate: true,
      },
    });

    const statusCounts: Record<string, number> = {
      WISHLIST: 0,
      APPLIED: 0,
      INTERVIEWING: 0,
      OFFER: 0,
      REJECTED: 0,
    };

    jobs.forEach(job => {
      if (statusCounts[job.status] !== undefined) {
        statusCounts[job.status]++;
      }
    });

    return {
      totalApplications: jobs.length,
      statusCounts,
      recent: jobs.slice(0, 5),
    };
  },
};

// ─── Tool 6: recommend_projects ──────────────────────────────────
const recommendProjectsTool: ToolDefinition<
  { specialization?: string; atsScore?: number; techStack?: string },
  Record<string, unknown>
> = {
  name: 'recommend_projects',
  description: 'Generate high-impact portfolio project ideas tailored to a specialization and tech stack.',
  requiresApproval: false,
  validateInput: (input: unknown) => {
    const raw = input as Record<string, unknown> | undefined;
    return {
      valid: true,
      data: {
        specialization: typeof raw?.specialization === 'string' ? raw.specialization.slice(0, 100) : undefined,
        atsScore: typeof raw?.atsScore === 'number' ? raw.atsScore : undefined,
        techStack: typeof raw?.techStack === 'string' ? raw.techStack.slice(0, 200) : undefined,
      },
    };
  },
  execute: async (input, ctx) => {
    const suggestions = await recommendProjectsService(input, { signal: ctx.signal });
    return {
      count: suggestions.length,
      projects: suggestions,
    };
  },
};

// ─── Tool 7: draft_blueprint ─────────────────────────────────────
const draftBlueprintTool: ToolDefinition<
  { title: string; techStack: string },
  Record<string, unknown>
> = {
  name: 'draft_blueprint',
  description: 'Draft a technical architecture blueprint (Mermaid diagram + implementation tasks) for a project.',
  requiresApproval: false,
  validateInput: (input: unknown) => {
    const raw = input as Record<string, unknown> | undefined;
    if (!raw || typeof raw.title !== 'string' || !raw.title.trim()) {
      return { valid: false, error: 'Project title is required.' };
    }
    if (typeof raw.techStack !== 'string' || !raw.techStack.trim()) {
      return { valid: false, error: 'Tech stack is required.' };
    }
    return {
      valid: true,
      data: {
        title: raw.title.trim().slice(0, 120),
        techStack: raw.techStack.trim().slice(0, 200),
      },
    };
  },
  execute: async (input, ctx) => {
    const blueprint = await draftBlueprintService(input, { signal: ctx.signal });
    return {
      title: input.title,
      techStack: input.techStack,
      architecture: blueprint.architecture,
      tasks: blueprint.tasks,
    };
  },
};

// ─── Tool 8: draft_career_plan ───────────────────────────────────
const draftCareerPlanTool: ToolDefinition<
  {
    targetRole?: string;
    specialization?: string;
    techStack?: string;
    experience?: string;
    recentFeedback?: string;
    skillGaps?: string[];
    durationWeeks?: number;
  },
  CareerPlanData
> = {
  name: 'draft_career_plan',
  description: 'Synthesize profile data, gaps, and milestones into a comprehensive structured career roadmap.',
  requiresApproval: false,
  validateInput: (input: unknown) => {
    const raw = input as Record<string, unknown> | undefined;
    return {
      valid: true,
      data: {
        targetRole: typeof raw?.targetRole === 'string' ? raw.targetRole.slice(0, 100) : undefined,
        specialization: typeof raw?.specialization === 'string' ? raw.specialization.slice(0, 100) : undefined,
        techStack: typeof raw?.techStack === 'string' ? raw.techStack.slice(0, 200) : undefined,
        experience: typeof raw?.experience === 'string' ? raw.experience.slice(0, 300) : undefined,
        recentFeedback: typeof raw?.recentFeedback === 'string' ? raw.recentFeedback.slice(0, 300) : undefined,
        skillGaps: Array.isArray(raw?.skillGaps) ? raw.skillGaps.map(String).slice(0, 5) : undefined,
        durationWeeks: typeof raw?.durationWeeks === 'number' ? Math.min(Math.max(raw.durationWeeks, 1), 12) : 4,
      },
    };
  },
  execute: async (input, ctx) => {
    const prompt = buildCareerPlanPrompt(input);
    const plan = await generateJSON<CareerPlanData>(prompt, {
      maxOutputTokens: AGENT_CONFIG.MAX_OUTPUT_TOKENS_PER_CALL,
      temperature: 0.7,
      signal: ctx.signal,
    });

    if (!plan || !plan.title || !plan.milestones || !Array.isArray(plan.milestones)) {
      throw new Error('Failed to generate valid career plan structure.');
    }

    return plan;
  },
};

// ─── Tool 9: save_career_plan (WRITE - Requires Explicit Approval) ───
const saveCareerPlanTool: ToolDefinition<CareerPlanData, { saved: boolean; message: string }> = {
  name: 'save_career_plan',
  description: 'Persist an approved career roadmap into the user’s career plans. Requires explicit user approval.',
  requiresApproval: true,
  validateInput: (input: unknown) => {
    const raw = input as Record<string, unknown> | undefined;
    if (!raw || typeof raw.title !== 'string' || !Array.isArray(raw.milestones)) {
      return { valid: false, error: 'Valid career plan object with title and milestones is required.' };
    }
    return { valid: true, data: raw as unknown as CareerPlanData };
  },
  execute: async () => {
    return {
      saved: false,
      message: 'Pending explicit user approval before saving.',
    };
  },
};

// ─── Registry Collection ──────────────────────────────────────────
export const TOOL_REGISTRY: Record<KnownToolName, ExecutableToolDefinition> = {
  get_profile: getProfileTool as unknown as ExecutableToolDefinition,
  get_recent_resume_analysis: getRecentResumeAnalysisTool as unknown as ExecutableToolDefinition,
  get_interview_feedback: getInterviewFeedbackTool as unknown as ExecutableToolDefinition,
  get_saved_projects: getSavedProjectsTool as unknown as ExecutableToolDefinition,
  get_job_pipeline_summary: getJobPipelineSummaryTool as unknown as ExecutableToolDefinition,
  recommend_projects: recommendProjectsTool as unknown as ExecutableToolDefinition,
  draft_blueprint: draftBlueprintTool as unknown as ExecutableToolDefinition,
  draft_career_plan: draftCareerPlanTool as unknown as ExecutableToolDefinition,
  save_career_plan: saveCareerPlanTool as unknown as ExecutableToolDefinition,
};

export function getTool(name: string): ExecutableToolDefinition | undefined {
  return TOOL_REGISTRY[name as KnownToolName];
}

export function listToolDescriptions(): string {
  return Object.values(TOOL_REGISTRY)
    .map(tool => `- ${tool.name}: ${tool.description}${tool.requiresApproval ? ' (REQUIRES USER APPROVAL)' : ''}`)
    .join('\n');
}
