import { useState, useEffect } from 'react';
import { Settings, Monitor, Sun, Moon, Database, Trash2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useSession } from 'next-auth/react';
import { UserData } from '../app/page';

interface Props {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

export default function SettingsSection({ userData, updateUserData }: Props) {
  const { theme, setTheme } = useTheme();
  const { data: session, update } = useSession();

  const [localName, setLocalName] = useState(userData.name || "");
  const [localCollege, setLocalCollege] = useState(userData.college || "");
  const [localSpecialization, setLocalSpecialization] = useState(userData.specialization || "");
  const [localCgpa, setLocalCgpa] = useState(userData.cgpa || "");
  const [localTechStack, setLocalTechStack] = useState(userData.techStack || "");
  const [localExperience, setLocalExperience] = useState(userData.experience || "");

  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalName(userData.name || "");
    setLocalCollege(userData.college || "");
    setLocalSpecialization(userData.specialization || "");
    setLocalCgpa(userData.cgpa || "");
    setLocalTechStack(userData.techStack || "");
    setLocalExperience(userData.experience || "");
  }, [userData]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: localName,
          college: localCollege,
          specialization: localSpecialization,
          cgpa: localCgpa,
          techStack: localTechStack,
          experience: localExperience,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save profile details.');
      }

      // Update next-auth session variables on the client side
      if (update) {
        await update({ name: localName });
      }

      // Update parent state
      updateUserData({
        name: localName,
        college: localCollege,
        specialization: localSpecialization,
        cgpa: localCgpa,
        techStack: localTechStack,
        experience: localExperience,
      });

      setSaveSuccess(true);
    } catch (err: any) {
      setSaveError(err.message || 'An error occurred while saving.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear local cache? This won't delete data from your account.")) {
      localStorage.removeItem('career-engine-theme');
      alert("Local cache cleared. The page will now reload.");
      window.location.reload();
    }
  };

  return (
    <section className="fade-in flex flex-col w-full max-w-4xl mx-auto pb-8">
      <div className="mb-8 slide-up">
        <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary tracking-tight">Settings</h2>
      </div>

      <div className="space-y-6 stagger-in">
        
        {/* Profile Card */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover">
          <h3 className="font-headline font-bold text-lg mb-6 text-primary flex items-center gap-2">
            Account Profile
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xl shadow-md">
              {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xl font-bold text-primary mb-1">{session?.user?.name || 'Guest User'}</p>
              <p className="text-on-surface-variant font-medium">{session?.user?.email || 'Not logged in'}</p>
            </div>
          </div>
        </div>

        {/* Academic & Technical Profile Editor */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover">
          <h3 className="font-headline font-bold text-lg mb-6 text-primary flex items-center gap-2">
            Academic & Technical Profile
          </h3>
          <p className="text-on-surface-variant text-[15px] mb-6">
            These details are used by the AI engine to evaluate your resume, suggest target job opportunities, and generate optimized distributed systems projects.
          </p>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">Full Name</label>
                <input 
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus:ring-1 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium text-primary" 
                  placeholder="Your full name" 
                  type="text"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">College / University</label>
                <input 
                  value={localCollege}
                  onChange={(e) => setLocalCollege(e.target.value)}
                  className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus:ring-1 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium text-primary" 
                  placeholder="e.g. UPES Dehradun" 
                  type="text"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">Specialization</label>
                <input 
                  value={localSpecialization}
                  onChange={(e) => setLocalSpecialization(e.target.value)}
                  className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus:ring-1 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium text-primary" 
                  placeholder="e.g. CSE (AIML), Cyber" 
                  type="text"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">CGPA</label>
                <input 
                  value={localCgpa}
                  onChange={(e) => setLocalCgpa(e.target.value)}
                  className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus:ring-1 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium text-primary" 
                  placeholder="e.g. 9.2/10" 
                  type="text"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">Tech Stack</label>
                <input 
                  value={localTechStack}
                  onChange={(e) => setLocalTechStack(e.target.value)}
                  className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus:ring-1 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium text-primary" 
                  placeholder="e.g. Python, React, AWS" 
                  type="text"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-label font-bold text-on-surface-variant mb-2.5 block tracking-widest uppercase">Raw Experience</label>
                <textarea 
                  value={localExperience}
                  onChange={(e) => setLocalExperience(e.target.value)}
                  rows={4} 
                  className="w-full bg-surface-container-low border border-transparent rounded-xl p-4 text-[15px] focus:ring-1 focus:ring-secondary/20 outline-none transition-all placeholder:text-on-surface-variant/40 font-medium leading-relaxed resize-none text-primary" 
                  placeholder="e.g. Worked with a team to build features..."
                ></textarea>
              </div>
            </div>

            {saveError && (
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/15 border border-green-200 dark:border-green-900/30 rounded-xl p-4">
                Profile details saved successfully.
              </div>
            )}

            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={savingProfile || !localName || !localCollege || !localExperience}
                className="bg-primary text-on-primary-fixed px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    Saving Details...
                  </>
                ) : (
                  "Save Profile Details"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Appearance Settings */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover">
          <h3 className="font-headline font-bold text-lg mb-6 text-primary">Appearance</h3>
          <p className="text-on-surface-variant text-[15px] mb-6">
            Customize the look and feel of your Career Architect dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                theme === 'light' 
                  ? 'border-secondary bg-secondary-fixed/5 shadow-md shadow-secondary/10' 
                  : 'border-outline-variant/20 hover:border-outline-variant/50'
              }`}
            >
              <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-secondary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>
                <Sun size={20} />
              </div>
              <span className="font-bold text-[14px]">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                theme === 'dark' 
                  ? 'border-secondary bg-secondary-fixed/5 shadow-md shadow-secondary/10' 
                  : 'border-outline-variant/20 hover:border-outline-variant/50'
              }`}
            >
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-secondary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>
                <Moon size={20} />
              </div>
              <span className="font-bold text-[14px]">Dark Mode</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`p-5 rounded-2xl border transition-all flex flex-col items-center gap-3 ${
                theme === 'system' 
                  ? 'border-secondary bg-secondary-fixed/5 shadow-md shadow-secondary/10' 
                  : 'border-outline-variant/20 hover:border-outline-variant/50'
              }`}
            >
              <div className={`p-3 rounded-full ${theme === 'system' ? 'bg-secondary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}>
                <Monitor size={20} />
              </div>
              <span className="font-bold text-[14px]">System Setting</span>
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm card-hover">
          <h3 className="font-headline font-bold text-lg mb-6 text-primary flex items-center gap-2">
            <Database size={20} className="text-secondary" /> Data Management
          </h3>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 gap-4">
            <div>
              <p className="font-bold text-primary mb-1">Clear Local Storage</p>
              <p className="text-sm text-on-surface-variant">Resets theme preferences and clears local cache.</p>
            </div>
            <button 
              onClick={handleClearCache}
              className="px-6 py-3 bg-white dark:bg-surface-container-low text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-xl font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              <Trash2 size={16} /> Clear Cache
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
