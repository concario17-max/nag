import React from 'react';
import { useUI } from '../../context/UIContext';
import SidebarHeader from '../../components/Sidebar/SidebarHeader.jsx';
import SidebarChapterList from '../../components/Sidebar/SidebarChapterList.jsx';
import SidebarLayout from '../../components/ui/SidebarLayout.jsx';

function LeftSidebar({ chapters, onSelectParagraph, activeParagraphId }) {
  const uiContext = useUI() || {
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    isDesktopSidebarOpen: true,
    isDesktopViewport: false,
  };
  const { isSidebarOpen, setIsSidebarOpen, isDesktopSidebarOpen, isDesktopViewport } = uiContext;

  const [expandedChapter, setExpandedChapter] = React.useState(() => {
    if (!activeParagraphId || !chapters) return chapters?.[0]?.id ?? null;

    for (const chapter of chapters) {
      if (chapter.paragraphs?.some((paragraph) => paragraph.id === activeParagraphId)) {
        return chapter.id;
      }
    }

    return chapters?.[0]?.id ?? null;
  });

  React.useEffect(() => {
    if (!activeParagraphId || !chapters) return;

    for (const chapter of chapters) {
      if (chapter.paragraphs?.some((paragraph) => paragraph.id === activeParagraphId)) {
        if (chapter.id !== expandedChapter) setExpandedChapter(chapter.id);
        break;
      }
    }
  }, [activeParagraphId, chapters, expandedChapter]);

  const toggleChapter = React.useCallback((chapterId) => {
    setExpandedChapter((prev) => (prev === chapterId ? null : chapterId));
  }, []);

  return (
    <SidebarLayout
      isOpen={isSidebarOpen}
      isDesktopOpen={isDesktopSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      position="left"
      widthClass="w-80"
      className="dark:bg-dark-bg/95"
    >
      <SidebarHeader setIsSidebarOpen={setIsSidebarOpen} />

      <div className="flex min-h-0 flex-1 flex-col bg-white/80 dark:bg-dark-bg/95 xl:mx-auto xl:w-full xl:max-w-[24rem] xl:border-r xl:border-gold-primary/10 xl:bg-white/90 xl:shadow-[12px_0_30px_rgba(120,93,48,0.04)] dark:xl:border-dark-border/40 dark:xl:bg-dark-bg/95">
        <SidebarChapterList
          chapters={chapters}
          expandedChapter={expandedChapter}
          toggleChapter={toggleChapter}
          onSelectParagraph={onSelectParagraph}
          activeParagraphId={activeParagraphId}
          setIsSidebarOpen={setIsSidebarOpen}
          isDesktopViewport={isDesktopViewport}
        />
      </div>
    </SidebarLayout>
  );
}

export default React.memo(
  LeftSidebar,
  (prevProps, nextProps) =>
    prevProps.activeParagraphId === nextProps.activeParagraphId &&
    prevProps.chapters === nextProps.chapters,
);
