import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { extractOdtXml } from '../scripts/extract-codex-data.js';
import { buildReadingData, flattenParagraphs } from '../src/lib/parseCodex.js';
import { parseEnglishSections, parseRangeLabel } from '../src/lib/parseCodexCore.js';
import { resolveStoredActiveParagraph } from '../src/lib/readingState.js';
import { codexData } from '../src/data/codexData.js';

function buildStoredZip(entries) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8');
    const dataBuffer = Buffer.from(entry.data, 'utf8');

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt32LE(0, 10);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(dataBuffer.length, 18);
    localHeader.writeUInt32LE(dataBuffer.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localChunks.push(localHeader, nameBuffer, dataBuffer);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt32LE(0, 14);
    centralHeader.writeUInt32LE(0, 18);
    centralHeader.writeUInt32LE(dataBuffer.length, 20);
    centralHeader.writeUInt32LE(dataBuffer.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralChunks.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + dataBuffer.length;
  }

  const localBuffer = Buffer.concat(localChunks);
  const centralBuffer = Buffer.concat(centralChunks);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralBuffer.length, 12);
  endRecord.writeUInt32LE(localBuffer.length, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([localBuffer, centralBuffer, endRecord]);
}

function runParserTests() {
  const chapters = buildReadingData();
  const flatParagraphs = flattenParagraphs(chapters);
  const prayerWork = codexData.works.find((work) => work.workId === 'prayer-of-apostle-paul');

  assert.equal(codexData.works.length, 17);
  assert.equal(chapters.length, 68);
  assert.equal(flatParagraphs.length, 321);
  assert.equal(chapters[0].chapterName, 'Prayer of Apostle Paul');
  assert.equal(chapters.find((chapter) => chapter.chapterName === 'Gospel of Thomas')?.paragraphs.length, 0);
  assert.equal(prayerWork?.sections.length, 1);
  assert.equal(prayerWork?.sections[0].rangeLabel, '1, 3-2, 10');
  assert.ok(flatParagraphs[0].text.english.length >= 0);
  assert.ok(flatParagraphs[0].text.tibetan.length >= 0);
  assert.equal(codexData.works[1].sections[0].subtitle, 'The Letter of James');
  assert.equal(parseRangeLabel('2, 7-1, 3'), null);
  assert.equal(parseEnglishSections('Title (1, 1-1, 8)\nBody line')[0].subtitle, 'Title');
}

async function runExtractionTests() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'nag-odt-'));
  try {
    const archivePath = path.join(tempDir, 'sample.odt');
    const archive = buildStoredZip([
      { name: 'content.xml', data: '<root><text:p>Hello</text:p></root>' },
    ]);

    await writeFile(archivePath, archive);

    const xml = await extractOdtXml(archivePath);
    assert.equal(xml, '<root><text:p>Hello</text:p></root>');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

function runReadingStateTests() {
  const paragraphs = [
    { id: 'a.1' },
    { id: 'a.2' },
  ];

  assert.equal(resolveStoredActiveParagraph(JSON.stringify('a.2'), paragraphs[0], paragraphs)?.id, 'a.2');
  assert.equal(resolveStoredActiveParagraph('not-json', paragraphs[0], paragraphs)?.id, 'a.1');
  assert.equal(resolveStoredActiveParagraph(null, paragraphs[0], paragraphs)?.id, 'a.1');
}

async function main() {
  runParserTests();
  await runExtractionTests();
  runReadingStateTests();
  console.log('All tests passed.');
}

main();
