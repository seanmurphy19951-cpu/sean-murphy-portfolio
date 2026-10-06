// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

/* ── one-time Chart.js setup (defaults + annotation plugins) ─────────────── */

const TYPE_COLORS = { promo: "#ffb938", campaign: "#4285f4", product: "#00d084", external: "#ff6b35" };

export function hexToRgba(color, alpha) {
  if (!color) return `rgba(128,128,128,${alpha})`;
  color = color.trim();
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return `rgba(${parseInt(hex.slice(0, 2), 16)},${parseInt(hex.slice(2, 4), 16)},${parseInt(hex.slice(4, 6), 16)},${alpha})`;
  }
  if (color.startsWith("rgb")) {
    const m = color.match(/[\d.]+/g);
    if (m) return `rgba(${m[0]},${m[1]},${m[2]},${alpha})`;
  }
  return color;
}

const promoAnnotationsPlugin = {
  id: "promoAnnotations",
  afterDatasetsDraw(chart) {
    const opts = chart.options.plugins?.promoAnnotations;
    if (!opts || !opts.promos || !opts.dateLabels) return;
    const { promos, dateLabels } = opts;
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const xScale = chart.scales.x;
    if (!xScale || !dateLabels.length) return;
    const half = (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
    for (const promo of promos) {
      let startIdx = -1;
      let endIdx = -1;
      for (let i = 0; i < dateLabels.length; i++) {
        if (dateLabels[i] >= promo.startDate && startIdx === -1) startIdx = i;
        if (dateLabels[i] <= promo.endDate) endIdx = i;
      }
      if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) continue;
      const x1 = Math.max(xScale.getPixelForValue(startIdx) - half, left);
      const x2 = Math.min(xScale.getPixelForValue(endIdx) + half, right);
      if (x1 >= x2) continue;
      const color = promo.color || "#ffb938";
      ctx.save();
      ctx.fillStyle = hexToRgba(color, 0.08);
      ctx.fillRect(x1, top, x2 - x1, bottom - top);
      ctx.strokeStyle = hexToRgba(color, 0.3);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x1, top); ctx.lineTo(x1, bottom); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 8px monospace";
      ctx.fillStyle = hexToRgba(color, 0.7);
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      if (x2 - x1 - 8 > 20) ctx.fillText(promo.name.toUpperCase(), x1 + 4, top + 4, x2 - x1 - 8);
      ctx.restore();
    }
  },
};

const chartAnnotationsPlugin = {
  id: "chartAnnotations",
  afterDatasetsDraw(chart) {
    const opts = chart.options.plugins?.chartAnnotations;
    if (!opts || !opts.annotations || !opts.dateLabels) return;
    const { annotations, dateLabels } = opts;
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const xScale = chart.scales.x;
    if (!xScale) return;
    for (const ann of annotations) {
      const idx = dateLabels.indexOf(ann.date);
      if (idx === -1) continue;
      const x = xScale.getPixelForValue(idx);
      if (x < left || x > right) continue;
      const color = TYPE_COLORS[ann.type] || "#888";
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 0.9; ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(x, top - 4); ctx.lineTo(x + 4, top); ctx.lineTo(x, top + 4); ctx.lineTo(x - 4, top); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  },
};

let ready = false;
function dashEl() {
  return document.querySelector(".dash") || document.documentElement;
}
export function cssVar(name) {
  return getComputedStyle(dashEl()).getPropertyValue(name).trim();
}

export function ensureChartSetup() {
  if (ready) return;
  ready = true;
  Chart.register(...registerables, promoAnnotationsPlugin, chartAnnotationsPlugin);
  const d = Chart.defaults;
  d.font.family = cssVar("--font") || "Inter, sans-serif";
  d.font.size = 12;
  d.color = "#7280a0";
  const t = d.plugins.tooltip;
  t.backgroundColor = "#181818"; t.titleColor = "#ffb938"; t.bodyColor = "#f3efe6";
  t.borderColor = "rgba(255,185,56,0.2)"; t.borderWidth = 1;
  t.titleFont = { size: 10, weight: "600", family: cssVar("--font-mono") || "monospace" };
  t.bodyFont = { size: 13, weight: "700" };
  t.padding = 12; t.cornerRadius = 6; t.displayColors = true; t.boxPadding = 4;
  d.plugins.legend.display = false;
  d.plugins.legend.labels.color = "#7280a0";
  d.elements.line.tension = 0.3; d.elements.line.borderWidth = 2;
  d.elements.point.radius = 0; d.elements.point.hoverRadius = 5; d.elements.point.hoverBorderWidth = 2;
  d.scale.grid.color = "rgba(255,255,255,0.05)";
  d.scale.ticks.padding = 8;
  d.scale.ticks.color = "#aab4cd";
  d.animation.duration = 900;
  d.animation.easing = "easeOutExpo";
}

/* ── palette ─────────────────────────────────────────────────────────────── */

export function channelColor(channel) {
  const map = {
    google: cssVar("--color-google") || "#4285f4",
    meta: cssVar("--color-meta") || "#1877f2",
    shopify: cssVar("--color-shopify") || "#96bf48",
    b2b: cssVar("--color-b2b") || "#ff6b35",
    organic: cssVar("--color-organic") || "#2ec4b6",
    direct: cssVar("--color-direct") || "#9b59b6",
    referral: cssVar("--color-referral") || "#e67e22",
    email: cssVar("--color-email") || "#1abc9c",
  };
  return map[channel] || cssVar("--chart-1") || "#4285f4";
}

export function chartColor(i) {
  const fb = ["#4285f4", "#34a853", "#ff6b35", "#9b59b6", "#e67e22", "#1abc9c", "#e74c3c", "#95a5a6"];
  return cssVar(`--chart-${(i % 8) + 1}`) || fb[i % 8];
}

/* ── config builders (ports of the vanilla chart factory) ────────────────── */

const legendOpts = { position: "top", labels: { usePointStyle: true, padding: 16 } };

function lineConfig({ labels, datasets, dualAxis = false, aspectRatio = 2, promoAnnotations = null, chartAnnotations = null }) {
  const ds = datasets.map((d, i) => {
    const color = d.borderColor || chartColor(i);
    const out = {
      label: d.label,
      data: d.data,
      borderColor: color,
      backgroundColor: d.backgroundColor !== undefined ? d.backgroundColor : hexToRgba(color, 0.1),
      fill: d.fill !== undefined ? d.fill : true,
      borderWidth: d.borderWidth || 2,
      tension: d.tension !== undefined ? d.tension : 0.4,
      pointRadius: d.pointRadius !== undefined ? d.pointRadius : 0,
      pointHoverRadius: d.pointHoverRadius !== undefined ? d.pointHoverRadius : 5,
      yAxisID: dualAxis && i > 0 ? "y1" : "y",
    };
    if (d.borderDash) out.borderDash = d.borderDash;
    return out;
  });
  const scales = { x: { type: "category" }, y: { position: "left" } };
  if (dualAxis) scales.y1 = { position: "right", grid: { display: false } };
  return {
    type: "line",
    data: { labels, datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: legendOpts,
        tooltip: { mode: "index", intersect: false },
        ...(promoAnnotations ? { promoAnnotations } : {}),
        ...(chartAnnotations ? { chartAnnotations } : {}),
      },
      scales,
    },
  };
}

function barConfig({ labels, datasets, horizontal = false, stacked = false, aspectRatio = 2 }) {
  const ds = datasets.map((d, i) => ({
    label: d.label,
    data: d.data,
    backgroundColor: d.backgroundColor || d.colors || chartColor(i),
    borderRadius: d.borderRadius !== undefined ? d.borderRadius : 4,
    borderSkipped: false,
  }));
  return {
    type: "bar",
    data: { labels, datasets: ds },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      plugins: { legend: legendOpts },
      scales: { x: { stacked, grid: { display: false } }, y: { stacked } },
    },
  };
}

function doughnutConfig({ labels, data, colors, centerText = null, aspectRatio = 1 }) {
  const plugins = centerText ? [{
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `bold 18px ${cssVar("--font") || "sans-serif"}`;
      ctx.fillStyle = cssVar("--text-primary") || "#f3efe6";
      ctx.fillText(centerText, (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2);
      ctx.restore();
    },
  }] : [];
  return {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors || labels.map((_, i) => chartColor(i)), borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: "70%",
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, padding: 16 } },
        tooltip: {
          callbacks: {
            label(c) {
              const total = c.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((c.parsed / total) * 100).toFixed(1) : 0;
              return `${c.label}: ${c.formattedValue} (${pct}%)`;
            },
          },
        },
      },
    },
    plugins,
  };
}

function bubbleConfig({ datasets, aspectRatio = 1.5 }) {
  return {
    type: "bubble",
    data: {
      datasets: datasets.map((d, i) => {
        const color = d.backgroundColor || chartColor(i);
        return { label: d.label, data: d.data, backgroundColor: hexToRgba(color, 0.7), borderColor: color, borderWidth: 1 };
      }),
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: legendOpts,
        tooltip: { callbacks: { label(c) { const p = c.raw; return `${c.dataset.label}: CPA $${p.x.toFixed(2)}, ROAS ${p.y.toFixed(2)}x`; } } },
      },
      scales: { x: { title: { display: true, text: "CPA ($)" } }, y: { title: { display: true, text: "ROAS" } } },
    },
  };
}

const lineIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,10 4,6 7,8 10,3 13,5" /></svg>
);
const barIcon = (
  <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="7" width="3" height="6" rx="0.5" /><rect x="5.5" y="4" width="3" height="9" rx="0.5" /><rect x="10" y="1" width="3" height="12" rx="0.5" /></svg>
);

/**
 * A titled chart card. `kind` is line | bar | doughnut | bubble; `spec` is the
 * same shape the vanilla factories took. `toggle` adds the line↔bar switch.
 */
export function ChartCard({ title, subtitle, kind, spec, toggle = false, legend = null }) {
  const canvas = useRef(null);
  const [type, setType] = useState(kind);
  useEffect(() => {
    ensureChartSetup();
    if (!canvas.current) return;
    const cfg = type === "line" ? lineConfig(spec) : type === "bar" ? barConfig(spec) : type === "doughnut" ? doughnutConfig(spec) : bubbleConfig(spec);
    const chart = new Chart(canvas.current, cfg);
    return () => chart.destroy();
  }, [spec, type]);
  return (
    <div className="chart-wrapper">
      {title && <div className="chart-title">{title}</div>}
      {subtitle && <div className="chart-subtitle">{subtitle}</div>}
      <div className="chart-canvas"><canvas ref={canvas} /></div>
      {legend && (
        <div className="chart-legend">
          {legend.map((l) => (
            <span key={l.label} className="chart-legend-item">
              <span className="chart-legend-dot" style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: cssVarSafe(l.colorVar), marginRight: 6, flexShrink: 0 }} />
              <span>{l.label}</span>
            </span>
          ))}
        </div>
      )}
      {toggle && (kind === "line" || kind === "bar") && (
        <button type="button" className="chart-type-toggle" title={`Switch to ${type === "line" ? "bar" : "line"} chart`} onClick={() => setType(type === "line" ? "bar" : "line")}>
          {type === "line" ? barIcon : lineIcon}
        </button>
      )}
    </div>
  );
}

function cssVarSafe(name) {
  return typeof document === "undefined" ? "#888" : cssVar(name);
}

export function Sparkline({ data, color }) {
  const canvas = useRef(null);
  useEffect(() => {
    ensureChartSetup();
    if (!canvas.current) return;
    const chart = new Chart(canvas.current, {
      type: "line",
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, backgroundColor: hexToRgba(color, 0.1), fill: true, borderWidth: 1.5, tension: 0.4, pointRadius: 0, pointHoverRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } },
    });
    return () => chart.destroy();
  }, [data, color]);
  return <div className="kpi-sparkline"><canvas ref={canvas} /></div>;
}
