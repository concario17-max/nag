import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChapterButton from './ChapterButton.jsx';
import SidebarVerseList from './SidebarVerseList.jsx';

function ChapterGroup({
  group,
  expandedChapter,
  toggleChapter,
  onSelectParagraph,
  activeParagraphId,
  setIsSidebarOpen,
  isDesktopViewport,
}) {
  const isExpanded = expandedChapter === group.id;

  return (
    <motion.div layout className="mb-2">
      <ChapterButton
        chapter={group}
        count={group.paragraphs?.length || 0}
        isExpanded={isExpanded}
        onClick={() => {
          toggleChapter(group.id);
          if (group.paragraphs?.length > 0 && onSelectParagraph) {
            onSelectParagraph(group.paragraphs[0]);
          }
        }}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        {isExpanded ? (
          <motion.div
            key={`${group.id}-sections`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <SidebarVerseList
              paragraphs={group.paragraphs}
              activeParagraphId={activeParagraphId}
              onSelectParagraph={onSelectParagraph}
              setIsSidebarOpen={setIsSidebarOpen}
              isDesktopViewport={isDesktopViewport}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default React.memo(ChapterGroup);
