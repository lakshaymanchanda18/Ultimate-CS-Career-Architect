import { ArrowRight, Mic } from 'lucide-react';

interface Props {
  navigate: (mode: string) => void;
}

export default function DiscoverySection({ navigate }: Props) {
  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full min-h-[600px] bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="p-12 pb-20 pt-20">
          <span className="px-3 py-1 bg-secondary-fixed text-primary text-xs font-bold rounded-full mb-6 inline-block">NEXT GEN CAREER TECH</span>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold leading-tight mb-6">
            Build a Resume<br/>That <span className="text-secondary">Beats the ATS</span><br/>and Wins the Job
          </h1>
          <p className="text-on-surface-variant mb-10 max-w-md">Stop guessing. Our AI-driven engine interviews you like a top-tier recruiter and architect's a professional narrative that high-growth companies can't ignore.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('interview')} className="bg-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-xl transition-all">
              Start Your Interview <ArrowRight size={16} />
            </button>
            <button className="bg-surface-container-low text-primary px-6 py-3 rounded-lg font-semibold hover:bg-outline-variant/20 transition-all">View Sample Resumes</button>
          </div>
        </div>
        <div className="h-full bg-surface-container-low relative flex flex-col justify-end p-12">
           <div className="glass-panel p-6 rounded-2xl w-3/4 self-end shadow-xl ai-glow transform translate-y-8">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <Mic size={14} />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-secondary">AI COACH ACTIVE</span>
              </div>
              <p className="text-sm font-medium italic">"I'm ready to audit your recent experience. Shall we begin?"</p>
           </div>
        </div>
      </div>
    </section>
  );
}
