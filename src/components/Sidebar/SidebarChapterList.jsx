import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterButton from './ChapterButton.jsx';

const CHAPTER_LIST_MAX_HEIGHT_CLASS = 'max-h-[19rem] xl:max-h-[23rem]';

function SidebarChapterList({
  chapters,
  expandedChapter,
  toggleChapter,
  onSelectParagraph,
}) {
  return (
    <motion.div
      layout
      className={`custom-scrollbar flex-none overflow-y-auto border-gold-border/40 transition-all duration-300 ease-out dark:border-[#222] ${
        expandedChapter ? `${CHAPTER_LIST_MAX_HEIGHT_CLASS} border-b shadow-sm` : 'max-h-full'
      }`}
    >
      <div className="h-2 lg:h-2.5" aria-hidden="true" />

      <div className="sticky top-0 z-10 hidden bg-white/90 px-3 py-4 backdrop-blur-sm dark:bg-dark-bg/95 lg:block">
        <h2 className="pl-1 font-inter text-[12px] font-bold uppercase tracking-[0.24em] text-text-primary/70 dark:text-dark-text-primary/60">
          Codex I Works
        </h2>
      </div>

      <div className="flex flex-col gap-0.5 px-2.5 pb-2 pt-1.5 lg:pt-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {chapters?.map((chapter) => {
            const isExpanded = expandedChapter === chapter.id;

            return (
              <ChapterButton
                key={chapter.id}
                chapter={chapter}
                count={chapter.paragraphs?.length || 0}
                isExpanded={isExpanded}
                onClick={() => {
                  toggleChapter(chapter.id);
                  if (chapter.paragraphs?.length > 0 && onSelectParagraph) {
                    onSelectParagraph(chapter.paragraphs[0]);
                  }
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default React.memo(SidebarChapterList);
