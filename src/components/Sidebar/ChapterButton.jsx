import React from 'react';
import { motion } from 'framer-motion';

function ChapterButton({ chapter, count, isExpanded, onClick, isSubchapter = false }) {
  return (
    <motion.button
      layout
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-1.5 rounded-lg px-2 py-[0.55rem] text-left transition-colors duration-200 ${
        isSubchapter ? 'pl-4' : 'pl-3'
      } ${
        isExpanded
          ? 'border border-gold-primary/16 bg-white/55 text-[#1C2B36] dark:bg-dark-bg/58 dark:text-gold-light'
          : 'border border-transparent text-[#5B7282] hover:bg-gold-surface/40 dark:text-dark-text-secondary dark:hover:bg-dark-bg/40'
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0 pr-1.5">
        <span
          className={`break-keep font-inter text-[12px] leading-snug ${
            isExpanded ? 'text-[#1C2B36] dark:text-gold-light' : ''
          } ${isSubchapter ? 'font-medium tracking-wide' : 'tracking-tight'}`}
        >
          {chapter.chapterName}
        </span>
      </div>
      <motion.span
        animate={{ opacity: isExpanded ? 1 : 0.72 }}
        className="shrink-0 rounded px-1.5 py-0 text-[10px] font-bold text-[#A68B5C]"
      >
        {count || 0}
      </motion.span>
    </motion.button>
  );
}

export default React.memo(ChapterButton);
