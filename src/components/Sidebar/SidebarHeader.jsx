import React from 'react';
import { X } from 'lucide-react';

function SidebarHeader({ setIsSidebarOpen }) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gold-border/30 bg-white/90 px-4 py-5 backdrop-blur-sm dark:border-[#333] dark:bg-dark-bg/95">
      <div className="min-w-0">
        <p className="font-inter text-[10px] font-semibold uppercase tracking-[0.42em] text-gold-primary/70 dark:text-gold-light/60">
          CODEX 1
        </p>
        <span className="mt-1 block font-crimson text-[1.3rem] font-semibold leading-none text-[#6C5432] dark:text-gold-light">
          Chapter List
        </span>
      </div>
      <button
        type="button"
        onClick={() => setIsSidebarOpen(false)}
        className="-mr-2 rounded-full p-2 text-text-secondary transition-colors hover:bg-gold-surface dark:text-dark-text-secondary dark:hover:bg-dark-surface lg:hidden"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export default React.memo(SidebarHeader);
