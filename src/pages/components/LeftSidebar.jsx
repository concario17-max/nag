import React from 'react';
import { useUI } from '../../context/UIContext';
import SidebarHeader from '../../components/Sidebar/SidebarHeader';
import SidebarChapterList from '../../components/Sidebar/SidebarChapterList';
import SidebarVerseList from '../../components/Sidebar/SidebarVerseList';
import SidebarLayout from '../../components/ui/SidebarLayout';

function buildSidebarGroups(chapters = []) {
  const groups = [];
  const groupLookup = new Map();

  chapters.forEach((chapter) => {
    const groupId = chapter.codexId || 'ungrouped';
    const groupTitle = chapter.codexTitle || chapter.codexId || 'Codex';

    let group = groupLookup.get(groupId);
    if (!group) {
      group = {
        id: groupId,
        title: groupTitle,
        chapterName: groupTitle,
        isGroup: true,
        subchapters: [],
      };
      groupLookup.set(groupId, group);
      groups.push(group);
    }

    group.subchapters.push({
      ...chapter,
      id: chapter.id,
      title: chapter.title ?? chapter.chapterName,
      chapterName: chapter.chapterName ?? chapter.title ?? chapter.id,
      paragraphs: chapter.paragraphs ?? [],
      tocHeadings: chapter.tocHeadings ?? [],
      tocActionLabel: chapter.tocActionLabel ?? chapter.chapterName ?? chapter.title ?? chapter.id,
    });
  });

  return groups;
}

function findExpandedChapterId(groups, activeParagraphId) {
  if (!groups?.length) return null;

  if (!activeParagraphId) {
    const firstGroup = groups[0];
    const firstSubchapter = firstGroup?.subchapters?.[0] ?? null;
    return firstGroup && firstSubchapter ? `${firstGroup.id}-${firstSubchapter.id}` : null;
  }

  for (const group of groups) {
    for (const subchapter of group.subchapters ?? []) {
      if (subchapter.paragraphs?.some((paragraph) => paragraph.id === activeParagraphId)) {
        return `${group.id}-${subchapter.id}`;
      }
    }
  }

  return null;
}

function findActiveSubchapter(groups, expandedChapter) {
  if (!expandedChapter) return null;

  for (const group of groups) {
    for (const subchapter of group.subchapters ?? []) {
      if (`${group.id}-${subchapter.id}` === expandedChapter) {
        return subchapter;
      }
    }
  }

  return null;
}

function buildParagraphIndices(groups) {
  const indices = {};
  let count = 1;

  groups.forEach((group) => {
    group.subchapters?.forEach((subchapter) => {
      subchapter.paragraphs?.forEach((paragraph) => {
        indices[paragraph.id] = count;
        count += 1;
      });
    });
  });

  return indices;
}

function LeftSidebar({ chapters, onSelectParagraph, activeParagraphId }) {
  const uiContext = useUI() || {
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    isDesktopSidebarOpen: true,
    isDesktopViewport: false,
  };
  const { isSidebarOpen, setIsSidebarOpen, isDesktopSidebarOpen, isDesktopViewport } = uiContext;

  const sidebarGroups = React.useMemo(() => buildSidebarGroups(chapters), [chapters]);
  const paragraphIndices = React.useMemo(() => buildParagraphIndices(sidebarGroups), [sidebarGroups]);
  const sidebarTitle = sidebarGroups[0]?.title ?? 'Codex I';

  const [expandedChapter, setExpandedChapter] = React.useState(() =>
    findExpandedChapterId(sidebarGroups, activeParagraphId),
  );

  React.useEffect(() => {
    const nextExpandedChapter = findExpandedChapterId(sidebarGroups, activeParagraphId);
    if (nextExpandedChapter && nextExpandedChapter !== expandedChapter) {
      setExpandedChapter(nextExpandedChapter);
    }
  }, [activeParagraphId, expandedChapter, sidebarGroups]);

  const toggleChapter = React.useCallback((chapterId) => {
    setExpandedChapter((prev) => (prev === chapterId ? null : chapterId));
  }, []);

  const activeSubchapter = React.useMemo(
    () => findActiveSubchapter(sidebarGroups, expandedChapter),
    [expandedChapter, sidebarGroups],
  );

  return (
    <SidebarLayout
      isOpen={isSidebarOpen}
      isDesktopOpen={isDesktopSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      title={sidebarTitle}
      position="left"
      widthClass="w-80"
      showMobileClose={false}
    >
      <SidebarHeader title={sidebarTitle} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-h-0 flex-1 flex-col bg-white/80 dark:bg-dark-bg/95">
        <SidebarChapterList
          chapters={sidebarGroups}
          expandedChapter={expandedChapter}
          toggleChapter={toggleChapter}
          onSelectParagraph={onSelectParagraph}
        />

        <SidebarVerseList
          paragraphs={activeSubchapter?.paragraphs ?? []}
          activeParagraphId={activeParagraphId}
          paragraphIndices={paragraphIndices}
          onSelectParagraph={onSelectParagraph}
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
