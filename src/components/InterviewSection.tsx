import { Bot, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { UserData } from '../app/page';

interface Props {
  navigate: (mode: string) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

export default function InterviewSection({ navigate, userData, updateUserData }: Props) {
  const handleSave = () => {
    navigate('analyzer');
  };

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">Interview Module • Phase 01</p>
        <h2 className="text-3xl font-headline font-extrabold text-primary mb-2">Academic Foundations</h2>
        <p className="text-on-surface-variant text-sm max-w-2xl">Let's build your technical profile. Our AI recruiter is here to help you structure your academic achievements for maximum impact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-surface-container-high rounded-2xl p-8 mb-6">
            <h3 className="font-headline font-bold text-lg mb-4">Why this matters?</h3>
            <p className="text-sm text-on-surface-variant mb-6">Your academic stats form the baseline for entry-level roles. We use these to match you with "Batch-Specific" opportunities.</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-lg shadow-sm border border-outline-variant/10">
                <CheckCircle className="text-secondary" size={20} />
                <span className="text-xs font-semibold">College Reputation Analysis</span>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-lg shadow-sm border border-outline-variant/10 opacity-50">
                <Lock className="text-outline-variant" size={20} />
                <span className="text-xs font-semibold">Technical Assessment (Phase 2)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 shadow-lg shadow-secondary-fixed/20">
              <Bot className="text-primary" size={20} />
            </div>
            <div className="bg-surface-container-lowest p-5 rounded-2xl rounded-tl-none border border-outline-variant/10 shadow-sm">
              <p className="text-sm mb-4">Hello! I'm Sarah, your Career Architect guide. To start building your professional profile, I'd love to learn about your academic background.</p>
              <p className="text-sm font-semibold">Which <span className="text-primary">College or University</span> did you attend, and what was your <span className="text-primary">Specialization</span>?</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 w-full">
            <div className="glass-panel p-8 rounded-2xl rounded-tr-none shadow-lg border border-secondary/20 w-full lg:w-4/5 fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">College / University</label>
                  <input 
                    value={userData.college}
                    onChange={(e) => updateUserData({ college: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/30 outline-none transition-all" 
                    placeholder="e.g. UPES Dehradun" 
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">Specialization</label>
                  <input 
                    value={userData.specialization}
                    onChange={(e) => updateUserData({ specialization: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/30 outline-none transition-all" 
                    placeholder="e.g. CSE (AIML), Cyber, SDE" 
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">CGPA</label>
                  <input 
                    value={userData.cgpa}
                    onChange={(e) => updateUserData({ cgpa: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/30 outline-none transition-all" 
                    placeholder="e.g. 9.2/10" 
                    type="text"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">Tech Stack</label>
                  <input 
                    value={userData.techStack}
                    onChange={(e) => updateUserData({ techStack: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/30 outline-none transition-all" 
                    placeholder="e.g. Python, React, AWS, Tailwind" 
                    type="text"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2 block tracking-widest uppercase">Raw Experience (Paste Resume Bullets)</label>
                  <textarea 
                    value={userData.experience}
                    onChange={(e) => updateUserData({ experience: e.target.value })}
                    rows={3} 
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/30 outline-none transition-all" 
                    placeholder="e.g. Worked with a team to build features for the website. Reduced load times."
                  ></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-xl transition-all">
                  Save & Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
