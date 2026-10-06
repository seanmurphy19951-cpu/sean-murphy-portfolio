// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { formatCompact, formatCurrency, formatNumber, formatPercent } from "./format";
import { Sparkline } from "./charts";

const fmtValue = (v, format) => {
  if (format === "currency") return formatCurrency(v, true);
  if (format === "percent") return formatPercent(v);
  if (format === "multiplier") return `${Number(v).toFixed(2)}×`;
  return formatCompact ? formatCompact(v) : formatNumber(v);
};

export function Kpi({
  label, value, previous, format, delta, invertDelta, subtitle, estimated, goal,
  accentColor, sparkline, sparklineColor, daysElapsed, daysInPeriod, index = 0,
}) {
  const reduce = useReducedMotion();
  const numeric = typeof value === "number" && !!format;
  const [shown, setShown] = useState(numeric && !reduce ? 0 : value);
  const raf = useRef(0);

  useEffect(() => {
    if (!numeric || reduce) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 700, 1);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, numeric, reduce]);

  let deltaEl = null;
  if (delta && delta.text) {
    let cls = delta.class || "neutral";
    if (invertDelta) cls = cls === "positive" ? "negative" : cls === "negative" ? "positive" : cls;
    deltaEl = <div className={`kpi-delta ${cls}`}>{delta.text}</div>;
  } else if (typeof previous === "number" && typeof value === "number" && previous !== 0) {
    const pct = ((value - previous) / Math.abs(previous)) * 100;
    let cls = Math.abs(pct) < 0.5 ? "neutral" : pct > 0 ? "positive" : "negative";
    if (invertDelta) cls = cls === "positive" ? "negative" : cls === "negative" ? "positive" : cls;
    deltaEl = <div className={`kpi-delta ${cls}`}>{`${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`}</div>;
  }

  let goalEl = null;
  if (goal && typeof value === "number") {
    const pct = Math.min((value / goal) * 100, 120);
    const fill = pct >= 100 ? "hit" : pct >= 80 ? "on-track" : "behind";
    let pace = null;
    if (daysElapsed > 0 && daysInPeriod > daysElapsed) {
      const projected = (value / daysElapsed) * daysInPeriod;
      const projPct = (projected / goal) * 100;
      if (projPct >= 95) {
        pace = <div className="kpi-pace kpi-pace--on">{`On pace for ${Math.round(projPct)}% of goal`}</div>;
      } else {
        const need = (goal - value) / (daysInPeriod - daysElapsed);
        pace = <div className="kpi-pace kpi-pace--behind">{`Behind pace — need ${fmtValue(need, format || "number")}/day`}</div>;
      }
    }
    goalEl = (
      <div className="kpi-goal">
        <div className="kpi-goal-bar"><div className={`kpi-goal-fill ${fill}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
        <div className="kpi-goal-label">{`${Math.round(pct)}% of goal`}</div>
        {pace}
      </div>
    );
  }

  const current = !numeric || reduce ? value : shown;
  const display = typeof current === "number" && format ? fmtValue(current, format) : current;

  return (
    <div className="kpi-card" style={{ animationDelay: `${index * 80}ms` }}>
      {accentColor && <div className="kpi-accent" style={{ background: accentColor }} />}
      <div className="kpi-label">{label}{estimated && <span className="kpi-estimated">EST</span>}</div>
      <div className="kpi-value">{display}</div>
      {deltaEl}
      {subtitle && <div className="kpi-sub">{subtitle}</div>}
      {goalEl}
      {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} color={sparklineColor || accentColor || "#ffb938"} />}
    </div>
  );
}

/* ── table ───────────────────────────────────────────────────────────────── */

const NUMERIC = new Set(["number", "currency", "percent", "roas"]);

function exportCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function cellText(col, val) {
  if (val == null) return "-";
  switch (col.type) {
    case "currency": return formatCurrency(val);
    case "percent": return formatPercent(val);
    case "number": return typeof val === "number" ? formatNumber(val) : val;
    case "roas": return `${Number(val).toFixed(2)}x`;
    default: return String(val);
  }
}

export function DataTable({ title, subtitle, columns, rows, defaultSort, csvFilename, rowClass }) {
  const [sort, setSort] = useState(() => {
    if (!defaultSort) return null;
    return { key: defaultSort.key, dir: defaultSort.dir || defaultSort.direction || "asc" };
  });

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = (r) => {
      if (col.sortValue) return col.sortValue(r);
      const v = r[col.key];
      if (NUMERIC.has(col.type)) return parseFloat(v) || 0;
      return String(v ?? "").toLowerCase();
    };
    const m = sort.dir === "desc" ? -1 : 1;
    return [...rows].sort((a, b) => {
      const x = get(a), y = get(b);
      return x < y ? -m : x > y ? m : 0;
    });
  }, [rows, columns, sort]);

  const toggle = (key) =>
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const renderCell = (col, row) => {
    const val = row[col.key];
    if (col.render) return col.render(val, row);
    if (col.badge) {
      const b = col.badge(row);
      return <span className={`badge ${b.cls}`}>{b.text}</span>;
    }
    if (col.type === "badge") {
      return <span className={`badge badge-${String(val).toLowerCase().replace(/\s+/g, "-")}`}>{val}</span>;
    }
    if (col.type === "qs") {
      const q = Number(val);
      return <span className={`qs-indicator ${q >= 7 ? "qs-good" : q >= 5 ? "qs-ok" : "qs-bad"}`}>{val}</span>;
    }
    if (col.type === "roas") {
      if (val == null) return "-";
      const r = Number(val);
      return <span className={r >= 2 ? "highlight-positive" : r < 1.5 ? "highlight-negative" : undefined}>{`${r.toFixed(2)}x`}</span>;
    }
    return cellText(col, val);
  };

  return (
    <div className="card" style={{ position: "relative" }}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      {csvFilename && (
        <button
          type="button"
          className="csv-export-btn"
          title="Export CSV"
          onClick={() =>
            exportCSV(
              csvFilename,
              columns.map((c) => c.label),
              sorted.map((r) => columns.map((c) => cellText(c, r[c.key]))),
            )
          }
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M2.5 13.5h11" /></svg>
        </button>
      )}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort && sort.key === c.key;
                return (
                  <th key={c.key} className={active ? "sorted" : undefined} style={{ textAlign: c.align || (NUMERIC.has(c.type) ? "right" : "left"), cursor: "pointer" }} onClick={() => toggle(c.key)}>
                    {c.label}{" "}
                    <span className="sort-icon" style={active ? undefined : { opacity: 0.3 }}>{active && sort.dir === "desc" ? "▼" : "▲"}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className={rowClass ? rowClass(row) : undefined}>
                {columns.map((c) => (
                  <td key={c.key} className={[NUMERIC.has(c.type) ? "num" : "", c.muted ? "muted" : "", c.colorClass ? c.colorClass(row) : ""].filter(Boolean).join(" ") || undefined}>
                    {renderCell(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── funnel / insights ───────────────────────────────────────────────────── */

export function Funnel({ title, steps }) {
  const first = steps[0]?.value || 1;
  return (
    <div className="card">
      {title && <div className="card-header"><h3 className="card-title">{title}</h3></div>}
      <div className="funnel">
        {steps.map((s) => (
          <div className="funnel-step" key={s.label}>
            <div className="funnel-label">{s.label}</div>
            <div className="funnel-bar-container">
              <div className="funnel-bar" style={{ width: `${(s.value / first) * 100}%`, backgroundColor: s.color }}>{formatNumber(s.value)}</div>
            </div>
            <div className="funnel-value">{formatNumber(s.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ICONS = { positive: "✓", warning: "!", critical: "✗" };

export function InsightCard({ insight }) {
  return (
    <div className={`insight-card ${insight.type}`}>
      <div className="insight-icon">{ICONS[insight.type] || "•"}</div>
      <div className="insight-content">
        <div className="insight-channel">{insight.channel}</div>
        <div className="insight-message">{insight.message}</div>
        {insight.detail && <div className="insight-detail">{insight.detail}</div>}
      </div>
    </div>
  );
}

const GROUPS = [
  { type: "critical", label: "Action Required", prefix: "!", bg: "--negative-bg", fg: "--negative" },
  { type: "warning", label: "Watch", prefix: "~", bg: "--warning-bg", fg: "--warning" },
  { type: "positive", label: "Wins", prefix: "✓", bg: "--positive-bg", fg: "--positive" },
];

export function InsightsView({ insights }) {
  if (!insights || !insights.length) return <p className="no-data">No significant insights generated</p>;
  return (
    <>
      {GROUPS.map((g) => {
        const items = insights.filter((i) => i.type === g.type);
        if (!items.length) return null;
        return (
          <div className="insights-group" key={g.type}>
            <div className="insights-group-title">
              <span className="insights-group-prefix">{g.prefix}</span>
              {g.label}
              <span className="count" style={{ background: `var(${g.bg})`, color: `var(${g.fg})` }}>{items.length}</span>
            </div>
            <div className="grid" style={{ gap: "var(--space-md)" }}>
              {items.map((it, i) => <InsightCard key={i} insight={it} />)}
            </div>
          </div>
        );
      })}
    </>
  );
}
