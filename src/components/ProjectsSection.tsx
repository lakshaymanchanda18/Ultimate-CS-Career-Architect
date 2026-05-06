import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Zap } from 'lucide-react';
import { UserData } from '../app/page';

interface Props {
  userData: UserData;
  openStudio: (title: string, techStack: string) => void;
}

export default function ProjectsSection({ userData, openStudio }: Props) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string, retryable: boolean} | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialization: userData.specialization,
          atsScore: userData.analysisResults?.atsScore,
          techStack: userData.techStack
        }),
        signal: AbortSignal.timeout(45000) // 45s timeout for complex generation
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw { message: data.error || 'Failed to generate projects.', retryable: data.retryable !== false };
      }

      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError({ message: 'Generation timed out. Please try again.', retryable: true });
      } else {
        setError(err.message ? err : { message: 'An unexpected error occurred.', retryable: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userData]);

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <span className="px-3 py-1.5 bg-secondary-fixed/15 text-secondary text-xs font-bold rounded-full mb-4 inline-flex items-center gap-1.5 w-fit badge-pulse">
             <Sparkles size={14} /> HIGH-IMPACT MODE
           </span>
           <h2 className="text-4xl font-headline font-extrabold text-primary mb-2 tracking-tight">Smart Project Suggester</h2>
           <p className="text-on-surface-variant text-[15px] max-w-2xl">
             Custom suggestions for <span className="font-bold text-secondary border-b border-secondary/30 pb-0.5">{userData.specialization || "Software Engineering"}</span> aiming for <span className="font-bold text-primary">50 LPA+</span> roles at Tier-1 MNCs.
           </p>
        </div>
        <button 
          onClick={fetchProjects} 
          disabled={loading} 
          className="bg-surface-container-lowest text-primary border border-outline-variant/20 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-surface-container-low transition-all disabled:opacity-50 h-fit"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Regenerate Ideas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <div className="skeleton h-[420px] rounded-3xl md:col-span-2"></div>
            <div className="skeleton h-[420px] rounded-3xl col-span-1"></div>
            <div className="skeleton h-[420px] rounded-3xl col-span-1"></div>
            <div className="skeleton h-[420px] rounded-3xl md:col-span-2"></div>
          </>
        ) : error ? (
          <div className="col-span-1 md:col-span-3 bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-red-200 shadow-sm text-center max-w-2xl mx-auto w-full mt-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-headline font-bold text-primary mb-3">Generation Failed</h3>
            <p className="text-on-surface-variant text-[15px] mb-8">{error.message}</p>
            {error.retryable !== false && (
              <button 
                onClick={fetchProjects}
                className="bg-primary text-on-primary-fixed px-8 py-3.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <RefreshCw size={18} /> Try Again
              </button>
            )}
          </div>
        ) : projects.map((p, index) => {
          const isHero = index % 3 === 0;
          return (
            <div key={index} className={`bg-surface-container-lowest rounded-3xl shadow-sm relative overflow-hidden group p-8 md:p-10 border border-outline-variant/15 flex flex-col justify-between card-hover ${isHero ? 'md:col-span-2' : 'col-span-1'} stagger-in`}>
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-secondary-fixed shadow-[0_0_20px_rgba(95,251,214,0.6)] opacity-80"></div>
              
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                  <h3 className="text-2xl md:text-3xl font-headline font-extrabold text-primary leading-tight">{p.title}</h3>
                  <span className="px-3.5 py-1.5 bg-surface-container-low rounded-lg text-[10px] font-bold whitespace-nowrap text-on-surface-variant w-fit uppercase tracking-wide">
                    {p.demand}
                  </span>
                </div>
                <p className="text-on-surface-variant text-[15px] mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.description }}></p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {p.stack?.map((tech: string) => (
                    <span key={tech} className="px-3 py-1 bg-surface-container-high text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="pt-6 border-t border-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <span className="text-xs font-bold text-secondary uppercase flex items-center gap-1.5 bg-secondary-fixed/10 px-3 py-1.5 rounded-lg"><Zap size={14} /> Hook: {p.hook}</span>
                  <span className="px-4 py-2 bg-primary-container text-secondary-fixed rounded-xl text-[10px] font-bold whitespace-nowrap uppercase tracking-widest shadow-md">LPA TIP: {p.lpaTip}</span>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl mt-2 opacity-80 group-hover:opacity-100 transition-opacity border border-outline-variant/10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-2">Killer Interview Question:</span>
                  <span className="text-on-surface-variant text-sm font-medium">"{p.killerQuestion}"</span>
                </div>
                <button 
                  onClick={() => openStudio(p.title, p.stack?.join(', ') || userData.techStack)}
                  className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:bg-primary-fixed transition-all mt-4"
                >
                  <Zap size={18} className="text-secondary-fixed" /> Execute in Studio
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
