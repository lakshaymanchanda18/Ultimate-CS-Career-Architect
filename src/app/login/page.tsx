"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, User, ArrowLeft, Eye, EyeOff, Code2, CheckCircle2, Shield, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set initial view from URL query param if present
  const queryView = searchParams.get("view") as "login" | "signup" | "forgot" | null;
  const initialView = (queryView === "signup" || queryView === "forgot") ? queryView : "login";

  const [view, setView] = useState<"login" | "signup" | "forgot">(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Strict email formatting validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (view === "signup" || view === "login") {
      if (view === "signup" && !name.trim()) {
        setError("Full name is required.");
        setLoading(false);
        return;
      }
      if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        setError("Please satisfy all password strength requirements.");
        setLoading(false);
        return;
      }
    }

    try {
      if (view === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || "Failed to initiate password reset.");
        } else {
          setResetSent(true);
          if (data.resetLink) {
            setResetLink(data.resetLink);
          }
        }
      } else {
        const isSignUp = view === "signup";
        const result = await signIn("credentials", {
          email,
          password,
          name: isSignUp ? name : undefined,
          action: isSignUp ? "signup" : "login",
          redirect: false,
        });

        if (result?.error) {
          setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
        } else {
          const section = searchParams.get("section");
          router.push(section ? `/?section=${section}` : "/");
          router.refresh();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex font-body text-primary">
      {/* Left Panel - Professional Workspace Overview */}
      <div className="hidden lg:flex w-1/2 bg-primary-container relative flex-col justify-between p-12 border-r border-outline-variant">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-surface-container text-secondary flex items-center justify-center border border-outline-variant">
              <Code2 size={20} />
            </div>
            <div>
              <h1 className="font-headline font-bold text-base text-white leading-tight">CareerEngine</h1>
              <p className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">CS Career Architect</p>
            </div>
          </div>

          <h2 className="text-3xl font-headline font-extrabold text-white leading-tight mb-4 tracking-tight">
            Software Engineering Career Preparation
          </h2>
          <p className="text-white/70 max-w-sm leading-relaxed text-sm mb-10">
            Resume ATS auditing, technical interview simulator, system architecture designer, and job pipeline tracking in one unified workspace.
          </p>

          <div className="space-y-4 max-w-sm text-xs text-white/80">
            <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
              <CheckCircle2 size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">3-Layer ATS Resume Audit</strong>
                <span>Scoring structure, specialization alignment, and quantifiable bullet impact.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
              <CheckCircle2 size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Interactive Technical Rounds</strong>
                <span>Conversational technical practice with depth evaluations across your stack.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
              <Shield size={16} className="text-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Supervised Career Planning</strong>
                <span>Bounded agentic roadmaps that always require explicit confirmation before persisting.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-xs text-white/50 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} CareerEngine</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface transition-colors">
        <div className="w-full max-w-md">
          {/* Mobile Header (Back Link + Logo) */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <button 
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary-container text-secondary flex items-center justify-center border border-outline-variant">
                <Code2 size={16} />
              </div>
              <span className="font-headline font-bold text-sm text-primary">CareerEngine</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-headline font-extrabold mb-1.5 text-primary tracking-tight">
              {view === "signup" && "Create your account"}
              {view === "login" && "Welcome back"}
              {view === "forgot" && "Reset your password"}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {view === "signup" && "Sign up to begin your career preparation workspace."}
              {view === "login" && "Sign in to access your saved resumes and plans."}
              {view === "forgot" && "Enter your account email to receive a reset link."}
            </p>
          </div>

          {/* Toggle between Login and Signup */}
          {view !== "forgot" && (
            <div className="flex bg-surface-container p-1 rounded-xl mb-6 border border-outline-variant">
              <button
                type="button"
                onClick={() => { setView("login"); setError(""); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  view === "login"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setView("signup"); setError(""); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  view === "signup"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {resetSent ? (
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant text-center space-y-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mx-auto">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-headline font-bold text-base text-primary">Password Reset Initiated</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                If an account exists with <strong className="text-primary">{email}</strong>, a reset link has been generated.
              </p>
              {resetLink && (
                <div className="p-3 bg-surface-container-low rounded-lg text-left font-mono text-[11px] break-all border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block mb-1">Direct Reset URL:</span>
                  <Link href={resetLink} className="text-secondary hover:underline">{resetLink}</Link>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setView("login"); setResetSent(false); setResetLink(""); }}
                className="w-full py-2.5 text-xs font-semibold bg-surface-container text-primary rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all text-primary"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-primary mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-3.5 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all text-primary"
                    required
                  />
                </div>
              </div>

              {view !== "forgot" && (
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-10 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all text-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer select-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {(view === "signup" || view === "login") && password.length > 0 && (
                    <div className="mt-2.5 p-3 bg-surface-container-low rounded-lg border border-outline-variant text-[11px] space-y-1">
                      <p className="font-semibold text-on-surface-variant mb-1">Password Requirements:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <span className={hasMinLength ? "text-secondary font-medium" : "text-on-surface-variant/70"}>
                          • 8+ characters
                        </span>
                        <span className={hasUppercase ? "text-secondary font-medium" : "text-on-surface-variant/70"}>
                          • Uppercase letter
                        </span>
                        <span className={hasLowercase ? "text-secondary font-medium" : "text-on-surface-variant/70"}>
                          • Lowercase letter
                        </span>
                        <span className={hasNumber ? "text-secondary font-medium" : "text-on-surface-variant/70"}>
                          • Number (0-9)
                        </span>
                        <span className={hasSpecial ? "text-secondary font-medium" : "text-on-surface-variant/70"}>
                          • Special symbol
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === "login" && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-outline-variant text-secondary focus:ring-secondary/20"
                    />
                    <span className="text-xs text-on-surface-variant font-medium">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setError(""); }}
                    className="text-xs font-semibold text-secondary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {view === "signup" && (
                <p className="text-[11px] text-on-surface-variant leading-relaxed pt-1">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-primary underline hover:text-secondary font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary underline hover:text-secondary font-medium">
                    Privacy Policy
                  </Link>.
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary-fixed py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer shadow-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {view === "signup" && "Create Account"}
                      {view === "login" && "Sign In"}
                      {view === "forgot" && "Send Reset Link"}
                    </span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {view === "forgot" && (
                <button
                  type="button"
                  onClick={() => { setView("login"); setError(""); }}
                  className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-center block"
                >
                  Back to Sign In
                </button>
              )}
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors">
              &larr; Back to Home
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
