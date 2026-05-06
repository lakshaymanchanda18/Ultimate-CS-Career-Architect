import { ArrowRight, Mic, Sparkles, BarChart2, Lightbulb, Zap } from 'lucide-react';

interface Props {
  navigate: (mode: string) => void;
}

export default function DiscoverySection({ navigate }: Props) {
  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto gap-8">
      {/* Hero Section */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch min-h-[560px] rounded-3xl overflow-hidden shadow-lg gradient-border">
        {/* Left — Content */}
        <div className="relative z-10 p-10 md:p-14 flex flex-col justify-center">
          <span className="px-3 py-1.5 bg-secondary-fixed/15 text-secondary text-xs font-bold rounded-full mb-6 inline-flex items-center gap-1.5 w-fit badge-pulse">
            <Sparkles size={13} /> AI-POWERED CAREER INTELLIGENCE
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-headline font-extrabold leading-[1.1] mb-6 tracking-tight">
            Build a Resume<br/>That <span className="text-secondary relative">
              Beats the ATS
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                <path d="M0 3C50 0 150 6 200 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </span><br/>and Wins the Job
          </h1>
          <p className="text-on-surface-variant mb-8 max-w-md leading-relaxed text-[15px]">
            Stop guessing. Our AI engine interviews you like a top-tier recruiter and architects a professional narrative that high-growth companies can't ignore.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('interview')}
              className="bg-primary text-on-primary-fixed px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 group"
            >
              Start Your Interview
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="bg-surface-container-low text-primary px-7 py-3.5 rounded-xl font-semibold hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/20"
            >
              View My Resumes
            </button>
          </div>
        </div>

        {/* Right — Visual Panel */}
        <div className="relative h-full bg-gradient-to-br from-[#0d1c32] via-[#0a2540] to-[#002a1f] bg-[length:400%_400%] animate-[gradientShift_12s_ease_infinite] flex flex-col justify-end p-10 md:p-12 overflow-hidden min-h-[320px]">
          {/* Floating Particles */}
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8 relative z-10 slide-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-[#0d1c32]/80 backdrop-blur-xl border border-[#5ffbd6]/10 rounded-xl p-3 text-center">
              <p className="text-xl font-headline font-black text-secondary-fixed">95+</p>
              <p className="text-[9px] text-white/50 uppercase tracking-wider mt-1 font-semibold">Avg ATS Score</p>
            </div>
            <div className="bg-[#0d1c32]/80 backdrop-blur-xl border border-[#5ffbd6]/10 rounded-xl p-3 text-center">
              <p className="text-xl font-headline font-black text-secondary-fixed">3x</p>
              <p className="text-[9px] text-white/50 uppercase tracking-wider mt-1 font-semibold">Interview Rate</p>
            </div>
            <div className="bg-[#0d1c32]/80 backdrop-blur-xl border border-[#5ffbd6]/10 rounded-xl p-3 text-center">
              <p className="text-xl font-headline font-black text-secondary-fixed">50+</p>
              <p className="text-[9px] text-white/50 uppercase tracking-wider mt-1 font-semibold">LPA Projects</p>
            </div>
          </div>

          {/* AI Coach Card */}
          <div className="bg-[#0d1c32]/80 backdrop-blur-xl border border-[#5ffbd6]/10 p-5 rounded-2xl shadow-xl shadow-[#5ffbd6]/10 ai-glow relative z-10 slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary-fixed flex items-center justify-center pulse-glow">
                <Mic size={16} />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-secondary-fixed uppercase">AI Coach Active</span>
            </div>
            <p className="text-sm font-medium text-white/80 italic typing-cursor">
              &quot;I&apos;m ready to audit your experience. Shall we begin?&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-in">
        <div
          onClick={() => navigate('interview')}
          className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant/15 card-hover cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-secondary-fixed/15 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <BarChart2 size={22} />
          </div>
          <h3 className="font-headline font-bold text-lg mb-2">ATS Optimizer</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            3-layer audit that scores structure, specialization alignment, and content impact for Tier-1 MNC roles.
          </p>
        </div>

        <div
          onClick={() => navigate('projects')}
          className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant/15 card-hover cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-secondary-fixed/15 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Lightbulb size={22} />
          </div>
          <h3 className="font-headline font-bold text-lg mb-2">Smart Projects</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            AI-generated 50 LPA+ project ideas with tech stacks, killer questions, and execution blueprints.
          </p>
        </div>

        <div
          onClick={() => navigate('job-board')}
          className="bg-surface-container-lowest p-7 rounded-2xl border border-outline-variant/15 card-hover cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-secondary-fixed/15 text-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Zap size={22} />
          </div>
          <h3 className="font-headline font-bold text-lg mb-2">Job Tracker</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Kanban-style application board with drag-and-drop tracking from wishlist to offer.
          </p>
        </div>
      </div>
    </section>
  );
}
