import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterButton from './ChapterButton';
import ChapterGroup from './ChapterGroup';

function SidebarChapterList({ chapters, expandedChapter, toggleChapter, onSelectParagraph }) {
  return (
    <motion.div
      layout
      className={`custom-scrollbar flex-none overflow-y-auto border-gold-border/40 transition-all duration-500 ease-in-out dark:border-[#222] ${
        expandedChapter ? 'h-[30%] min-h-[30%] border-b shadow-sm' : 'h-full max-h-full'
      }`}
    >
      <div className="flex flex-col gap-0 px-2.5 py-0.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {chapters?.map((chapter) => {
            if (chapter.isGroup) {
              return (
                <ChapterGroup
                  key={chapter.id}
                  group={chapter}
                  expandedChapter={expandedChapter}
                  toggleChapter={toggleChapter}
                  onSelectParagraph={onSelectParagraph}
                />
              );
            }

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
