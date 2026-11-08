"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { 
  ArrowRight, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Moon, 
  Sun, 
  GraduationCap, 
  FileText, 
  Database,
  Terminal,
  Menu,
  X,
  Code2,
  Check,
  Compass
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navigateTo = (view: "login" | "signup", section?: string) => {
    const url = section ? `/login?view=${view}&section=${section}` : `/login?view=${view}`;
    router.push(url);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-surface text-primary font-body overflow-x-hidden selection:bg-secondary/20 selection:text-primary">
      
      {/* ─── Navigation Header ────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-18 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant z-50 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-9 h-9 rounded-lg bg-primary-container text-secondary flex items-center justify-center border border-outline-variant">
              <Code2 size={20} />
            </div>
            <div>
              <h1 className="font-headline font-bold text-base leading-none">CareerEngine</h1>
              <p className="text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold mt-1">CS Career Architect</p>
            </div>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-on-surface-variant">
            <a href="#problems" onClick={(e) => scrollToSection(e, "problems")} className="hover:text-primary transition-colors cursor-pointer">Common Gaps</a>
            <a href="#comparison" onClick={(e) => scrollToSection(e, "comparison")} className="hover:text-primary transition-colors cursor-pointer">Approach</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-primary transition-colors cursor-pointer">Platform Features</a>
            <a href="#advantages" onClick={(e) => scrollToSection(e, "advantages")} className="hover:text-primary transition-colors cursor-pointer">Architecture</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors border border-outline-variant cursor-pointer"
              title="Toggle Theme"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button 
              onClick={() => navigateTo("login")}
              className="px-4 py-2 text-sm font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigateTo("signup")}
              className="bg-primary text-on-primary-fixed px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center border border-outline-variant"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center border border-outline-variant"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-18 left-0 w-full bg-surface-container-lowest border-b border-outline-variant py-6 px-6 flex flex-col gap-4 shadow-xl">
            <nav className="flex flex-col gap-3 font-medium text-sm text-on-surface-variant">
              <a href="#problems" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "problems"); }} className="hover:text-primary">Common Gaps</a>
              <a href="#comparison" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "comparison"); }} className="hover:text-primary">Approach</a>
              <a href="#features" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "features"); }} className="hover:text-primary">Platform Features</a>
              <a href="#advantages" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "advantages"); }} className="hover:text-primary">Architecture</a>
            </nav>
            <div className="h-[1px] bg-outline-variant w-full" />
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigateTo("login"); }}
                className="w-full py-2.5 text-center text-sm font-semibold border border-outline-variant rounded-lg"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigateTo("signup"); }}
                className="w-full py-2.5 text-center text-sm font-semibold bg-primary text-on-primary-fixed rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-md border border-outline-variant text-xs font-semibold text-on-surface-variant mb-6 w-fit">
              <Terminal size={13} className="text-secondary" />
              <span>Technical Career Workspace</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-headline font-extrabold leading-[1.12] mb-6 tracking-tight text-primary">
              Software engineering career preparation, audited for technical hiring.
            </h1>

            <p className="text-on-surface-variant mb-8 max-w-xl leading-relaxed text-base md:text-[17px]">
              Run multi-layer ATS audits on your resume, practice technical questions in interactive mock rounds, generate real microservice portfolio architectures, and track your job applications in one unified platform.
            </p>

            <div className="flex items-center gap-3.5 flex-wrap">
              <button 
                onClick={() => navigateTo("signup")}
                className="bg-primary text-on-primary-fixed px-6 py-3.5 rounded-lg font-semibold flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer text-sm shadow-sm"
              >
                Open Workspace
                <ArrowRight size={16} />
              </button>
              <a 
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
                className="bg-surface-container-low text-primary px-6 py-3.5 rounded-lg font-semibold hover:bg-surface-container transition-all border border-outline-variant text-sm text-center cursor-pointer"
              >
                Review Capabilities
              </a>
            </div>

            <div className="mt-10 pt-6 border-t border-outline-variant flex items-center gap-6 text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-secondary" />
                <span>Deterministic ATS Parsing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-secondary" />
                <span>Interactive Technical Rounds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-secondary" />
                <span>Zero Autonomous Writes</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Clean Real Product Breakdown */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Live ATS Audit Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-headline uppercase tracking-wider text-primary">ATS Compatibility Audit</h3>
                    <p className="text-[11px] text-on-surface-variant">Backend & Distributed Systems SDE</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold rounded-md font-mono">
                  88 / 100
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Format & Heading Parsability</span>
                    <span className="text-primary font-semibold">100%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-secondary h-full w-full" />
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Target Keyword Alignment</span>
                    <span className="text-primary font-semibold">82%</span>
                  </div>
                  <div className="w-full bg-surface-container h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-secondary h-full w-[82%]" />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1">Impact Revision Preview</span>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed">
                    <span className="line-through opacity-70">&ldquo;Wrote backend APIs for users&rdquo;</span>
                    <br />
                    <strong className="text-primary">&ldquo;Architected REST and gRPC endpoints in Go with Redis caching, reducing p95 query latency by 42% under load.&rdquo;</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture Card Preview */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database size={15} className="text-secondary" />
                  <span className="text-xs font-bold font-headline text-primary">Architecture Generator</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">Mermaid Syntax</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Generates step-by-step implementation milestones and system diagrams for distributed cache systems, event-driven pipelines, and high-concurrency microservices.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Problems Section ────────────────────────────────────── */}
      <section id="problems" className="py-20 bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 block">Technical Screening Analysis</span>
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary mb-3 tracking-tight">Four Common Failure Points in CS Resumes</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Recruiters and automated filters screen hundreds of applicants per opening. Resumes that lack measurable metrics or technical specificity are discarded in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-headline font-bold text-primary mb-1.5">1. Tutorial Replicas Without Depth</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  Basic clone applications and generic Todo lists demonstrate tutorial following rather than independent software engineering, testing, or system architecture.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                <Layers size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-headline font-bold text-primary mb-1.5">2. ATS Keyword Deficiencies</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  Applicant tracking systems match candidate resumes against required technical stacks. Missing fundamental keywords like indexing, concurrency, or containerization causes automated rejection.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                <Terminal size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-headline font-bold text-primary mb-1.5">3. Vague, Task-Based Bullet Points</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  Listing responsibilities without quantifiable outcome metrics fails to convey technical competence. Engineering recruiters look for latency reductions, scale, and concrete tooling.
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0">
                <Code2 size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-headline font-bold text-primary mb-1.5">4. Missing Engineering Practices</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">
                  Screeners look for evidence of automated test coverage, database indexing, dockerized deployments, and error handling. Generic resumes routinely omit these details.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Approach Comparison ───────────────────────────────── */}
      <section id="comparison" className="py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 block">Preparation Methodology</span>
          <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary mb-3 tracking-tight">Structured Preparation vs Ad-Hoc Applications</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Comparing unstructured resume submissions against an audited, milestone-driven technical roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Unstructured Approach */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-red-500">
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-headline font-bold text-primary">Unstructured Approach</h3>
                  <p className="text-xs text-on-surface-variant">Ad-hoc submissions and generic templates</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-red-400 mt-1.5 shrink-0" />
                  <span>Resume fails keyword filters and is silently rejected by automated screening parsers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-red-400 mt-1.5 shrink-0" />
                  <span>Project portfolio consists of common tutorial clones with no real architectural complexity.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-red-400 mt-1.5 shrink-0" />
                  <span>Entering technical rounds without structured practice on trade-offs or concurrency questions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-red-400 mt-1.5 shrink-0" />
                  <span>No persistent tracking of application pipeline status, follow-ups, or notes.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant text-xs text-on-surface-variant font-medium">
              Result: Low response rate and missed technical screening opportunities.
            </div>
          </div>

          {/* CareerEngine Approach */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-headline font-bold text-primary">CareerEngine Workflow</h3>
                  <p className="text-xs text-on-surface-variant">Systematic audit, roadmap, and execution</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-secondary mt-1.5 shrink-0" />
                  <span>3-Layer audit validates ATS compatibility, specialization match, and bullet impact scores.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-secondary mt-1.5 shrink-0" />
                  <span>Generates step-by-step project architectures with verifiable system engineering components.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-secondary mt-1.5 shrink-0" />
                  <span>Interactive mock interview simulator evaluates technical depth and query optimization knowledge.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-secondary mt-1.5 shrink-0" />
                  <span>Supervised career planning agent synthesizes roadmaps that require explicit user approval to persist.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-outline-variant text-xs text-secondary font-medium">
              Result: Verifiable technical portfolio with clear evidence of engineering rigor.
            </div>
          </div>

        </div>
      </section>

      {/* ─── Platform Features Section ──────────────────────────── */}
      <section id="features" className="py-20 bg-surface-container-low border-y border-outline-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 block">Integrated Workspace Modules</span>
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary mb-3 tracking-tight">Core Platform Modules</h2>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Everything required to audit your resume, practice technical discussions, and build software engineering credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-surface-container text-secondary rounded-lg flex items-center justify-center mb-5">
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-headline font-bold text-primary mb-2">3-Layer Resume Audit</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed mb-6">
                  Analyzes ATS format parsability, checks tech stack keyword alignment against target SDE profiles, and replaces weak descriptions with quantified impact statements.
                </p>
              </div>
              <button 
                onClick={() => navigateTo("signup", "analyzer")}
                className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-left w-fit cursor-pointer"
              >
                Inspect Analyzer <ArrowRight size={13} />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-surface-container text-secondary rounded-lg flex items-center justify-center mb-5">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-lg font-headline font-bold text-primary mb-2">Technical Interview Simulation</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed mb-6">
                  Participate in conversational mock interview rounds tailored to your primary tech stack. Receive structured evaluations on technical depth and problem-solving reasoning.
                </p>
              </div>
              <button 
                onClick={() => navigateTo("signup", "interview")}
                className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-left w-fit cursor-pointer"
              >
                Inspect Interview Prep <ArrowRight size={13} />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-surface-container text-secondary rounded-lg flex items-center justify-center mb-5">
                  <Database size={20} />
                </div>
                <h3 className="text-lg font-headline font-bold text-primary mb-2">Project Studio & Blueprints</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed mb-6">
                  Explore production-grade project concepts with auto-generated Mermaid architecture diagrams, checklist task breakdowns, and critical interview defense questions.
                </p>
              </div>
              <button 
                onClick={() => navigateTo("signup", "projects")}
                className="text-xs font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-left w-fit cursor-pointer"
              >
                Inspect Project Studio <ArrowRight size={13} />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Supervised Agentic Architecture ────────────────────── */}
      <section id="advantages" className="py-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <span className="text-xs font-bold tracking-wider text-secondary uppercase mb-2 block">Agentic Architecture</span>
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary mb-4 tracking-tight leading-tight">
              Supervised Planning with Zero Autonomous Writes
            </h2>
            
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Unlike fragile autonomous scripts, our Career Architect Agent operates under strict engineering guardrails. It inspects your real user records, forms structured milestone plans, and always pauses for explicit candidate review and approval before persisting any record.
            </p>

            <div className="space-y-3.5 text-xs text-on-surface-variant">
              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-start gap-3">
                <Compass size={18} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-primary block font-semibold">Bounded Orchestration Loop</strong>
                  <span>Enforces hard ceilings: maximum 4 tool calls and 3 planning turns per run to prevent infinite execution cycles or unexpected costs.</span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-start gap-3">
                <CheckCircle2 size={18} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-primary block font-semibold">Human Approval Gate</strong>
                  <span>Every write action transitions the run into an Awaiting Approval state. No career roadmap is stored without your explicit button click.</span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-start gap-3">
                <Terminal size={18} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-primary block font-semibold">Multi-Provider Router with Failover</strong>
                  <span>Intelligent failover across Google Gemini, Groq, OpenRouter, Mistral, and Cerebras ensures high availability.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trace Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <span className="text-xs font-mono font-bold text-primary">AUDIT TRACE EXECUTION</span>
              <span className="text-[11px] font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">STATUS: 200 OK</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between">
                <span className="text-primary">step_1: get_profile</span>
                <span className="text-on-surface-variant">42ms • COMPLETED</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between">
                <span className="text-primary">step_2: get_recent_resume_analysis</span>
                <span className="text-on-surface-variant">38ms • COMPLETED</span>
              </div>
              <div className="p-2.5 bg-surface-container-low rounded-lg flex items-center justify-between">
                <span className="text-primary">step_3: draft_career_plan</span>
                <span className="text-on-surface-variant">210ms • COMPLETED</span>
              </div>
              <div className="p-2.5 bg-secondary/10 border border-secondary/20 rounded-lg flex items-center justify-between">
                <span className="text-secondary font-bold">step_4: save_career_plan</span>
                <span className="text-secondary font-bold">AWAITING_APPROVAL</span>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed pt-2">
              All tool invocations are logged with step numbers, tool names, and execution latencies in the account trace record.
            </p>
          </div>

        </div>
      </section>

      {/* ─── Call To Action Banner ───────────────────────────────── */}
      <section className="py-16 bg-primary-container text-white border-t border-outline-variant">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">
            Ready to audit your resume and structure your preparation?
          </h2>
          <p className="text-white/70 max-w-lg mx-auto text-sm leading-relaxed">
            Create an account to begin your technical interview simulation, run ATS audits, and generate portfolio project roadmaps.
          </p>
          <div>
            <button 
              onClick={() => navigateTo("signup")}
              className="bg-secondary text-white px-7 py-3.5 rounded-lg text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
            >
              Get Started with CareerEngine
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant py-10 px-6 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary-container text-secondary flex items-center justify-center border border-outline-variant">
              <Code2 size={16} />
            </div>
            <span className="font-headline font-bold text-primary text-sm">CareerEngine</span>
          </div>

          <p className="text-on-surface-variant text-center">
            &copy; {new Date().getFullYear()} CareerEngine. Technical career workspace for software engineering candidates.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <a href="#problems" onClick={(e) => scrollToSection(e, "problems")} className="hover:text-primary transition-colors">Gaps</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-primary transition-colors">Features</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
