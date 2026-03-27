import React from 'react';
import { buildReadingData } from '../lib/parseCodex.js';
import { flattenParagraphs } from '../lib/parseCodexCore.js';
import { resolveStoredActiveParagraph } from '../lib/readingState.js';
import { useUI } from '../context/UIContext';
import Header from '../components/Header.jsx';
import AppShell from '../components/ui/AppShell.jsx';
import { getDesktopFrameColumns } from '../components/ui/desktopFrame.js';
import LeftSidebar from './components/LeftSidebar.jsx';
import ReadingPanel from './components/ReadingPanel.jsx';
import RightSidebar from './components/RightSidebar.jsx';

const ACTIVE_PARAGRAPH_STORAGE_KEY = 'nag_active_section';

function loadStoredActiveParagraph(fallbackParagraph, paragraphs) {
  const saved = typeof localStorage === 'undefined' ? null : localStorage.getItem(ACTIVE_PARAGRAPH_STORAGE_KEY);
  return resolveStoredActiveParagraph(saved, fallbackParagraph, paragraphs);
}

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

function StatePanel({ kicker, title, description }) {
  return (
    <div className="flex h-full w-full flex-1 items-center justify-center p-6 sm:p-8">
      <div className="empty-state-card max-w-lg rounded-[2rem] px-8 py-10 text-center shadow-[0_30px_70px_rgba(120,93,48,0.08)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold-border/25 bg-gold-surface/35 text-gold-deep shadow-inner">
          <span className="font-serif text-2xl">N</span>
        </div>
        <p className="mt-5 font-inter text-[10px] font-semibold uppercase tracking-[0.4em] text-gold-deep/72">
          {kicker}
        </p>
        <h3 className="mt-4 font-serif text-[1.8rem] leading-tight text-text-primary dark:text-dark-text-primary">
          {title}
        </h3>
        <p className="mt-4 font-korean text-[15px] leading-[1.9] text-text-secondary/85 dark:text-dark-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

function TextPage() {
  const chapters = React.useMemo(() => buildReadingData(), []);
  const flatParagraphs = React.useMemo(() => flattenParagraphs(chapters), [chapters]);
  const [activeParagraph, setActiveParagraph] = React.useState(() =>
    loadStoredActiveParagraph(flatParagraphs[0] ?? null, flatParagraphs),
  );
  const ui = useUI() ?? createFallbackUIContext();

  React.useEffect(() => {
    if (typeof activeParagraph?.id === 'string' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ACTIVE_PARAGRAPH_STORAGE_KEY, JSON.stringify(activeParagraph.id));
    }
  }, [activeParagraph]);

  const currentIndex = activeParagraph
    ? flatParagraphs.findIndex((paragraph) => paragraph.id === activeParagraph.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < flatParagraphs.length - 1;

  const desktopGridColumns = React.useMemo(
    () => getDesktopFrameColumns(ui.isDesktopSidebarOpen, ui.activeDesktopRightPanel === 'commentary'),
    [ui.activeDesktopRightPanel, ui.isDesktopSidebarOpen],
  );

  function handleNavigate(direction) {
    if (direction === 'prev' && hasPrev) setActiveParagraph(flatParagraphs[currentIndex - 1]);
    if (direction === 'next' && hasNext) setActiveParagraph(flatParagraphs[currentIndex + 1]);
  }

  return (
    <AppShell
      header={<Header desktopGridColumns={desktopGridColumns} />}
      sidebar={
        <LeftSidebar
          chapters={chapters}
          onSelectParagraph={setActiveParagraph}
          activeParagraphId={activeParagraph?.id ?? null}
        />
      }
      rightPanel={<RightSidebar paragraph={activeParagraph} />}
      desktopGridColumns={desktopGridColumns}
      isMobilePanelOpen={ui.isSidebarOpen || ui.activeRightPanel !== null}
    >
      <div className="relative min-h-full bg-sand-primary pt-16 xl:bg-transparent">
        <div className="pointer-events-none absolute inset-0 z-[-1] bg-grid-slate-900/[0.04] bg-[bottom_1px_center]" />

        {activeParagraph ? (
          <ReadingPanel
            paragraph={activeParagraph}
            globalIndex={currentIndex + 1}
            onPrevious={hasPrev ? () => handleNavigate('prev') : null}
            onNext={hasNext ? () => handleNavigate('next') : null}
          />
        ) : (
          <StatePanel
            kicker="Select a passage"
            title="Select a section to begin"
            description="Choose a work and section from the left sidebar to open the Codex I reading layout."
          />
        )}
      </div>
    </AppShell>
  );
}

export default TextPage;
