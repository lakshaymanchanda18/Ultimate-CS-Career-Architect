import { useEffect, useState } from 'react';
import { FileText, Calendar, TrendingUp, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface AnalysisRecord {
  id: string;
  atsScore: number;
  primaryMatchName: string;
  contentImpactGrade: string;
  createdAt: string;
  user?: {
    profiles?: any[];
  };
}

interface Props {
  navigate: (mode: string) => void;
  restoreAnalysis: (analysis: any, profile: any) => void;
}

export default function DashboardSection({ navigate, restoreAnalysis }: Props) {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleCardClick = (analysis: any) => {
    let profile = null;
    if (analysis.user?.profiles && analysis.user.profiles.length > 0) {
      profile = analysis.user.profiles[0];
    }
    
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

  const handleDeleteAnalysis = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete analysis');
      
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full pb-8">
        <div className="mb-8">
          <div className="skeleton h-4 w-24 mb-3"></div>
          <div className="skeleton h-10 w-64 mb-3"></div>
          <div className="skeleton h-4 w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="skeleton h-48 rounded-3xl"></div>
          <div className="skeleton h-48 rounded-3xl"></div>
          <div className="skeleton h-48 rounded-3xl"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full items-center justify-center">
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-red-200 shadow-sm text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-headline font-bold text-primary mb-3">Access Denied</h3>
          <p className="text-on-surface-variant text-[15px] mb-8">{error}</p>
          <button 
            onClick={fetchAnalyses}
            className="w-full bg-primary text-on-primary-fixed py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <RefreshCw size={18} /> Retry Connection
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto pb-8">
      <div className="mb-10 slide-up">
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">My Resumes</p>
        <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-3 tracking-tight">Audit Dashboard</h2>
        <p className="text-on-surface-variant text-[15px] max-w-2xl">Review and export your historically saved resume analyses.</p>
      </div>

      {analyses.length === 0 ? (
        <div className="bg-surface-container-lowest p-16 rounded-3xl border border-outline-variant/15 shadow-sm text-center slide-up" style={{ animationDelay: '100ms' }}>
          <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={32} className="text-on-surface-variant/40" />
          </div>
          <h3 className="text-xl font-headline font-bold mb-3 text-primary">No audits found</h3>
          <p className="text-[15px] text-on-surface-variant mb-8 max-w-sm mx-auto">You haven't run any resume analyses while logged in yet. Start your first audit to see it here.</p>
          <button 
            onClick={() => navigate('interview')} 
            className="bg-primary text-on-primary-fixed px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            Start New Audit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-in">
          {analyses.map((analysis) => (
            <div 
              key={analysis.id}
              onClick={() => handleCardClick(analysis)}
              className="bg-surface-container-lowest p-7 rounded-3xl border border-outline-variant/15 shadow-sm card-hover cursor-pointer group flex flex-col relative overflow-hidden"
            >
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-surface-container group-hover:bg-secondary-fixed transition-colors duration-300"></div>

              <div className="flex justify-between items-start mb-8 mt-2">
                <div>
                  <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors mb-2 text-on-surface-variant">{analysis.primaryMatchName || 'Software Engineer'}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                    <Calendar size={12} />
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="w-14 h-14 rounded-full border-2 border-surface-container-low border-t-secondary-fixed flex items-center justify-center bg-surface-container-lowest shrink-0 group-hover:shadow-[0_0_15px_rgba(95,251,214,0.4)] transition-all duration-300 relative z-10">
                    <span className="font-black font-headline text-lg text-secondary-fixed">{analysis.atsScore}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteAnalysis(e, analysis.id)}
                    className="p-1.5 text-on-surface-variant/40 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20"
                    title="Delete Analysis"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-auto border-t border-surface-container-low pt-5 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">Impact Grade</span>
                <div className="flex items-center gap-1.5 font-black text-primary bg-surface-container-low px-3 py-1 rounded-lg">
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
