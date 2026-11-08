// ─── Agent Contracts & Types ──────────────────────────────────────

export type AgentRunStatus =
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AgentActionStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'WAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type ApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type KnownToolName =
  | 'get_profile'
  | 'get_recent_resume_analysis'
  | 'get_interview_feedback'
  | 'get_saved_projects'
  | 'get_job_pipeline_summary'
  | 'recommend_projects'
  | 'draft_blueprint'
  | 'draft_career_plan'
  | 'save_career_plan';

export interface MilestoneTask {
  id?: string;
  text: string;
  completed?: boolean;
}

export interface CareerMilestone {
  title: string;
  duration: string; // e.g. "Week 1-2"
  description: string;
  tasks: string[];
}

export interface CareerPlanData {
  title: string;
  targetRole: string;
  timeline: string; // e.g. "4 Weeks"
  summary: string;
  skillGaps: string[];
  milestones: CareerMilestone[];
  rationale: string;
  recommendedNextModule?: 'analyzer' | 'interview' | 'projects' | 'job-board';
}

export interface AgentActionTrace {
  id?: string;
  toolName: KnownToolName | string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  status: AgentActionStatus;
  approvalStatus: ApprovalStatus;
  thought?: string;
  latencyMs?: number;
  error?: string | null;
}

export interface AgentRunMetadata {
  toolStepsCount: number;
  planningTurns: number;
  stopReason: 'COMPLETED' | 'WAITING_APPROVAL' | 'MAX_STEPS' | 'ERROR' | 'TIMEOUT';
  totalDurationMs: number;
}

export interface AgentRunResponse {
  id: string;
  status: AgentRunStatus;
  userRequest: string;
  finalAnswer: string | null;
  planPreview?: CareerPlanData | null;
  pendingApproval?: {
    actionId: string;
    toolName: string;
    payload: CareerPlanData;
    reason: string;
  } | null;
  actions: AgentActionTrace[];
  metadata: AgentRunMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ToolExecutionContext {
  userId: string;
  signal?: AbortSignal;
}

export interface ToolDefinition<TInput = Record<string, unknown>, TOutput = Record<string, unknown>> {
  name: KnownToolName;
  description: string;
  requiresApproval: boolean;
  validateInput: (input: unknown) => { valid: boolean; error?: string; data?: TInput };
  execute: (input: TInput, ctx: ToolExecutionContext) => Promise<TOutput>;
}

export interface ExecutableToolDefinition {
  name: KnownToolName;
  description: string;
  requiresApproval: boolean;
  validateInput: (input: unknown) => { valid: boolean; error?: string; data?: unknown };
  execute: (input: unknown, ctx: ToolExecutionContext) => Promise<Record<string, unknown>>;
}

