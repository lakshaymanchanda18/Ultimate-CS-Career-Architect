import { useState } from 'react';
import { Home, Sparkles, Plus, Mic, BarChart2, Lightbulb, GraduationCap, Settings, HelpCircle, LogIn, LogOut, X, Info } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  currentMode: string;
  navigate: (mode: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentMode, navigate, isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const navItemClass = (mode: string) => {
    const base = "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer ";
    if (currentMode === mode) {
      return base + "bg-surface-container-low text-primary font-bold";
    }
    return base + "text-on-surface-variant font-medium hover:bg-surface-container/50 hover:text-primary";
  };

  const handleNav = (mode: string) => {
    navigate(mode);
    if (onClose) onClose();
  };

  const handleNewResume = () => {
    showToast("Resume uploading coming soon!");
    handleNav('interview');
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 w-[280px] bg-surface-container-lowest border-r border-outline-variant/15 flex flex-col justify-between z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:flex shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => handleNav('discovery')}>
              <div className="w-10 h-10 rounded-xl bg-primary-container text-secondary-fixed flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(95,251,214,0.3)] transition-all duration-300">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="font-headline font-bold text-[17px] leading-tight tracking-tight">CareerEngine</h1>
                <p className="text-[9px] text-on-surface-variant tracking-widest uppercase font-bold mt-0.5">CS Architect</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="px-6 mb-8">
            <button 
              onClick={handleNewResume} 
              className="w-full bg-primary text-on-primary-fixed rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer"
            >
              <Plus size={18} /> New Resume
            </button>
          </div>

          <nav className="px-4 space-y-1.5">
            <div onClick={() => handleNav('discovery')} className={navItemClass('discovery')}>
              <Home size={20} className={currentMode === 'discovery' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
              <span className="text-[14px]">Home</span>
            </div>
            <div onClick={() => handleNav('interview')} className={navItemClass('interview')}>
              <Mic size={20} className={currentMode === 'interview' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
              <span className="text-[14px]">Interview</span>
            </div>
            <div onClick={() => handleNav('analyzer')} className={navItemClass('analyzer')}>
              <BarChart2 size={20} className={currentMode === 'analyzer' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
              <span className="text-[14px]">Analyzer</span>
            </div>
            <div onClick={() => handleNav('projects')} className={navItemClass('projects')}>
              <Lightbulb size={20} className={currentMode === 'projects' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
              <span className="text-[14px]">Project Suggester</span>
            </div>
            <div onClick={() => handleNav('job-board')} className={navItemClass('job-board')}>
              <GraduationCap size={20} className={currentMode === 'job-board' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
              <span className="text-[14px]">Job Board</span>
            </div>
          </nav>
        </div>

        <div className="p-4 space-y-1.5 mb-4 border-t border-outline-variant/10 pt-6">
          {session ? (
            <div onClick={() => signOut({ callbackUrl: '/login' })} className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors cursor-pointer group">
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-[14px]">Sign Out</span>
            </div>
          ) : (
            <div onClick={() => router.push('/login')} className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-primary font-bold hover:bg-surface-container-low transition-colors cursor-pointer">
              <LogIn size={18} />
              <span className="text-[14px]">Sign In</span>
            </div>
          )}
          <div onClick={() => handleNav('settings')} className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors cursor-pointer ${currentMode === 'settings' ? 'bg-surface-container-low text-primary font-bold' : 'text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-primary'}`}>
            <Settings size={18} />
            <span className="text-[14px]">Settings</span>
          </div>
          <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer">
            <HelpCircle size={18} />
            <span className="text-[14px]">Support</span>
          </div>
        </div>
      </aside>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-surface-container-high/95 backdrop-blur-xl border border-secondary/30 text-primary px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-primary">{toastMessage}</p>
            <p className="text-[11px] text-on-surface-variant/80 mt-0.5 leading-snug">
              Direct PDF upload feature coming soon! Use our AI Profile Builder to construct your SDE resume instantly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
