"use client";

import { Sparkles, Plus, Mic, BarChart2, Lightbulb, GraduationCap, Settings, HelpCircle, LogIn, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface SidebarProps {
  currentMode: string;
  navigate: (mode: string) => void;
}

export default function Sidebar({ currentMode, navigate }: SidebarProps) {
  const { data: session } = useSession();

  const navItemClass = (mode: string) => {
    const base = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group cursor-pointer ";
    if (currentMode === mode) {
      return base + "bg-surface-container-low text-secondary font-bold";
    }
    return base + "text-on-surface-variant hover:bg-surface-container-low";
  };

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col justify-between hidden md:flex shrink-0 z-20">
      <div>
        <div className="p-6 cursor-pointer" onClick={() => navigate('discovery')}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary-container text-secondary-fixed flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="font-headline font-bold text-base leading-tight">CareerEngine</h1>
              <p className="text-[10px] text-on-surface-variant tracking-wider uppercase">CS Student Hub</p>
            </div>
          </div>
        </div>
        
        <div className="px-4 mt-2">
          <button onClick={() => navigate('interview')} className="w-full bg-primary text-white rounded-lg py-3 flex items-center justify-center gap-2 font-semibold hover:shadow-lg transition-all">
            <Plus size={18} /> New Resume
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-1">
          <div onClick={() => navigate('interview')} className={navItemClass('interview')}>
            <Mic size={20} className={currentMode !== 'interview' ? "group-hover:text-secondary" : ""} />
            <span className="font-medium">Interview</span>
          </div>
          <div onClick={() => navigate('analyzer')} className={navItemClass('analyzer')}>
            <BarChart2 size={20} className={currentMode !== 'analyzer' ? "group-hover:text-secondary" : ""} />
            <span className="font-medium">Analyzer</span>
          </div>
          <div onClick={() => navigate('projects')} className={navItemClass('projects')}>
            <Lightbulb size={20} className={currentMode !== 'projects' ? "group-hover:text-secondary" : ""} />
            <span className="font-medium">Project Suggester</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors group opacity-50 cursor-not-allowed">
            <GraduationCap size={20} />
            <span className="font-medium">Mentorship</span>
          </div>
        </nav>
      </div>

      <div className="p-4 space-y-1 mb-4">
        {session ? (
          <div onClick={() => signOut()} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </div>
        ) : (
          <div onClick={() => signIn()} className="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container-low transition-colors cursor-pointer">
            <LogIn size={20} />
            <span className="font-medium">Sign In</span>
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
          <HelpCircle size={20} />
          <span className="font-medium">Support</span>
        </div>
      </div>
    </aside>
  );
}
