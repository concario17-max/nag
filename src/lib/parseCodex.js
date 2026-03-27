import { codexData } from '../data/codexData.js';
import { codexIndex } from '../data/codexIndex.js';
import { createReadingData, flattenParagraphs, mergeCodexIndexWithWorks } from './parseCodexCore.js';

export { createReadingData, flattenParagraphs } from './parseCodexCore.js';

export function buildReadingData() {
  return createReadingData(mergeCodexIndexWithWorks(codexIndex, codexData.works));
}
