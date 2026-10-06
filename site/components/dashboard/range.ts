// @ts-nocheck
/** Pure date-range helpers. State is passed in; nothing is held at module level. */

export const COMPARE = { NONE: "NONE", YOY: "YOY", QOQ: "QOQ", CUSTOM: "CUSTOM" };

export function fmtISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const parse = (s) => new Date(s + "T00:00:00");

export function reportEnd(reportPeriod) {
  const [y, m] = reportPeriod.split("-").map(Number);
  return new Date(y, m, 0);
}

export function dataBounds(reportPeriod) {
  return { min: "2025-01-01", max: fmtISO(reportEnd(reportPeriod)) };
}

export function presetRange(preset, reportPeriod, current) {
  const end = reportEnd(reportPeriod);
  const y = end.getFullYear();
  const m = end.getMonth();
  switch (preset) {
    case "MTD": return { start: fmtISO(new Date(y, m, 1)), end: fmtISO(end) };
    case "QTD": return { start: fmtISO(new Date(y, Math.floor(m / 3) * 3, 1)), end: fmtISO(end) };
    case "YTD": return { start: fmtISO(new Date(y, 0, 1)), end: fmtISO(end) };
    case "PREV_YEAR": return { start: fmtISO(new Date(y - 1, m, 1)), end: fmtISO(new Date(y - 1, m + 1, 0)) };
    default: return { start: current.start, end: current.end };
  }
}

/** Explicit comparison (YoY shifts 12 months, QoQ 3, custom as chosen). */
export function comparisonRange(st) {
  if (!st.start || !st.end) return null;
  if (st.compareMode === COMPARE.CUSTOM) {
    return st.compareStart && st.compareEnd ? { start: st.compareStart, end: st.compareEnd } : null;
  }
  const s = parse(st.start);
  const e = parse(st.end);
  if (st.compareMode === COMPARE.QOQ) { s.setMonth(s.getMonth() - 3); e.setMonth(e.getMonth() - 3); }
  else { s.setFullYear(s.getFullYear() - 1); e.setFullYear(e.getFullYear() - 1); }
  return { start: fmtISO(s), end: fmtISO(e) };
}

/** Contextual comparison used for deltas when no explicit mode is on. */
export function defaultComparisonRange(st) {
  if (!st.start || !st.end) return null;
  const s = parse(st.start);
  const e = parse(st.end);
  switch (st.preset) {
    case "MTD": {
      const prevEnd = new Date(s.getFullYear(), s.getMonth(), 0);
      return { start: fmtISO(new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1)), end: fmtISO(prevEnd) };
    }
    case "QTD": {
      const qStart = Math.floor(s.getMonth() / 3) * 3;
      const prevEnd = new Date(s.getFullYear(), qStart, 0);
      const prevStartMonth = Math.floor(prevEnd.getMonth() / 3) * 3;
      return { start: fmtISO(new Date(prevEnd.getFullYear(), prevStartMonth, 1)), end: fmtISO(prevEnd) };
    }
    case "YTD":
      return {
        start: fmtISO(new Date(s.getFullYear() - 1, s.getMonth(), s.getDate())),
        end: fmtISO(new Date(e.getFullYear() - 1, e.getMonth(), e.getDate())),
      };
    case "PREV_YEAR":
      return {
        start: fmtISO(new Date(s.getFullYear() - 1, s.getMonth(), 1)),
        end: fmtISO(new Date(s.getFullYear() - 1, s.getMonth() + 1, 0)),
      };
    default: {
      const prevEnd = new Date(s.getTime() - 86400000);
      return { start: fmtISO(new Date(prevEnd.getTime() - (e.getTime() - s.getTime()))), end: fmtISO(prevEnd) };
    }
  }
}

export function isExplicitCompare(st) {
  return st.compareMode === COMPARE.YOY || st.compareMode === COMPARE.QOQ || st.compareMode === COMPARE.CUSTOM;
}

export function comparisonPeriodLabel(st) {
  const r = isExplicitCompare(st) && st.compareMode !== COMPARE.CUSTOM ? comparisonRange(st) : defaultComparisonRange(st);
  if (!r) return "";
  const s = parse(r.start);
  const e = parse(r.end);
  const fmt = { month: "short", year: "numeric" };
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return s.toLocaleDateString("en-US", fmt);
  return `${s.toLocaleDateString("en-US", fmt)} – ${e.toLocaleDateString("en-US", fmt)}`;
}

export function rangeDisplayLabel(st) {
  if (!st.start || !st.end) return "";
  const opts = { month: "short", day: "numeric", year: "numeric" };
  return `${parse(st.start).toLocaleDateString("en-US", opts)} — ${parse(st.end).toLocaleDateString("en-US", opts)}`;
}

export function compareBadgeLabel(st) {
  if (st.compareMode === COMPARE.NONE || !st.start) return "";
  const r = comparisonRange(st);
  if (!r) return "";
  if (st.compareMode === COMPARE.CUSTOM) {
    const f = { month: "short", day: "numeric" };
    return `vs ${parse(r.start).toLocaleDateString("en-US", f)} – ${parse(r.end).toLocaleDateString("en-US", f)}`;
  }
  if (st.compareMode === COMPARE.QOQ) return `vs ${parse(r.start).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  return `vs ${parse(r.start).getFullYear()}`;
}
