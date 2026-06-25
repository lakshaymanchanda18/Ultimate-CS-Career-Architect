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
- [Database Schema](#database-schema)
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

#### **8. Settings**
- User profile management
- Preferences and account settings
- System configuration

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

### AI & ML
- **AI API**: Google Gemini (via @google/genai SDK)
- **Models**: 
  - Primary: `gemini-flash-latest`
  - Fallback: `gemini-flash-lite-latest`
- **Features**: 
  - Structured JSON generation
  - Resume analysis prompts
  - Interview question generation
  - Project architecture synthesis

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

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `DATABASE_URL` | String | ✅ Yes | PostgreSQL connection string (with all parameters) |
| `DIRECT_URL` | String | ✅ Yes | Direct PostgreSQL connection (used for migrations) |
| `AI_API_KEY` | String | ✅ Yes | Google Gemini API key from AI Studio |
| `GEMINI_API_KEY` | String | ⚠️ Optional | Alternative key variable name |
| `NEXTAUTH_SECRET` | String | ⚠️ Optional | For session encryption (implement auth) |
| `NEXTAUTH_URL` | String | ⚠️ Optional | Authentication callback URL |

### AI Model Configuration

Edit `src/lib/ai-client.ts` to change AI models:

```typescript
const PRIMARY_MODEL = 'gemini-flash-latest';      // Primary model
const FALLBACK_MODEL = 'gemini-flash-lite-latest'; // Fallback model
const MAX_RETRIES = 3;                              // Retry attempts
```

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
