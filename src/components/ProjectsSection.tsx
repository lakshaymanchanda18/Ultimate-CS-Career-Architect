import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Settings, Zap } from 'lucide-react';
import { UserData } from '../app/page';

interface Props {
  userData: UserData;
  openStudio: (title: string, techStack: string) => void;
}

export default function ProjectsSection({ userData, openStudio }: Props) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [userData]);

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <span className="px-3 py-1 bg-secondary-fixed text-primary text-xs font-bold rounded-full mb-4 inline-flex items-center gap-1"><Sparkles size={14} /> HIGH-IMPACT MODE</span>
           <h2 className="text-4xl font-headline font-extrabold text-primary mb-2">Smart Project Suggester</h2>
           <p className="text-on-surface-variant text-sm">Custom suggestions for <span className="font-bold border-b border-secondary pb-0.5 text-secondary">{userData.specialization || "Software Engineering"}</span> aiming for <span className="font-bold text-primary">50 LPA+</span> roles at Tier-1 MNCs.</p>
        </div>
        <button onClick={fetchProjects} disabled={loading} className="bg-primary text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold hover:shadow-lg transition-all disabled:opacity-50">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Regenerate Ideas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-1 md:col-span-3 py-12 flex flex-col items-center justify-center opacity-70 fade-in">
             <Settings className="text-4xl text-secondary animate-spin mb-4" size={48} />
             <p className="text-sm font-semibold tracking-wider">Architecting AI Projects in Real-Time...</p>
          </div>
        ) : error ? (
          <div className="col-span-1 md:col-span-3 text-red-500 p-8 border border-red-200 rounded-xl bg-red-50 text-sm">
            <b>Error generating projects:</b> {error}. Please verify your API Key and try again.
          </div>
        ) : projects.map((p, index) => {
          const isHero = index === 0;
          return (
            <div key={index} className={`bg-surface-container-lowest rounded-2xl shadow-sm relative overflow-hidden group p-8 border border-outline-variant/10 flex flex-col justify-between hover:shadow-xl transition-all ${isHero ? 'md:col-span-2' : 'col-span-1'}`}>
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-fixed shadow-[0_0_15px_rgba(95,251,214,0.8)]"></div>
              
              <div>
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h3 className="text-2xl font-headline font-extrabold text-primary">{p.title}</h3>
                  <span className="px-3 py-1 bg-surface-container-low rounded-lg text-[10px] font-bold whitespace-nowrap hidden sm:block">{p.demand}</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.description }}></p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {p.stack?.map((tech: string) => (
                    <span key={tech} className="px-2 py-1 bg-surface-container-high text-[10px] font-bold rounded-full">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="pt-6 border-t border-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <span className="text-[11px] font-bold text-secondary uppercase flex items-center gap-1"><Zap size={14} /> Hook: {p.hook}</span>
                  <span className="px-4 py-2 bg-primary-container text-secondary-fixed rounded-full text-[10px] font-bold whitespace-nowrap">LPA TIP: {p.lpaTip}</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl mt-2 text-xs opacity-80 group-hover:opacity-100 transition-opacity">
                  <span className="font-bold text-primary block mb-1">Killer Question:</span>
                  <span className="text-on-surface-variant italic">{p.killerQuestion}</span>
                </div>
                <button 
                  onClick={() => openStudio(p.title, p.stack?.join(', ') || userData.techStack)}
                  className="w-full bg-surface-container-highest text-primary border border-outline-variant/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all mt-4"
                >
                  <Zap size={16} /> Execute in Studio
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
