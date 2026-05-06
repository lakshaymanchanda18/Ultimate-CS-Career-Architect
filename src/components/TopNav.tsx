import { Bell } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-16 border-b border-outline-variant/10 flex items-center justify-between px-8 bg-surface-container-lowest md:bg-transparent md:border-none z-10 shrink-0">
      <div className="flex items-center gap-6 font-medium text-sm text-on-surface-variant">
        <a href="#" className="hover:text-primary transition-colors hidden md:block">My Resumes</a>
        <a href="#" className="hover:text-primary transition-colors hidden md:block">Job Board</a>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
          LM
        </div>
      </div>
    </header>
  );
}
