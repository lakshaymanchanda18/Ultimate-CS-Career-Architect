"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, User } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set initial view from URL query param if present
  const queryView = searchParams.get("view") as "login" | "signup" | "forgot" | null;
  const initialView = (queryView === "signup" || queryView === "forgot") ? queryView : "login";

  const [view, setView] = useState<"login" | "signup" | "forgot">(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
          redirect: false,
        });

        if (result?.error) {
          setError(result.error === "CredentialsSignin" ? "Invalid email or password." : result.error);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex font-body">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-primary-container relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-secondary-fixed blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur text-secondary-fixed flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="font-headline font-bold text-lg text-white leading-tight">CareerEngine</h1>
              <p className="text-[10px] text-white/50 tracking-wider uppercase">CS Career Architect</p>
            </div>
          </div>

          <h2 className="text-4xl font-headline font-extrabold text-white leading-tight mb-6">
            Architect Your<br />
            Path to <span className="text-secondary-fixed">Tier-1</span><br />
            Tech Companies
          </h2>
          <p className="text-white/60 max-w-sm leading-relaxed">
            AI-powered resume auditing, ATS optimization, and personalized project recommendations — all in one platform.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-headline font-black text-secondary-fixed">95+</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">Avg ATS Score</p>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-headline font-black text-secondary-fixed">3x</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">Interview Rate</p>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-headline font-black text-secondary-fixed">50+</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">LPA Projects</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface transition-colors">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-secondary-fixed flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <h1 className="font-headline font-bold text-xl">CareerEngine</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-headline font-extrabold mb-2 text-primary">
              {view === "signup" && "Create your account"}
              {view === "login" && "Welcome back"}
              {view === "forgot" && "Reset Password"}
            </h2>
            <p className="text-on-surface-variant text-sm font-medium">
              {view === "signup" && "Start building your career profile today."}
              {view === "login" && "Sign in to continue your career journey."}
              {view === "forgot" && "Enter your email to receive a password reset link."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          {view === "forgot" && resetSent ? (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400 text-sm px-4 py-3.5 rounded-xl font-medium leading-relaxed">
                If an account exists for <span className="font-bold">{email}</span>, a password reset link has been generated. For testing in your local development environment:
                {resetLink && (
                  <div className="mt-3 p-3 bg-surface-container border border-green-200 dark:border-green-900/20 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-green-800 dark:text-green-400 mb-1">Local Testing Link:</p>
                    <a
                      href={resetLink}
                      className="text-xs font-mono text-secondary hover:underline break-all block"
                    >
                      {resetLink}
                    </a>
                  </div>
                )}
                <p className="mt-2 text-xs text-green-600/80 dark:text-green-400/80">
                  The link has also been printed in your server terminal.
                </p>
              </div>

              <button
                onClick={() => {
                  setView("login");
                  setResetSent(false);
                  setResetLink("");
                  setEmail("");
                }}
                className="w-full bg-primary text-on-primary-fixed rounded-xl py-3.5 font-semibold text-center hover:shadow-lg transition-all"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {view === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all text-primary"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all text-primary"
                    required
                  />
                </div>
              </div>

              {view !== "forgot" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all text-primary"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              {view === "login" && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-outline-variant/30 text-secondary focus:ring-secondary/20"
                    />
                    <span className="text-xs text-on-surface-variant font-medium">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setError(""); }}
                    className="text-xs text-secondary font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary-fixed rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {view === "signup" && "Create Account"}
                    {view === "login" && "Sign In"}
                    {view === "forgot" && "Send Reset Link"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant font-semibold">
              {view === "login" && (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => { setView("signup"); setError(""); }}
                    className="text-secondary font-bold hover:underline"
                  >
                    Create one
                  </button>
                </>
              )}
              {view === "signup" && (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setView("login"); setError(""); }}
                    className="text-secondary font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
              {view === "forgot" && !resetSent && (
                <>
                  Remembered your password?{" "}
                  <button
                    onClick={() => { setView("login"); setError(""); }}
                    className="text-secondary font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-on-surface-variant animate-pulse font-body">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
