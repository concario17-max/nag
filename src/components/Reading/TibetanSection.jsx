import React from 'react';

function TibetanSection({ tibetan, pronunciation }) {
  if (!tibetan && !pronunciation) return null;

  return (
    <>
      <section
        id="coptic-original"
        className="relative mb-6 mt-5 overflow-hidden rounded-[2rem] border border-gold-border/20 bg-white/55 px-4 py-6 text-center shadow-[0_25px_60px_rgba(120,93,48,0.08)] backdrop-blur-xl dark:border-dark-border/60 dark:bg-dark-surface/45 sm:px-8 sm:py-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gold-surface/25 to-transparent dark:from-gold-primary/10" />
        <div className="relative mx-auto max-w-5xl">
          <p className="font-inter text-[9px] font-semibold uppercase tracking-[0.34em] text-gold-deep/70 dark:text-gold-light/70">
            Coptic Original
          </p>

          {tibetan ? (
            <p className="mx-auto mt-3 max-w-[96%] break-keep font-antinoou text-[13px] font-bold leading-[1.45] tracking-[0.01em] text-[#4A0404] antialiased drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] dark:text-[#F0A2A2] sm:text-[14px] sm:leading-[1.5]">
              {tibetan.replace(/[\r\n]+/g, '\n')}
            </p>
          ) : null}

          {pronunciation ? (
            <div className="mx-auto mt-6 max-w-3xl rounded-[1.4rem] border border-gold-border/15 bg-sand-primary/45 px-3 py-3 dark:border-dark-border/50 dark:bg-dark-bg/20 sm:px-5">
              <p className="mb-2 font-inter text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-deep/65 dark:text-gold-light/60">
                Pronunciation Guide
              </p>
              <p className="font-inter text-[10px] uppercase leading-[1.9] tracking-[0.14em] text-gold-muted dark:text-gold-light/75 sm:text-[11px] sm:leading-[1.95]">
                {pronunciation.split('\n').map((line, index) => (
                  <React.Fragment key={`${line}-${index}`}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto my-6 flex w-full max-w-md items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-border/40 to-transparent" />
        <span className="font-serif text-sm text-gold-primary/60 dark:text-gold-light/60">III</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-border/40 to-transparent" />
      </div>
    </>
  );
}

export default React.memo(TibetanSection);
