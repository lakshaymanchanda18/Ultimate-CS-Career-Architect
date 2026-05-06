import { useEffect, useState } from 'react';
import { FileText, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { UserData } from '../app/page';

interface AnalysisRecord {
  id: string;
  atsScore: number;
  primaryMatchName: string;
  contentImpactGrade: string;
  createdAt: string;
  user?: {
    profiles?: any[];
  };
  // other fields are there but we just spread them when restoring
}

interface Props {
  navigate: (mode: string) => void;
  restoreAnalysis: (analysis: any, profile: any) => void;
}

export default function DashboardSection({ navigate, restoreAnalysis }: Props) {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await fetch('/api/analyses');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load historical data');
        }

        setAnalyses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  const handleCardClick = (analysis: any) => {
    // Attempt to extract the matching profile to restore the context
    let profile = null;
    if (analysis.user?.profiles && analysis.user.profiles.length > 0) {
      // Just grab the first profile for now, or match by closest date
      profile = analysis.user.profiles[0];
    }
    
    // Parse keywords back to array if it's a string
    let parsedKeywords = [];
    try {
      parsedKeywords = typeof analysis.keywords === 'string' ? JSON.parse(analysis.keywords) : analysis.keywords;
    } catch (e) {
      parsedKeywords = [];
    }

    const formattedAnalysis = {
      ...analysis,
      keywords: parsedKeywords
    };

    restoreAnalysis(formattedAnalysis, profile);
    navigate('analyzer');
  };

  if (loading) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full">
        <div className="flex-1 flex flex-col items-center justify-center py-20 w-full h-full">
          <div className="w-12 h-12 border-4 border-surface-container border-t-secondary-fixed rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(95,251,214,0.5)]"></div>
          <h3 className="text-xl font-headline font-bold text-primary">Loading Archives...</h3>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full items-center justify-center">
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center flex flex-col items-center max-w-md">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <h3 className="font-bold text-red-600 mb-1">Access Denied</h3>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <p className="text-xs text-on-surface-variant">Please sign in to view your saved resumes.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">My Resumes</p>
        <h2 className="text-3xl font-headline font-extrabold text-primary mb-2">Audit Dashboard</h2>
        <p className="text-on-surface-variant text-sm max-w-2xl">Review and export your historically saved resume analyses.</p>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/20 shadow-sm text-center">
          <FileText size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
          <h3 className="text-lg font-bold mb-2">No audits found</h3>
          <p className="text-sm text-on-surface-variant mb-6">You haven't run any resume analyses while logged in yet.</p>
          <button onClick={() => navigate('interview')} className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
            Start New Audit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <div 
              key={analysis.id}
              onClick={() => handleCardClick(analysis)}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{analysis.primaryMatchName || 'Software Engineer'}</h3>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-1 opacity-70">
                    <Calendar size={12} />
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-surface-container-low border-t-secondary-fixed flex items-center justify-center bg-surface-container-lowest shrink-0 group-hover:shadow-[0_0_10px_rgba(95,251,214,0.3)] transition-all">
                  <span className="font-bold text-sm text-secondary-fixed">{analysis.atsScore}</span>
                </div>
              </div>

              <div className="mt-auto border-t border-surface-container-low pt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Impact Grade</span>
                <div className="flex items-center gap-1 font-bold text-primary">
                  <TrendingUp size={14} className="text-secondary" />
                  {analysis.contentImpactGrade}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
