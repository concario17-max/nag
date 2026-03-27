import React from 'react';

function SidebarVerseList({
  paragraphs,
  activeParagraphId,
  onSelectParagraph,
  setIsSidebarOpen,
  isDesktopViewport = false,
}) {
  if (!paragraphs?.length) {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center px-4 py-6">
        <div className="rounded-[1.2rem] border border-dashed border-gold-border/35 bg-white/45 px-4 py-5 text-center text-text-secondary/75 dark:border-dark-border/50 dark:bg-dark-bg/45 dark:text-dark-text-secondary/75">
          <div className="font-crimson text-[1rem] font-semibold tracking-[0.08em] text-gold-primary/80 dark:text-gold-light/70">
            No passages
          </div>
          <div className="mt-1 text-[11px] leading-5 tracking-[0.04em]">
            This work has no section data yet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto bg-transparent animate-[fadeIn_0.5s_ease-out]">
      <div className="space-y-0.5 px-1.5 py-1.5">
        {paragraphs.map((paragraph) => {
          const isActive = activeParagraphId === paragraph.id;

          return (
            <button
              key={paragraph.id}
              type="button"
              onClick={() => {
                if (onSelectParagraph) onSelectParagraph(paragraph);
                if (!isDesktopViewport) setIsSidebarOpen(false);
              }}
              className={`flex w-full items-start gap-1.5 rounded-[0.8rem] border px-2 py-[0.55rem] text-left text-[15px] transition-colors ${
                isActive
                  ? 'border-gold-primary/24 bg-white/62 text-text-primary dark:border-gold-primary/18 dark:bg-dark-bg/58 dark:text-gold-light'
                  : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:bg-gold-surface/30 hover:text-text-primary dark:hover:bg-dark-bg/40'
              }`}
            >
              <span
                className={`mt-[0.15rem] flex min-w-[1.65rem] items-center justify-center rounded-full bg-gold-surface/55 px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                  isActive
                    ? 'text-gold-primary dark:bg-dark-bg/50'
                    : 'text-text-secondary/70 dark:bg-dark-bg/40 dark:text-dark-text-secondary/70'
                }`}
              >
                {paragraph.paragraphNumber}
              </span>
              <span className="min-w-0 overflow-hidden break-keep font-antinoou text-[13px] leading-[1.35] opacity-90 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {paragraph.title || paragraph.text?.tibetan || paragraph.chapterTitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(SidebarVerseList);
