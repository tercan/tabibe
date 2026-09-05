function clampSelection(value, position) {
  return Math.min(Math.max(Number(position) || 0, 0), value.length);
}

function getNoteMetrics(value) {
  const text = typeof value === 'string' ? value : '';
  const trimmedText = text.trim();
  const wordMatches = trimmedText.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu);
  return {
    characters: Array.from(text).length,
    words: wordMatches?.length || 0,
  };
}

function transformPreviewUrl(value) {
  if (typeof value !== 'string') return '';

  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? value : '';
  } catch {
    return '';
  }
}

function applyInlineFormat(value, selectionStart, selectionEnd, options) {
  const text = typeof value === 'string' ? value : '';
  const start = clampSelection(text, selectionStart);
  const end = clampSelection(text, Math.max(selectionStart, selectionEnd));
  const selectedText = text.slice(start, end) || options.placeholder;
  const insertion = `${options.prefix}${selectedText}${options.suffix}`;
  const nextValue = `${text.slice(0, start)}${insertion}${text.slice(end)}`;
  const contentStart = start + options.prefix.length;

  return {
    value: nextValue,
    selectionStart: contentStart,
    selectionEnd: contentStart + selectedText.length,
  };
}

function applyLinePrefix(value, selectionStart, selectionEnd, prefix) {
  const text = typeof value === 'string' ? value : '';
  const start = clampSelection(text, selectionStart);
  const end = clampSelection(text, Math.max(selectionStart, selectionEnd));
  const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  const nextLineBreak = text.indexOf('\n', end);
  const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
  const selectedLines = text.slice(lineStart, lineEnd).split('\n');
  const insertion = selectedLines.map((line) => `${prefix}${line}`).join('\n');
  const nextValue = `${text.slice(0, lineStart)}${insertion}${text.slice(lineEnd)}`;

  return {
    value: nextValue,
    selectionStart: lineStart,
    selectionEnd: lineStart + insertion.length,
  };
}

function applyLinkFormat(value, selectionStart, selectionEnd, placeholder) {
  const text = typeof value === 'string' ? value : '';
  const start = clampSelection(text, selectionStart);
  const end = clampSelection(text, Math.max(selectionStart, selectionEnd));
  const label = text.slice(start, end) || placeholder;
  const url = 'https://';
  const insertion = `[${label}](${url})`;
  const urlStart = start + label.length + 3;

  return {
    value: `${text.slice(0, start)}${insertion}${text.slice(end)}`,
    selectionStart: urlStart,
    selectionEnd: urlStart + url.length,
  };
}

export { applyInlineFormat, applyLinePrefix, applyLinkFormat, getNoteMetrics, transformPreviewUrl };
