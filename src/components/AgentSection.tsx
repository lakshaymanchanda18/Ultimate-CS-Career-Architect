"use client";

import { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  History,
  Compass,
  Check,
  RotateCw,
  ExternalLink,
  Target,
  Zap,
  ShieldCheck,
  Bookmark,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { AgentActionTrace, AgentRunResponse, CareerPlanData } from '@/lib/agent/types';

interface SavedPlanRecord {
  id: string;
  title: string;
  targetRole: string;
  status: string;
  plan?: CareerPlanData | null;
  createdAt: string;
  updatedAt?: string;
}

interface Props {
  navigate: (mode: string) => void;
}

export default function AgentSection({ navigate }: Props) {
  const [activeTab, setActiveTab] = useState<'consult' | 'saved' | 'history'>('consult');
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<AgentRunResponse | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>([]);
  const [pastRuns, setPastRuns] = useState<AgentRunResponse[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvedPlanId, setApprovedPlanId] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({ 0: true });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const starterPrompts = [
    {
      title: "Backend SDE 4-Week Roadmap",
      desc: "Analyze my profile and recent interview feedback to create a targeted 4-week preparation plan.",
    },
    {
      title: "Identify Top Skill Gaps",
      desc: "Inspect my resume ATS analyses and recommend high-impact projects that bridge my biggest weaknesses.",
    },
    {
      title: "Portfolio Project Blueprint",
      desc: "Suggest a Tier-1 level system design project matching my current tech stack and draft an architecture blueprint.",
    },
    {
      title: "Job Pipeline Strategy",
      desc: "Summarize my active job applications and give me concrete weekly actions to improve conversion rates.",
    },
  ];

  const loadSavedPlans = async () => {
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/agent/plans');
      if (res.ok) {
        const data = (await res.json()) as { plans?: SavedPlanRecord[] };
        setSavedPlans(data.plans || []);
      }
    } catch (err: unknown) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoadingSaved(false);
    }
  };

  const loadRunHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/agent/runs');
      if (res.ok) {
        const data = (await res.json()) as { runs?: AgentRunResponse[] };
        setPastRuns(data.runs || []);
      }
    } catch (err: unknown) {
      console.error('Failed to load runs:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTabChange = (tab: 'consult' | 'saved' | 'history') => {
    setActiveTab(tab);
    if (tab === 'saved') {
      void loadSavedPlans();
    } else if (tab === 'history') {
      void loadRunHistory();
    }
  };

  const handleRunAgent = async (overridePrompt?: string) => {
    const textToRun = (overridePrompt || prompt).trim();
    if (!textToRun || isRunning) return;

    setIsRunning(true);
    setErrorMessage(null);
    setCurrentRun(null);
    setApprovedPlanId(null);

    try {
      const res = await fetch('/api/agent/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToRun }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to complete agent consultation.');
      } else {
        setCurrentRun(data as AgentRunResponse);
        if (!overridePrompt) setPrompt('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error communicating with agent.';
      setErrorMessage(msg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!currentRun || !currentRun.planPreview || approving) return;

    setApproving(true);
    try {
      const res = await fetch(`/api/agent/runs/${currentRun.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: currentRun.planPreview }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApprovedPlanId(data.plan.id);
        setCurrentRun(prev => (prev ? { ...prev, status: 'COMPLETED' } : null));
      } else {
        alert(data.error || 'Failed to approve plan.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error approving plan.';
      alert(msg);
    } finally {
      setApproving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to remove this roadmap?')) return;
    try {
      const res = await fetch(`/api/agent/plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedPlans(prev => prev.filter(p => p.id !== id));
      }
    } catch (err: unknown) {
      console.error('Delete plan error:', err);
    }
  };

  const toggleMilestone = (idx: number) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner / Hero */}
      <div className="relative rounded-2xl p-8 md:p-10 overflow-hidden bg-surface-container-lowest border border-outline-variant shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold rounded-md inline-flex items-center gap-1.5">
                <Compass size={13} /> SUPERVISED AGENT
              </span>
              <span className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant border border-outline-variant text-[11px] font-semibold rounded-md">
                Bounded & Zero-Autonomous Writes
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-primary">
              Career Architect Agent
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-[14px] leading-relaxed">
              Your autonomous career counselor. The agent inspects your profile, ATS resume scores, mock interview breakdowns, and job tracker to orchestrate a personalized, milestone-driven preparation roadmap.
            </p>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 bg-surface-container-low/70 backdrop-blur-md p-1.5 rounded-2xl border border-outline-variant/20 self-start md:self-auto">
            <button
              onClick={() => handleTabChange('consult')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'consult'
                  ? 'bg-primary text-on-primary-fixed shadow-md'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Sparkles size={14} /> Agent Chat
            </button>
            <button
              onClick={() => handleTabChange('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-primary text-on-primary-fixed shadow-md'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Bookmark size={14} /> Saved Plans
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-primary text-on-primary-fixed shadow-md'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <History size={14} /> Run Traces
            </button>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: CONSULTATION ─── */}
      {activeTab === 'consult' && (
        <div className="space-y-6">
          {/* Prompt Box */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Ask Career Architect Agent
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleRunAgent();
                  }
                }}
                disabled={isRunning}
                placeholder="E.g., Review my recent interview feedback and resume analysis, then design a 4-week roadmap to prepare for Senior Backend roles..."
                rows={3}
                maxLength={2000}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 text-sm text-primary placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-on-surface-variant">
                  {prompt.length}/2000 chars • Press <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded border border-outline-variant/30 text-[10px]">Ctrl+Enter</kbd> to run
                </span>
                <button
                  onClick={() => handleRunAgent()}
                  disabled={isRunning || !prompt.trim()}
                  className="bg-primary text-on-primary-fixed px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <RotateCw size={15} className="animate-spin" />
                      Orchestrating...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Consult Agent
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Starters */}
            {!currentRun && !isRunning && (
              <div className="mt-6 pt-5 border-t border-outline-variant/10">
                <p className="text-xs font-semibold text-on-surface-variant mb-3 flex items-center gap-1.5">
                  <Zap size={13} className="text-secondary" /> Or try a quick starter scenario:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starterPrompts.map((starter, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setPrompt(starter.desc);
                        handleRunAgent(starter.desc);
                      }}
                      className="p-3.5 bg-surface-container-low/60 hover:bg-surface-container-high border border-outline-variant/15 rounded-xl cursor-pointer transition-all hover:scale-[1.01] group"
                    >
                      <p className="text-xs font-bold text-primary group-hover:text-secondary transition-colors flex items-center justify-between">
                        {starter.title}
                        <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-[11px] text-on-surface-variant/80 mt-1 line-clamp-2">
                        {starter.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-500 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold">Consultation Error</p>
                <p className="text-xs text-red-400 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Running State Animation */}
          {isRunning && (
            <div className="p-8 bg-surface-container rounded-2xl border border-secondary/30 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
                <Compass size={22} className="absolute inset-0 m-auto text-secondary animate-pulse" />
              </div>
              <div>
                <p className="text-base font-bold text-primary">Autonomous Agent at Work</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-md">
                  Consulting tool registry, retrieving profile context, evaluating resume/interview history, and designing next steps...
                </p>
              </div>
            </div>
          )}

          {/* Current Run Results */}
          {currentRun && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Tool Execution Trace */}
              {currentRun.actions && currentRun.actions.length > 0 && (
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                      <ShieldCheck size={14} className="text-secondary" /> Bounded Tool Execution Trace
                    </h3>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {currentRun.actions.length} tools executed • {currentRun.metadata?.totalDurationMs ?? 0}ms total
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {currentRun.actions.map((act: AgentActionTrace, idx: number) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-primary font-mono">{act.toolName}</span>
                            {act.thought && (
                              <p className="text-[11px] text-on-surface-variant mt-0.5">{act.thought}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {act.latencyMs && (
                            <span className="text-[10px] text-on-surface-variant font-mono">
                              {act.latencyMs}ms
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              act.status === 'SUCCESS'
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                                : act.status === 'WAITING_APPROVAL'
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                                : 'bg-red-500/15 text-red-500'
                            }`}
                          >
                            {act.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Synthesized Advice */}
              {currentRun.finalAnswer && (
                <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/20 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-secondary" />
                    <h3 className="text-base font-bold text-primary">Strategic Career Recommendation</h3>
                  </div>
                  <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                    {currentRun.finalAnswer}
                  </div>
                </div>
              )}

              {/* Interactive Plan Preview Card */}
              {currentRun.planPreview && (
                <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-secondary/40 shadow-sm space-y-6">
                  {/* Card Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/15">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary text-[11px] font-bold rounded-md uppercase">
                          Target Role: {currentRun.planPreview.targetRole}
                        </span>
                        <span className="px-2.5 py-0.5 bg-surface-container border border-outline-variant text-primary text-[11px] font-semibold rounded-md">
                          {currentRun.planPreview.timeline}
                        </span>
                      </div>
                      <h2 className="text-2xl font-headline font-bold text-primary">
                        {currentRun.planPreview.title}
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                        {currentRun.planPreview.summary}
                      </p>
                    </div>

                    {/* Approval Action */}
                    <div className="shrink-0">
                      {approvedPlanId ? (
                        <div className="px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-2">
                          <CheckCircle2 size={16} /> Roadmap Saved!
                        </div>
                      ) : (
                        <button
                          onClick={handleApprovePlan}
                          disabled={approving}
                          className="bg-secondary text-primary font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 hover:shadow-lg hover:shadow-secondary/20 transition-all cursor-pointer hover:scale-105"
                        >
                          {approving ? (
                            <>
                              <RotateCw size={14} className="animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <FolderPlus size={16} /> Approve & Save Roadmap
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Skill Gaps Addressed */}
                  {currentRun.planPreview.skillGaps && currentRun.planPreview.skillGaps.length > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                        Target Skill Gaps Addressed:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentRun.planPreview.skillGaps.map((gap: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-surface-container-high border border-outline-variant/20 rounded-lg text-xs font-medium text-primary flex items-center gap-1.5"
                          >
                            <Target size={12} className="text-secondary" /> {gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones Accordion */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                      Execution Milestones:
                    </p>
                    {currentRun.planPreview.milestones.map((m, idx: number) => (
                      <div
                        key={idx}
                        className="bg-surface-container rounded-2xl border border-outline-variant/20 overflow-hidden"
                      >
                        <div
                          onClick={() => toggleMilestone(idx)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-primary">{m.title}</h4>
                                <span className="text-[10px] font-semibold text-secondary px-2 py-0.5 bg-secondary/10 rounded-md">
                                  {m.duration}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-0.5">{m.description}</p>
                            </div>
                          </div>
                          {expandedMilestones[idx] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {expandedMilestones[idx] && (
                          <div className="px-6 pb-4 pt-2 border-t border-outline-variant/10 bg-surface-container-low/50">
                            <ul className="space-y-2 mt-2">
                              {m.tasks.map((task: string, tIdx: number) => (
                                <li key={tIdx} className="flex items-start gap-2.5 text-xs text-primary">
                                  <div className="w-4 h-4 rounded border border-secondary/40 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check size={10} className="text-secondary opacity-70" />
                                  </div>
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Evidence / Rationale */}
                  {currentRun.planPreview.rationale && (
                    <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/15 text-xs text-on-surface-variant">
                      <p className="font-bold text-primary mb-1">Architect Rationale & Evidence:</p>
                      <p className="italic">{currentRun.planPreview.rationale}</p>
                    </div>
                  )}

                  {/* Connected Module Shortcuts */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs font-semibold text-on-surface-variant">Next Step Recommendations:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate('interview')}
                        className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        Practice Interview <ExternalLink size={12} />
                      </button>
                      <button
                        onClick={() => navigate('projects')}
                        className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        Explore Project Ideas <ExternalLink size={12} />
                      </button>
                      <button
                        onClick={() => navigate('analyzer')}
                        className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl text-xs font-semibold text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        Resume ATS Audit <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: SAVED ROADMAPS ─── */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-primary">Saved Career Roadmaps</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Approved plans generated by Career Architect Agent.
              </p>
            </div>
            <button
              onClick={loadSavedPlans}
              className="p-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors cursor-pointer"
              title="Refresh plans"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {loadingSaved ? (
            <div className="p-12 text-center text-on-surface-variant text-sm">
              <RotateCw size={24} className="animate-spin mx-auto mb-2 text-secondary" />
              Loading saved roadmaps...
            </div>
          ) : savedPlans.length === 0 ? (
            <div className="p-12 bg-surface-container rounded-2xl border border-outline-variant/20 text-center space-y-3">
              <Bookmark size={32} className="mx-auto text-on-surface-variant/40" />
              <p className="text-sm font-bold text-primary">No Saved Plans Yet</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Consult the Career Architect Agent to draft a personalized milestone roadmap, then click &ldquo;Approve &amp; Save&rdquo;.
              </p>
              <button
                onClick={() => setActiveTab('consult')}
                className="bg-primary text-on-primary-fixed px-5 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                Draft New Roadmap
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedPlans.map(plan => (
                <div
                  key={plan.id}
                  className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold rounded-md uppercase">
                          {plan.targetRole}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          Created {new Date(plan.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-primary mt-1">{plan.title}</h3>
                      {plan.plan?.summary && (
                        <p className="text-xs text-on-surface-variant mt-1">{plan.plan.summary}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                      title="Delete roadmap"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Plan Milestones */}
                  {plan.plan?.milestones && Array.isArray(plan.plan.milestones) && (
                    <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                      {plan.plan.milestones.map((m, idx: number) => (
                        <div key={idx} className="p-3 bg-surface-container-low rounded-xl text-xs">
                          <div className="flex items-center justify-between font-bold text-primary">
                            <span>{idx + 1}. {m.title}</span>
                            <span className="text-secondary text-[10px]">{m.duration}</span>
                          </div>
                          {m.tasks && (
                            <ul className="mt-2 space-y-1 text-on-surface-variant">
                              {m.tasks.map((t: string, ti: number) => (
                                <li key={ti} className="flex items-center gap-2">
                                  <Check size={11} className="text-secondary" /> {t}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: RUN TRACES ─── */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-primary">Agent Consultation History</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Past reasoning traces and tool executions.
              </p>
            </div>
            <button
              onClick={loadRunHistory}
              className="p-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant transition-colors cursor-pointer"
              title="Refresh history"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="p-12 text-center text-on-surface-variant text-sm">
              <RotateCw size={24} className="animate-spin mx-auto mb-2 text-secondary" />
              Loading run history...
            </div>
          ) : pastRuns.length === 0 ? (
            <div className="p-12 bg-surface-container rounded-2xl border border-outline-variant/20 text-center space-y-3">
              <History size={32} className="mx-auto text-on-surface-variant/40" />
              <p className="text-sm font-bold text-primary">No Past Consultations</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Consult the agent above to see execution traces and steps recorded here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastRuns.map(run => (
                <div
                  key={run.id}
                  className="bg-surface-container rounded-2xl p-5 border border-outline-variant/20 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-primary line-clamp-1">
                      &ldquo;{run.userRequest}&rdquo;
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {new Date(run.createdAt).toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          run.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>
                  </div>

                  {run.finalAnswer && (
                    <p className="text-xs text-on-surface-variant line-clamp-3 bg-surface-container-low p-3 rounded-xl font-mono">
                      {run.finalAnswer}
                    </p>
                  )}

                  {run.actions && run.actions.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-on-surface-variant font-semibold">Tools used:</span>
                      {run.actions.map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-surface-container-high rounded text-[10px] font-mono text-secondary"
                        >
                          {a.toolName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
