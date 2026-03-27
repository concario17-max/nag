import React from 'react';
import { X } from 'lucide-react';

function SidebarHeader({ title = 'Codex I', onClose }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-gold-border/30 p-4 dark:border-dark-border/60 xl:hidden">
      <span className="font-korean text-lg font-semibold text-text-primary dark:text-dark-text-primary">
        {title}
      </span>
      <button
        type="button"
        onClick={onClose}
        className="-mr-2 rounded-full p-2 text-text-secondary transition-colors hover:bg-gold-surface dark:text-dark-text-secondary dark:hover:bg-dark-surface"
        aria-label="Close sidebar"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

export default React.memo(SidebarHeader);
