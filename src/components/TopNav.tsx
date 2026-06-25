"use client";

import { useState } from "react";
import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Settings, ChevronDown } from 'lucide-react';

interface Props {
  navigate?: (mode: string) => void;
}

export default function TopNav({ navigate }: Props) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userInitials = session?.user?.name
    ? session.user.name.substring(0, 2).toUpperCase()
    : "US";

  return (
    <header className="h-[72px] border-b border-outline-variant/15 flex items-center justify-between px-6 md:px-10 bg-surface-container-lowest/80 backdrop-blur-xl z-30 shrink-0 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-8 font-semibold text-[14px] text-on-surface-variant">
          <button onClick={() => navigate && navigate('dashboard')} className="hover:text-primary transition-colors hover:scale-105 transform duration-200 cursor-pointer">My Resumes</button>
          <button onClick={() => navigate && navigate('job-board')} className="hover:text-primary transition-colors hover:scale-105 transform duration-200 cursor-pointer">Job Board</button>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        {session?.user ? (
          <>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 bg-surface-container-low/50 px-3 py-1.5 rounded-full border border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer group select-none"
            >
              <div className="text-right hidden sm:block pl-2">
                <p className="text-[13px] font-bold leading-tight text-primary group-hover:text-secondary transition-colors">{session.user.name}</p>
                <p className="text-[10px] font-semibold text-on-surface-variant leading-tight">{session.user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
                {userInitials}
              </div>
              <ChevronDown size={14} className={`text-on-surface-variant/70 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container border border-outline-variant/20 rounded-xl py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-outline-variant/10 md:hidden">
                    <p className="text-sm font-bold text-primary">{session.user.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{session.user.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      if (navigate) navigate('settings');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Settings size={16} className="text-on-surface-variant" />
                    Settings
                  </button>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-outline-variant/5 cursor-pointer font-medium"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse"></div>
        )}
      </div>
    </header>
  );
}
