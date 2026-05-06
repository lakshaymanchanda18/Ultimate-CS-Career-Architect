"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-secondary-fixed flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <h1 className="font-headline font-bold text-xl">CareerEngine</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-headline font-extrabold mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-on-surface-variant">
              {isSignUp
                ? "Start building your career profile today."
                : "Sign in to continue your career journey."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all"
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
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary-fixed rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="text-secondary font-semibold hover:underline"
              >
                {isSignUp ? "Sign In" : "Create one"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
