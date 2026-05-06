import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { CheckCircle, Circle, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

interface ProjectStudioProps {
  title: string;
  techStack: string;
  navigate: (mode: string) => void;
}

export default function ProjectStudio({ title, techStack, navigate }: ProjectStudioProps) {
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string, retryable: boolean} | null>(null);
  const [tasks, setTasks] = useState<{ text: string; completed: boolean }[]>([]);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const fetchBlueprint = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, techStack }),
        signal: AbortSignal.timeout(30000)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw { message: data.error || 'Failed to generate blueprint.', retryable: data.retryable !== false };
      }

      setBlueprint(data);
      setTasks(data.tasks.map((t: string) => ({ text: t, completed: false })));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError({ message: 'Request timed out. Please try again.', retryable: true });
      } else {
        setError(err.message ? err : { message: 'An unexpected error occurred.', retryable: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default', fontFamily: 'Inter' });
    fetchBlueprint();
  }, [title, techStack]);

  useEffect(() => {
    if (blueprint?.architecture && mermaidRef.current) {
      mermaidRef.current.innerHTML = '';
      mermaid.render('mermaid-graph', blueprint.architecture).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
        }
      });
    }
  }, [blueprint]);

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full pb-8">
      <button 
        onClick={() => navigate('projects')} 
        className="text-on-surface-variant font-semibold mb-8 flex items-center gap-2 hover:text-primary transition-colors w-fit bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="mb-8 slide-up">
        <span className="px-3.5 py-1.5 bg-primary-container text-secondary-fixed text-[10px] font-bold rounded-full mb-4 inline-block uppercase tracking-widest shadow-sm">Execution Studio</span>
        <h2 className="text-4xl font-headline font-extrabold text-primary mb-3 tracking-tight">{title}</h2>
        <p className="text-on-surface-variant text-[15px]">Tech Stack: <span className="font-bold text-primary">{techStack}</span></p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-4">
          <div className="skeleton h-[600px] rounded-3xl"></div>
          <div className="skeleton h-[600px] rounded-3xl"></div>
        </div>
      ) : error ? (
        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl border border-red-200 shadow-sm text-center max-w-2xl mx-auto w-full mt-8">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-headline font-bold text-primary mb-3">Blueprint Generation Failed</h3>
          <p className="text-on-surface-variant text-[15px] mb-8">{error.message}</p>
          {error.retryable !== false && (
            <button 
              onClick={fetchBlueprint}
              className="bg-primary text-on-primary-fixed px-8 py-3.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              <RefreshCw size={18} /> Try Again
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-in">
          {/* Left Column: Tasks */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm p-8 flex flex-col h-[600px] card-hover">
            <div className="mb-8">
              <h3 className="text-xl font-headline font-bold mb-4">Implementation Roadmap</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2.5 bg-surface-container rounded-full progress-shimmer">
                  <div className="h-full bg-secondary rounded-full transition-all duration-700 ease-out z-10 relative" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs font-bold text-secondary">{Math.round(progress)}%</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-3 space-y-3 no-scrollbar pb-4">
              {tasks.map((task, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toggleTask(idx)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3.5 ${task.completed ? 'bg-surface-container-low border-outline-variant/20 opacity-60 scale-[0.98]' : 'bg-white border-outline-variant/20 hover:border-secondary/50 hover:shadow-md'}`}
                >
                  <div className={`mt-0.5 transition-transform duration-300 ${task.completed ? 'check-bounce' : ''}`}>
                    {task.completed ? <CheckCircle size={20} className="text-secondary" /> : <Circle size={20} className="text-outline-variant" />}
                  </div>
                  <p className={`text-[15px] leading-relaxed font-medium ${task.completed ? 'line-through text-on-surface-variant' : 'text-primary'}`}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Architecture Diagram */}
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 shadow-sm p-8 flex flex-col h-[600px] card-hover">
            <h3 className="text-xl font-headline font-bold mb-6">System Architecture</h3>
            <div className="flex-1 overflow-auto bg-surface-container-low rounded-2xl flex items-center justify-center p-6 border border-outline-variant/10 shadow-inner relative group">
               <div ref={mermaidRef} className="w-full h-full flex justify-center text-sm font-body"></div>
               <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
                 <span className="bg-primary text-on-primary-fixed px-4 py-2 rounded-lg text-xs font-bold shadow-lg">Scroll to zoom/pan</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
