import { codexData } from '../data/codexData.js';
import { createReadingData, flattenParagraphs } from './parseCodexCore.js';

export { createReadingData, flattenParagraphs } from './parseCodexCore.js';

export function buildReadingData() {
  return createReadingData(codexData.works);
}
