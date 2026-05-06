import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Cpu, Download } from 'lucide-react';
import { UserData } from '../app/page';
import { usePDF } from 'react-to-pdf';
import ResumeTemplate from './ResumeTemplate';

interface Props {
  navigate: (mode: string) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

export default function AnalyzerSection({ navigate, userData, updateUserData }: Props) {
  const [loading, setLoading] = useState(!userData.analysisResults);
  const [error, setError] = useState<string | null>(null);
  const { toPDF, targetRef } = usePDF({filename: 'optimized_resume.pdf'});

  useEffect(() => {
    if (userData.analysisResults) return;

    const analyze = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        updateUserData({ analysisResults: data });
      } catch (err: any) {
        setError(err.message || 'Failed to analyze resume.');
      } finally {
        setLoading(false);
      }
    };

    analyze();
  }, [userData, updateUserData]);

  if (loading) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full">
        <div className="flex-1 flex flex-col items-center justify-center py-20 w-full h-full">
          <div className="w-16 h-16 border-4 border-surface-container border-t-secondary-fixed rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(95,251,214,0.5)]"></div>
          <h3 className="text-xl font-headline font-bold mb-2 text-primary">Agentic Audit Initiated</h3>
          <p className="text-on-surface-variant text-sm">Evaluating structure and extracting impact metrics via Gemini...</p>
        </div>
      </section>
    );
  }

  if (error || !userData.analysisResults) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full">
        <div className="p-8 text-red-500 font-bold border border-red-200 rounded-xl bg-red-50 text-sm mt-8 mx-auto w-full max-w-2xl">
          Error running Agentic Analysis: {error}
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
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto relative">
      <ResumeTemplate ref={targetRef} userData={userData} />
      
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">The Editorial Engineer</p>
        <h2 className="text-3xl font-headline font-extrabold text-primary mb-2">Ultimate CS Career Architect</h2>
        <p className="text-on-surface-variant text-sm max-w-2xl">Precision-engineered resume analysis for high-tier tech roles. Our 3-Layer Audit identifies structural gaps, keyword misalignments, and impact deficiencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-primary-container text-white p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-secondary opacity-10 rounded-full blur-3xl"></div>
          <h3 className="text-xs font-label tracking-widest font-bold uppercase opacity-60 mb-2">Layer 01 Audit</h3>
          <h4 className="text-xl font-headline font-bold mb-4">ATS Compatibility</h4>
          
          <div className="flex flex-col items-center py-8">
            <div className="w-40 h-40 rounded-full border-4 border-surface-container-low/20 border-l-secondary-fixed flex items-center justify-center relative">
               <span className="text-6xl font-black font-headline text-secondary-fixed">{atsScore}</span>
               <span className="absolute bottom-5 text-[10px] font-label font-bold tracking-widest opacity-60">SCORE / 100</span>
            </div>
          </div>
          
          <p className="text-xs opacity-70 border-t border-white/10 pt-4 mt-2">{atsFeedback}</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div>
             <h3 className="text-xs font-label font-bold tracking-widest uppercase mb-1 text-on-surface-variant">Layer 02 Audit</h3>
             <h4 className="text-xl font-headline font-bold mb-8">Specialization Alignment</h4>
             
             <div className="space-y-6">
               <div>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-sm font-bold">{primaryMatchName}</span>
                   <span className="text-xs font-bold text-secondary">{primaryMatchScore}% MATCH</span>
                 </div>
                 <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                   <div className="h-full bg-secondary rounded-full" style={{ width: `${primaryMatchScore}%` }}></div>
                 </div>
               </div>
               
               <div>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-sm font-bold text-on-surface-variant">{secondaryMatchName}</span>
                   <span className="text-xs font-bold text-on-surface-variant">{secondaryMatchScore}% MATCH</span>
                 </div>
                 <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                   <div className="h-full bg-outline-variant rounded-full" style={{ width: `${secondaryMatchScore}%` }}></div>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-surface-container-low">
             <h5 className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant mb-4">Top Keyword Matches</h5>
             <div className="flex gap-2 flex-wrap">
               {keywords?.slice(0, 4).map((k: string) => (
                 <span key={k} className="px-3 py-1 bg-secondary-fixed/20 text-secondary border border-secondary-fixed/50 text-[10px] font-bold rounded-full">{k}</span>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm mb-8">
         <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xs font-label font-bold tracking-widest uppercase mb-1 text-on-surface-variant">Layer 03 Audit</h3>
              <h4 className="text-xl font-headline font-bold">Content Impact Score</h4>
            </div>
            <div className="flex items-center gap-2 border border-outline-variant/20 px-4 py-2 rounded-lg bg-surface-container-lowest">
              <span className="text-xl font-black font-headline">{contentImpactGrade}</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant w-20 leading-tight">Quantifiable Impact Level</span>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
               <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-3 flex items-center gap-1"><AlertTriangle size={14} /> Weak Bullet Points</span>
               <p className="text-sm italic mb-4">"{weakBullet || 'N/A'}"</p>
               <span className="text-[10px] font-bold text-red-600 uppercase">ISSUE: {weakIssue || 'Vague description'}</span>
            </div>
            <div className="bg-[#f0fbf8] p-6 rounded-xl border-l-4 border-secondary">
               <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-1"><CheckCircle size={14} /> Impactful Alternatives</span>
               <p className="text-sm font-semibold mb-4 leading-relaxed bg-white p-3 rounded shadow-sm">"{fixedBullet || 'N/A'}"</p>
               <span className="text-[10px] font-bold text-secondary uppercase">STRENGTH: {fixedStrength || 'Action-oriented'}</span>
            </div>
         </div>
      </div>
      
      <div className="flex justify-end gap-4">
         <button onClick={() => toPDF()} className="bg-surface-container-low text-on-surface-variant border border-outline-variant/20 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-surface-container transition-all">
           <Download size={16} /> Export to PDF
         </button>
         <button onClick={() => navigate('projects')} className="bg-primary-container text-secondary-fixed px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary transition-all ai-glow">
           <Cpu size={16} /> Suggest Projects for My Profile
         </button>
      </div>
    </section>
  );
}
