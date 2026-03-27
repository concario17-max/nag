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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const englishDir = path.join(projectRoot, 'CODEX 1 ENG');
const odtPath = path.join(projectRoot, 'codex 1.odt');
const indexPath = path.join(projectRoot, '1.index.txt');
const outputPath = path.join(projectRoot, 'src', 'data', 'codexIndex.js');

const WORK_TO_FILE = new Map([
  ['Prayer of Apostle Paul', 'THE_PRAYER_OF_THE_APOSTLE_PAUL_body_only.txt'],
  ['Apocryphon of James', 'The_Secret_Book_of_James_cleaned.txt'],
  ['Gospel of Truth', 'The_Gospel_of_Truth_cleaned.txt'],
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
  const indexSource = await readFile(indexPath, 'utf8');
  const codexIndex = parseCodexIndex(indexSource);

  await mkdir(path.dirname(outputPath), { recursive: true });

  const contents = `export const codexIndex = ${JSON.stringify(codexIndex, null, 2)};

export default codexIndex;
`;

  await writeFile(outputPath, contents, 'utf8');
  console.log(`Wrote ${outputPath}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { readZipEntry };
