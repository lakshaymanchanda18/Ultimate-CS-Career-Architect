"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { 
  Sparkles, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  Cpu, 
  Layers, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Moon, 
  Sun, 
  ChevronRight, 
  GraduationCap, 
  FileText, 
  Database,
  Terminal,
  Zap,
  Menu,
  X
} from "lucide-react";

// ─── Animation Components ──────────────────────────────────────

function Reveal({ 
  children, 
  className = "", 
  delay = 0, 
  variant = "fade-up" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number; 
  variant?: "fade-up" | "fade-left" | "fade-right" | "scale-up" | "fade-in"; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getVariantClass = () => {
    switch (variant) {
      case "fade-up": 
        return isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8";
      case "fade-left": 
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12";
      case "fade-right": 
        return isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12";
      case "scale-up": 
        return isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95";
      case "fade-in":
        return isVisible ? "opacity-100" : "opacity-0";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getVariantClass()} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function AnimatedCounter({ 
  value, 
  duration = 1500, 
  suffix = "" 
}: { 
  value: number; 
  duration?: number; 
  suffix?: string; 
}) {
  const [count, setCount] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!hasRun) {
          setHasRun(true);
          let startTimestamp: number | null = null;
          
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(value);
            }
          };
          
          window.requestAnimationFrame(step);
        }
      } else {
        setHasRun(false);
        setCount(0);
      }
    }, { threshold: 0.05 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasRun]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Main Landing Page ──────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationView, setNavigationView] = useState<"login" | "signup">("login");
  const [loadingText, setLoadingText] = useState("");
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNavigate = (view: "login" | "signup", section?: string) => {
    setNavigationView(view);
    setIsNavigating(true);

    const loadingPhrases = [
      "Initializing CareerEngine Gateway...",
      "Configuring SDE portfolio optimizer...",
      "Analyzing ATS parsing modules...",
      "Connecting to recruiter sandbox database...",
      "Securing user session tokens...",
      "Opening Career Architect console..."
    ];

    let index = 0;
    setLoadingText(loadingPhrases[0]);
    const interval = setInterval(() => {
      index++;
      if (index < loadingPhrases.length) {
        setLoadingText(loadingPhrases[index]);
      }
    }, 250);

    setTimeout(() => {
      clearInterval(interval);
      const url = section ? `/login?view=${view}&section=${section}` : `/login?view=${view}`;
      router.push(url);
    }, 1600);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setHighlightedSection(id);
      setTimeout(() => {
        setHighlightedSection(null);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-primary font-body overflow-x-hidden selection:bg-secondary/30 selection:text-primary">
      
      {/* ─── Navigation Header ────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-20 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 z-50 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer animate-in fade-in slide-in-from-top-3 duration-500" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-xl bg-primary-container text-secondary-fixed flex items-center justify-center shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-headline font-bold text-lg leading-none">CareerEngine</h1>
              <p className="text-[9px] text-on-surface-variant tracking-widest uppercase font-bold mt-1">CS Career Architect</p>
            </div>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-on-surface-variant animate-in fade-in slide-in-from-top-3 duration-500">
            <a href="#problems" onClick={(e) => scrollToSection(e, "problems")} className="hover:text-primary transition-colors cursor-pointer">Core Problems</a>
            <a href="#inaction" onClick={(e) => scrollToSection(e, "inaction")} className="hover:text-primary transition-colors cursor-pointer">Path Comparison</a>
            <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-primary transition-colors cursor-pointer">AI Core Features</a>
            <a href="#advantages" onClick={(e) => scrollToSection(e, "advantages")} className="hover:text-primary transition-colors cursor-pointer">Advantages</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4 animate-in fade-in slide-in-from-top-3 duration-500">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors border border-outline-variant/10 cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => handleNavigate("login")}
              className="px-5 py-2.5 text-sm font-semibold text-primary hover:text-secondary transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={() => handleNavigate("signup")}
              className="bg-primary text-on-primary-fixed px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/10 hover:scale-102 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center transition-colors border border-outline-variant/10"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-surface-container-lowest border-b border-outline-variant/15 py-6 px-6 flex flex-col gap-5 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col gap-4 font-bold text-base text-on-surface-variant">
              <a href="#problems" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "problems"); }} className="hover:text-primary cursor-pointer">Core Problems</a>
              <a href="#inaction" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "inaction"); }} className="hover:text-primary cursor-pointer">Path Comparison</a>
              <a href="#features" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "features"); }} className="hover:text-primary cursor-pointer">AI Core Features</a>
              <a href="#advantages" onClick={(e) => { setMobileMenuOpen(false); scrollToSection(e, "advantages"); }} className="hover:text-primary cursor-pointer">Advantages</a>
            </nav>
            <div className="h-[1px] bg-outline-variant/10 w-full" />
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); handleNavigate("login"); }}
                className="w-full py-3 text-center text-sm font-bold border border-outline-variant/20 rounded-xl"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); handleNavigate("signup"); }}
                className="w-full py-3 text-center text-sm font-bold bg-primary text-on-primary-fixed rounded-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 max-w-7xl mx-auto px-6 md:px-12 relative overflow-hidden">
        {/* Decorative Grid Mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none -z-10 rounded-full blur-3xl" />
        <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-primary-container/5 pointer-events-none -z-10 rounded-full blur-3xl animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <Reveal delay={100} variant="fade-up">
              <span className="px-3 py-1.5 bg-secondary-fixed/10 text-secondary dark:text-secondary-fixed text-xs font-bold rounded-full mb-6 inline-flex items-center gap-1.5 w-fit badge-pulse">
                <Zap size={12} className="text-secondary dark:text-secondary-fixed" /> THE SDE PORTFOLIO SYSTEM
              </span>
            </Reveal>

            <Reveal delay={250} variant="scale-up" className="origin-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl lg:text-[3.5rem] font-headline font-extrabold leading-[1.08] mb-6 tracking-tight">
                The Complete CS Career Blueprint. <br />
                <span className="text-secondary dark:text-secondary-fixed relative inline-block mt-2">
                  Build an SDE Resume
                  <svg className="absolute -bottom-2 left-0 w-full text-secondary/35 dark:text-secondary-fixed/30" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                    <path d="M0 4C50 1 150 7 200 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span><br />
                That Wins Tier-1 Offers.
              </h2>
            </Reveal>

            <Reveal delay={400} variant="fade-up">
              <p className="text-on-surface-variant mb-8 max-w-xl leading-relaxed text-[16px] md:text-[17px] font-medium">
                Stop copying generic tutorials. Our AI-driven engine conducts direct mock technical audits, scans for automated ATS alignment gaps, and generates step-by-step custom SDE architectures to help you stand out.
              </p>
            </Reveal>

            <Reveal delay={550} variant="fade-up">
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={() => handleNavigate("signup")}
                  className="bg-primary text-on-primary-fixed px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl hover:shadow-primary/20 hover:scale-102 transition-all cursor-pointer group text-base"
                >
                  Get Started Free
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <a 
                  href="#features"
                  onClick={(e) => scrollToSection(e, "features")}
                  className="bg-surface-container-low text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container-high transition-all border border-outline-variant/15 text-base text-center cursor-pointer"
                >
                  Explore Features
                </a>
              </div>
            </Reveal>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 relative h-full flex flex-col justify-center min-h-[380px]">
            {/* Visual Panel */}
            <Reveal delay={300} variant="scale-up" className="w-full">
              <div className="relative w-full aspect-square max-w-[450px] mx-auto bg-gradient-to-br from-[#0d1c32] via-[#0a2540] to-[#002a1f] rounded-[2.5rem] flex flex-col justify-end p-8 md:p-10 overflow-hidden shadow-2xl">
                
                {/* Particles */}
                <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-secondary-fixed/5 blur-2xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary-container/10 blur-2xl animate-pulse" />

                {/* Floating Stat Card Grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-6 relative z-10">
                  <div className="bg-[#0d1c32]/85 backdrop-blur-md border border-[#5ffbd6]/15 rounded-xl p-3 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                    <p className="text-xl font-headline font-black text-secondary-fixed">
                      <AnimatedCounter value={95} suffix="+" />
                    </p>
                    <p className="text-[8px] text-white/50 uppercase tracking-widest font-bold mt-1">ATS Match</p>
                  </div>
                  <div className="bg-[#0d1c32]/85 backdrop-blur-md border border-[#5ffbd6]/15 rounded-xl p-3 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                    <p className="text-xl font-headline font-black text-secondary-fixed">
                      <AnimatedCounter value={3} suffix="x" />
                    </p>
                    <p className="text-[8px] text-white/50 uppercase tracking-widest font-bold mt-1">Interviews</p>
                  </div>
                  <div className="bg-[#0d1c32]/85 backdrop-blur-md border border-[#5ffbd6]/15 rounded-xl p-3 text-center shadow-lg hover:scale-105 transition-transform duration-300">
                    <p className="text-xl font-headline font-black text-secondary-fixed">
                      <AnimatedCounter value={50} suffix="+" />
                    </p>
                    <p className="text-[8px] text-white/50 uppercase tracking-widest font-bold mt-1">LPA Projects</p>
                  </div>
                </div>

                {/* Simulated AI Recruiter Dialog Box */}
                <div className="bg-[#0d1c32]/85 backdrop-blur-md border border-[#5ffbd6]/15 p-5 rounded-2xl shadow-2xl shadow-[#5ffbd6]/5 relative z-10 hover:shadow-secondary/5 transition-all">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/15 text-secondary-fixed flex items-center justify-center pulse-glow">
                        <Cpu size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest text-secondary-fixed uppercase leading-none">AI Career Architect</p>
                        <p className="text-[8px] text-white/40 mt-0.5">Online • Audit Active</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                  </div>
                  <p className="text-[13px] font-medium text-white/90 leading-relaxed italic">
                    &quot;I've audited your project list. The 'Todo App' should be replaced with a distributed key-value store. Let's build the architecture roadmap for it.&quot;
                  </p>
                </div>

              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Problems Section ────────────────────────────────────── */}
      <section id="problems" className={`py-24 bg-surface-container-low transition-all duration-700 scroll-mt-20 ${highlightedSection === "problems" ? "ring-4 ring-secondary/20 shadow-2xl shadow-secondary/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <Reveal delay={100} variant="fade-up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-[10px] font-bold tracking-widest text-secondary dark:text-secondary-fixed uppercase mb-3 block">WHY CS STUDENTS GET REJECTED</span>
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4 tracking-tight">The 4 Major Gaps in CS Resumes</h2>
              <p className="text-on-surface-variant text-[15px] md:text-base leading-relaxed">
                Standard university templates and copy-pasted advice don't work anymore. If your resume falls into these traps, screening algorithms and recruiters will filter you out instantly.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <Reveal delay={0} variant="scale-up">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm card-hover flex gap-5 h-full">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-primary mb-2">1. Tutorial Hell & Generic Projects</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Building clones (Netflix, Spotify, Discord) or basic Todo list web applications tells recruiters you only know how to copy-paste videos, not engineer systems.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Card 2 */}
            <Reveal delay={150} variant="scale-up">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm card-hover flex gap-5 h-full">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-primary mb-2">2. The ATS Keyword Filtering Gap</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Automated tracking software (ATS) grades resumes based on precise matching. If your resume misses the specific stacks in the SDE job descriptions, it goes straight to the trash.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Card 3 */}
            <Reveal delay={300} variant="scale-up">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm card-hover flex gap-5 h-full">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <TrendingUp size={24} className="rotate-180" />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-primary mb-2">3. Weak, Responsibility-Based Bullets</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Writing &quot;Responsible for writing APIs&quot; instead of &quot;Designed gRPC microservices reducing API latency by 45% using Redis caching&quot; makes you look like a beginner.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Card 4 */}
            <Reveal delay={450} variant="scale-up">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-sm card-hover flex gap-5 h-full">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <Terminal size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-primary mb-2">4. Lacking Engineering Rigor</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Hiring managers look for mentions of testing coverage (Jest, PyTest), concurrency, database index tuning, containerization (Docker), or CI/CD pipelines. Standard resumes ignore these.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ─── What If Not Used (Path Comparison) ─────────────────── */}
      <section id="inaction" className={`py-24 max-w-7xl mx-auto px-6 md:px-12 scroll-mt-20 overflow-hidden transition-all duration-700 rounded-3xl ${highlightedSection === "inaction" ? "ring-4 ring-secondary/20 shadow-2xl shadow-secondary/5" : ""}`}>
        <Reveal delay={100} variant="fade-up">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-[10px] font-bold tracking-widest text-secondary dark:text-secondary-fixed uppercase mb-3 block">THE COST OF INACTION</span>
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4 tracking-tight">Two Paths After Graduation</h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              Where will you be 6 months from now? See how using CareerEngine changes the trajectory of your job hunt.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Path A - Without CareerEngine */}
          <Reveal delay={150} variant="fade-left" className="h-full">
            <div className="bg-surface-container-lowest border-2 border-red-500/20 dark:border-red-950/40 rounded-3xl p-8 shadow-md flex flex-col justify-between card-hover relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    <XCircle size={20} />
                  </div>
                  <h3 className="text-lg font-headline font-bold text-primary">Path A: Manual Job Hunt</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Your resume is silently rejected by ATS filters without a human ever seeing it.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Months of sending 500+ generic applications with zero response.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Showcasing basic &quot;Todo lists&quot; that get laughed at in technical rounds.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <span>Stumbling over architectural and metrics-based questions in unexpected interviews.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 py-3.5 px-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2">
                  <XCircle size={16} className="shrink-0" />
                  <span>Outcome: Rejection & Low-LPA Support Roles</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Path B - With CareerEngine */}
          <Reveal delay={150} variant="fade-right" className="h-full">
            <div className="bg-surface-container-lowest border-2 border-secondary/20 dark:border-secondary-fixed/20 rounded-3xl p-8 shadow-md flex flex-col justify-between card-hover relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary"></div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary dark:text-secondary-fixed flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <h3 className="text-lg font-headline font-bold text-primary">Path B: CareerEngine Guided</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                    <span>Resume is optimized to score **95+** on ATS criteria, opening the recruiter gate.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                    <span>Learn how to write high-impact bullet points mapped to exact SDE requirements.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                    <span>Generate production-grade architectures and step-by-step coding roadmaps.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                    <span>Practice with an interactive conversational AI that prepares you for SDE rounds.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <div className="bg-secondary/15 border border-secondary/30 text-secondary py-3.5 px-4 rounded-2xl text-center text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-secondary/5 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent pointer-events-none -z-10 group-hover:translate-x-full transition-transform duration-1000" />
                  <Sparkles size={16} className="shrink-0 animate-pulse text-secondary" />
                  <span>Outcome: Direct SDE Interviews & Tier-1 Placement</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

      </section>

      {/* ─── AI Features Section ────────────────────────────────── */}
      <section id="features" className={`py-24 bg-surface-container-low transition-all duration-700 scroll-mt-20 ${highlightedSection === "features" ? "ring-4 ring-secondary/20 shadow-2xl shadow-secondary/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <Reveal delay={100} variant="fade-up">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-[10px] font-bold tracking-widest text-secondary dark:text-secondary-fixed uppercase mb-3 block">CORE AI CAPABILITIES</span>
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-4 tracking-tight">AI-Powered SDE Career Platform</h2>
              <p className="text-on-surface-variant text-[15px] leading-relaxed">
                We leverage advanced LLM systems tailored specifically for Computer Science students to build architectures and refine resumes.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Reveal delay={0} variant="fade-up" className="h-full">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 bg-secondary/15 text-secondary dark:text-secondary-fixed rounded-2xl flex items-center justify-center mb-6">
                    <GraduationCap size={24} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary mb-3">Conversational AI Recruiter</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                    Instead of filling out form text boxes, chat directly with our AI recruiter. It interviews you, asks how you optimized queries, handled cache invalidation, or built pipelines, and dynamically converts the conversation into resume bullets.
                  </p>
                </div>
                <button 
                  onClick={() => handleNavigate("signup", "interview")}
                  className="border-t border-outline-variant/10 pt-4 flex items-center gap-1.5 text-xs font-bold text-secondary dark:text-secondary-fixed uppercase tracking-wider cursor-pointer hover:text-primary transition-colors text-left w-full border-none bg-transparent font-body"
                >
                  Experience Extraction <ChevronRight size={14} />
                </button>
              </div>
            </Reveal>

            {/* Feature 2 */}
            <Reveal delay={150} variant="fade-up" className="h-full">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 bg-secondary/15 text-secondary dark:text-secondary-fixed rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={24} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary mb-3">ATS Audit & Optimizer</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                    Instantly verify how well your resume matches target positions. The analyzer breaks down your compatibility score, flags missing tech stack keywords, audits bullet grammar, and suggests high-impact alternatives.
                  </p>
                </div>
                <button 
                  onClick={() => handleNavigate("signup", "analyzer")}
                  className="border-t border-outline-variant/10 pt-4 flex items-center gap-1.5 text-xs font-bold text-secondary dark:text-secondary-fixed uppercase tracking-wider cursor-pointer hover:text-primary transition-colors text-left w-full border-none bg-transparent font-body"
                >
                  Keyword Alignment <ChevronRight size={14} />
                </button>
              </div>
            </Reveal>

            {/* Feature 3 */}
            <Reveal delay={300} variant="fade-up" className="h-full">
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover flex flex-col justify-between h-full">
                <div>
                  <div className="w-12 h-12 bg-secondary/15 text-secondary dark:text-secondary-fixed rounded-2xl flex items-center justify-center mb-6">
                    <Database size={24} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary mb-3">SDE Project Generator</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                    Say goodbye to tutorial projects. Our generator creates custom project blueprints complete with a Mermaid-based microservices architecture diagram and a step-by-step checklist matching modern software engineering practices.
                  </p>
                </div>
                <button 
                  onClick={() => handleNavigate("signup", "projects")}
                  className="border-t border-outline-variant/10 pt-4 flex items-center gap-1.5 text-xs font-bold text-secondary dark:text-secondary-fixed uppercase tracking-wider cursor-pointer hover:text-primary transition-colors text-left w-full border-none bg-transparent font-body"
                >
                  Roadmap Generation <ChevronRight size={14} />
                </button>
              </div>
            </Reveal>
          </div>

        </div>
      </section>

      {/* ─── Advantages Section ─────────────────────────────────── */}
      <section id="advantages" className={`py-24 max-w-7xl mx-auto px-6 md:px-12 scroll-mt-20 transition-all duration-700 rounded-3xl ${highlightedSection === "advantages" ? "ring-4 ring-secondary/20 shadow-2xl shadow-secondary/5" : ""}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <Reveal delay={100} variant="fade-up">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-secondary dark:text-secondary-fixed uppercase mb-3 block">WHY CAREERENGINE</span>
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-6 tracking-tight leading-tight">Designed Exclusively for Software Engineering Careers</h2>
              
              <p className="text-on-surface-variant text-[15px] leading-relaxed mb-8">
                We aren't a generic resume builder. CareerEngine was architected by industry engineering managers who know exactly what technical filters, system design questions, and metrics recruiter screening pipelines evaluate.
              </p>

              <div className="space-y-4">
                <div className="flex gap-3 animate-in">
                  <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary dark:text-secondary-fixed flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-[15px]">Production-Grade Templates</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Clean Single-Page LaTeX-style resume layout, fully compatible with all ATS parsers.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary dark:text-secondary-fixed flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-[15px]">System Design Guided blueprints</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Generate database schemas, load balancer configs, and microservice graphs instantly.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/15 text-secondary dark:text-secondary-fixed flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-secondary dark:text-secondary-fixed" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-[15px]">PDF Resumes Downloadable</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Download your optimized resume in PDF format, ready to submit.</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} variant="scale-up" className="w-full">
            <div className="relative">
              {/* Visual Advantage Illustration */}
              <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-xl relative max-w-[480px] mx-auto card-hover overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl" />
                
                <h3 className="font-headline font-bold text-primary mb-6 border-b border-outline-variant/10 pb-3 flex items-center gap-2">
                  <FileText size={18} className="text-secondary" /> Resume Bullet Auditing
                </h3>
                
                <div className="space-y-5">
                  {/* Before */}
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-1">Your Draft (Generic)</span>
                    <p className="text-xs text-on-surface-variant italic">
                      &quot;Helped write database APIs and fixed bugs in a web application.&quot;
                    </p>
                  </div>
                  {/* AI Auditing Arrow */}
                  <div className="flex justify-center text-secondary">
                    <ArrowRight size={20} className="rotate-90 md:rotate-0" />
                  </div>
                  {/* After */}
                  <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl relative">
                    <span className="text-[10px] font-bold text-secondary dark:text-secondary-fixed uppercase tracking-widest block mb-1">AI Optimized (Impact-focused)</span>
                    <p className="text-xs text-primary font-medium italic">
                      &quot;Co-designed RESTful endpoints in Go; optimized SQL database indexing to reduce API query times by 38% under high concurrency.&quot;
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ─── Call To Action Banner ───────────────────────────────── */}
      <section className="py-20 bg-primary-container text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#5ffbd6_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        <Reveal delay={100} variant="fade-up" className="max-w-4xl mx-auto px-6 relative z-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold mb-6 leading-tight">
              Ready to Stand Out in the Hiring Pool?
            </h2>
            <p className="text-white/70 max-w-lg mx-auto mb-8 text-[15px] md:text-base leading-relaxed">
              Join other CS students using CareerEngine to design architectures, optimize resume bullets, and win technical offers.
            </p>
            <button 
              onClick={() => handleNavigate("signup")}
              className="bg-secondary hover:bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-secondary/25 transition-all text-base cursor-pointer"
            >
              Create Your Account Now
            </button>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/15 py-12 px-6 transition-colors text-sm text-on-surface-variant font-medium">
        <Reveal delay={100} variant="fade-in" className="w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-secondary-fixed flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <span className="font-headline font-bold text-primary">CareerEngine</span>
            </div>

            <p className="text-xs text-on-surface-variant/70 text-center">
              &copy; {new Date().getFullYear()} CareerEngine. All rights reserved. Created for CS Careers & SDE placements.
            </p>

            <div className="flex items-center gap-6 text-xs text-on-surface-variant/80">
              <a href="#problems" onClick={(e) => scrollToSection(e, "problems")} className="hover:underline cursor-pointer">Problems</a>
              <a href="#inaction" onClick={(e) => scrollToSection(e, "inaction")} className="hover:underline cursor-pointer">Path</a>
              <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:underline cursor-pointer">Features</a>
            </div>
          </div>
        </Reveal>
      </footer>

      {/* ─── Navigation transition overlay ────────────────────── */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface transition-colors duration-500 animate-in fade-in duration-300">
          {/* Decorative mesh */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(var(--color-secondary)_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>
          
          <div className="relative flex flex-col items-center max-w-sm px-6 text-center animate-in slide-in-from-bottom-6 duration-500">
            {/* Pulsating logo box */}
            <div className="w-16 h-16 rounded-2xl bg-primary-container text-secondary-fixed flex items-center justify-center shadow-lg shadow-secondary/10 mb-8 animate-pulse">
              <Sparkles size={32} />
            </div>
            
            {/* Spinning loader */}
            <div className="relative w-12 h-12 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-outline-variant/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-secondary animate-spin" />
            </div>
            
            {/* Dynamic loading text */}
            <h3 className="font-headline font-extrabold text-xl text-primary mb-2">
              {navigationView === "signup" ? "Accessing SDE Portfolio Console..." : "Connecting to Recruiter Dashboard..."}
            </h3>
            <p className="text-on-surface-variant text-xs font-mono h-4 tracking-wide">
              {loadingText}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
