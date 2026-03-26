import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterButton from './ChapterButton.jsx';

const CHAPTER_LIST_MAX_HEIGHT_CLASS = 'max-h-[21rem] xl:max-h-[25rem]';

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
      <div className="sticky top-0 z-10 bg-white/90 px-3 py-4 backdrop-blur-sm dark:bg-dark-bg/95">
        <p className="font-inter text-[10px] font-semibold uppercase tracking-[0.42em] text-gold-primary/70 dark:text-gold-light/60">
          CODEX 1
        </p>
        <h2 className="mt-1 font-crimson text-[1.1rem] font-semibold leading-none text-[#6C5432] dark:text-gold-light">
          Chapter List
        </h2>
      </div>

      <div className="flex flex-col gap-0.5 px-2.5 pb-3 pt-2.5 lg:pt-3">
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
