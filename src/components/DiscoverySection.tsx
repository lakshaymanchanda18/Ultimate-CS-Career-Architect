import { ArrowRight, Mic, BarChart2, Lightbulb, Zap, CheckCircle2, Database } from 'lucide-react';

interface Props {
  navigate: (mode: string) => void;
}

export default function DiscoverySection({ navigate }: Props) {
  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto gap-8 pb-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch rounded-2xl p-8 md:p-12 bg-surface-container-lowest border border-outline-variant shadow-sm">
        
        {/* Left - Content */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-md border border-outline-variant text-xs font-semibold text-on-surface-variant mb-6 w-fit">
            <BarChart2 size={13} className="text-secondary" />
            <span>Technical Career Preparation</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-headline font-extrabold leading-[1.15] mb-5 tracking-tight text-primary">
            Build a technical resume audited for software engineering filters.
          </h1>
          
          <p className="text-on-surface-variant mb-8 max-w-md leading-relaxed text-sm md:text-[15px]">
            Run deterministic ATS compatibility audits, practice mock technical interview questions tailored to your stack, and design verified system architectures.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('interview')}
              className="bg-primary text-on-primary-fixed px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-95 transition-opacity cursor-pointer text-sm shadow-sm"
            >
              Start Interview Prep
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="bg-surface-container-low text-primary px-6 py-3 rounded-lg font-semibold hover:bg-surface-container transition-colors border border-outline-variant text-sm cursor-pointer"
            >
              View My Resumes
            </button>
          </div>
        </div>

        {/* Right - Clean Real Capabilities Panel */}
        <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <span className="text-xs font-bold uppercase tracking-wider text-primary font-headline">Audit Readiness</span>
            <span className="text-xs text-secondary font-semibold font-mono">Workspace Active</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant flex items-start gap-3">
              <CheckCircle2 size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">3-Layer ATS Parsing Engine</strong>
                <span className="text-on-surface-variant">Validates format structure, role alignment, and bullet action verbs.</span>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant flex items-start gap-3">
              <Mic size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">Mock Technical Interviewer</strong>
                <span className="text-on-surface-variant">Evaluates system design trade-offs, concurrency, and SQL tuning.</span>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-lowest rounded-lg border border-outline-variant flex items-start gap-3">
              <Database size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-primary block font-semibold">System Architecture Blueprints</strong>
                <span className="text-on-surface-variant">Step-by-step task roadmaps with verifiable Mermaid service diagrams.</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-on-surface-variant border-t border-outline-variant/60 flex items-center justify-between">
            <span>Multi-provider failover routing</span>
            <span className="font-mono text-secondary">Gemini • Groq • Mistral</span>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('analyzer')}
          className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-hover cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center mb-4">
            <BarChart2 size={20} />
          </div>
          <h3 className="font-headline font-bold text-base mb-1.5 text-primary">ATS Optimizer</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            3-Layer audit evaluating ATS compatibility, specialization match, and quantifiable bullet impact grades.
          </p>
        </div>

        <div
          onClick={() => navigate('projects')}
          className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-hover cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center mb-4">
            <Lightbulb size={20} />
          </div>
          <h3 className="font-headline font-bold text-base mb-1.5 text-primary">Smart Projects</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            Production-grade software engineering project architectures with tech stacks and execution blueprints.
          </p>
        </div>

        <div
          onClick={() => navigate('job-board')}
          className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant card-hover cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center mb-4">
            <Zap size={20} />
          </div>
          <h3 className="font-headline font-bold text-base mb-1.5 text-primary">Job Tracker</h3>
          <p className="text-on-surface-variant text-xs leading-relaxed">
            Kanban-style application tracker with stage updates from wishlist through offer.
          </p>
        </div>
      </div>
    </section>
  );
}
