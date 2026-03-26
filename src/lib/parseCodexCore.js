const DASH = '-';

function toText(value) {
  return String(value ?? '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2013|\u2014/g, DASH);
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
    const tokenText = normalizeWhitespace(text.slice(start, end));

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

export function createReadingData(works) {
  return works.map((work) => {
    const paragraphs = work.sections.map((section, index) => ({
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
      paragraphs,
      subchapters: paragraphs,
    };
  });
}

export function flattenParagraphs(chapters) {
  return chapters.flatMap((chapter) => chapter.paragraphs ?? []);
}
