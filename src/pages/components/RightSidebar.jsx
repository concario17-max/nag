import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import SidebarLayout from '../../components/ui/SidebarLayout.jsx';

function createFallbackUIContext() {
  return {
    isDesktopViewport: false,
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    isDesktopSidebarOpen: true,
    setIsDesktopSidebarOpen: () => {},
    toggleSidebar: () => {},
    activeRightPanel: null,
    setActiveRightPanel: () => {},
    activeDesktopRightPanel: 'commentary',
    setActiveDesktopRightPanel: () => {},
    isRightPanelOpen: true,
    closeRightPanel: () => {},
    toggleRightPanel: () => {},
    isDarkMode: false,
    toggleTheme: () => {},
    closeAllDrawers: () => {},
  };
}

function CommentaryPanel({ paragraph }) {
  const englishText = paragraph?.text?.english || 'No English rendering is available for this section.';
  const copticText = paragraph?.text?.tibetan || 'No Coptic source line is available for this section.';
  const rangeText = paragraph?.rangeLabel || '1:1 mapping candidate';

  return (
    <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
      <section className="rounded-[1.5rem] border border-gold-border/25 bg-white/65 p-5 shadow-sm dark:border-dark-border/60 dark:bg-dark-surface/55">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-deep/70 dark:text-gold-light/65">
          Mapping Lens
        </p>
        <h3 className="mt-3 text-lg font-semibold text-text-primary dark:text-dark-text-primary">
          {paragraph?.chapterTitle || 'Commentary'}
        </h3>
        <p className="mt-3 whitespace-pre-wrap font-korean text-[14px] leading-7 text-text-secondary dark:text-dark-text-secondary">
          {`Section ${paragraph?.id || '-'} is mapped against the English source and the Coptic transcript.\nRange: ${rangeText}`}
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-gold-border/20 bg-gold-surface/45 p-5 dark:border-dark-border/60 dark:bg-dark-bg/30">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-deep/70 dark:text-gold-light/65">
          Coptic Anchor
        </p>
        <p className="mt-3 whitespace-pre-wrap font-antinoou text-[14px] leading-7 text-text-primary dark:text-dark-text-primary">
          {copticText}
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-gold-border/20 bg-white/60 p-5 dark:border-dark-border/60 dark:bg-dark-surface/50">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-deep/70 dark:text-gold-light/65">
          English Reference
        </p>
        <p className="mt-3 whitespace-pre-wrap font-korean text-[14px] leading-7 tracking-[-0.01em] text-text-primary dark:text-dark-text-primary">
          {englishText}
        </p>
      </section>
    </div>
  );
}

function RightSidebar({ paragraph }) {
  const uiContext = useUI() ?? createFallbackUIContext();
  const { activeRightPanel, activeDesktopRightPanel, closeRightPanel } = uiContext;
  const isMobileOpen = activeRightPanel === 'commentary';
  const isDesktopOpen = activeDesktopRightPanel === 'commentary';

  return (
    <SidebarLayout
      isOpen={isMobileOpen}
      isDesktopOpen={isDesktopOpen}
      onClose={closeRightPanel}
      position="right"
      widthClass="w-[90vw] sm:w-[400px]"
      className="dark:bg-dark-bg/95"
    >
      <div className="relative flex h-full min-h-0 flex-col bg-white/80 p-6 dark:bg-dark-bg/95">
        <div className="mb-6 flex shrink-0 items-center gap-2 border-b border-gold-border/30 pb-4">
          <MessageSquareText className="h-5 w-5 text-[#A68B5C] dark:text-gold-light" />
          <h2 className="text-sm font-bold tracking-wide text-[#1C2B36] dark:text-dark-text-primary">
            Commentary
          </h2>
        </div>

        <CommentaryPanel paragraph={paragraph} />
      </div>
    </SidebarLayout>
  );
}

export default React.memo(RightSidebar, (prevProps, nextProps) => prevProps.paragraph?.id === nextProps.paragraph?.id);
