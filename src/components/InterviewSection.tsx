import { useState, useRef, useEffect } from 'react';
import { 
  Bot, CheckCircle, Lock, ArrowRight, UserCircle, Sparkles, 
  Award, ArrowLeft, RefreshCw, Send, BrainCircuit, FileText, 
  Check, AlertCircle, HelpCircle, Loader2, Sparkle, Clock
} from 'lucide-react';
import { UserData } from '../app/page';

interface Props {
  navigate: (mode: string) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EvaluationData {
  type: 'evaluation';
  overallScore: number;
  scores: {
    technicalDepth: number;
    problemSolving: number;
    communication: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
  };
  qaBreakdown: Array<{
    question: string;
    userAnswer: string;
    recruiterAnalysis: string;
    idealAnswer: string;
  }>;
}

interface ProfileSyncData {
  type: 'profile_sync';
  college: string;
  specialization: string;
  cgpa: string;
  techStack: string;
  experience: string;
}

export default function InterviewSection({ navigate, userData, updateUserData }: Props) {
  // Screen and Mode States
  const [sessionState, setSessionState] = useState<'setup' | 'chat' | 'evaluation' | 'profile-sync'>('setup');
  const [interviewMode, setInterviewMode] = useState<'profile-builder' | 'mock-interview'>('profile-builder');
  
  // Selection Metadata
  const [selectedRole, setSelectedRole] = useState<'Backend' | 'Frontend' | 'Fullstack' | 'DevOps' | 'Mobile' | 'DataML' | 'QA' | 'Security' | 'Other'>('Backend');
  const [customRole, setCustomRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'Entry' | 'Mid' | 'Senior'>('Mid');

  // Chat States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data results states
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [profileSync, setProfileSync] = useState<ProfileSyncData | null>(null);

  // Saving state for DB Profile Sync
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  // History states
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history list when returning to welcome screen
  useEffect(() => {
    if (sessionState === 'setup') {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const res = await fetch('/api/interview/history');
          if (res.ok) {
            const data = await res.json();
            setHistoryList(data.sessions || []);
          }
        } catch (err) {
          console.error("Failed to load interview history", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [sessionState]);

  // Auto Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Autocorrect common spacing errors returned by cheap free-tier models
  const cleanRecruiterTypos = (text: string): string => {
    if (!text) return text;
    
    let cleaned = text;

    // 1. Systematically fix any contraction merges (straight ' or curly ’ apostrophes)
    // Matches e.g. I'mexcited -> I'm excited, Let'sbegin -> Let's begin, We'vediscussed -> We've discussed
    // and standard contractions: m, ll, ve, d, s, re
    const contractionRegex = /\b([a-zA-Z]+['’](?:m|ll|ve|d|s|re))([a-zA-Z]+)\b/g;
    cleaned = cleaned.replace(contractionRegex, '$1 $2');

    // 2. Fix "I[verb]" spacing issues (e.g. Imade -> I made)
    const iVerbRegex = /\bI(made|think|have|had|am|was|go|went|see|saw|want|wanted|need|needed|hope|hoped|feel|felt|know|knew|say|said|tell|told|ask|asked|get|got|can|could|will|would|should|must|do|did|done|make|build|built|suggest|suggested|start|started|begin|began|understand|agree|disagree|believe|appreciate|apologize)\b/g;
    cleaned = cleaned.replace(iVerbRegex, 'I $1');

    // 3. Fix "To[verb]" spacing issues (e.g. Toclarify -> To clarify)
    const toVerbRegex = /\b(To|to)(clarify|get|start|begin|help|discuss|ask|build|guide|share|talk|say|tell|write|create|make|do|see|hear|feel|know|think|understand|learn|practice|review|evaluate|analyze|analyse|audit|sync|save|proceed|identify|outline|explore|summarize|select|focus|tackle|solve)\b/g;
    cleaned = cleaned.replace(toVerbRegex, '$1 $2');

    // 4. Fix "You[verb]" spacing issues (e.g. Youwant -> You want)
    const youVerbRegex = /\b(You|you)(want|need|have|had|are|were|can|will|should|do|did|describe|share|think|know|make|suggest|suggested|start|started|begin|began|agree|disagree|tell|told|say|said)\b/g;
    cleaned = cleaned.replace(youVerbRegex, '$1 $2');

    // 5. Fix "We[verb]" spacing issues (e.g. Wehave -> We have)
    const weVerbRegex = /\b(We|we)(made|think|have|had|are|were|want|need|discuss|discussed|start|started|begin|began|can|will|should|do|did|suggest|suggested)\b/g;
    cleaned = cleaned.replace(weVerbRegex, '$1 $2');

    // 6. Fix "Let[me/us]" spacing issues (e.g. Letme -> Let me)
    cleaned = cleaned.replace(/\b(Let|let)(me|us)\b/g, '$1 $2');

    // 7. Fix "Here[is/are]" / "There[is/are]" spacing issues (e.g. Hereis -> Here is)
    cleaned = cleaned.replace(/\b(Here|here|There|there)(is|are|was|were)\b/g, '$1 $2');

    // 8. Fix "What[is/are/can/do]" spacing issues (e.g. Whatcan -> What can)
    cleaned = cleaned.replace(/\b(What|what)(is|are|was|were|can|do|does)\b/g, '$1 $2');

    return cleaned;
  };

  // JSON Repair helper for missing quotes around lists/bullets
  const repairJSONString = (text: string): string => {
    let cleaned = text.trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start < 0 || end <= start) return text;
    
    let jsonPart = cleaned.substring(start, end + 1);

    // If experience is not quoted (like bullet points directly after colon)
    // We wrap the experience block in quotes and escape any inner quotes.
    const expMatch = jsonPart.match(/"experience"\s*:\s*([^"\s{][\s\S]*?)\s*\}/);
    if (expMatch) {
      const rawVal = expMatch[1].trim();
      // Only repair if it does not start with double quotes
      if (!rawVal.startsWith('"')) {
        const escapedVal = rawVal.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        jsonPart = jsonPart.replace(expMatch[1], `"${escapedVal}"`);
      }
    }
    return jsonPart;
  };

  // JSON Extraction helper
  const tryParseJSON = (text: string) => {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
    }
    try {
      const obj = JSON.parse(cleaned);
      if (obj && typeof obj === 'object') return obj;
    } catch (e) {
      // Try repair
      try {
        const repaired = repairJSONString(cleaned);
        const obj = JSON.parse(repaired);
        if (obj && typeof obj === 'object') return obj;
      } catch {}
      
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start >= 0 && end > start) {
        try {
          const obj = JSON.parse(cleaned.substring(start, end + 1));
          if (obj && typeof obj === 'object') return obj;
        } catch {}
      }
    }
    return null;
  };

  // Start Session handler
  const handleStartSession = async (mode: 'profile-builder' | 'mock-interview') => {
    setInterviewMode(mode);
    setSessionState('chat');
    setLoading(true);
    setError(null);
    setMessages([]);

    const targetRole = selectedRole === 'Other' ? (customRole || 'Custom SDE') : selectedRole;
    let initialMsg = '';
    if (mode === 'profile-builder') {
      initialMsg = "Hi, I am ready to start building my academic and professional profile. Let's begin.";
    } else {
      initialMsg = `Hi, I am ready to start my technical mock interview for the ${selectedLevel} ${targetRole} Developer position.`;
    }

    const startMessages = [{ role: 'user' as const, content: initialMsg, timestamp: new Date() }];
    setMessages(startMessages);

    try {
      const startTime = Date.now();
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: startMessages.map(m => ({ role: m.role, content: m.content })),
          mode,
          role: targetRole,
          level: selectedLevel
        })
      });

      if (!res.ok) throw new Error("Could not connect to the AI Recruiter.");
      const data = await res.json();
      
      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(0, 1200 - elapsedTime);

      setTimeout(() => {
        setLoading(false);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: cleanRecruiterTypos(data.reply),
            timestamp: new Date()
          }
        ]);
      }, delay);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try restarting.");
      setSessionState('setup');
      setLoading(false);
    }
  };

  // Send Message handler
  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    setInputText('');
    setError(null);

    const updatedMessages = [
      ...messages,
      { role: 'user' as const, content: textToSend, timestamp: new Date() }
    ];
    setMessages(updatedMessages);
    setLoading(true);

    const targetRole = selectedRole === 'Other' ? (customRole || 'Custom SDE') : selectedRole;
    try {
      const startTime = Date.now();
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          mode: interviewMode,
          role: targetRole,
          level: selectedLevel
        })
      });

      if (!res.ok) throw new Error("Failed to send message.");
      const data = await res.json();

      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(0, 1200 - elapsedTime);

      setTimeout(() => {
        setLoading(false);

        // Check if it's a final payload (even if parsing fails)
        const isFinalPayload = data.reply.includes('"type": "profile_sync"') || data.reply.includes('"type": "evaluation"');

        // Check if the reply is a JSON block
        const parsedData = tryParseJSON(data.reply);
        if (parsedData) {
          if (parsedData.type === 'evaluation') {
            setEvaluation(parsedData);
            setSessionState('evaluation');
            fetch('/api/interview/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mode: 'mock-interview',
                role: targetRole,
                level: selectedLevel,
                overallScore: parsedData.overallScore,
                feedback: parsedData
              })
            }).catch(err => console.error("Failed to auto-save mock feedback", err));
          } else if (parsedData.type === 'profile_sync') {
            setProfileSync(parsedData);
            setSessionState('profile-sync');
            fetch('/api/interview/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mode: 'profile-builder',
                role: 'Academic Onboarding',
                level: 'Standard',
                overallScore: null,
                feedback: parsedData
              })
            }).catch(err => console.error("Failed to auto-save profile sync", err));
          } else {
            // Fallback if type missing but it's JSON
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: cleanRecruiterTypos(data.reply), timestamp: new Date() }
            ]);
          }
        } else if (isFinalPayload) {
          // Hide from chat feed even if it failed to parse
          setError("Your results were compiled but they failed to parse. Please check your internet connection and try sending again.");
        } else {
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: cleanRecruiterTypos(data.reply), timestamp: new Date() }
          ]);
        }
      }, delay);
    } catch (err: any) {
      setError(err.message || "Failed to process AI response. Please try again.");
      setLoading(false);
    }
  };

  // Save profile builder results to DB
  const handleSaveProfileSync = async () => {
    if (!profileSync) return;
    setSavingProfile(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college: profileSync.college,
          specialization: profileSync.specialization,
          cgpa: profileSync.cgpa,
          techStack: profileSync.techStack,
          experience: profileSync.experience,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save academic profile.');
      }

      // Update parent react state
      updateUserData({
        college: profileSync.college,
        specialization: profileSync.specialization,
        cgpa: profileSync.cgpa,
        techStack: profileSync.techStack,
        experience: profileSync.experience,
        analysisResults: undefined // clear to force re-analyzing
      });

      navigate('analyzer');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving profile data.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/interview/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to parse resume.');
      }

      const data = await res.json();
      if (data.parsedData) {
        // Pre-fill profile sync results directly!
        setProfileSync(data.parsedData);
        // Save the parsed session into history silently
        fetch('/api/interview/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'profile-builder',
            role: 'Uploaded Resume',
            level: 'Standard',
            overallScore: null,
            feedback: data.parsedData
          })
        }).catch(err => console.error("Failed to auto-save uploaded resume history", err));
        
        // Immediately go to the profile sync edit view so they can view/polish what was parsed!
        setSessionState('profile-sync');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not parse resume. Make sure it is a readable PDF or clear Image.');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Intermediate Finish Session Trigger
  const handleForceFinish = async () => {
    setLoading(true);
    try {
      const finishText = "I have completed all my answers. Please analyze the interview session now and output the final response JSON.";
      handleSendMessage(undefined, finishText);
    } catch (err: any) {
      setError("Failed to generate report. Please try resubmitting.");
      setLoading(false);
    }
  };

  // Count how many questions asked in mock
  const getQuestionProgress = () => {
    if (interviewMode !== 'mock-interview') return 0;
    // Count assistant messages asking questions
    const assistantCount = messages.filter(m => m.role === 'assistant').length;
    return Math.min(assistantCount, 5);
  };

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto pb-8 min-h-[calc(100vh-120px)] justify-between">
      
      {/* ─── SETUP SCREEN ─── */}
      {sessionState === 'setup' && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary-container px-3 py-1 rounded-full">
              Recruiter Hub • Phase 01
            </span>
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-primary mt-4 mb-3 tracking-tight">
              Conversational Recruiter
            </h2>
            <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
              Interact with our failover-engineered SDE agent. Practice rigorous mock interviews or build high-impact resume bullet points dynamically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* CARD A: PROFILE BUILDER */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary-fixed/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="text-secondary" size={24} />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3 text-primary">Resume Profile Builder</h3>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed mb-6">
                  Don't know how to write resume bullets? Chat with the recruiter agent. We'll ask about your college studies and projects, then draft professional SDE resume achievements automatically.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <CheckCircle className="text-secondary" size={16} />
                    <span>Guides University & Specialization details</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <CheckCircle className="text-secondary" size={16} />
                    <span>Auto-generates SDE project bullet points</span>
                  </div>
                </div>

                {/* Resume Upload Box */}
                <div className="mb-6 p-4 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant/40 hover:border-secondary/40 transition-colors relative flex flex-col items-center justify-center text-center">
                  <input 
                    type="file" 
                    accept=".pdf,image/png,image/jpeg"
                    onChange={handleResumeUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-secondary" size={20} />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Parsing resume...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <FileText className="text-secondary/70" size={22} />
                      <div>
                        <span className="text-xs font-bold text-primary block">Upload Resume (Optional)</span>
                        <span className="text-[9px] text-on-surface-variant/60 block mt-0.5">Supports PDF, PNG, JPG</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleStartSession('profile-builder')}
                className="w-full bg-secondary-fixed text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                Launch Builder <Sparkle size={16} />
              </button>
            </div>

            {/* CARD B: MOCK INTERVIEW */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/15 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-container text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="text-primary" size={24} />
                </div>
                <h3 className="font-headline font-bold text-xl mb-3 text-primary">SDE Technical Mock Interview</h3>
                <p className="text-sm text-on-surface-variant/80 leading-relaxed mb-6">
                  Experience a structured technical interview screen. Choose your development path and seniority, answer 5 custom engineering questions, and analyze a diagnostic report card.
                </p>

                {/* SDE Settings */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className={selectedRole === 'Other' ? 'col-span-1' : 'col-span-1'}>
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Track</label>
                    <select 
                      value={selectedRole}
                      onChange={(e: any) => setSelectedRole(e.target.value)}
                      className="w-full bg-surface-container-low border border-transparent rounded-lg p-2 text-xs font-semibold focus-ring outline-none"
                    >
                      <option value="Backend">Backend Developer</option>
                      <option value="Frontend">Frontend Developer</option>
                      <option value="Fullstack">Fullstack Engineer</option>
                      <option value="DevOps">DevOps Architect</option>
                      <option value="Mobile">Mobile Engineer</option>
                      <option value="DataML">Data/ML Engineer</option>
                      <option value="QA">QA Automation Engineer</option>
                      <option value="Security">Cybersecurity Specialist</option>
                      <option value="Other">Other (Custom Track)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Seniority</label>
                    <select 
                      value={selectedLevel}
                      onChange={(e: any) => setSelectedLevel(e.target.value)}
                      className="w-full bg-surface-container-low border border-transparent rounded-lg p-2 text-xs font-semibold focus-ring outline-none"
                    >
                      <option value="Entry">Entry-Level</option>
                      <option value="Mid">Mid-Level</option>
                      <option value="Senior">Senior Architect</option>
                    </select>
                  </div>
                  {selectedRole === 'Other' && (
                    <div className="col-span-2">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Custom Track Title</label>
                      <input 
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g., Embedded Systems Engineer, Game Developer"
                        className="w-full bg-surface-container-low border border-transparent rounded-lg p-2.5 text-xs font-semibold focus-ring outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleStartSession('mock-interview')}
                className="w-full bg-primary text-on-primary-fixed font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                Start Mock Interview <ArrowRight size={16} />
              </button>
            </div>

          </div>

          {/* HISTORY SECTION */}
          <div className="mt-12 pt-8 border-t border-outline-variant/15">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-primary" size={20} />
              <h3 className="font-headline font-bold text-lg text-primary">Session History Logs</h3>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-primary mr-2" size={18} />
                <span className="text-xs font-semibold text-on-surface-variant">Loading past sessions...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-6 text-center text-xs font-semibold text-on-surface-variant/70 border border-outline-variant/10">
                No past interview sessions found. Complete a mock session above to save reports.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyList.map((sessionItem) => (
                  <div 
                    key={sessionItem.id}
                    onClick={() => {
                      const payload = typeof sessionItem.feedback === 'string' 
                        ? JSON.parse(sessionItem.feedback) 
                        : sessionItem.feedback;
                      if (sessionItem.mode === 'mock-interview') {
                        setEvaluation(payload);
                        setSessionState('evaluation');
                      } else {
                        setProfileSync(payload);
                        setSessionState('profile-sync');
                      }
                    }}
                    className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          sessionItem.mode === 'mock-interview' 
                            ? 'bg-primary-container text-white' 
                            : 'bg-secondary-fixed/20 text-secondary'
                        }`}>
                          {sessionItem.mode === 'mock-interview' ? 'Mock Assessment' : 'Academic Sync'}
                        </span>
                        <span className="text-[10px] text-on-surface-variant/50 font-semibold">
                          {new Date(sessionItem.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-primary leading-snug">
                        {sessionItem.role} Developer
                      </h4>
                      <span className="text-[10px] text-on-surface-variant/60 block mt-0.5 font-medium">
                        Level: {sessionItem.level}
                      </span>
                    </div>

                    {sessionItem.overallScore !== null && (
                      <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-on-surface-variant/70">Overall Rating</span>
                        <span className="text-xs font-bold text-primary">{sessionItem.overallScore}/100</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ─── ACTIVE CHAT INTERFACE ─── */}
      {sessionState === 'chat' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-4">
          
          {/* Left Status sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 flex flex-col justify-between self-start shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="text-primary" size={20} />
                <h4 className="font-headline font-bold text-sm text-primary">Session Details</h4>
              </div>
              
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-on-surface-variant/60 block font-medium">Session Mode</span>
                  <span className="font-bold text-primary">
                    {interviewMode === 'profile-builder' ? 'Academic Builder' : 'Technical Mock'}
                  </span>
                </div>
                {interviewMode === 'mock-interview' && (
                  <>
                    <div>
                      <span className="text-on-surface-variant/60 block font-medium">Target Track</span>
                      <span className="font-bold text-primary">{selectedRole === 'Other' ? (customRole || 'Custom SDE') : selectedRole} Developer</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/60 block font-medium">Seniority</span>
                      <span className="font-bold text-primary">{selectedLevel} Level</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/60 block font-medium">Progress Tracker</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-surface-container-low h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all duration-300" 
                            style={{ width: `${(getQuestionProgress() / 5) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-[10px] text-primary">{getQuestionProgress()}/5</span>
                      </div>
                    </div>
                  </>
                )}
                {interviewMode === 'profile-builder' && (
                  <div>
                    <span className="text-on-surface-variant/60 block font-medium">Progress Tracker</span>
                    <span className="font-semibold text-secondary">Gathering profile facts...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mt-8">
              <button 
                onClick={handleForceFinish}
                disabled={loading || messages.length < 2}
                className="w-full bg-surface-container border border-outline-variant/30 text-xs font-semibold py-2.5 rounded-lg hover:bg-surface-container-high transition-colors disabled:opacity-50 cursor-pointer"
              >
                Finish & Evaluate
              </button>
              <button 
                onClick={() => setSessionState('setup')}
                className="w-full bg-red-50 text-red-600 text-xs font-bold py-2.5 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Exit Session
              </button>
            </div>
          </div>

          {/* Right Conversation Window */}
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant/15 rounded-3xl flex flex-col h-[580px] shadow-sm overflow-hidden">
            
            {/* Header bar */}
            <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed/20 flex items-center justify-center pulse-glow">
                  <Bot className="text-secondary" size={20} />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-primary">Recruiter Agent</h3>
                  <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active failover routing
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {messages.map((m, idx) => {
                const isLast = idx === messages.length - 1;
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-primary-container text-white' : 'bg-secondary-fixed/20'}`}>
                      {m.role === 'user' ? <UserCircle size={20} /> : <Bot className="text-secondary" size={18} />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-on-primary-fixed rounded-tr-sm' : 'bg-surface-container-low text-primary rounded-tl-sm'}`}>
                      {isLast && m.role === 'assistant' ? (
                        <TypewriterBubble text={m.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed/20 flex items-center justify-center shrink-0">
                    <Bot className="text-secondary" size={18} />
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl rounded-tl-sm flex items-center justify-center gap-1.5 border border-outline-variant/10 shadow-sm">
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-3 max-w-[80%] mx-auto items-center bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs font-semibold">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Suggestions */}
            {!loading && messages.length > 0 && (
              <div className="px-6 py-2 bg-surface-container-lowest border-t border-outline-variant/10 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSendMessage(undefined, "Can I have a hint, please?")}
                  className="bg-surface-container text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors text-primary"
                >
                  💡 Request Hint
                </button>
                <button 
                  onClick={() => handleSendMessage(undefined, "I need a moment to think about this.")}
                  className="bg-surface-container text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors text-primary"
                >
                  ⏳ Need time
                </button>
                <button 
                  onClick={() => handleSendMessage(undefined, "Could you explain the system requirements again?")}
                  className="bg-surface-container text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors text-primary"
                >
                  🔍 Re-explain question
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/15 flex gap-3 bg-surface-container-lowest">
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={loading}
                placeholder="Type your response here..."
                rows={1}
                className="flex-1 bg-surface-container-low border border-transparent rounded-xl px-4 py-3 text-sm focus-ring outline-none font-medium placeholder:text-on-surface-variant/40 resize-none leading-relaxed min-h-[48px] align-middle no-scrollbar"
              />
              <button 
                type="submit"
                disabled={loading || !inputText.trim()}
                className="w-12 h-12 bg-primary text-on-primary-fixed rounded-xl flex items-center justify-center hover:shadow-md hover:brightness-105 active:scale-[0.96] transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Send size={18} />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* ─── EVALUATION FEEDBACK SCREEN ─── */}
      {sessionState === 'evaluation' && evaluation && (
        <div className="flex-1 flex flex-col mt-4 gap-8">
          
          {/* Header Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
            <div className="text-center md:text-left z-10">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary-container px-3 py-1 rounded-full">Mock Assessment Feedback</span>
              <h2 className="text-3xl font-headline font-extrabold text-primary mt-3">Diagnostic Performance Card</h2>
              <p className="text-sm text-on-surface-variant/80 mt-1 max-w-xl">
                Here is the feedback generated by the AI recruiter agent based on your mock answers. Use this to patch gaps in your system design and algorithm syntax.
              </p>
            </div>

            {/* Overall Score Dial */}
            <div className="flex flex-col items-center shrink-0 z-10">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" fill="transparent" />
                  <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" className="text-primary" fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - evaluation.overallScore / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-headline font-black text-primary">{evaluation.overallScore}</span>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wide">Overall Rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Competency Ratings */}
            <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-sm self-start">
              <h3 className="font-headline font-bold text-base mb-6 text-primary flex items-center gap-2">
                <BrainCircuit size={18} /> Competency Scorecard
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-primary mb-1">
                    <span>Technical Depth</span>
                    <span>{evaluation.scores.technicalDepth}/100</span>
                  </div>
                  <div className="bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${evaluation.scores.technicalDepth}%` }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-semibold text-primary mb-1">
                    <span>Problem Solving</span>
                    <span>{evaluation.scores.problemSolving}/100</span>
                  </div>
                  <div className="bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: `${evaluation.scores.problemSolving}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-primary mb-1">
                    <span>Communication Style</span>
                    <span>{evaluation.scores.communication}/100</span>
                  </div>
                  <div className="bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-green-600 h-full rounded-full" style={{ width: `${evaluation.scores.communication}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-outline-variant/10 space-y-3">
                <button 
                  onClick={() => handleStartSession('mock-interview')}
                  className="w-full bg-primary text-on-primary-fixed font-bold py-3.5 rounded-xl hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <RefreshCw size={16} /> Retake Interview
                </button>
                <button 
                  onClick={() => setSessionState('setup')}
                  className="w-full bg-surface-container border border-outline-variant/30 text-primary font-bold py-3.5 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer text-sm"
                >
                  Exit to Welcome Screen
                </button>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-sm">
                <h3 className="font-headline font-bold text-base mb-4 text-primary">Strengths</h3>
                <ul className="space-y-3">
                  {evaluation.feedback.strengths.map((str, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-sm text-on-surface-variant leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5 border border-green-200">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-6 shadow-sm">
                <h3 className="font-headline font-bold text-base mb-4 text-primary">Areas of Improvement</h3>
                <ul className="space-y-3">
                  {evaluation.feedback.improvements.map((imp, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-sm text-on-surface-variant leading-relaxed">
                      <div className="w-5 h-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                        <AlertCircle size={12} strokeWidth={3} />
                      </div>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Q&A Breakdown list */}
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-8 shadow-sm">
            <h3 className="font-headline font-bold text-lg mb-6 text-primary flex items-center gap-2">
              <FileText size={20} /> Question-by-Question Audit Report
            </h3>

            <div className="space-y-8">
              {evaluation.qaBreakdown.map((item, idx) => (
                <div key={idx} className="border-b border-outline-variant/10 pb-8 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold bg-surface-container-high px-2.5 py-1 rounded-full text-primary">Q{idx + 1}</span>
                    <h4 className="font-headline font-bold text-sm text-primary">{item.question}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                      <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase block mb-1">Your Answer</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed italic">
                        "{item.userAnswer || 'No answer provided.'}"
                      </p>
                    </div>

                    <div className="bg-secondary-fixed/5 p-4 rounded-xl border border-secondary-fixed/10">
                      <span className="text-[10px] font-bold text-secondary uppercase block mb-1">Interviewer Critique</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {item.recruiterAnalysis}
                      </p>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-green-50/20 p-4 rounded-xl border border-green-200/30">
                      <span className="text-[10px] font-bold text-green-700 uppercase block mb-1">Exemplary Target Answer</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {item.idealAnswer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ─── PROFILE SYNC VIEW ─── */}
      {sessionState === 'profile-sync' && profileSync && (
        <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto mt-4">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary tracking-tight">
              Profile Synthesis Complete!
            </h2>
            <p className="text-xs text-on-surface-variant mt-2 max-w-md mx-auto leading-relaxed">
              We parsed your college, stack, and experiences from the conversation and formulated professional software engineering resume bullets.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-3xl p-8 shadow-md space-y-6">
            
            {/* Extracted Fields Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-outline-variant/10">
              <div>
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">College</label>
                <span className="text-sm font-semibold text-primary block">{profileSync.college}</span>
              </div>
              <div>
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Specialization</label>
                <span className="text-sm font-semibold text-primary block">{profileSync.specialization}</span>
              </div>
              <div>
                <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">CGPA</label>
                <span className="text-sm font-semibold text-primary block">{profileSync.cgpa || 'N/A'}</span>
              </div>
            </div>

            {/* Extracted Tech Stack */}
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Core Tech Stack</label>
              <div className="flex flex-wrap gap-1.5">
                {profileSync.techStack.split(',').map((tech, idx) => (
                  <span key={idx} className="bg-surface-container px-2.5 py-1 rounded-md text-xs font-semibold text-primary">
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Generated Experience Resume Bullets */}
            <div>
              <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Generated SDE Bullets</label>
              <textarea
                value={profileSync.experience}
                onChange={(e) => setProfileSync({ ...profileSync, experience: e.target.value })}
                rows={6}
                className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-xs font-medium focus-ring outline-none resize-none leading-relaxed text-on-surface-variant"
              />
            </div>

            {error && (
              <div className="text-xs font-bold text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-4 pt-4 border-t border-outline-variant/10 justify-end">
              <button 
                onClick={() => setSessionState('setup')}
                className="bg-surface-container border border-outline-variant/30 text-xs font-bold px-6 py-3.5 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Discard & Redo
              </button>
              <button 
                onClick={handleSaveProfileSync}
                disabled={savingProfile}
                className="bg-primary text-on-primary-fixed font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Syncing Profile...
                  </>
                ) : (
                  <>
                    Save & Proceed to Audit <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}

function TypewriterBubble({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    const words = text.split(/(\s+)/).filter(w => w !== undefined); // split by whitespaces but retain them
    let index = 0;
    setDisplayedText('');
    
    const timer = setInterval(() => {
      if (index < words.length) {
        setDisplayedText(prev => prev + (words[index] || ''));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
}
