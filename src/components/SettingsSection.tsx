import { Settings, Monitor, Sun, Moon, Database, Trash2 } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useSession } from 'next-auth/react';

export default function SettingsSection() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

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
        <p className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2">Preferences</p>
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
