"use client";

import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';

interface Props {
  navigate?: (mode: string) => void;
}

export default function TopNav({ navigate }: Props) {
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name.substring(0, 2).toUpperCase()
    : null;

  return (
    <header className="h-[72px] border-b border-outline-variant/15 flex items-center justify-between px-6 md:px-10 bg-surface-container-lowest/80 backdrop-blur-xl z-10 shrink-0 sticky top-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center gap-8 font-semibold text-[14px] text-on-surface-variant">
          <button onClick={() => navigate && navigate('dashboard')} className="hover:text-primary transition-colors hover:scale-105 transform duration-200">My Resumes</button>
          <button onClick={() => navigate && navigate('job-board')} className="hover:text-primary transition-colors hover:scale-105 transform duration-200">Job Board</button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {session?.user ? (
          <div className="flex items-center gap-4 bg-surface-container-low/50 px-2 py-1.5 rounded-full border border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer group">
            <div className="text-right hidden sm:block pl-3">
              <p className="text-[13px] font-bold leading-tight text-primary group-hover:text-secondary transition-colors">{session.user.name}</p>
              <p className="text-[10px] font-semibold text-on-surface-variant leading-tight">{session.user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
              {userInitials}
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-container-high animate-pulse"></div>
        )}
      </div>
    </header>
  );
}
