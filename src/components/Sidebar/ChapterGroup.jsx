import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterButton from './ChapterButton';

function ChapterGroup({ group, expandedChapter, toggleChapter, onSelectParagraph }) {
  return (
    <motion.div layout className="mb-0.5">
      <div className="mb-0.5 rounded-lg bg-gold-surface/30 px-3 py-1.5 font-inter text-[16px] font-bold tracking-[0.08em] text-gold-primary/80 dark:bg-dark-bg/30 dark:text-gold-light/70">
        {group.chapterName}
      </div>

      <div className="flex flex-col gap-0">
        <AnimatePresence mode="popLayout">
          {group.subchapters.map((subchapter) => {
            const uniqueId = `${group.id}-${subchapter.id}`;
            const isExpanded = expandedChapter === uniqueId;
            const count = subchapter.paragraphs?.length || 0;

            return (
              <ChapterButton
                key={subchapter.id}
                chapter={subchapter}
                count={count}
                isExpanded={isExpanded}
                isSubchapter={true}
                onClick={() => {
                  toggleChapter(uniqueId);
                  if (subchapter.paragraphs?.length > 0 && onSelectParagraph) {
                    onSelectParagraph(subchapter.paragraphs[0]);
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

export default React.memo(ChapterGroup);
