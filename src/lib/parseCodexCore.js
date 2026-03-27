const DASH = '-';

function toText(value) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2013|\u2014/g, DASH);
}

function normalizeCopticText(value) {
  return toText(value).replace(/\u0323/g, '');
}

export function normalizeWhitespace(value) {
  return toText(value)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
}

export function slugify(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseRangeLabel(rangeLabel) {
  const compact = normalizeWhitespace(rangeLabel);
  const match = compact.match(/^(\d+)\s*,\s*(\d+)(?:\s*-\s*(?:(\d+)\s*,\s*)?(\d+))?$/);
  if (!match) return null;

  const startPage = Number(match[1]);
  const startLine = Number(match[2]);
  const endPage = match[3] ? Number(match[3]) : startPage;
  const endLine = Number(match[4] ?? match[3] ?? match[2]);

  if (startPage < 1 || startLine < 1 || endPage < 1 || endLine < 1) return null;
  if (endPage < startPage) return null;
  if (endPage === startPage && endLine < startLine) return null;

  return {
    start: { page: startPage, line: startLine },
    end: { page: endPage, line: endLine },
  };
}

export function parseWorkOrder(source) {
  return normalizeWhitespace(source)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes('\u2192'))
    .map((line) => {
      const parts = line.split('\u2192');
      return {
        workLabel: normalizeWhitespace(parts[0]),
        sourceTitle: normalizeWhitespace(parts[1]),
      };
    });
}

function isCodexHeading(line) {
  return /^Codex\s+[IVXLCDM]+$/i.test(line) || /^Codex\s+\d+$/i.test(line);
}

function parseIndexEntry(line, groupTitle, groupId, workIndex) {
  const arrowIndex = line.indexOf('→');
  const chapterName = normalizeWhitespace(arrowIndex >= 0 ? line.slice(0, arrowIndex) : line);
  const rawSourceTitle = normalizeWhitespace(arrowIndex >= 0 ? line.slice(arrowIndex + 1) : '');
  const sourceTitle = rawSourceTitle && rawSourceTitle !== '없음' ? rawSourceTitle : null;

  return {
    indexId: `${groupId}.${workIndex + 1}`,
    workId: slugify(chapterName),
    chapterName,
    title: `${groupTitle} - ${chapterName}`,
    sourceTitle,
  };
}

export function parseCodexIndex(source) {
  const lines = String(source ?? '').replace(/\r/g, '').split('\n');
  const groups = [];
  let currentGroup = null;

  for (const rawLine of lines) {
    const line = normalizeWhitespace(rawLine);
    if (!line) continue;

    if (isCodexHeading(line)) {
      currentGroup = {
        id: slugify(line),
        kind: 'codex',
        title: line,
        chapterName: line,
        works: [],
      };
      groups.push(currentGroup);
      continue;
    }

    if (line.includes('→')) {
      if (!currentGroup) {
        currentGroup = {
          id: 'codex-index',
          kind: 'misc',
          title: 'Index',
          chapterName: 'Index',
          works: [],
        };
        groups.push(currentGroup);
      }

      const entry = parseIndexEntry(line, currentGroup.title, currentGroup.id, currentGroup.works.length);
      currentGroup.works.push(entry);
      continue;
    }

    if (!currentGroup) {
      currentGroup = {
        id: slugify(line),
        kind: 'misc',
        title: line,
        chapterName: line,
        works: [],
      };
      groups.push(currentGroup);
      continue;
    }

    if (currentGroup.kind === 'codex') {
      currentGroup = {
        id: slugify(line),
        kind: 'misc',
        title: line,
        chapterName: line,
        works: [],
      };
      groups.push(currentGroup);
      continue;
    }

    currentGroup.works.push({
      indexId: `${currentGroup.id}.${currentGroup.works.length + 1}`,
      workId: slugify(line),
      chapterName: line,
      title: line,
      sourceTitle: null,
    });
  }

  return groups;
}

function buildWorkLookup(works) {
  const lookup = new Map();

  function pushLookup(key, record) {
    if (!key) return;
    const normalizedKey = normalizeWhitespace(key);
    if (!normalizedKey) return;
    if (!lookup.has(normalizedKey)) {
      lookup.set(normalizedKey, []);
    }
    lookup.get(normalizedKey).push(record);
  }

  works.forEach((work, index) => {
    const record = { work, used: false, index };
    pushLookup(work.workId, record);
    pushLookup(work.chapterName, record);
    pushLookup(work.sourceTitle, record);
    pushLookup(slugify(work.chapterName), record);
  });

  return lookup;
}

function takeWorkForIndexEntry(lookup, entry) {
  const keys = [entry.workId, entry.chapterName, entry.sourceTitle, slugify(entry.chapterName)];

  for (const key of keys) {
    const normalizedKey = normalizeWhitespace(key);
    if (!normalizedKey) continue;

    const queue = lookup.get(normalizedKey);
    if (!queue?.length) continue;

    while (queue.length && queue[0].used) {
      queue.shift();
    }

    const record = queue.shift();
    if (record && !record.used) {
      record.used = true;
      return record.work;
    }
  }

  return null;
}

export function mergeCodexIndexWithWorks(indexGroups, works) {
  const lookup = buildWorkLookup(works);
  const mergedWorks = [];

  indexGroups.forEach((group, groupIndex) => {
    group.works.forEach((entry, workIndex) => {
      const matchedWork = takeWorkForIndexEntry(lookup, entry);

      if (matchedWork) {
        mergedWorks.push({
          ...matchedWork,
          codexId: group.id,
          codexTitle: group.title,
          indexId: entry.indexId,
          indexGroupOrder: groupIndex + 1,
          indexWorkOrder: workIndex + 1,
        });
        return;
      }

      mergedWorks.push({
        workId: `${group.id}.${entry.indexId}.${slugify(entry.chapterName) || 'work'}`,
        chapterName: entry.chapterName,
        title: entry.title,
        sourceTitle: entry.sourceTitle ?? '',
        sections: [],
        codexId: group.id,
        codexTitle: group.title,
        indexId: entry.indexId,
        indexGroupOrder: groupIndex + 1,
        indexWorkOrder: workIndex + 1,
      });
    });
  });

  return mergedWorks;
}

export function parseEnglishSections(source) {
  const lines = String(source ?? '').replace(/\r/g, '').split('\n');
  const sections = [];
  let current = null;

  function pushCurrent() {
    if (!current) return;
    sections.push({
      subtitle: current.subtitle,
      heading: current.heading,
      title: current.title,
      rangeLabel: current.rangeLabel,
      range: current.range,
      body: normalizeWhitespace(current.bodyLines.join('\n')),
    });
    current = null;
  }

  for (const rawLine of lines) {
    const line = normalizeWhitespace(rawLine);
    if (!line) {
      if (current) current.bodyLines.push('');
      continue;
    }

    const headingMatch = line.match(/^(?:(.*?)\s*)?\(\s*(\d+\s*,\s*\d+(?:\s*-\s*(?:\d+\s*,\s*)?\d+)?)\s*\)\s*(.*)$/);
    if (!headingMatch) {
      if (current) current.bodyLines.push(line);
      continue;
    }

    pushCurrent();

    const subtitle = normalizeWhitespace(headingMatch[1]);
    const rangeLabel = normalizeWhitespace(headingMatch[2]);
    const after = normalizeWhitespace(headingMatch[3]);
    const range = parseRangeLabel(rangeLabel);
    if (!range) continue;

    let title = subtitle;
    let bodyPrefix = after;

    if (!title) {
      const sentenceMatch = after.match(/^(.+?[.?!])\s+(.*)$/);
      if (sentenceMatch) {
        title = normalizeWhitespace(sentenceMatch[1]);
        bodyPrefix = normalizeWhitespace(sentenceMatch[2]);
      } else {
        title = after || rangeLabel;
        bodyPrefix = '';
      }
    }

    current = {
      subtitle: subtitle || title,
      heading: line,
      title,
      rangeLabel,
      range,
      bodyLines: bodyPrefix ? [bodyPrefix] : [],
    };
  }

  pushCurrent();
  return sections;
}

export function extractLineTokens(source) {
  const text = toText(source);
  const markerPattern = /\((\d+)\/(\d+)\)\s*/g;
  const matches = [...text.matchAll(markerPattern)];
  const tokens = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const next = matches[index + 1];
    const start = match.index + match[0].length;
    const end = next ? next.index : text.length;
    const tokenText = normalizeWhitespace(normalizeCopticText(text.slice(start, end)));

    if (!tokenText) continue;

    tokens.push({
      page: Number(match[1]),
      line: Number(match[2]),
      text: tokenText,
    });
  }

  return tokens;
}

export function sliceLineTokens(tokens, range) {
  return normalizeWhitespace(
    tokens
      .filter((token) => {
        if (token.page < range.start.page || token.page > range.end.page) return false;
        if (token.page === range.start.page && token.line < range.start.line) return false;
        if (token.page === range.end.page && token.line > range.end.line) return false;
        return true;
      })
      .map((token) => token.text)
      .join('\n'),
  );
}

export function formatRangeLabel(range) {
  if (range.start.page === range.end.page) {
    return `${range.start.page}, ${range.start.line}-${range.end.line}`;
  }

  return `${range.start.page}, ${range.start.line}-${range.end.page}, ${range.end.line}`;
}

export function createReadingData(indexTreeOrWorks, maybeWorks = null) {
  if (!Array.isArray(maybeWorks)) {
    return (indexTreeOrWorks ?? []).map((work) => {
      const paragraphs = (work.sections ?? []).map((section, index) => ({
        id: `${work.workId}.${index + 1}`,
        title: section.title,
        paragraphNumber: index + 1,
        chapterTitle: work.title,
        text: {
          tibetan: section.coptic,
          pronunciation: '',
          english: section.english,
          korean: '',
        },
        rangeLabel: section.rangeLabel,
        workId: work.workId,
        sourceTitle: work.sourceTitle,
      }));

      return {
        id: work.workId,
        chapterName: work.chapterName,
        title: work.title,
        sourceTitle: work.sourceTitle,
        codexId: work.codexId ?? null,
        codexTitle: work.codexTitle ?? null,
        paragraphs,
      };
    });
  }

  return mergeCodexIndexWithWorks(indexTreeOrWorks, maybeWorks).map((work) => {
    const paragraphs = (work.sections ?? []).map((section, index) => ({
      id: `${work.workId}.${index + 1}`,
      title: section.title,
      paragraphNumber: index + 1,
      chapterTitle: work.title,
      text: {
        tibetan: section.coptic,
        pronunciation: '',
        english: section.english,
        korean: '',
      },
      rangeLabel: section.rangeLabel,
      workId: work.workId,
      sourceTitle: work.sourceTitle,
    }));

    return {
      id: work.workId,
      chapterName: work.chapterName,
      title: work.title,
      sourceTitle: work.sourceTitle,
      codexId: work.codexId ?? null,
      codexTitle: work.codexTitle ?? null,
      paragraphs,
    };
  });
}

export function flattenParagraphs(chapters) {
  const flattened = [];

  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (!node || typeof node !== 'object') return;

    const childLists = ['paragraphs', 'works', 'chapters', 'children'];
    const hasChildren = childLists.some((key) => Array.isArray(node[key]) && node[key].length > 0);

    if (hasChildren) {
      childLists.forEach((key) => {
        if (Array.isArray(node[key])) {
          node[key].forEach(visit);
        }
      });
      return;
    }

    if (typeof node.id === 'string' && (node.text || typeof node.paragraphNumber === 'number')) {
      flattened.push(node);
    }
  }

  visit(chapters);
  return flattened;
}
