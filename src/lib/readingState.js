export function resolveStoredActiveParagraph(savedValue, fallbackParagraph, paragraphs) {
  try {
    if (!savedValue) return fallbackParagraph;

    const parsed = JSON.parse(savedValue);
    const paragraphId =
      typeof parsed === 'string'
        ? parsed
        : typeof parsed?.id === 'string'
          ? parsed.id
          : null;

    if (!paragraphId) return fallbackParagraph;
    return paragraphs.find((paragraph) => paragraph.id === paragraphId) ?? fallbackParagraph;
  } catch {
    return fallbackParagraph;
  }
}
