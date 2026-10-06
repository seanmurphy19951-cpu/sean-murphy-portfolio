/**
 * Central state for date range selection and comparison mode.
 * Pub/sub pattern — UI and app.js subscribe to changes.
 */

export const DATE_PRESETS = {
  MTD: 'MTD',
  QTD: 'QTD',
  YTD: 'YTD',
  PREV_YEAR: 'PREV_YEAR',
  CUSTOM: 'CUSTOM',
};

export const COMPARE_MODES = {
  NONE: 'NONE',
  YOY: 'YOY',
  QOQ: 'QOQ',
  CUSTOM: 'CUSTOM',
};

let state = {
  preset: DATE_PRESETS.MTD,
  start: null,
  end: null,
  compareMode: COMPARE_MODES.NONE,
  compareStart: null,
  compareEnd: null,
};

let reportEndDate = null;
let dataStartDate = null;
const subscribers = new Set();

export function initDateRangeState(reportPeriod) {
  const [year, month] = reportPeriod.split('-').map(Number);
  reportEndDate = new Date(year, month, 0);
  dataStartDate = new Date(2025, 0, 1);
  setDateRange(DATE_PRESETS.MTD);
}

export function getDataBounds() {
  return {
    min: dataStartDate ? formatDate(dataStartDate) : '2025-01-01',
    max: reportEndDate ? formatDate(reportEndDate) : '2026-03-31',
  };
}

function computeRange(preset) {
  if (!reportEndDate) return { start: null, end: null };

  const y = reportEndDate.getFullYear();
  const m = reportEndDate.getMonth();

  switch (preset) {
    case DATE_PRESETS.MTD:
      return {
        start: formatDate(new Date(y, m, 1)),
        end: formatDate(reportEndDate),
      };
    case DATE_PRESETS.QTD: {
      const qStart = Math.floor(m / 3) * 3;
      return {
        start: formatDate(new Date(y, qStart, 1)),
        end: formatDate(reportEndDate),
      };
    }
    case DATE_PRESETS.YTD:
      return {
        start: formatDate(new Date(y, 0, 1)),
        end: formatDate(reportEndDate),
      };
    case DATE_PRESETS.PREV_YEAR:
      return {
        start: formatDate(new Date(y - 1, m, 1)),
        end: formatDate(new Date(y - 1, m + 1, 0)),
      };
    case DATE_PRESETS.CUSTOM:
      return { start: state.start, end: state.end };
    default:
      return { start: state.start, end: state.end };
  }
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function setDateRange(preset) {
  const { start, end } = computeRange(preset);
  state = { ...state, preset, start, end };
  notify();
}

export function setCustomRange(start, end) {
  state = { ...state, preset: DATE_PRESETS.CUSTOM, start, end };
  notify();
}

export function setCompareMode(mode) {
  state = { ...state, compareMode: mode };
  notify();
}

export function setCustomCompareRange(start, end, primaryStart, primaryEnd) {
  state = {
    ...state,
    preset: DATE_PRESETS.CUSTOM,
    start: primaryStart || state.start,
    end: primaryEnd || state.end,
    compareMode: COMPARE_MODES.CUSTOM,
    compareStart: start,
    compareEnd: end,
  };
  notify();
}

export function getDateRange() {
  return { ...state };
}

/**
 * Get the comparison range based on the active comparison mode.
 * YoY: same period shifted 12 months back.
 * QoQ: same period shifted 3 months back.
 */
export function getComparisonRange() {
  if (!state.start || !state.end) return null;

  if (state.compareMode === COMPARE_MODES.CUSTOM) {
    if (state.compareStart && state.compareEnd) {
      return { start: state.compareStart, end: state.compareEnd };
    }
    return null;
  }

  const s = new Date(state.start + 'T00:00:00');
  const e = new Date(state.end + 'T00:00:00');

  if (state.compareMode === COMPARE_MODES.QOQ) {
    s.setMonth(s.getMonth() - 3);
    e.setMonth(e.getMonth() - 3);
  } else {
    // YOY
    s.setFullYear(s.getFullYear() - 1);
    e.setFullYear(e.getFullYear() - 1);
  }
  return { start: formatDate(s), end: formatDate(e) };
}

/**
 * Get the default (contextual) comparison range based on the active preset.
 *
 * - MTD  → previous month
 * - QTD  → previous quarter (same length)
 * - YTD  → same YTD last year
 * - PREV_YEAR → same month two years ago (may be out of data range)
 * - CUSTOM → same-length period immediately before the selected range
 */
export function getDefaultComparisonRange() {
  if (!state.start || !state.end) return null;

  const s = new Date(state.start + 'T00:00:00');
  const e = new Date(state.end + 'T00:00:00');

  switch (state.preset) {
    case DATE_PRESETS.MTD: {
      // Previous month: e.g. Mar → Feb
      const prevEnd = new Date(s.getFullYear(), s.getMonth(), 0); // last day of prev month
      const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
      return { start: formatDate(prevStart), end: formatDate(prevEnd) };
    }
    case DATE_PRESETS.QTD: {
      // Previous quarter: e.g. Q1 (Jan-Mar) → Q4 prev year (Oct-Dec)
      const qStartMonth = Math.floor(s.getMonth() / 3) * 3;
      const prevQEnd = new Date(s.getFullYear(), qStartMonth, 0); // last day before this quarter
      const prevQStartMonth = Math.floor(prevQEnd.getMonth() / 3) * 3;
      const prevQStart = new Date(prevQEnd.getFullYear(), prevQStartMonth, 1);
      return { start: formatDate(prevQStart), end: formatDate(prevQEnd) };
    }
    case DATE_PRESETS.YTD: {
      // Same YTD last year: Jan 1 – Mar 31 last year
      const prevS = new Date(s.getFullYear() - 1, s.getMonth(), s.getDate());
      const prevE = new Date(e.getFullYear() - 1, e.getMonth(), e.getDate());
      return { start: formatDate(prevS), end: formatDate(prevE) };
    }
    case DATE_PRESETS.PREV_YEAR: {
      // Same month, two years ago
      const prevS = new Date(s.getFullYear() - 1, s.getMonth(), 1);
      const prevE = new Date(s.getFullYear() - 1, s.getMonth() + 1, 0);
      return { start: formatDate(prevS), end: formatDate(prevE) };
    }
    case DATE_PRESETS.CUSTOM:
    default: {
      // Same-length period immediately before
      const durationMs = e.getTime() - s.getTime();
      const prevE = new Date(s.getTime() - 86400000); // day before start
      const prevS = new Date(prevE.getTime() - durationMs);
      return { start: formatDate(prevS), end: formatDate(prevE) };
    }
  }
}

/**
 * Get a human-readable label for what the delta is comparing against.
 */
export function getComparisonPeriodLabel() {
  const range = (state.compareMode === COMPARE_MODES.YOY || state.compareMode === COMPARE_MODES.QOQ)
    ? getComparisonRange()
    : getDefaultComparisonRange();

  if (!range) return '';

  const s = new Date(range.start + 'T00:00:00');
  const e = new Date(range.end + 'T00:00:00');

  // If same month
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  const fmt = { month: 'short', year: 'numeric' };
  return `${s.toLocaleDateString('en-US', fmt)} – ${e.toLocaleDateString('en-US', fmt)}`;
}

export function getRangeDisplayLabel() {
  if (!state.start || !state.end) return '';
  const s = new Date(state.start + 'T00:00:00');
  const e = new Date(state.end + 'T00:00:00');
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${s.toLocaleDateString('en-US', opts)} — ${e.toLocaleDateString('en-US', opts)}`;
}

export function getComparisonLabel() {
  if (state.compareMode === COMPARE_MODES.NONE || !state.start) return '';
  const compRange = getComparisonRange();
  if (!compRange) return '';
  if (state.compareMode === COMPARE_MODES.CUSTOM) {
    const s = new Date(compRange.start + 'T00:00:00');
    const e = new Date(compRange.end + 'T00:00:00');
    const fmt = { month: 'short', day: 'numeric' };
    return `vs ${s.toLocaleDateString('en-US', fmt)} – ${e.toLocaleDateString('en-US', fmt)}`;
  }
  if (state.compareMode === COMPARE_MODES.QOQ) {
    const s = new Date(compRange.start + 'T00:00:00');
    const fmt = { month: 'short', year: 'numeric' };
    return `vs ${s.toLocaleDateString('en-US', fmt)}`;
  }
  const y = new Date(compRange.start + 'T00:00:00').getFullYear();
  return `vs ${y}`;
}

export function subscribe(fn) {
  subscribers.add(fn);
}

export function unsubscribe(fn) {
  subscribers.delete(fn);
}

function notify() {
  const current = getDateRange();
  for (const fn of subscribers) {
    fn(current);
  }
}
