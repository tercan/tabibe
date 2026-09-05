/**
 * 1. Text normalization
 */

function getSafeText(value) {
  return typeof value === 'string' ? value : '';
}

function stripMarkdownForDisplay(value) {
  return getSafeText(value)
    .replace(/^\s{0,3}#{1,6}(?:\s+|$)/, '')
    .replace(/^(?:\s*>\s*)+/, '')
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+(?:\[[ xX]\]\s*)?/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    .replace(/<(https?:\/\/[^>]+)>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/(\*\*|__|~~|`)(.*?)\1/g, '$2')
    .replace(/(^|[\s([{])([*_])([^*_]+)\2(?=$|[\s)\]},.!?:;])/g, '$1$3')
    .replace(/\\([\\`*_[\]{}()#+\-.!>])/g, '$1')
    .replace(/^[*_~`]+|[*_~`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMeaningfulContentLines(content) {
  return getSafeText(content).split(/\r?\n/).map(stripMarkdownForDisplay).filter(Boolean);
}

/**
 * 2. Note list presentation
 */

function getNoteDisplayTitle(note, fallbackTitle = '') {
  const explicitTitle = stripMarkdownForDisplay(note?.title);
  if (explicitTitle) return explicitTitle;

  return getMeaningfulContentLines(note?.content)[0] || getSafeText(fallbackTitle).trim();
}

function getDateTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function formatNoteRelativeTime(
  value,
  { locale, now = new Date(), numeric = 'auto', style = 'short' } = {},
) {
  const targetTimestamp = getDateTimestamp(value);
  const nowTimestamp = getDateTimestamp(now);
  if (targetTimestamp === null || nowTimestamp === null) return '';

  const differenceMs = targetTimestamp - nowTimestamp;
  const absoluteDifferenceMs = Math.abs(differenceMs);
  const second = 1000;
  const minute = 60 * second;
  const hour = 60 * minute;
  const day = 24 * hour;
  let divisor;
  let unit;

  if (absoluteDifferenceMs < 10 * second) {
    return createRelativeTimeFormatter(locale, numeric, style).format(0, 'second');
  }
  if (absoluteDifferenceMs < hour) {
    divisor = minute;
    unit = 'minute';
  } else if (absoluteDifferenceMs < day) {
    divisor = hour;
    unit = 'hour';
  } else if (absoluteDifferenceMs < 7 * day) {
    divisor = day;
    unit = 'day';
  } else if (absoluteDifferenceMs < 30 * day) {
    divisor = 7 * day;
    unit = 'week';
  } else if (absoluteDifferenceMs < 365 * day) {
    divisor = 30 * day;
    unit = 'month';
  } else {
    divisor = 365 * day;
    unit = 'year';
  }

  return createRelativeTimeFormatter(locale, numeric, style).format(
    Math.round(differenceMs / divisor),
    unit,
  );
}

function createRelativeTimeFormatter(locale, numeric, style) {
  try {
    return new Intl.RelativeTimeFormat(locale || undefined, { numeric, style });
  } catch {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'short' });
  }
}

function groupNotesForLibrary(notes, { preserveOrder = false } = {}) {
  const preparedNotes = (Array.isArray(notes) ? notes : [])
    .filter((note) => note && typeof note === 'object')
    .map((note, index) => ({ note, index }));
  const sortedNotes = preserveOrder
    ? preparedNotes.map(({ note }) => note)
    : preparedNotes
        .sort((firstItem, secondItem) => {
          const firstTimestamp = getDateTimestamp(
            firstItem.note.updatedAt || firstItem.note.createdAt,
          );
          const secondTimestamp = getDateTimestamp(
            secondItem.note.updatedAt || secondItem.note.createdAt,
          );
          const timestampDifference = (secondTimestamp || 0) - (firstTimestamp || 0);
          return timestampDifference || firstItem.index - secondItem.index;
        })
        .map(({ note }) => note);

  return {
    pinnedNotes: sortedNotes.filter((note) => note.isPinned),
    recentNotes: sortedNotes.filter((note) => !note.isPinned),
  };
}

export {
  formatNoteRelativeTime,
  getNoteDisplayTitle,
  groupNotesForLibrary,
  stripMarkdownForDisplay,
};
