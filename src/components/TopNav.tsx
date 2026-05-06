"use client";

import { useSession } from 'next-auth/react';

interface Props {
  navigate?: (mode: string) => void;
}

export default function TopNav({ navigate }: Props) {
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name.substring(0, 2).toUpperCase()
    : null;

  return (
    <header className="h-14 border-b border-outline-variant/10 flex items-center justify-between px-8 bg-surface-container-lowest/50 backdrop-blur-sm z-10 shrink-0">
      <div className="flex items-center gap-6 font-medium text-sm text-on-surface-variant">
        <button onClick={() => navigate && navigate('dashboard')} className="hover:text-primary transition-colors hidden md:block">My Resumes</button>
        <button onClick={() => navigate && navigate('job-board')} className="hover:text-primary transition-colors hidden md:block">Job Board</button>
      </div>
      <div className="flex items-center gap-3">
        {session?.user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold leading-tight">{session.user.name}</p>
              <p className="text-[10px] text-on-surface-variant leading-tight">{session.user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
              {userInitials}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
