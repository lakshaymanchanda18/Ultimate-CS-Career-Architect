"use client";

import { Home, Sparkles, Plus, Mic, BarChart2, Lightbulb, GraduationCap, Settings, HelpCircle, LogIn, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  currentMode: string;
  navigate: (mode: string) => void;
}

export default function Sidebar({ currentMode, navigate }: SidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const navItemClass = (mode: string) => {
    const base = "flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer nav-active-bar ";
    if (currentMode === mode) {
      return base + "bg-surface-container-low text-primary font-bold";
    }
    return base + "text-on-surface-variant font-medium hover:bg-surface-container/50 hover:text-primary";
  };

  return (
    <aside className="w-[280px] bg-surface-container-lowest border-r border-outline-variant/15 flex flex-col justify-between hidden lg:flex shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div>
        <div className="p-8 cursor-pointer group" onClick={() => navigate('discovery')}>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-secondary-fixed flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(95,251,214,0.3)] transition-all duration-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="font-headline font-bold text-[17px] leading-tight tracking-tight">CareerEngine</h1>
              <p className="text-[9px] text-on-surface-variant tracking-widest uppercase font-bold mt-0.5">CS Architect</p>
            </div>
          </div>
        </div>
        
        <div className="px-6 mb-8">
          <button 
            onClick={() => navigate('interview')} 
            className="w-full bg-primary text-on-primary-fixed rounded-xl py-3.5 flex items-center justify-center gap-2 font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <Plus size={18} /> New Resume
          </button>
        </div>

        <nav className="px-4 space-y-1.5">
          <div onClick={() => navigate('discovery')} className={navItemClass('discovery')}>
            <Home size={20} className={currentMode === 'discovery' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
            <span className="text-[14px]">Home</span>
          </div>
          <div onClick={() => navigate('interview')} className={navItemClass('interview')}>
            <Mic size={20} className={currentMode === 'interview' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
            <span className="text-[14px]">Interview</span>
          </div>
          <div onClick={() => navigate('analyzer')} className={navItemClass('analyzer')}>
            <BarChart2 size={20} className={currentMode === 'analyzer' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
            <span className="text-[14px]">Analyzer</span>
          </div>
          <div onClick={() => navigate('projects')} className={navItemClass('projects')}>
            <Lightbulb size={20} className={currentMode === 'projects' ? 'text-secondary' : 'text-on-surface-variant/70 group-hover:text-secondary transition-colors'} />
            <span className="text-[14px]">Project Suggester</span>
          </div>
          <div onClick={() => navigate('job-board')} className={navItemClass('job-board')}>
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
        <div onClick={() => navigate('settings')} className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-colors cursor-pointer ${currentMode === 'settings' ? 'bg-surface-container-low text-primary font-bold' : 'text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-primary'}`}>
          <Settings size={18} />
          <span className="text-[14px]">Settings</span>
        </div>
        <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer">
          <HelpCircle size={18} />
          <span className="text-[14px]">Support</span>
        </div>
      </div>
    </aside>
  );
}
