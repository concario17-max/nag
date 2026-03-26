import React from 'react';

function ReadingHeader({ workTitle, sectionTitle, rangeLabel, globalIndex, sectionId }) {
  const sectionLabel = workTitle || 'Codex I';
  const entryLabel = sectionTitle || `Section ${globalIndex || sectionId}`;

  return (
    <div className="mb-6 flex flex-col items-center justify-center pt-2 sm:mb-8 sm:pt-4">
      <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-gold-border/30 bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-text-secondary/80 shadow-[0_10px_30px_rgba(166,139,92,0.08)] backdrop-blur-md dark:border-dark-border/60 dark:bg-dark-surface/70 dark:text-dark-text-secondary/80 sm:px-5">
        <span>{sectionLabel}</span>
        <span className="text-gold-primary/60 dark:text-gold-light/60">|</span>
        <span className="text-text-primary dark:text-dark-text-primary">{entryLabel}</span>
        {rangeLabel ? <span className="text-gold-primary/70 dark:text-gold-light/70">{rangeLabel}</span> : null}
      </div>
    </div>
  );
}

export default React.memo(ReadingHeader);
