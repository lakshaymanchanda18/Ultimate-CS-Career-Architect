# Ultimate CS Career Architect

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AI-Powered Career Development Platform for Computer Science Students**

*Precision-engineered resume analysis, interview preparation, and career planning for high-tier tech roles.*

[Live Demo](https://ultimate-cs-career-architect.vercel.app) • [Report Bug](https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect/issues) • [Request Feature](https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Database Schema & Migrations](#database-schema)
- [Agentic Architecture vs RAG](#architectural-note-agentic-orchestration-vs-rag)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Ultimate CS Career Architect** is a comprehensive AI-powered platform designed to help computer science students and early-career professionals optimize their career trajectory. The application leverages Google's Gemini AI to provide intelligent, data-driven insights across multiple career development dimensions.

### Problem Statement

Students and early-career professionals face significant challenges in:
- Optimizing resumes for ATS (Applicant Tracking Systems)
- Identifying skill gaps relative to target roles
- Preparing for technical interviews
- Building portfolio projects strategically
- Managing job applications effectively
- Creating structured career development plans

### Solution

This platform provides an integrated suite of AI-powered tools that address each of these challenges through:

1. **3-Layer Resume Audit System** - ATS compatibility analysis, specialization alignment matching, and content impact scoring
2. **Interactive Interview Preparation** - Mock interviews with AI feedback
3. **Intelligent Project Studio** - AI-suggested portfolio projects with auto-generated architecture diagrams
4. **Job Application Dashboard** - Track applications, statuses, and opportunities
5. **Career Discovery Module** - Personalized career pathways and role recommendations

---

## Key Features

### 🎯 Core Modules

#### **1. Discovery Section**
- Onboarding flow for student profiles
- Capture of academic background, specialization, and tech stack
- Entry point for career exploration

#### **2. Interview Preparation**
- Interactive mock interview simulation
- Real-time AI feedback
- Question generation based on specialization
- Performance tracking

#### **3. Resume Analyzer** 
- **Layer 1 Audit**: ATS Compatibility Score (0-100)
  - Identifies structural issues and keyword optimization opportunities
  - Detailed feedback on formatting and readability

- **Layer 2 Audit**: Specialization Alignment
  - Primary and secondary specialization matching (0-100%)
  - Top keyword recommendations
  - Skill-role compatibility analysis

- **Layer 3 Audit**: Content Impact Score
  - Grades resume bullet points (A-F scale)
  - Identifies weak bullet points with specific issues
  - Suggests impactful alternatives with actionable improvements
  - PDF export functionality

#### **4. Dashboard**
- View historical analysis results
- Restore previous analyses
- Track improvements over time
- Performance metrics visualization

#### **5. Job Board**
- Track job applications (WISHLIST, APPLIED, INTERVIEWING, OFFER, REJECTED)
- Record company and role information
- Add application notes and timelines
- Filter and sort applications

#### **6. Projects Section**
- Browse AI-suggested portfolio projects
- Filter by tech stack and specialization
- Project recommendations based on user profile

#### **7. Project Studio**
- AI-generated project architecture diagrams (Mermaid)
- Step-by-step task breakdown
- Tech stack specification
- Exportable project blueprints

#### **8. Career Architect Agent (Supervised Agentic AI)**
- **Bounded Multi-Turn Planning**: Autonomous planning loop capped at 3 planning turns and 4 tool executions per run (`MAX_TOOL_CALLS_PER_RUN = 4`).
- **Rich Candidate Context Inspection**: Queries authenticated user records directly using Prisma (student profile, resume ATS audits, mock interview feedback, saved portfolio projects, and job application pipeline).
- **Human-in-the-Loop Approval Gate (Zero Autonomous Writes)**: The agent operates strictly read-only during exploration. Persisting a career plan always pauses the run into an `AWAITING_APPROVAL` state, requiring the candidate to review and explicitly click "Approve & Save" before any database record is created.
- **Enterprise-Grade Safety Guardrails**:
  - Prompt injection mitigation: untrusted user input and candidate documents are wrapped in `<untrusted_user_data>` delimiters to prevent instruction hijacking.
  - Strict tool whitelisting: Model can only execute pre-registered, validated tools with typed Zod/custom schemas.
  - No dynamic code execution, no arbitrary SQL, no arbitrary external URLs, and no shell access.
  - Relational querying over Prisma: Does **not** use vector RAG or external vector databases; data access is deterministic, tenant-isolated, and authenticated.
- **Transparent Auditability**: Full execution trace showing tool invocations, execution latencies, input summaries, and high-level action descriptions.

#### **9. Settings**
- User profile management
- Preferences and account settings
- System configuration & Career Agent guardrails overview

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.2 (App Router)
- **UI Library**: React 19.2
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React 1.14
- **Animations**: Native CSS with Tailwind transitions

### Backend
- **Runtime**: Node.js (via Next.js API routes)
- **ORM**: Prisma 5.22
- **Database**: PostgreSQL (with support for other drivers via Prisma)
- **Authentication**: NextAuth 4.24

### AI & ML (Multi-Provider Failover Architecture)
- **Primary AI Provider**: Google Gemini (via `@google/genai` SDK)
  - Models: `gemini-flash-latest` (Primary), `gemini-flash-lite-latest` (Lightweight fallback)
- **Automatic Multi-Provider Failover Router** (`src/lib/ai-client.ts`):
  1. **Google Gemini**: `gemini-flash-latest` / `gemini-flash-lite-latest`
  2. **Groq**: `llama-3.3-70b-versatile` (Ultra-low latency inference)
  3. **OpenRouter**: `google/gemini-2.0-flash-001` (Aggregated model gateway)
  4. **Mistral AI**: `mistral-small-latest` (High-efficiency reasoning)
  5. **Cerebras**: `llama3.1-8b` (High-speed hardware acceleration)
- **Agent Orchestrator**: Bounded multi-turn supervisor (`src/lib/agent/orchestrator.ts`)
- **Key Capabilities**:
  - Structured JSON generation with automatic markdown fence stripping and repair
  - Resume ATS and content impact evaluation
  - Contextual technical interview questions and scoring
  - Project architecture synthesis with Mermaid diagram generation
  - Supervised agentic career roadmap generation with human approval gates

### Additional Libraries
- **Diagram Generation**: Mermaid 11.14
- **PDF Export**: react-to-pdf 3.2
- **Drag & Drop**: @hello-pangea/dnd 18.0
- **Security**: bcrypt 6.0 (for password hashing)

### Development Tools
- **Linting**: ESLint 9.0 + Next.js config
- **PostCSS**: 4.0 (Tailwind integration)
- **Build Tool**: Webpack (Next.js default)

---

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────┐
│                   User Interface Layer                  │
│                    (React Components)                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   API Layer                             │
│              (Next.js API Routes)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │ /api/analyze      - Resume analysis               │ │
│  │ /api/projects     - Project generation            │ │
│  │ /api/auth         - Authentication                │ │
│  │ /api/analyses     - Analysis retrieval            │ │
│  │ /api/jobs         - Job application management    │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         ▼                ▼
┌──────────────────┐  ┌──────────────────┐
│  Prisma ORM      │  │  Google Gemini   │
│                  │  │  AI API          │
│  PostgreSQL DB   │  │  (with Retry)    │
└──────────────────┘  └──────────────────┘
```

### Component Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main application container
│   ├── globals.css             # Global styles
│   ├── api/                    # Backend API routes
│   │   ├── analyze/            # Resume analysis endpoint
│   │   ├── projects/           # Project generation
│   │   ├── jobs/               # Job tracking
│   │   ├── analyses/           # Analysis retrieval
│   │   └── auth/               # Authentication
│   └── login/                  # Auth UI (future)
├── components/                 # React components
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── TopNav.tsx              # Header navigation
│   ├── DiscoverySection.tsx    # Onboarding flow
│   ├── InterviewSection.tsx    # Mock interviews
│   ├── AnalyzerSection.tsx     # Resume analysis UI
│   ├── DashboardSection.tsx    # Historical analyses
│   ├── JobBoardSection.tsx     # Job application tracker
│   ├── ProjectsSection.tsx     # Project browser
│   ├── ProjectStudio.tsx       # Project details editor
│   ├── SettingsSection.tsx     # User settings
│   ├── ResumeTemplate.tsx      # PDF template
│   ├── Sidebar.tsx             # Navigation
│   ├── ThemeProvider.tsx       # Theme management
│   └── Providers.tsx           # Client-side providers
└── lib/                        # Utilities & services
    ├── ai-client.ts            # Google Gemini integration
    ├── prisma.ts               # Prisma client instance
    └── prompts.ts              # AI prompt templates
```

### Data Flow: Resume Analysis

```
User Input (College, Specialization, CGPA, Tech Stack, Experience)
                    ↓
            POST /api/analyze
                    ↓
         Construct AI Prompt with User Data
                    ↓
         Call Gemini API (with retry logic)
                    ↓
         Parse JSON Response (Robust parsing)
                    ↓
    Extract Analysis: ATS Score, Match %, Keywords, Impact Grade
                    ↓
         Save to Database via Prisma
                    ↓
    Return Analysis Data to Frontend
                    ↓
      Render in AnalyzerSection Component
```

---

## Project Structure

```
ultimate-cs-career-architect/
│
├── 📄 README.md                    # This file
├── 📄 package.json                 # Dependencies and scripts
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 next.config.ts               # Next.js configuration
├── 📄 tailwind.config.mjs           # Tailwind CSS config
├── 📄 postcss.config.mjs            # PostCSS config
├── 📄 eslint.config.mjs             # ESLint configuration
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 public/                      # Static assets
│   └── [favicon, images, etc.]
│
├── 📁 prisma/                      # Database configuration
│   └── schema.prisma              # Prisma schema (User, Profile, Analysis, etc.)
│
├── 📁 src/
│   │
│   ├── 📁 app/                     # Next.js App Router
│   │   ├── 📄 layout.tsx           # Root layout
│   │   ├── 📄 page.tsx             # Main application page
│   │   ├── 📄 globals.css          # Global styles
│   │   ├── 📄 icon.svg             # App icon
│   │   │
│   │   ├── 📁 api/                 # API routes
│   │   │   ├── 📁 analyze/         # Resume analysis endpoint
│   │   │   ├── 📁 projects/        # Project generation
│   │   │   ├── 📁 jobs/            # Job tracking
│   │   │   ├── 📁 analyses/        # Analysis retrieval
│   │   │   └── 📁 auth/            # Authentication routes
│   │   │
│   │   └── 📁 login/               # Login page (placeholder)
│   │
│   ├── 📁 components/              # Reusable React components
│   │   ├── 📄 Sidebar.tsx          # Navigation sidebar
│   │   ├── 📄 TopNav.tsx           # Top navigation bar
│   │   ├── 📄 DiscoverySection.tsx  # Discovery/onboarding
│   │   ├── 📄 InterviewSection.tsx  # Interview prep
│   │   ├── 📄 AnalyzerSection.tsx   # Resume analysis
│   │   ├── 📄 DashboardSection.tsx  # Dashboard
│   │   ├── 📄 JobBoardSection.tsx   # Job board
│   │   ├── 📄 ProjectsSection.tsx   # Projects browser
│   │   ├── 📄 ProjectStudio.tsx     # Project details
│   │   ├── 📄 SettingsSection.tsx   # Settings
│   │   ├── 📄 ResumeTemplate.tsx    # Resume PDF template
│   │   ├── 📄 ThemeProvider.tsx     # Theme management
│   │   └── 📄 Providers.tsx         # Client providers
│   │
│   └── 📁 lib/                     # Utility libraries
│       ├── 📄 ai-client.ts         # Google Gemini client
│       ├── 📄 prisma.ts            # Prisma singleton
│       └── 📄 prompts.ts           # AI prompt templates
│
└── 📄 .env.local                   # Environment variables (local)
```

---

## Installation

### Prerequisites

- **Node.js** 18+ (tested with 20.x)
- **npm** or **yarn** package manager
- **PostgreSQL** database (or compatible database via Prisma)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com))

### Step 1: Clone Repository

```bash
git clone https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect.git
cd Ultimate-CS-Career-Architect
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Setup Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/career_architect"
DIRECT_URL="postgresql://user:password@localhost:5432/career_architect"

# Google AI API
AI_API_KEY="your-google-gemini-api-key-here"
# Alternative: GEMINI_API_KEY="your-key"

# NextAuth Configuration (if implementing auth)
NEXTAUTH_SECRET="generate-a-random-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# Career Architect Agent Feature Flag
CAREER_AGENT_ENABLED="true"
```

### Step 4: Setup Database

Run Prisma migrations to create database schema:

```bash
npx prisma migrate dev --name init
```

Or generate Prisma client only:

```bash
npx prisma generate
```

### Step 5: Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser.

### Step 6: (Optional) Open Prisma Studio

Explore your database with an interactive UI:

```bash
npx prisma studio
```

---

## Configuration

### Environment Variables Reference

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DATABASE_URL` | String | ✅ Yes | — | PostgreSQL connection string with SSL mode |
| `DIRECT_URL` | String | ⚠️ Optional | — | Direct PostgreSQL connection string (useful for migrations/pooling) |
| `NEXTAUTH_SECRET` | String | ✅ Yes | — | Random secret key used by NextAuth to sign and encrypt JWT session cookies |
| `NEXTAUTH_URL` | String | ✅ Yes | `http://localhost:3001` | Canonical origin URL for NextAuth callbacks |
| `CAREER_AGENT_ENABLED` | String | ⚠️ Optional | `true` | **Instant Kill-Switch**: Set to `false` to disable the Career Agent UI and return 403 on all `/api/agent/*` routes |
| `GEMINI_API_KEY` | String | ⚠️ Optional | — | Google AI Studio API key (`gemini-flash-latest`, `gemini-flash-lite-latest`) |
| `AI_API_KEY` | String | ⚠️ Optional | — | Alias for `GEMINI_API_KEY` |
| `GROQ_API_KEY` | String | ⚠️ Optional | — | Groq Cloud API key (`llama-3.3-70b-versatile`) |
| `OPENROUTER_API_KEY` | String | ⚠️ Optional | — | OpenRouter API key (`google/gemini-2.0-flash-001`) |
| `MISTRAL_API_KEY` | String | ⚠️ Optional | — | Mistral AI API key (`mistral-small-latest`) |
| `CEREBRAS_API_KEY` | String | ⚠️ Optional | — | Cerebras API key (`llama3.1-8b`) |
| `AI_ROUTING_ORDER` | String | ⚠️ Optional | `gemini,groq,openrouter,mistral,cerebras` | Comma-separated order of provider failover preference |
| `AGENT_MAX_TOOL_CALLS` | Number | ⚠️ Optional | `4` | Maximum tool calls per agent run (enforced clamp: 1 to 8) |
| `AGENT_MAX_TURNS` | Number | ⚠️ Optional | `3` | Maximum model planning turns per agent run (enforced clamp: 1 to 5) |
| `AGENT_TIMEOUT_MS` | Number | ⚠️ Optional | `35000` | Agent execution timeout in milliseconds (minimum 10,000ms) |
| `AGENT_MAX_USER_PROMPT_LENGTH` | Number | ⚠️ Optional | `1200` | Maximum character length for user career goal prompts |

> [!NOTE]
> **Provider Availability & Free Quotas**: The multi-provider failover system ensures zero-downtime operation without paid services. However, free quotas, rate limits, and model identifiers can change on external provider platforms over time. If a provider returns a `429 (Rate Limited)` or `503 (Unavailable)`, the system automatically fails over to the next configured provider in `AI_ROUTING_ORDER`.

### AI Provider Failover Router

The application includes an enterprise-grade AI client (`src/lib/ai-client.ts`) that implements provider-agnostic structured JSON generation, automatic markdown fence stripping, JSON repair heuristics, exponential backoff, and transparent provider failover.

```mermaid
flowchart TD
    Req["AI Request (Prompt & JSON Schema)"] --> P1{"1. Google Gemini"}
    P1 -->|Success| Done["Valid Parsed Response"]
    P1 -->|429 / 5xx / Network Error| P2{"2. Groq"}
    P2 -->|Success| Done
    P2 -->|Fail| P3{"3. OpenRouter"}
    P3 -->|Success| Done
    P3 -->|Fail| P4{"4. Mistral"}
    P4 -->|Success| Done
    P4 -->|Fail| P5{"5. Cerebras"}
    P5 -->|Success| Done
    P5 -->|All Failed| Err["Safe Error Handled (No Raw Leaks)"]
```

### Disabling the Career Agent (Instant Kill-Switch)

To disable the agent instantly across the application without redeploying code or modifying database tables:

```bash
CAREER_AGENT_ENABLED="false"
```

When set to `false`:
- The Career Agent tab in navigation shows as disabled with a clear status badge.
- All `/api/agent/*` endpoints reject incoming requests with HTTP `403 Forbidden` (`{ "error": "Career agent feature is disabled" }`).
- Existing core features (Resume Analyzer, Mock Interview, Project Studio, Job Tracker, Settings) continue running completely unaffected.

### Database Connection

The application uses Prisma as the ORM with PostgreSQL. Update `DATABASE_URL` in `.env.local`:

```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

Example:
```
postgresql://postgres:password@localhost:5432/ultimate_cs_career
```

---

## Usage Guide

### Initial Setup Flow

1. **Discovery Module**
   - Enter college/university name
   - Select specialization (CSE, IT, etc.)
   - Input CGPA
   - List primary tech stack
   - Specify years of experience

2. **Interview Preparation**
   - Answer mock interview questions
   - Receive AI-generated feedback
   - Track performance metrics

3. **Resume Analysis**
   - Automatic 3-layer analysis
   - View ATS score, specialization match, and impact grade
   - Review suggestions for improvement
   - Export optimized resume as PDF

4. **Career Dashboard**
   - View historical analyses
   - Compare improvements over time
   - Restore previous analysis sessions

5. **Job Board**
   - Create job applications
   - Track application status (Wishlist → Applied → Interviewing → Offer/Rejected)
   - Add notes and dates

6. **Project Portfolio**
   - Browse AI-suggested projects
   - Open Project Studio for details
   - View auto-generated architecture diagrams
   - Review step-by-step implementation guide

### Key User Workflows

#### **Complete Resume Analysis**
1. Navigate to "Interview" section
2. Complete the interview (provide your background)
3. Go to "Analyzer" section
4. Review the 3-layer audit results
5. Export PDF for external use

#### **Get Project Recommendations**
1. Complete your profile in Discovery
2. Navigate to "Projects" section
3. Filter by tech stack or specialization
4. Click on project to open Project Studio
5. Review architecture and tasks

#### **Manage Job Applications**
1. Navigate to "Job Board" section
2. Click "Add Application"
3. Enter company name, role, and status
4. Add notes about the opportunity
5. Update status as you progress

---

## API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### **Resume Analysis**

**POST** `/analyze`

Analyze a user's resume profile and return AI-powered insights.

**Request:**
```json
{
  "college": "Stanford University",
  "specialization": "Computer Science",
  "cgpa": "3.8",
  "techStack": "JavaScript, React, Node.js, PostgreSQL",
  "experience": "2 years"
}
```

**Response:**
```json
{
  "atsScore": 85,
  "atsFeedback": "Strong ATS compatibility. Keywords optimized.",
  "primaryMatchName": "Full Stack Developer",
  "primaryMatchScore": 92,
  "secondaryMatchName": "Frontend Engineer",
  "secondaryMatchScore": 78,
  "keywords": ["React", "Node.js", "PostgreSQL", "REST API"],
  "contentImpactGrade": "A",
  "weakBullet": "Worked on web projects",
  "weakIssue": "Vague description",
  "fixedBullet": "Built 5+ production web applications using React...",
  "fixedStrength": "Quantified and action-oriented"
}
```

**Errors:**
- `400` - Invalid request data
- `401` - Missing API key
- `429` - Rate limited
- `500` - Server error

---

#### **Project Generation**

**POST** `/projects`

Generate AI-suggested portfolio projects based on user profile.

**Request:**
```json
{
  "specialization": "Full Stack Development",
  "techStack": "React, Node.js",
  "experience": "2 years"
}
```

**Response:**
```json
{
  "projects": [
    {
      "title": "Real-time Collaborative Code Editor",
      "techStack": "React, Node.js, WebSockets",
      "architecture": "mermaid-diagram-syntax",
      "tasks": [...]
    }
  ]
}
```

---

#### **Job Applications**

**POST** `/jobs` - Create job application
**GET** `/jobs?userId=abc123` - List applications
**PATCH** `/jobs/:id` - Update application
**DELETE** `/jobs/:id` - Delete application

---

#### **Past Analyses**

**GET** `/analyses?userId=abc123` - Get user's analysis history
**GET** `/analyses/:id` - Get specific analysis

---

#### **Career Architect Agent Endpoints**

All agent endpoints require NextAuth user session authentication. Every database operation is strictly scoped to `session.user.id`.

##### **1. Start an Agent Planning Run**
**POST** `/api/agent/runs`

Initiates a bounded, supervised multi-turn planning run. The agent queries user-scoped profile and assessment tools, selects relevant skills, and prepares a tailored career plan preview.

**Request:**
```json
{
  "goal": "I want to prepare for junior full-stack developer roles within 8 weeks.",
  "focusArea": "Backend Systems & System Design"
}
```

**Response (HTTP 200/201):**
```json
{
  "run": {
    "id": "cly1234567890",
    "status": "AWAITING_APPROVAL",
    "summary": "Synthesized 8-week full-stack career preparation plan with 4 milestones.",
    "planPreview": {
      "title": "8-Week Junior Full-Stack Preparation Plan",
      "targetRole": "Full-Stack Software Engineer",
      "timeframeWeeks": 8,
      "skillGapsIdentified": ["Distributed Systems", "SQL Indexing"],
      "recommendedProjects": ["Real-time Collaborative Whiteboard"],
      "weeklyMilestones": [
        {
          "weekNumber": 1,
          "focus": "Advanced Backend & Database Query Tuning",
          "tasks": ["Optimize PostgreSQL indexing", "Implement connection pooling"]
        }
      ]
    },
    "actions": [
      {
        "stepNumber": 1,
        "toolName": "get_profile",
        "description": "Loaded candidate profile",
        "status": "COMPLETED",
        "executionMs": 42
      },
      {
        "stepNumber": 2,
        "toolName": "get_recent_resume_analysis",
        "description": "Checked recent ATS resume evaluation",
        "status": "COMPLETED",
        "executionMs": 35
      },
      {
        "stepNumber": 3,
        "toolName": "save_career_plan",
        "description": "Proposed career plan awaiting user approval",
        "status": "PENDING_APPROVAL",
        "requiresApproval": true
      }
    ]
  }
}
```

##### **2. List Agent Runs**
**GET** `/api/agent/runs`

Returns recent agent execution runs for the authenticated candidate with pagination (defaults to 10 most recent runs).

##### **3. Get Run Details & Execution Trace**
**GET** `/api/agent/runs/[id]`

Retrieves full metadata, current status, pending actions, plan preview, and chronological tool action traces for run `[id]`.

##### **4. Approve Pending Plan (Write Gate)**
**POST** `/api/agent/runs/[id]/approve`

Explicit human approval required to persist the drafted career plan into the database. Validates that the run is in `AWAITING_APPROVAL`, belongs to the authenticated user, and matches the plan schema.

> [!TIP]
> **Idempotency Protection**: Repeated approval clicks return the existing persisted `CareerPlan` record with status `200 OK` rather than generating duplicate plans.

**Response (HTTP 200/201):**
```json
{
  "success": true,
  "message": "Career plan approved and persisted successfully",
  "plan": {
    "id": "cplan123456",
    "title": "8-Week Junior Full-Stack Preparation Plan",
    "status": "ACTIVE",
    "createdAt": "2026-11-08T20:00:00.000Z"
  }
}
```

##### **5. Cancel Run**
**POST** `/api/agent/runs/[id]/cancel`

Cancels a run in `AWAITING_APPROVAL` status, preventing any writes.

##### **6. List Saved Career Plans**
**GET** `/api/agent/plans`

Returns all active, completed, and archived career plans saved by the user.

##### **7. Update Career Plan Status**
**PATCH** `/api/agent/plans/[id]`

Updates the lifecycle status of a plan (`ACTIVE`, `COMPLETED`, `ARCHIVED`).

##### **8. Delete Career Plan**
**DELETE** `/api/agent/plans/[id]`

Permanently deletes a saved career plan owned by the authenticated user.

---

## Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  password      String?
  emailVerified DateTime?
  image         String?
  
  // Relations
  accounts      Account[]
  sessions      Session[]
  profiles      Profile[]
  analyses      Analysis[]
  jobApplications JobApplication[]
  projectBlueprints ProjectBlueprint[]
}
```

### Profile Model
```prisma
model Profile {
  id              String   @id @default(cuid())
  userId          String
  college         String
  specialization  String
  cgpa            String
  techStack       String
  experience      String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Analysis Model
```prisma
model Analysis {
  id                  String   @id @default(cuid())
  userId              String
  atsScore            Int
  atsFeedback         String
  primaryMatchName    String
  primaryMatchScore   Int
  secondaryMatchName  String
  secondaryMatchScore Int
  keywords            String   // JSON string
  contentImpactGrade  String
  weakBullet          String
  weakIssue           String
  fixedBullet         String
  fixedStrength       String
  createdAt           DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### JobApplication Model
```prisma
model JobApplication {
  id          String    @id @default(cuid())
  userId      String
  company     String
  role        String
  status      String    @default("WISHLIST")  // WISHLIST, APPLIED, INTERVIEWING, OFFER, REJECTED
  appliedDate DateTime?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### ProjectBlueprint Model
```prisma
model ProjectBlueprint {
  id            String   @id @default(cuid())
  userId        String
  title         String
  architecture  String   // Mermaid diagram syntax
  techStack     String
  tasks         String   // JSON string
  createdAt     DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Agent Models (Supervised Agentic AI)

```prisma
model AgentRun {
  id          String   @id @default(cuid())
  userId      String
  goal        String
  focusArea   String?
  status      String   @default("RUNNING") // RUNNING, AWAITING_APPROVAL, COMPLETED, FAILED, CANCELLED
  summary     String?
  planPreview String?  // JSON stringified CareerPlanData
  error       String?
  toolCalls   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  actions AgentAction[]
  plans   CareerPlan[]

  @@index([userId, createdAt])
  @@index([status])
}

model AgentAction {
  id               String    @id @default(cuid())
  runId            String
  toolName         String
  inputSummary     String
  outputSummary    String?
  requiresApproval Boolean   @default(false)
  status           String    @default("PENDING") // PENDING, PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED, FAILED
  stepNumber       Int       @default(1)
  executionMs      Int?
  error            String?
  createdAt        DateTime  @default(now())
  completedAt      DateTime?

  run AgentRun @relation(fields: [runId], references: [id], onDelete: Cascade)

  @@index([runId, stepNumber])
  @@index([toolName])
}

model CareerPlan {
  id             String    @id @default(cuid())
  userId         String
  runId          String?
  title          String
  targetRole     String
  timeframeWeeks Int       @default(8)
  milestones     String    // JSON stringified WeeklyMilestone[]
  skillGaps      String    // JSON stringified string[]
  projects       String    // JSON stringified string[]
  status         String    @default("ACTIVE") // ACTIVE, COMPLETED, ARCHIVED
  approvedAt     DateTime  @default(now())
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  run  AgentRun? @relation(fields: [runId], references: [id], onDelete: SetNull)

  @@index([userId, status])
  @@index([createdAt])
}
```

### Database Migrations & Deployment

The database schema is managed via deterministic Prisma migrations located in `prisma/migrations/`:
- `00000000000000_baseline`: Baseline schema with core User, Profile, Analysis, and JobApplication models.
- `20261108000000_add_career_agent`: Migration creating `AgentRun`, `AgentAction`, and `CareerPlan` tables and relational indexes with cascading deletes.

To apply migrations in production:
```bash
npx prisma migrate deploy
```

To regenerate the Prisma Client types:
```bash
npx prisma generate
```

> [!IMPORTANT]
> **Zero-Downtime Non-Destructive Migrations**: Never use `prisma migrate reset` or `prisma db push --force-reset` on production databases. The migrations use safe, additive SQL with cascade deletes to maintain relational integrity without dropping existing tables.

---

## Architectural Note: Agentic Orchestration vs RAG

This platform implements a **deterministic, bounded multi-turn agentic planning loop**, not a vector Retrieval-Augmented Generation (RAG) system:

1. **Deterministic Relational Access**: The agent queries real candidate records (`Profile`, `Analysis`, `InterviewSession`, `SavedProject`, `JobApplication`) using strict Prisma queries scoped by `session.user.id`. There is no vector embedding store, chunking latency, or approximate similarity search.
2. **Untrusted Data Boundaries**: Candidate profiles, resumes, and interview feedback are enclosed within `<untrusted_user_data>` delimiters to defend against prompt injection and jailbreaks.
3. **Bounded Reasoning**: Execution is clamped to at most 4 tool steps and 3 model turns to prevent infinite loops, hallucination chains, or runaway API usage.
4. **Approval Gate Before Write**: The agent has zero autonomous write permissions. Persisting a plan mandates an explicit user review and approval action via `/api/agent/runs/:id/approve`.

---

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Debug AI Client

Set log level in `src/lib/ai-client.ts` to see detailed AI operation logs:

```typescript
// Already integrated: structured logging to console
logAI('INFO', 'event_name', { detail: 'data' });
```

### Generate Prisma Types

```bash
npx prisma generate
```

### Reset Database (Caution)

```bash
npx prisma migrate reset
```

---

## Deployment

### Vercel Deployment (Recommended)

This project is optimized for [Vercel](https://vercel.com).

1. Push repository to GitHub
2. Import project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with one click

**Environment Variables to Set:**
- `DATABASE_URL`
- `DIRECT_URL`
- `AI_API_KEY`
- `NEXTAUTH_SECRET` (if implementing auth)

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ultimate-cs-career-architect .
docker run -p 3001:3001 --env-file .env.local ultimate-cs-career-architect
```

### Environment Checklist Before Deployment

- [ ] `DATABASE_URL` configured and tested
- [ ] `AI_API_KEY` valid and quota available
- [ ] Database migrations run (`npx prisma migrate deploy`)
- [ ] Built successfully (`npm run build`)
- [ ] Environment variables are NOT committed to git
- [ ] HTTPS enforced in production
- [ ] Error monitoring configured (e.g., Sentry)

---

## Contributing

### Issues & Feature Requests

Found a bug or have a suggestion?

1. [Check existing issues](https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect/issues)
2. [Create a new issue](https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect/issues/new)
3. Describe the problem with reproduction steps

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request with clear description

### Coding Standards

- Use TypeScript for all new code
- Follow existing component patterns
- Add error boundaries for new features
- Test with different screen sizes
- Run ESLint: `npm run lint`

---

## Roadmap

### Phase 1 (Complete ✅)
- [x] Multi-module application architecture
- [x] Resume 3-layer audit system
- [x] Interview preparation flow
- [x] Project portfolio generator
- [x] Job application tracker
- [x] PDF export functionality

### Phase 2 (In Progress 🚀)
- [ ] User authentication (NextAuth integration)
- [ ] Profile persistence across sessions
- [ ] Interview history and analytics
- [ ] Advanced filtering on job board
- [ ] Email notifications

### Phase 3 (Planned 📋)
- [ ] Skill recommendation engine
- [ ] Salary negotiation guides
- [ ] Company interview reviews
- [ ] LeetCode problem integration
- [ ] Resume version comparison

### Phase 4 (Future Ideas 💡)
- [ ] Browser extension for job postings
- [ ] Mobile app (React Native)
- [ ] Community features (forums, mentorship)
- [ ] Certification tracking
- [ ] Real-time job market insights

---

## Troubleshooting

### Common Issues

#### **"AI_API_KEY_MISSING" Error**
**Solution:** Ensure `AI_API_KEY` is set in `.env.local` and matches a valid Google Gemini API key from [AI Studio](https://aistudio.google.com).

#### **Database Connection Failed**
**Solution:** Verify PostgreSQL is running and `DATABASE_URL` in `.env.local` is correct:
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

#### **Port 3001 Already in Use**
**Solution:** Kill the process or specify a different port:
```bash
npm run dev -- -p 3002
```

#### **Prisma Migration Errors**
**Solution:** Reset and recreate schema (⚠️ Destroys data):
```bash
npx prisma migrate reset
```

#### **AI Response Parsing Fails**
**Solution:** Check the AI client logs for detailed error messages. Ensure response is valid JSON.

---

## Performance Optimization

### Current Optimizations
- React Server Components for reduced bundle size
- Image optimization via Next.js Image component
- CSS-in-JS with Tailwind (minimal CSS output)
- Lazy-loaded components
- Connection pooling via Prisma

### Monitoring
- Check build size: `npm run build` (look for `.next/static`)
- Monitor Core Web Vitals in production
- Use Vercel Analytics dashboard

---

## Security Considerations

1. **API Key Protection**
   - Never commit `.env.local` to git
   - Use environment variables for all secrets
   - Rotate keys periodically

2. **Database Security**
   - Use parameterized queries (Prisma handles this)
   - Enable SSL for database connections
   - Regular backups

3. **Frontend Security**
   - Content Security Policy headers
   - CORS configuration
   - Input validation on all forms

4. **Authentication** (Future)
   - Implement NextAuth for user sessions
   - Password hashing (bcrypt 6.0 included)
   - JWT token management

---

## License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software with proper attribution.

---

## Acknowledgments

- **Google Gemini API** for AI-powered analysis
- **Vercel** for Next.js and hosting platform
- **Prisma** for database ORM and migrations
- **Tailwind CSS** for utility-first styling
- **React & Next.js** communities for excellent documentation

---

## Support

Need help? Reach out through:

- 📧 **Email**: Open an issue on GitHub
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/lakshaymanchanda18/Ultimate-CS-Career-Architect/discussions)
- 🌐 **Live Demo**: [ultimate-cs-career-architect.vercel.app](https://ultimate-cs-career-architect.vercel.app)

---

<div align="center">

**Made with ❤️ by [Lakshay Manchanda](https://github.com/lakshaymanchanda18)**

⭐ If this project helped you, please consider giving it a star!

[⬆ Back to top](#ultimate-cs-career-architect)

</div>
