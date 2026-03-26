import React from 'react';

function SectionLabel({ children }) {
  return (
    <p className="font-inter text-[10px] font-semibold uppercase tracking-[0.38em] text-gold-deep/70 dark:text-gold-light/65">
      {children}
    </p>
  );
}

function TranslationSection({ english, korean }) {
  return (
    <section className="mb-8 space-y-6 sm:space-y-8">
      {english ? (
        <div className="rounded-[1.8rem] border border-gold-border/18 bg-white/55 px-4 py-5 shadow-[0_20px_50px_rgba(120,93,48,0.05)] backdrop-blur-lg dark:border-dark-border/55 dark:bg-dark-surface/35 sm:px-6 sm:py-6">
          <SectionLabel>English Rendering</SectionLabel>
          <div className="mx-auto mt-3 max-w-[52rem]">
            <p className="whitespace-pre-wrap text-left font-korean text-[14px] leading-[1.65] tracking-[-0.02em] text-text-primary/92 dark:text-dark-text-primary/92 sm:text-[15px] sm:leading-[1.7]">
              {english}
            </p>
          </div>
        </div>
      ) : null}

      {korean ? (
        <div className="rounded-[1.8rem] border border-gold-border/18 bg-gradient-to-b from-sand-primary/75 to-white/60 px-4 py-5 shadow-[0_20px_50px_rgba(120,93,48,0.06)] backdrop-blur-lg dark:border-dark-border/55 dark:from-dark-surface/45 dark:to-dark-bg/35 sm:px-6 sm:py-6">
          <SectionLabel>Notes</SectionLabel>
          <p className="mt-3 whitespace-pre-wrap font-korean break-keep text-[14px] leading-[1.8] tracking-[-0.015em] text-text-primary dark:text-dark-text-primary sm:text-[15px] sm:leading-[1.9]">
            {korean}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export default React.memo(TranslationSection);
