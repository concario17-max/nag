import React from 'react';
import { X } from 'lucide-react';

function SidebarLayout({
  isOpen,
  isDesktopOpen,
  onClose,
  title,
  children,
  position = 'left',
  widthClass = 'w-80',
  shellTone = 'default',
  showMobileClose = true,
  className = '',
  bodyClassName = '',
}) {
  const isLeft = position === 'left';
  const isFlatTone = shellTone === 'flat';
  const mobileTranslateClosed = isLeft ? '-translate-x-full' : 'translate-x-full';
  const placementClass = isLeft ? 'left-0' : 'right-0';
  const borderClass = isLeft ? (isFlatTone ? '' : 'border-r') : 'border-l';
  const shellBorderClass = isFlatTone ? '' : 'border-gold-primary/20 dark:border-dark-border/50';
  const shellToneClass = isFlatTone ? 'bg-white dark:bg-dark-bg' : 'bg-white/80 backdrop-blur-xl dark:bg-dark-bg/95';

  const mobileStateClass = isOpen
    ? `${widthClass} translate-x-0 shadow-2xl`
    : `${widthClass} ${mobileTranslateClosed}`;

  const desktopStateClass = isDesktopOpen
    ? 'xl:relative xl:inset-auto xl:top-0 xl:h-full xl:w-full xl:translate-x-0 xl:opacity-100 xl:pointer-events-auto xl:shadow-none'
    : 'xl:relative xl:inset-auto xl:top-0 xl:h-full xl:w-full xl:translate-x-0 xl:opacity-0 xl:pointer-events-none xl:shadow-none xl:border-transparent';

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/50 opacity-100 backdrop-blur-sm transition-opacity duration-300 xl:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed bottom-0 top-16 ${placementClass} z-50 flex h-[calc(100dvh-64px)] flex-col overflow-hidden overscroll-contain font-inter transition-all duration-300 xl:sticky xl:z-20 xl:min-w-0 ${shellToneClass} ${borderClass} ${shellBorderClass} ${mobileStateClass} ${desktopStateClass} ${className}`}
      >
        {showMobileClose ? (
          <div className="absolute right-4 top-4 z-50 xl:hidden">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-text-secondary transition-colors hover:bg-gold-surface dark:text-dark-text-secondary dark:hover:bg-dark-surface"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {title ? (
          <div className="hidden shrink-0 flex-col border-b border-gold-border/30 bg-white/92 px-5 py-5 dark:border-dark-border/60 dark:bg-dark-bg/96 xl:flex">
            <span className="font-inter text-[10px] font-semibold uppercase tracking-[0.42em] text-gold-primary/70 dark:text-gold-light/60">
              Chapter List
            </span>
            <span className="mt-1 font-crimson text-[1.45rem] font-semibold leading-none text-[#6C5432] dark:text-gold-light">
              {title}
            </span>
          </div>
        ) : null}

        <div className={`flex flex-1 min-h-0 flex-col overflow-hidden ${bodyClassName}`}>{children}</div>
      </aside>
    </>
  );
}

export default React.memo(SidebarLayout);
