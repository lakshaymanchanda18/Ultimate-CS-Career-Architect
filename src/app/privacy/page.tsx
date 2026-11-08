import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | CareerEngine",
  description: "Privacy Policy explaining data collection, AI inference processing, and user data rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface text-primary font-body py-12 px-6 md:px-12 selection:bg-secondary/20">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Back to CareerEngine
          </Link>
          <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
            Effective: January 2026
          </span>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-md border border-outline-variant text-xs font-medium text-on-surface-variant">
            <Shield size={14} className="text-secondary" /> Privacy and Data Governance
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed max-w-2xl">
            This policy outlines how CareerEngine collects, stores, processes, and protects your career and resume data when using our software engineering preparation workspace.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-on-surface-variant">
          
          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant space-y-3">
            <h2 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <Eye size={18} className="text-secondary" /> 1. Information We Collect
            </h2>
            <p>
              We collect only the information necessary to provide ATS analysis, mock technical interviews, and system architecture planning:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-primary">Account Credentials:</strong> Name, email address, and securely salted/hashed passwords (or OAuth identity tokens).</li>
              <li><strong className="text-primary">Candidate Profile:</strong> University or college background, primary specialization, GPA, technical stack, and years of experience.</li>
              <li><strong className="text-primary">Assessment & Interview Data:</strong> Written or transcribed answers submitted during mock interview rounds.</li>
              <li><strong className="text-primary">Career Tracking Records:</strong> Target company names, roles, and status stages recorded on your personal job board.</li>
            </ul>
          </section>

          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant space-y-3">
            <h2 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <Lock size={18} className="text-secondary" /> 2. AI Model Processing & Third-Party Providers
            </h2>
            <p>
              When you initiate an ATS audit, an interview simulation, or a project blueprint, candidate text is sent transiently to configured AI service providers (such as Google Gemini, Groq, Mistral, or OpenRouter) via authenticated server-side API requests:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your data is never used by us to train foundational public language models.</li>
              <li>API requests are executed with enterprise-tier data processing commitments that prohibit model training on submitted API payloads.</li>
              <li>Prompts and documents are delimited as untrusted data buffers to safeguard against prompt injection.</li>
            </ul>
          </section>

          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant space-y-3">
            <h2 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <Database size={18} className="text-secondary" /> 3. Data Storage & Security
            </h2>
            <p>
              All application state is stored in managed PostgreSQL databases:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>All database connections are enforced via TLS/SSL encryption in transit.</li>
              <li>User passwords are hashed using bcrypt with salt work factors.</li>
              <li>Every database query is strictly scoped to the authenticated session user ID to enforce strict tenant isolation.</li>
            </ul>
          </section>

          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant space-y-3">
            <h2 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
              <Trash2 size={18} className="text-secondary" /> 4. Data Retention & Deletion Rights
            </h2>
            <p>
              You maintain total ownership of your data. You may at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Export your optimized resume and project architectures as PDF or structured JSON files.</li>
              <li>Delete saved job tracker entries, analyses, and saved career plans directly in the workspace.</li>
              <li>Request complete account deletion and purge of all associated records by submitting a request through Settings.</li>
            </ul>
          </section>

          <section className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant space-y-3">
            <h2 className="text-lg font-headline font-bold text-primary">5. Contact & Privacy Inquiries</h2>
            <p>
              For questions regarding this policy, data processing, or data export requests, please contact our team via the support portal or repository issue tracker.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
          <p>&copy; {new Date().getFullYear()} CareerEngine. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-primary transition-colors">Workspace</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
