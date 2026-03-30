import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import {
  extractLineTokens,
  normalizeWhitespace,
  parseEnglishSections,
  parseCodexIndex,
  parseWorkOrder,
  slugify,
  sliceLineTokens,
} from '../src/lib/parseCodexCore.js';
import { codexData as existingCodexData } from '../src/data/codexData.js';
import { codexIndex as existingCodexIndex } from '../src/data/codexIndex.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const englishDir = path.join(projectRoot, 'CODEX 1 ENG');
const odtPath = path.join(projectRoot, 'codex 1.odt');
const prayerOdtPath = path.join(projectRoot, 'codex', 'codex 1-1.odt');
const prayerEnglishPath = path.join(projectRoot, 'CODEX ENG', 'THE_PRAYER_OF_THE_APOSTLE_PAUL.txt');
const jamesEnglishPath = path.join(projectRoot, 'CODEX ENG', 'CODEX 1 ENG', '2.The_Secret_Book_of_James_reformatted.txt');
const indexPath = path.join(projectRoot, '1.index.txt');
const codexTwoEnglishDir = path.join(projectRoot, 'CODEX ENG', 'CODEX 2 ENG');
const codexTwoOdtPath = path.join(projectRoot, 'codex', 'codex 2.odt');
const codexDataOutputPath = path.join(projectRoot, 'src', 'data', 'codexData.js');

const WORK_TO_FILE = new Map([
  ['Prayer of Apostle Paul', 'THE_PRAYER_OF_THE_APOSTLE_PAUL.txt'],
  ['Apocryphon of James', '2.The_Secret_Book_of_James_reformatted.txt'],
  ['Gospel of Truth', '3.The_Gospel_of_Truth_reformatted.txt'],
  ['Treatise on the Resurrection', 'The_Treatise_on_Resurrection_cleaned.txt'],
  ['Tripartite Tractate', 'The_Tripartite_Tractate_Part_One_cleaned.txt'],
]);

const SOURCE_TO_WORK = new Map([
  ['THE PRAYER OF THE APOSTLE PAUL', 'Prayer of Apostle Paul'],
  ['THE SECRET BOOK OF JAMES', 'Apocryphon of James'],
  ['THE GOSPEL OF TRUTH', 'Gospel of Truth'],
  ['THE TREATISE ON RESURRECTION', 'Treatise on the Resurrection'],
  ['THE TRIPARTITE TRACTATE', 'Tripartite Tractate'],
]);

const CODEX_II_WORK_TO_FILE = new Map([
  ['Apocryphon of John', 'The_Secret_Book_of_John_cleaned.txt'],
  ['Gospel of Philip', 'The_Gospel_of_Philip_cleaned.txt'],
  ['Hypostasis of the Archons', 'The_Nature_of_the_Rulers_cleaned.txt'],
  ['Origin of the World', 'On_the_Origin_of_the_World_cleaned.txt'],
  ['Exegesis on the Soul', 'Exegesis_on_the_Soul_cleaned.txt'],
  ['Book of Thomas the Contender', 'The_Book_of_Thomas_cleaned.txt'],
]);

const CODEX_II_EXCLUDED_SOURCE_TITLE = 'THE GOSPEL OF THOMAS WITH THE GREEK GOSPEL OF THOMAS';

function readUInt16LE(buffer, offset) {
  return buffer.readUInt16LE(offset);
}

function readUInt32LE(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function normalizeBodyOnlyText(source) {
  const lines = String(source ?? '').replace(/\r/g, '').split('\n');
  const output = [];
  let current = '';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (current) {
        output.push(current);
        current = '';
      }
      if (output.length && output[output.length - 1] !== '') {
        output.push('');
      }
      continue;
    }

    if (!current) {
      current = line;
      continue;
    }

    if (/[-‐‑‒–—]\s*$/.test(current)) {
      current = `${current.replace(/[-‐‑‒–—]\s*$/, '')}${line}`;
      continue;
    }

    output.push(current);
    current = line;
  }

  if (current) {
    output.push(current);
  }

  return output
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseBodyOnlySection(source, workTitle) {
  const body = normalizeBodyOnlyText(source);

  return [
    {
      title: workTitle,
      subtitle: workTitle,
      heading: workTitle,
      rangeLabel: '1, 1-1, 40',
      range: { start: { page: 1, line: 1 }, end: { page: 1, line: 40 } },
      english: body,
      coptic: '',
    },
  ];
}

async function buildPrayerWork() {
  const englishSource = await readFile(prayerEnglishPath, 'utf8');
  const englishSections = parseEnglishSections(englishSource);

  if (englishSections.length !== 1) {
    throw new Error(`Expected exactly one English section for Prayer of Apostle Paul, got ${englishSections.length}.`);
  }

  const prayerSection = englishSections[0];
  if (!prayerSection.range) {
    throw new Error('Missing range for Prayer of Apostle Paul.');
  }

  const copticXml = await extractOdtXml(prayerOdtPath);
  const copticTokens = extractLineTokens(xmlToPlainText(copticXml));

  return {
    workId: 'prayer-of-apostle-paul',
    chapterName: 'Prayer of Apostle Paul',
    title: 'Codex I - Prayer of Apostle Paul',
    sourceTitle: 'THE PRAYER OF THE APOSTLE PAUL',
    sections: [
      {
        title: prayerSection.title,
        subtitle: prayerSection.subtitle,
        heading: prayerSection.heading,
        rangeLabel: prayerSection.rangeLabel,
        range: prayerSection.range,
        english: prayerSection.body,
        coptic: sliceLineTokens(copticTokens, prayerSection.range),
      },
    ],
  };
}

export async function buildJamesWork() {
  const englishSource = await readFile(jamesEnglishPath, 'utf8');
  const englishSections = parseEnglishSections(englishSource);

  if (!englishSections.length) {
    throw new Error('Expected at least one English section for Apocryphon of James.');
  }

  const copticXml = await extractOdtXml(odtPath);
  const copticTokens = extractLineTokens(xmlToPlainText(copticXml));

  return {
    workId: 'apocryphon-of-james',
    chapterName: 'Apocryphon of James',
    title: 'Codex I - Apocryphon of James',
    sourceTitle: 'THE SECRET BOOK OF JAMES',
    sections: englishSections.map((section) => {
      if (!section.range) {
        throw new Error(`Missing range for Apocryphon of James section ${section.title}.`);
      }

      return {
        title: section.title,
        subtitle: section.subtitle,
        heading: section.heading,
        rangeLabel: section.rangeLabel,
        range: section.range,
        english: section.body,
        coptic: String(sliceLineTokens(copticTokens, section.range))
          .replace(/\((?:\u2c81|\u2c83)\)\s*/g, '')
          .trim(),
      };
    }),
  };
}

export async function buildGospelOfTruthWork() {
  const englishSource = await readFile(path.join(projectRoot, 'CODEX ENG', 'CODEX 1 ENG', '3.The_Gospel_of_Truth_reformatted.txt'), 'utf8');
  const englishSections = parseEnglishSections(englishSource);

  if (!englishSections.length) {
    throw new Error('Expected at least one English section for Gospel of Truth.');
  }

  const copticXml = await extractOdtXml(odtPath);
  const copticTokens = extractLineTokens(xmlToPlainText(copticXml));

  return {
    workId: 'gospel-of-truth',
    chapterName: 'Gospel of Truth',
    title: 'Codex I - Gospel of Truth',
    sourceTitle: 'THE GOSPEL OF TRUTH',
    sections: englishSections.map((section) => {
      if (!section.range) {
        throw new Error(`Missing range for Gospel of Truth section ${section.title}.`);
      }

      return {
        title: section.title,
        subtitle: section.subtitle,
        heading: section.heading,
        rangeLabel: section.rangeLabel,
        range: section.range,
        english: section.body,
        coptic: sliceLineTokens(copticTokens, section.range),
      };
    }),
  };
}

function serializeCodexData(data) {
  return `export const codexData = ${JSON.stringify(data, null, 2)};

export default codexData;
`;
}

function buildCodexTwoWorkSections(englishSource, copticTokens, workTitle) {
  const englishSections = parseEnglishSections(englishSource);

  if (!englishSections.length) {
    throw new Error(`Could not parse any English sections for ${workTitle}.`);
  }

  return englishSections.map((section) => {
    if (!section.range) {
      throw new Error(`Missing range for ${workTitle} section ${section.title}.`);
    }

    return {
      title: section.title,
      subtitle: section.subtitle,
      heading: section.heading,
      rangeLabel: section.rangeLabel,
      range: section.range,
      english: section.body,
      coptic: sliceLineTokens(copticTokens, section.range),
    };
  });
}

async function buildCodexTwoWorks() {
  const codexTwoGroup = existingCodexIndex.find((group) => group.id === 'codex-ii');
  if (!codexTwoGroup) {
    throw new Error('Could not find Codex II in codexIndex.');
  }

  const copticXml = await extractOdtXml(codexTwoOdtPath);
  const copticTokens = extractLineTokens(xmlToPlainText(copticXml));
  const works = [];

  for (const entry of codexTwoGroup.works) {
    if (entry.sourceTitle === CODEX_II_EXCLUDED_SOURCE_TITLE) {
      continue;
    }

    const fileName = CODEX_II_WORK_TO_FILE.get(entry.chapterName);
    if (!fileName) {
      throw new Error(`No Codex II English file mapping found for ${entry.chapterName}.`);
    }

    const englishSource = await readFile(path.join(codexTwoEnglishDir, fileName), 'utf8');
    const sections = buildCodexTwoWorkSections(englishSource, copticTokens, entry.chapterName);

    works.push({
      workId: entry.workId,
      chapterName: entry.chapterName,
      title: entry.title,
      sourceTitle: entry.sourceTitle,
      sections,
    });
  }

  return works;
}

function findEndOfCentralDirectory(buffer) {
  const minimumSize = 22;
  const maxCommentLength = 0xffff;
  const searchStart = Math.max(0, buffer.length - minimumSize - maxCommentLength);

  for (let offset = buffer.length - minimumSize; offset >= searchStart; offset -= 1) {
    if (readUInt32LE(buffer, offset) === 0x06054b50) {
      return offset;
    }
  }

  throw new Error('Could not find ZIP end-of-central-directory record.');
}

function readZipEntry(buffer, entryName) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const centralDirectorySize = readUInt32LE(buffer, eocdOffset + 12);
  const centralDirectoryOffset = readUInt32LE(buffer, eocdOffset + 16);
  const totalEntries = readUInt16LE(buffer, eocdOffset + 10);

  let offset = centralDirectoryOffset;
  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize;

  for (let index = 0; index < totalEntries && offset < centralDirectoryEnd; index += 1) {
    if (readUInt32LE(buffer, offset) !== 0x02014b50) {
      throw new Error(`Invalid ZIP central directory entry at offset ${offset}.`);
    }

    const compressionMethod = readUInt16LE(buffer, offset + 10);
    const flags = readUInt16LE(buffer, offset + 8);
    const compressedSize = readUInt32LE(buffer, offset + 20);
    const fileNameLength = readUInt16LE(buffer, offset + 28);
    const extraFieldLength = readUInt16LE(buffer, offset + 30);
    const commentLength = readUInt16LE(buffer, offset + 32);
    const localHeaderOffset = readUInt32LE(buffer, offset + 42);
    const fileName = buffer.slice(offset + 46, offset + 46 + fileNameLength).toString('utf8');

    if (fileName === entryName) {
      if ((flags & 0x0001) !== 0) {
        throw new Error(`ZIP entry ${entryName} is encrypted and cannot be read.`);
      }

      if (readUInt32LE(buffer, localHeaderOffset) !== 0x04034b50) {
        throw new Error(`Invalid ZIP local file header for ${entryName}.`);
      }

      const localNameLength = readUInt16LE(buffer, localHeaderOffset + 26);
      const localExtraLength = readUInt16LE(buffer, localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.slice(dataOffset, dataOffset + compressedSize);

      if (compressionMethod === 0) {
        return compressed;
      }

      if (compressionMethod === 8) {
        return inflateRawSync(compressed);
      }

      throw new Error(`Unsupported ZIP compression method ${compressionMethod} for ${entryName}.`);
    }

    offset += 46 + fileNameLength + extraFieldLength + commentLength;
  }

  throw new Error(`Could not find ${entryName} inside the ODT archive.`);
}

async function findTocPath(rootDir) {
  const entries = await readdir(rootDir);
  const match = entries.find((name) => name.endsWith('.txt') && name.includes('\uBAA9\uCC28'));
  if (!match) {
    throw new Error('Could not find the TOC file.');
  }
  return path.join(rootDir, match);
}

export async function extractOdtXml(filePath) {
  const archive = await readFile(filePath);
  return readZipEntry(archive, 'content.xml').toString('utf8');
}

export function xmlToPlainText(xml) {
  return xml
    .replace(/<text:span[^>]*>/g, '')
    .replace(/<\/text:span>/g, '')
    .replace(/<text:tab\s*\/>/g, '\t')
    .replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g, (_, count) => ' '.repeat(Number(count ?? '1')))
    .replace(/<text:line-break\s*\/>/g, '\n')
    .replace(/<text:p[^>]*>/g, '\n')
    .replace(/<\/text:p>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, ' ');
}

async function main() {
  const jamesWork = await buildJamesWork();
  const codexIGroup = existingCodexIndex.find((group) => group.id === 'codex-i');

  if (!codexIGroup) {
    throw new Error('Could not find Codex I in codexIndex.');
  }

  const codexIToc = codexIGroup.works.map((entry) => ({
    workLabel: entry.chapterName,
    sourceTitle: entry.sourceTitle,
  }));
  const codexIWorks = existingCodexData.works.filter((work) => work.title.startsWith('Codex I - '));
  const codexIWorkIds = new Set(codexIWorks.map((work) => work.workId));
  const missingCodexIWorks = codexIGroup.works.filter((entry) => !codexIWorkIds.has(entry.workId));

  if (missingCodexIWorks.length) {
    throw new Error(`Missing Codex I work data for: ${missingCodexIWorks.map((entry) => entry.chapterName).join(', ')}`);
  }

  const nextCodexIWorksWithJames = existingCodexData.works.map((work) => {
    if (work.workId !== jamesWork.workId) {
      return work;
    }

    return jamesWork;
  });

  const nextCodexData = {
    ...existingCodexData,
    toc: [...codexIToc],
    works: nextCodexIWorksWithJames,
  };
  await writeFile(codexDataOutputPath, serializeCodexData(nextCodexData), 'utf8');
  console.log(`Wrote ${codexDataOutputPath}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { readZipEntry };
