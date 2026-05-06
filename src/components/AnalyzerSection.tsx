import { useEffect, useState, useRef, useCallback } from 'react';
import { AlertTriangle, CheckCircle, Cpu, Download, RefreshCw, ShieldAlert } from 'lucide-react';
import { UserData } from '../app/page';
import { usePDF } from 'react-to-pdf';
import ResumeTemplate from './ResumeTemplate';

interface Props {
  navigate: (mode: string) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

interface AnalysisError {
  message: string;
  retryable: boolean;
}

export default function AnalyzerSection({ navigate, userData, updateUserData }: Props) {
  const [loading, setLoading] = useState(!userData.analysisResults);
  const [error, setError] = useState<AnalysisError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const { toPDF, targetRef } = usePDF({filename: 'optimized_resume.pdf'});

  const analyze = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college: userData.college,
          specialization: userData.specialization,
          cgpa: userData.cgpa,
          techStack: userData.techStack,
          experience: userData.experience,
        }),
        signal: controller.signal,
      });

      // Check if aborted during fetch
      if (controller.signal.aborted) return;

      const data = await res.json();

      if (!res.ok) {
        throw {
          message: data.error || 'Failed to analyze resume.',
          retryable: data.retryable !== false,
        };
      }

      // Validate we got actual analysis data
      if (typeof data.atsScore !== 'number') {
        throw {
          message: 'Received incomplete analysis data. Please try again.',
          retryable: true,
        };
      }

      updateUserData({ analysisResults: data });
      setRetryCount(0);
    } catch (err: any) {
      // Ignore abort errors from cleanup
      if (err?.name === 'AbortError' || controller.signal.aborted) {
        return;
      }

      if (err.name === 'TimeoutError') {
        setError({ message: 'Request timed out. The AI service may be busy — please try again.', retryable: true });
      } else if (err.message) {
        setError({ message: err.message, retryable: err.retryable !== false });
      } else {
        setError({ message: 'An unexpected error occurred. Please try again.', retryable: true });
      }
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [userData.college, userData.specialization, userData.cgpa, userData.techStack, userData.experience]);

  // Auto-start analysis on mount if no results
  useEffect(() => {
    if (!userData.analysisResults) {
      analyze();
    }

    // Cleanup: abort on unmount
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  // Determine if this is a configuration error (not retryable)
  const isConfigError = error && !error.retryable;

  if (loading) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full">
        <div className="flex-1 flex flex-col items-center justify-center py-20 w-full h-full text-center">
          <div className="spinner w-16 h-16 mb-8"></div>
          <h3 className="text-2xl font-headline font-bold mb-3 text-primary tracking-tight">AI Analysis Engine Active</h3>
          <p className="text-on-surface-variant text-[15px] max-w-sm mx-auto mb-4">
            Evaluating structure and extracting quantifiable impact metrics...
          </p>
          {retryCount > 0 && (
            <p className="text-on-surface-variant/60 text-xs mb-12">
              Attempt {retryCount + 1} • The AI service may need a moment
            </p>
          )}
          
          {/* Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-left">
            <div className="skeleton h-[280px] w-full rounded-2xl"></div>
            <div className="skeleton h-[280px] w-full rounded-2xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !userData.analysisResults) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full items-center justify-center">
        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-3xl border border-red-200 shadow-lg text-center max-w-md">
          <div className={`w-16 h-16 ${isConfigError ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            {isConfigError ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
          </div>
          <h3 className="text-xl font-headline font-bold text-primary mb-3">
            {isConfigError ? 'Configuration Issue' : 'Analysis Failed'}
          </h3>
          <p className="text-on-surface-variant text-[15px] mb-8">{error?.message || 'No data available. Please start an interview first.'}</p>
          
          {error?.retryable && (
            <button 
              onClick={analyze}
              disabled={loading}
              className="w-full bg-primary text-on-primary-fixed py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 
              {retryCount > 2 ? 'Try Again (AI may be busy)' : 'Retry Analysis'}
            </button>
          )}

          {!error && (
            <button
              onClick={() => navigate('interview')}
              className="w-full bg-primary text-on-primary-fixed py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              Start Interview First
            </button>
          )}

          {isConfigError && (
            <p className="text-xs text-on-surface-variant/50 mt-6">
              If this persists, check that your AI_API_KEY is valid in .env.local
            </p>
          )}
        </div>
      </section>
    );
  }

  const {
    atsScore,
    atsFeedback,
    primaryMatchName,
    primaryMatchScore,
    secondaryMatchName,
    secondaryMatchScore,
    keywords,
    contentImpactGrade,
    weakBullet,
    weakIssue,
    fixedBullet,
    fixedStrength
  } = userData.analysisResults;

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto relative pb-8">
      <ResumeTemplate ref={targetRef} userData={userData} />
      
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">The Editorial Engineer</p>
        <h2 className="text-3xl font-headline font-extrabold text-primary mb-2 tracking-tight">Ultimate CS Career Architect</h2>
        <p className="text-on-surface-variant text-[15px] max-w-2xl leading-relaxed">
          Precision-engineered resume analysis for high-tier tech roles. Our 3-Layer Audit identifies structural gaps, keyword misalignments, and impact deficiencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 stagger-in">
        {/* Layer 1 */}
        <div className="bg-primary-container text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between card-hover">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-secondary opacity-20 rounded-full blur-[60px]"></div>
          <h3 className="text-xs font-label tracking-widest font-bold uppercase opacity-60 mb-2">Layer 01 Audit</h3>
          <h4 className="text-2xl font-headline font-bold mb-4">ATS Compatibility</h4>
          
          <div className="flex flex-col items-center py-6">
            <div className="w-44 h-44 rounded-full border-4 border-surface-container-low/10 border-l-secondary-fixed flex items-center justify-center relative bg-white/5 backdrop-blur-sm">
               <span className="text-7xl font-black font-headline text-secondary-fixed score-reveal">{atsScore}</span>
               <span className="absolute bottom-6 text-[9px] font-label font-bold tracking-widest opacity-60 uppercase">Score / 100</span>
            </div>
          </div>
          
          <p className="text-sm opacity-80 border-t border-white/10 pt-5 mt-2 leading-relaxed">{atsFeedback}</p>
        </div>

        {/* Layer 2 */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col justify-between card-hover">
          <div>
             <h3 className="text-xs font-label font-bold tracking-widest uppercase mb-2 text-on-surface-variant">Layer 02 Audit</h3>
             <h4 className="text-2xl font-headline font-bold mb-8">Specialization Alignment</h4>
             
             <div className="space-y-6">
               <div className="group">
                 <div className="flex justify-between items-end mb-3">
                   <span className="text-[15px] font-bold text-primary">{primaryMatchName}</span>
                   <span className="text-xs font-bold text-secondary group-hover:scale-105 transition-transform">{primaryMatchScore}% MATCH</span>
                 </div>
                 <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                   <div className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out" style={{ width: `${primaryMatchScore}%` }}></div>
                 </div>
               </div>
               
               <div className="group opacity-70 hover:opacity-100 transition-opacity">
                 <div className="flex justify-between items-end mb-3">
                   <span className="text-[15px] font-bold text-primary">{secondaryMatchName}</span>
                   <span className="text-xs font-bold text-primary">{secondaryMatchScore}% MATCH</span>
                 </div>
                 <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                   <div className="h-full bg-outline-variant rounded-full transition-all duration-1000 ease-out delay-200" style={{ width: `${secondaryMatchScore}%` }}></div>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-surface-container-low">
             <h5 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">Top Keyword Matches</h5>
             <div className="flex gap-2 flex-wrap">
               {keywords?.slice(0, 4).map((k: string) => (
                 <span key={k} className="px-3.5 py-1.5 bg-secondary-fixed/10 text-secondary border border-secondary-fixed/30 text-[10px] font-bold rounded-full hover:bg-secondary-fixed/20 hover:scale-105 transition-all cursor-default">
                   {k}
                 </span>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Layer 3 */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm mb-8 card-hover slide-up" style={{ animationDelay: '200ms' }}>
         <div className="flex justify-between items-center mb-8 border-b border-surface-container-low pb-6">
            <div>
              <h3 className="text-xs font-label font-bold tracking-widest uppercase mb-2 text-on-surface-variant">Layer 03 Audit</h3>
              <h4 className="text-2xl font-headline font-bold">Content Impact Score</h4>
            </div>
            <div className="flex items-center gap-3 border border-outline-variant/20 px-5 py-3 rounded-2xl bg-surface-container-lowest shadow-sm">
              <span className="text-3xl font-black font-headline text-primary score-reveal">{contentImpactGrade}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant w-24 leading-snug">Quantifiable Impact Level</span>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 hover:border-red-200 transition-colors">
               <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertTriangle size={14} /> Weak Bullet Points</span>
               <p className="text-[15px] italic mb-5 text-on-surface-variant leading-relaxed">"{weakBullet || 'N/A'}"</p>
               <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-lg">ISSUE: {weakIssue || 'Vague description'}</span>
            </div>
            <div className="bg-secondary-fixed/5 p-6 rounded-2xl border border-secondary-fixed/30 hover:border-secondary-fixed/50 transition-colors">
               <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-1.5"><CheckCircle size={14} /> Impactful Alternatives</span>
               <p className="text-[15px] font-semibold mb-5 leading-relaxed bg-surface-container-lowest p-4 rounded-xl shadow-sm text-primary">"{fixedBullet || 'N/A'}"</p>
               <span className="inline-block px-3 py-1 bg-secondary-fixed/20 text-secondary text-[10px] font-bold uppercase rounded-lg">STRENGTH: {fixedStrength || 'Action-oriented'}</span>
            </div>
         </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-3 slide-up" style={{ animationDelay: '300ms' }}>
         <button onClick={() => toPDF()} className="bg-surface-container-lowest text-primary border border-outline-variant/20 px-7 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all">
           <Download size={18} /> Export to PDF
         </button>
         <button onClick={() => navigate('projects')} className="bg-primary-container text-secondary-fixed px-7 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary transition-all ai-glow">
           <Cpu size={18} /> Suggest Projects for My Profile
         </button>
      </div>
    </section>
  );
}
