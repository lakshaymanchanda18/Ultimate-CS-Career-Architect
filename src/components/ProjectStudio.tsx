import { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { CheckCircle, Circle, Loader2, ArrowLeft } from 'lucide-react';

interface ProjectStudioProps {
  title: string;
  techStack: string;
  navigate: (mode: string) => void;
}

export default function ProjectStudio({ title, techStack, navigate }: ProjectStudioProps) {
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<{ text: string; completed: boolean }[]>([]);
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });

    const fetchBlueprint = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/projects/blueprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, techStack })
        });
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);

        setBlueprint(data);
        setTasks(data.tasks.map((t: string) => ({ text: t, completed: false })));
      } catch (err: any) {
        setError(err.message || 'Failed to generate blueprint.');
      } finally {
        setLoading(false);
      }
    };

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
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full">
      <button onClick={() => navigate('projects')} className="text-secondary font-bold mb-6 flex items-center gap-2 hover:opacity-80 w-fit">
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="mb-8">
        <span className="px-3 py-1 bg-primary-container text-secondary-fixed text-xs font-bold rounded-full mb-4 inline-block">EXECUTION STUDIO</span>
        <h2 className="text-4xl font-headline font-extrabold text-primary mb-2">{title}</h2>
        <p className="text-on-surface-variant text-sm">Tech Stack: <span className="font-bold">{techStack}</span></p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 w-full">
           <Loader2 className="animate-spin text-secondary mb-4" size={48} />
           <p className="text-sm font-semibold tracking-wider">Generating AI Blueprint and Architecture...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 p-8 border border-red-200 rounded-xl bg-red-50 text-sm">
          <b>Error:</b> {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Tasks */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-8 flex flex-col h-[600px]">
            <div className="mb-6">
              <h3 className="text-lg font-headline font-bold mb-2">Implementation Roadmap</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs font-bold text-on-surface-variant">{Math.round(progress)}%</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
              {tasks.map((task, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toggleTask(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${task.completed ? 'bg-surface-container border-outline-variant/30 opacity-60' : 'bg-white border-outline-variant/20 hover:border-secondary hover:shadow-md'}`}
                >
                  <div className="mt-0.5">
                    {task.completed ? <CheckCircle size={18} className="text-secondary" /> : <Circle size={18} className="text-outline-variant" />}
                  </div>
                  <p className={`text-sm leading-relaxed ${task.completed ? 'line-through text-on-surface-variant/70' : 'text-primary'}`}>
                    {task.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Architecture Diagram */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm p-8 flex flex-col h-[600px]">
            <h3 className="text-lg font-headline font-bold mb-6">System Architecture</h3>
            <div className="flex-1 overflow-auto bg-surface-container-low rounded-xl flex items-center justify-center p-4 border border-outline-variant/10">
               <div ref={mermaidRef} className="w-full flex justify-center text-sm font-body"></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
