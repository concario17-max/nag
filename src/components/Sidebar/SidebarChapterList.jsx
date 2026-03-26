import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterGroup from './ChapterGroup.jsx';

function SidebarChapterList({
  chapters,
  expandedChapter,
  toggleChapter,
  onSelectParagraph,
  activeParagraphId,
  setIsSidebarOpen,
  isDesktopViewport,
}) {
  return (
    <motion.div
      layout
      className={`custom-scrollbar flex-none overflow-y-auto border-gold-border/40 transition-all duration-300 ease-out dark:border-[#222] ${
        expandedChapter ? 'border-b shadow-sm' : 'max-h-full'
      }`}
    >
      <div className="sticky top-0 z-10 hidden bg-white/90 px-3 py-4 backdrop-blur-sm dark:bg-dark-bg/95 lg:block">
        <h2 className="pl-1 font-inter text-[12px] font-bold uppercase tracking-[0.24em] text-text-primary/70 dark:text-dark-text-primary/60">
          Codex I Works
        </h2>
      </div>

      <div className="flex flex-col gap-0.5 px-2.5 py-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {chapters?.map((chapter) => (
            <ChapterGroup
              key={chapter.id}
              group={chapter}
              expandedChapter={expandedChapter}
              toggleChapter={toggleChapter}
              onSelectParagraph={onSelectParagraph}
              activeParagraphId={activeParagraphId}
              setIsSidebarOpen={setIsSidebarOpen}
              isDesktopViewport={isDesktopViewport}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default React.memo(SidebarChapterList);
