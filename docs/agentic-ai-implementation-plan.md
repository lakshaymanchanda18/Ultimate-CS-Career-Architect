# Agentic AI Implementation Plan

## Goal

Add an optional, supervised Career Architect Agent that can understand a user's career goal, inspect their existing career data, choose from a small set of existing platform capabilities, and return a practical plan. Keep current resume, interview, project, job tracking, authentication, and database workflows working as they do today.

The first release should be additive: a new agent page/API, bounded read-only tools, explicit user approval for writes, and reuse of the existing model router. No current feature should depend on the agent.

## What the project already has

- Next.js App Router API endpoints and client components.
- NextAuth sessions and per-user data in Prisma.
- A provider router in `src/lib/ai-client.ts` with Gemini, Groq, OpenRouter, Mistral, and Cerebras configuration, failover, timeouts, and JSON parsing.
- Existing AI workflows: resume analysis (`/api/analyze`), interview/profile chat (`/api/interview/chat`), resume upload (`/api/interview/upload`), project ideas (`/api/projects`), and project blueprints (`/api/projects/blueprint`).
- Relevant stored context: `Profile`, `Analysis`, `InterviewSession`, `SavedProject`, `ProjectBlueprint`, and `JobApplication` in `prisma/schema.prisma`.

The AI router is reusable, but its provider list and model names are configuration, not a guarantee that each provider currently offers a free quota. Free availability, rate limits, and model names can change. For zero spend, keep the agent disabled unless at least one provider key with an available free quota is configured; optionally add local Ollama support later for inference on the user's own hardware.

## Agent scope for v1

The agent should support user-initiated tasks such as:

- “What should I work on next to prepare for backend roles?”
- “Review my profile and recent interview feedback and make a 4-week plan.”
- “Suggest a portfolio project that addresses my biggest skill gap.”
- “Turn this plan into project tasks.”

The agent can read authorized account data and invoke bounded generation tools. It must not autonomously apply to jobs, send messages, alter profile data, delete records, or silently persist plans. V1 writes only an approved roadmap/plan record. Existing features remain directly usable without agent availability.

## Target architecture

```text
Agent panel (new UI)
  -> POST /api/agent/runs (authenticated)
      -> load user-owned context with Prisma
      -> bounded agent orchestrator
          -> model proposes one structured next action
          -> server validates action against tool registry and schemas
          -> execute read-only tool or request user approval for a write
          -> add result to run state and continue (max 4 tool steps)
      -> persist run/action trace and return plan/progress
  -> POST /api/agent/runs/:id/approve (explicit user approval)
      -> validate owner, pending action, and payload again
      -> apply the approved write and mark action complete
```

Use the existing provider failover for model calls. Keep the orchestrator server-side. Treat all model output, user prompts, and database text as untrusted input. Tool execution is application code; the model may request a named tool, but it never receives database credentials or direct SQL access.

## Tool catalog and where each capability belongs

| Tool | Initial behavior | Existing project area | Guardrails |
|---|---|---|---|
| `get_profile` | Read profile and selected preferences | `Profile`, `/api/profile` | Require session; query by session user ID only |
| `get_recent_resume_analysis` | Read latest analysis and findings | `Analysis`, `/api/analyses` | Limit count and fields; account scoped |
| `get_interview_feedback` | Summarize recent interview outcomes | `InterviewSession`, `/api/interview/history` | Limit recent sessions; don't expose unrelated users |
| `get_saved_projects` | Read saved ideas and existing blueprints | `SavedProject`, `ProjectBlueprint` | Account scoped; cap rows and text length |
| `get_job_pipeline_summary` | Return counts/statuses and optionally next steps | `JobApplication`, `/api/jobs` | Aggregate by current user; no external job search in v1 |
| `recommend_projects` | Generate ideas using current project prompt | `/api/projects`, `buildProjectsPrompt` | Invoke shared server function, not an HTTP loopback |
| `draft_blueprint` | Generate architecture/tasks | `/api/projects/blueprint` | Draft only; do not save until user approves |
| `draft_career_plan` | Convert profile/context/gaps into prioritized plan | New prompt in `src/lib/prompts.ts` | Structured schema; bounded length and dates |
| `save_career_plan` | Persist approved plan | New Prisma model and approval endpoint | Explicit approval; ownership and schema validation |

Resume analysis and interview evaluation are compute-heavy/user-input workflows. In v1 the agent should read their saved results and link the user to the existing UI. Do not trigger these automatically with missing or fabricated inputs. Add agent-triggered execution later only with clear preview and confirmation.

## Implementation phases

### Phase 0 — Baseline and compatibility

1. Preserve the existing routes and their request/response contracts.
2. Extract reusable server-side service functions from AI endpoints only where needed, so both existing routes and agent tools call the same implementation.
3. Add a feature flag such as `CAREER_AGENT_ENABLED=false` by default. The new API returns a clear disabled response while off.
4. Ensure absence of an AI API key affects only AI-dependent requests, not page loading, login, profile, jobs, or saved data.

### Phase 1 — Read-only agent MVP

1. Add a typed tool registry and JSON schemas for each input/output. Start with profile, recent analysis, interview feedback, saved projects, and job summary tools.
2. Add `POST /api/agent/runs`, requiring NextAuth and rejecting oversized/empty prompts.
3. Implement a bounded orchestrator: max 4 tool calls, max 2 model planning turns, request timeout, output-size limit, provider failover, and clear stop reasons.
4. Require structured model output, for example `{kind:"tool_call",tool:"get_profile",input:{}}` or `{kind:"final",answer:"...",plan:[...]}`. Validate it with deterministic code before dispatch.
5. Add an Agent panel accessible from the app navigation, showing the request, concise reasoning summary, tools used, progress, and final suggestions. Do not expose hidden chain-of-thought; show an action summary instead.
6. If no provider is configured or all free quotas are exhausted, show a recoverable unavailable state and keep other modules accessible.

### Phase 2 — Durable runs and approved writes

1. Add Prisma models such as `AgentRun`, `AgentAction`, and `CareerPlan`, each related to `User` with cascading deletion. Store status, bounded input/output JSON, tool names, timestamps, and approval status; never store API keys.
2. Add a migration and deploy it before enabling the feature. Keep reads compatible with existing schema and data.
3. Add run-history and approval endpoints. Every endpoint checks the session user ID and queries by both record ID and user ID.
4. Show a preview of a proposed plan (milestones, tasks, target roles, rationale/evidence) and let the user approve saving it. Revalidate the approved payload server-side; never accept a model-supplied owner ID.
5. Add cancel/retry and idempotency behavior so repeated requests do not create duplicate plans.

### Phase 3 — Integrate the existing career modules

1. Discovery/profile: suggest missing profile fields and career targets; save only after user edits and confirms.
2. Resume analyzer: explain the latest analysis and generate a targeted checklist; route users to Analyzer for a fresh run.
3. Interview preparation: use recent feedback to propose the next practice track; start a session only after user action.
4. Projects/Project Studio: suggest a project, draft blueprint, and offer to save to existing project storage after approval.
5. Job Board: summarize the user's pipeline and suggest follow-up tasks; do not contact employers or change statuses automatically.
6. Dashboard: show approved plan progress and links to supporting analyses/interviews/projects.
7. Settings: provide agent enable/disable, clear run history, and data-retention controls.

### Phase 4 — Optional advanced capabilities

- Add local Ollama adapter if users need zero API spend and have compatible hardware. Route through a provider interface without changing tool logic.
- Add retrieval over the user's own saved records with simple relational filtering first. Add embeddings only if measured search quality needs them; don't require a paid vector service.
- Add scheduled reminders only as an explicit user-configured feature and only if the deployment has a reliable scheduler.
- Add external job-market research only after selecting a source/API and checking its access/cost constraints.

## Data model proposal

- `AgentRun`: `id`, `userId`, `status` (`RUNNING`, `WAITING_APPROVAL`, `COMPLETED`, `FAILED`, `CANCELLED`), user request, final answer, timestamps, and bounded context metadata.
- `AgentAction`: `id`, `runId`, `toolName`, input/output JSON, status, approval timestamp, execution timestamp, error code. Keep sensitive free text minimized.
- `CareerPlan`: `id`, `userId`, title, target role, plan JSON, status, created/updated timestamps.

Use PostgreSQL JSON fields if supported by the deployed provider. If the current database setup makes JSON migration awkward, store validated JSON strings consistently with current schema patterns. Add indexes on `userId`, `status`, and timestamps. Existing SQLite `dev.db` is local development data; do not reset or rewrite it as part of this feature.

## Reliability and safety requirements

- Feature flag off by default and independent of existing routes.
- Auth required for every run, history, approval, and plan endpoint.
- All Prisma reads/writes scoped to the authenticated user.
- Tool allowlist; strict schemas; no dynamic imports, arbitrary URLs, shell, SQL, or unrestricted file access.
- Bounded iterations, tokens, input size, database result count, and request duration.
- Retry/failover only on provider transport or availability errors; don't repeat side-effecting tools automatically.
- Persist a run trace sufficient to explain which tools ran, without storing secrets or unnecessary conversation content.
- Sanitize model errors for the UI; log provider, latency, run ID, tool name, and error class, not API keys or full resume text.
- Escape/render generated text safely; do not inject model content as HTML.
- Confirmation before all writes. Re-check permissions and validate payload at execution time.
- Prompt injection defense: treat profile/resume/interview/job text as data, never as instructions; tools do not grant permissions based on model claims.
- Add per-user request throttling and a per-run call budget to prevent accidental quota burn.

## Free-tier operating strategy

- Reuse `generateChatResponse` / `generateAIResponse` and the existing `AI_ROUTING_ORDER` mechanism where practical.
- The agent should make the fewest model calls possible: one planning call, up to four tool calls, and one final synthesis call, with a lower configurable budget by default.
- Prefer concise context summaries and only retrieve records required for the user's request.
- Make provider keys optional at build/startup; detect missing keys at request time.
- Provide documentation for configuring one available free provider. Do not promise that a named provider/model remains free; verify its current terms when deploying.
- Local inference can avoid per-request API charges but still uses the user's hardware/electricity and may be slower.

## Rollout without disrupting the app

1. Implement behind `CAREER_AGENT_ENABLED=false`.
2. Apply additive database migration; do not rename or remove current fields/models.
3. Run typecheck/build/lint and manually exercise existing critical flows plus new agent flow in a development environment.
4. Enable only in local/staging with one configured provider and test with a non-sensitive account.
5. Enable for a small set of users or keep opt-in; monitor error rates, provider usage, and run duration.
6. Keep an immediate rollback: set feature flag false. Agent tables may remain; no existing feature depends on them.

## Delivery checklist

- [x] Confirm deployment database provider and migration workflow.
- [x] Define typed agent/tool contracts and output schemas.
- [x] Add shared service layer for any reused generators.
- [x] Add read-only tools and authenticated run endpoint.
- [x] Add bounded orchestrator and provider budget handling.
- [x] Add Agent UI and navigation entry behind feature flag.
- [x] Add run/action/plan schema and additive migration.
- [x] Add approval-gated plan persistence and history UI.
- [x] Integrate analyzer, interviews, projects, job board, dashboard, and settings incrementally.
- [x] Update `.env.production.example`, README setup, privacy notes, and troubleshooting.
- [x] Verify existing workflows and rollback with feature flag.

## Suggested first release boundary

Ship Phase 1 plus plan preview, then Phase 2 persistence only after the read-only agent behaves reliably. This yields useful agent planning while containing cost, limiting permissions, and keeping current workflows available if the agent or provider is down.
