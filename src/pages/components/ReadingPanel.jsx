import React from 'react';
import { motion } from 'framer-motion';
import ReadingHeader from '../../components/Reading/ReadingHeader.jsx';
import TibetanSection from '../../components/Reading/TibetanSection.jsx';
import TranslationSection from '../../components/Reading/TranslationSection.jsx';
import NavigationPill from '../../components/Reading/NavigationPill.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function ReadingPanel({ paragraph, globalIndex, onPrevious, onNext }) {
  const safeParagraph = paragraph && typeof paragraph === 'object' ? paragraph : null;
  const paragraphId = typeof safeParagraph?.id === 'string' ? safeParagraph.id : '';
  const paragraphText = safeParagraph?.text && typeof safeParagraph.text === 'object' ? safeParagraph.text : null;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative z-10 min-h-full bg-transparent pb-28 pt-8 font-crimson text-text-primary transition-colors duration-500 dark:text-dark-text-primary sm:pb-20 sm:pt-12"
    >
      <div className="mx-auto w-full max-w-[980px] px-5 sm:px-8 xl:px-10">
        <motion.div variants={itemVariants}>
          <ReadingHeader
            workTitle={safeParagraph?.chapterTitle}
            sectionTitle={safeParagraph?.title}
            rangeLabel={safeParagraph?.rangeLabel}
            globalIndex={globalIndex}
            sectionId={paragraphId}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TibetanSection
            tibetan={paragraphText?.tibetan ?? ''}
            pronunciation={paragraphText?.pronunciation ?? ''}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TranslationSection english={paragraphText?.english ?? ''} korean={paragraphText?.korean ?? ''} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <NavigationPill globalIndex={globalIndex} verseId={paragraphId} onPrevious={onPrevious} onNext={onNext} />
        </motion.div>
      </div>
    </motion.section>
  );
}

export default React.memo(ReadingPanel, (prevProps, nextProps) => prevProps.paragraph?.id === nextProps.paragraph?.id);
