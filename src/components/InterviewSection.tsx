import { Bot, CheckCircle, Lock, ArrowRight, UserCircle } from 'lucide-react';
import { UserData } from '../app/page';

interface Props {
  navigate: (mode: string) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

export default function InterviewSection({ navigate, userData, updateUserData }: Props) {
  const handleSave = () => {
    updateUserData({ analysisResults: undefined });
    navigate('analyzer');
  };

  return (
    <section className="fade-in flex flex-col w-full max-w-6xl mx-auto pb-8">
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">Interview Module • Phase 01</p>
        <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary mb-3 tracking-tight">Academic Foundations</h2>
        <p className="text-on-surface-variant text-[15px] max-w-2xl leading-relaxed">
          Let's build your technical profile. Our AI recruiter is here to help you structure your academic achievements for maximum impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Context */}
        <div className="col-span-1 slide-up">
          <div className="bg-surface-container-lowest rounded-3xl p-8 mb-6 border border-outline-variant/15 shadow-sm card-hover">
            <h3 className="font-headline font-bold text-lg mb-4 text-primary">Why this matters?</h3>
            <p className="text-[15px] text-on-surface-variant mb-6 leading-relaxed">
              Your academic stats form the baseline for entry-level roles. We use these to match you with "Batch-Specific" opportunities.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl shadow-sm border border-outline-variant/10">
                <CheckCircle className="text-secondary" size={20} />
                <span className="text-sm font-semibold text-primary">College Reputation Analysis</span>
              </div>
              <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 opacity-60">
                <Lock className="text-outline-variant" size={20} />
                <span className="text-sm font-semibold text-on-surface-variant">Technical Assessment (Phase 2)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Chat & Form */}
        <div className="col-span-1 lg:col-span-2 slide-up" style={{ animationDelay: '100ms' }}>
          
          {/* AI Message */}
          <div className="flex gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed/20 flex items-center justify-center shrink-0 shadow-lg shadow-secondary-fixed/10 pulse-glow border border-secondary-fixed/30">
              <Bot className="text-secondary" size={24} />
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-3xl rounded-tl-sm border border-outline-variant/15 shadow-sm card-hover">
              <p className="text-[15px] mb-4 text-on-surface-variant leading-relaxed">
                Hello! I'm your Career Architect guide. To start building your professional profile, I'd love to learn about your academic background.
              </p>
              <p className="text-[15px] font-semibold text-primary">
                Which College or University did you attend, and what was your Specialization?
              </p>
            </div>
          </div>

          {/* User Form Form */}
          <div className="flex flex-col items-end gap-4 w-full slide-up" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 shadow-lg -mb-2 mr-4 relative z-10">
              <UserCircle size={24} />
            </div>
            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-3xl rounded-tr-sm shadow-md border border-outline-variant/20 w-full lg:w-11/12 gradient-border focus-within:shadow-xl transition-shadow duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">College / University</label>
                  <input 
                    value={userData.college}
                    onChange={(e) => updateUserData({ college: e.target.value })}
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus-ring focus:border-secondary/30 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium" 
                    placeholder="e.g. UPES Dehradun" 
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">Specialization</label>
                  <input 
                    value={userData.specialization}
                    onChange={(e) => updateUserData({ specialization: e.target.value })}
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus-ring focus:border-secondary/30 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium" 
                    placeholder="e.g. CSE (AIML), Cyber" 
                    type="text"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">CGPA</label>
                  <input 
                    value={userData.cgpa}
                    onChange={(e) => updateUserData({ cgpa: e.target.value })}
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus-ring focus:border-secondary/30 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium" 
                    placeholder="e.g. 9.2/10" 
                    type="text"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">Tech Stack</label>
                  <input 
                    value={userData.techStack}
                    onChange={(e) => updateUserData({ techStack: e.target.value })}
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus-ring focus:border-secondary/30 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium" 
                    placeholder="e.g. Python, React, AWS" 
                    type="text"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase flex justify-between">
                    <span>Raw Experience</span>
                    <span className="text-[9px] font-normal opacity-70 normal-case">(Paste Resume Bullets)</span>
                  </label>
                  <textarea 
                    value={userData.experience}
                    onChange={(e) => updateUserData({ experience: e.target.value })}
                    rows={4} 
                    className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus-ring focus:border-secondary/30 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium leading-relaxed resize-none" 
                    placeholder="e.g. Worked with a team to build features for the website. Reduced load times."
                  ></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={!userData.college || !userData.experience}
                  className="bg-primary text-on-primary-fixed px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Continue 
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
