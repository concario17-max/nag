import React from 'react';
import { X } from 'lucide-react';

function SidebarHeader({ setIsSidebarOpen }) {
  return (
    <div className="flex shrink-0 items-center justify-end border-b border-gold-border/30 bg-white/90 px-4 py-4 backdrop-blur-sm dark:border-[#333] dark:bg-dark-bg/95 lg:hidden">
      <button
        type="button"
        onClick={() => setIsSidebarOpen(false)}
        className="-mr-2 rounded-full p-2 text-text-secondary transition-colors hover:bg-gold-surface dark:text-dark-text-secondary dark:hover:bg-dark-surface"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export default React.memo(SidebarHeader);
