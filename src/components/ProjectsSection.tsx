import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Zap, Bookmark, BookmarkCheck, Trash2, Loader2 } from 'lucide-react';
import { UserData } from '../app/page';

interface Props {
  userData: UserData;
  openStudio: (title: string, techStack: string) => void;
  exploreProjects: any[];
  setExploreProjects: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ProjectsSection({ userData, openStudio, exploreProjects, setExploreProjects }: Props) {
  const projects = exploreProjects;
  const setProjects = setExploreProjects;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{message: string, retryable: boolean} | null>(null);
  
  // Saved projects states
  const [savedProjects, setSavedProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'explore' | 'saved'>('explore');
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const fetchSavedProjects = async () => {
    try {
      const res = await fetch('/api/projects/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load saved projects", err);
    }
  };

  const handleSave = async (p: any) => {
    setSavingId(p.title);
    try {
      const res = await fetch('/api/projects/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
      if (res.ok) {
        const savedProject = await res.json();
        setSavedProjects(prev => [savedProject, ...prev]);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save project');
      }
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleUnsave = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/saved/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSavedProjects(prev => prev.filter(sp => sp.id !== id));
      } else {
        alert('Failed to unsave project');
      }
    } catch (err) {
      console.error("Unsave error", err);
    }
  };

  const handleUnsaveByTitle = async (title: string) => {
    const project = savedProjects.find(sp => sp.title === title);
    if (project) {
      await handleUnsave(project.id);
    }
  };

  // Initial load: Fetch saved projects, and trigger generation only if explore results are empty
  useEffect(() => {
    fetchSavedProjects();
    if (projects.length === 0) {
      fetchProjects();
    }
  }, []);

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <span className="px-3 py-1.5 bg-secondary-fixed/15 text-secondary text-xs font-bold rounded-full mb-4 inline-flex items-center gap-1.5 w-fit badge-pulse">
             <Sparkles size={14} /> HIGH-IMPACT MODE
           </span>
           <h2 className="text-4xl font-headline font-extrabold text-primary mb-2 tracking-tight">
             {activeTab === 'explore' ? 'Smart Project Suggester' : 'My Saved Projects'}
           </h2>
           <p className="text-on-surface-variant text-[15px] max-w-2xl">
             {activeTab === 'explore' 
               ? <>Custom suggestions for <span className="font-bold text-secondary border-b border-secondary/30 pb-0.5">{userData.specialization || "Software Engineering"}</span> aiming for <span className="font-bold text-primary">50 LPA+</span> roles.</>
               : 'Review, modify, and execute your permanently saved roadmap ideas.'
             }
           </p>
        </div>
        {activeTab === 'explore' && (
          <button 
            onClick={fetchProjects} 
            disabled={loading} 
            className="bg-surface-container-lowest text-primary border border-outline-variant/20 px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-surface-container-low transition-all disabled:opacity-50 h-fit cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Regenerate Ideas
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/15 mb-8 gap-6">
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-3.5 text-sm font-semibold tracking-tight transition-all relative cursor-pointer ${activeTab === 'explore' ? 'text-primary font-bold border-b-2 border-secondary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Explore Ideas
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3.5 text-sm font-semibold tracking-tight transition-all relative cursor-pointer flex items-center gap-2 ${activeTab === 'saved' ? 'text-primary font-bold border-b-2 border-secondary' : 'text-on-surface-variant hover:text-primary'}`}
        >
          Saved Projects
          {savedProjects.length > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
              {savedProjects.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'explore' ? (
        <div className="flex flex-col gap-6 w-full">
          {loading ? (
            <>
              <div className="skeleton h-[360px] rounded-3xl w-full"></div>
              <div className="skeleton h-[360px] rounded-3xl w-full"></div>
              <div className="skeleton h-[360px] rounded-3xl w-full"></div>
            </>
          ) : error ? (
            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-red-200 shadow-sm text-center max-w-2xl mx-auto w-full mt-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-headline font-bold text-primary mb-3">Generation Failed</h3>
              <p className="text-on-surface-variant text-[15px] mb-8">{error.message}</p>
              {error.retryable !== false && (
                <button 
                  onClick={fetchProjects}
                  className="bg-primary text-on-primary-fixed px-8 py-3.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                >
                  <RefreshCw size={18} /> Try Again
                </button>
              )}
            </div>
          ) : projects.map((p, index) => {
            const isSaved = savedProjects.some(sp => sp.title === p.title);
            return (
              <div key={index} className="bg-surface-container-lowest rounded-3xl shadow-sm relative overflow-hidden group p-8 md:p-10 border border-outline-variant/15 flex flex-col md:flex-row gap-8 card-hover stagger-in w-full">
                
                {/* Left Column: Project Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex flex-wrap justify-between items-start gap-4">
                      <span className="px-3 py-1 bg-secondary-fixed/10 border border-secondary-fixed/20 text-secondary text-[10px] font-bold uppercase rounded-lg tracking-wider inline-block">
                        Target: {p.demand}
                      </span>
                      
                      <button
                        onClick={() => isSaved ? handleUnsaveByTitle(p.title) : handleSave(p)}
                        disabled={savingId === p.title}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isSaved 
                            ? 'bg-secondary-fixed/10 border-secondary-fixed/30 text-secondary' 
                            : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50'
                        }`}
                      >
                        {savingId === p.title ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                          </>
                        ) : isSaved ? (
                          <>
                            <BookmarkCheck size={14} />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark size={14} />
                            Save Project
                          </>
                        )}
                      </button>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-headline font-extrabold text-primary leading-tight tracking-tight">{p.title}</h3>
                    
                    <p className="text-on-surface-variant text-[15px] my-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.description }}></p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {p.stack?.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 bg-surface-container-high text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{tech}</span>
                    ))}
                  </div>
                </div>

                {/* Right Column: AI Pitch & Execute */}
                <div className="flex-1 flex flex-col justify-between space-y-6 md:space-y-0 md:border-l md:border-outline-variant/10 md:pl-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary-fixed/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <Zap size={13} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Pitch / Hook</span>
                        <p className="text-on-surface-variant text-sm font-medium mt-0.5 leading-relaxed">{p.hook}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={13} className="text-primary-fixed" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">LPA Tip</span>
                        <p className="text-on-surface-variant text-sm font-medium mt-0.5 leading-relaxed">{p.lpaTip}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low/50 p-5 rounded-2xl border border-outline-variant/10 group-hover:bg-surface-container-low transition-colors duration-300 my-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-1.5">Killer Interview Question</span>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed italic">
                      &ldquo;{p.killerQuestion}&rdquo;
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => openStudio(p.title, p.stack?.join(', ') || userData.techStack)}
                    className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:bg-primary-fixed transition-all mt-4 cursor-pointer"
                  >
                    <Zap size={18} className="text-secondary-fixed" /> Execute in Studio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Saved Projects Tab
        <div className="flex flex-col gap-6 w-full">
          {savedProjects.length === 0 ? (
            <div className="bg-surface-container-lowest p-16 rounded-3xl border border-outline-variant/15 shadow-sm text-center">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark size={32} className="text-on-surface-variant/40" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-3 text-primary">No saved projects</h3>
              <p className="text-[15px] text-on-surface-variant mb-8 max-w-sm mx-auto">
                You haven't saved any suggested projects yet. Browse the "Explore Ideas" tab and save the projects that align with your career goals.
              </p>
              <button 
                onClick={() => setActiveTab('explore')} 
                className="bg-primary text-on-primary-fixed px-8 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                Explore suggested projects
              </button>
            </div>
          ) : (
            savedProjects.map((p, index) => (
              <div key={p.id || index} className="bg-surface-container-lowest rounded-3xl shadow-sm relative overflow-hidden group p-8 md:p-10 border border-outline-variant/15 flex flex-col md:flex-row gap-8 card-hover stagger-in w-full">
                
                {/* Left Column */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex flex-wrap justify-between items-start gap-4">
                      <span className="px-3 py-1 bg-primary-container text-secondary-fixed text-[10px] font-bold uppercase rounded-lg tracking-wider inline-block">
                        Target: {p.demand}
                      </span>
                      
                      <button
                        onClick={() => handleUnsave(p.id)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-red-200/40 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} /> Remove Saved
                      </button>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-headline font-extrabold text-primary leading-tight tracking-tight">{p.title}</h3>
                    
                    <p className="text-on-surface-variant text-[15px] my-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.description }}></p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {p.stack?.map((tech: string) => (
                      <span key={tech} className="px-3 py-1 bg-surface-container-high text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">{tech}</span>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col justify-between space-y-6 md:space-y-0 md:border-l md:border-outline-variant/10 md:pl-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary-fixed/15 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                        <Zap size={13} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Pitch / Hook</span>
                        <p className="text-on-surface-variant text-sm font-medium mt-0.5 leading-relaxed">{p.hook}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-container/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={13} className="text-primary-fixed" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">LPA Tip</span>
                        <p className="text-on-surface-variant text-sm font-medium mt-0.5 leading-relaxed">{p.lpaTip}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low/50 p-5 rounded-2xl border border-outline-variant/10 group-hover:bg-surface-container-low transition-colors duration-300 my-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary block mb-1.5">Killer Interview Question</span>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed italic">
                      &ldquo;{p.killerQuestion}&rdquo;
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => openStudio(p.title, p.stack?.join(', ') || userData.techStack)}
                    className="w-full bg-primary text-on-primary-fixed py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:bg-primary-fixed transition-all mt-4 cursor-pointer"
                  >
                    <Zap size={18} className="text-secondary-fixed" /> Execute in Studio
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
