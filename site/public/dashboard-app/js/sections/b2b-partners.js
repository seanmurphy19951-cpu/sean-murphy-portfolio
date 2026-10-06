import { createKPICard } from '../components/kpi-card.js';
import { createLineChart, createBarChart, createDoughnutChart, getChannelColor, getChartColor } from '../components/chart-factory.js';
import { createDataTable } from '../components/data-table.js';
import { formatCurrency, formatNumber, formatPercent, formatDelta, formatDate, formatDuration } from '../formatters.js';

function el(tag, cls) { const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function card(title) { const w = el('div','chart-wrapper'); if(title) { const t = el('div','chart-title'); t.textContent = title; w.appendChild(t); } return w; }
function canvas(id) { const c = el('canvas'); c.id = id; return c; }
function grid(cols) { const g = el('div', `grid grid-${cols}`); return g; }

function roiColor(roi) {
  if (roi >= 5)  return '#34a853';
  if (roi >= 3)  return '#7ab648';
  if (roi >= 2)  return '#f4b400';
  if (roi >= 1)  return '#ff8c42';
  return '#ff6b35';
}

export function renderB2BPartners(data, container, compareData = null) {
  const b = data.b2b;

  // ── ROW 1: KPI Cards ──────────────────────────────────────────────────────
  const row1 = grid(4);

  createKPICard(row1, {
    label:       'Total Leads',
    value:       formatNumber(b.summary.totalLeads),
    delta:       formatDelta(b.summary.totalLeads, b.previousSummary.totalLeads),
    accentColor: '#ff6b35',
  });

  createKPICard(row1, {
    label: 'Closed Deals',
    value: formatNumber(b.summary.closedDeals),
    delta: formatDelta(b.summary.closedDeals, b.previousSummary.closedDeals),
    estimated: true,
  });

  createKPICard(row1, {
    label:    'Pipeline Revenue',
    value:    formatCurrency(b.summary.revenue),
    subtitle: 'from closed deals',
    delta:    formatDelta(b.summary.revenue, b.previousSummary.revenue),
    estimated: true,
  });

  createKPICard(row1, {
    label:    'Avg Deal Size',
    value:    formatCurrency(b.summary.avgDealSize),
    subtitle: 'per closed deal',
    delta:    formatDelta(b.summary.avgDealSize, b.previousSummary.avgDealSize),
    estimated: true,
  });

  if (data._comparisonLabel) {
    const disclaimer = el('div', 'comparison-disclaimer');
    disclaimer.textContent = `% changes compared to ${data._comparisonLabel}`;
    row1.appendChild(disclaimer);
  }

  container.appendChild(row1);

  // ── ROW 2: Partner Performance Table ──────────────────────────────────────
  const row2 = el('div', 'section-row');
  const tableWrapper = card('Partner Performance');

  createDataTable(tableWrapper, {
    defaultSort: { key: 'revenue', dir: 'desc' },
    columns: [
      { key: 'name', label: 'Partner', type: 'text' },
      {
        key:   'type',
        label: 'Type',
        type:  'badge',
        badge: row => ({
          text: row.type.charAt(0).toUpperCase() + row.type.slice(1),
          cls:  'badge-b2b',
        }),
      },
      { key: 'spend',        label: 'Spend',        type: 'currency' },
      { key: 'leads',        label: 'Leads',        type: 'number' },
      { key: 'qualifiedLeads', label: 'Qualified',  type: 'number' },
      { key: 'closedDeals',  label: 'Deals Closed', type: 'number' },
      { key: 'revenue',      label: 'Revenue',      type: 'currency' },
      { key: 'cpl',          label: 'CPL',          type: 'currency' },
      { key: 'roi',          label: 'ROI',          type: 'roas' },
    ],
    rows: b.partners,
    csvFilename: 'b2b-partners',
  });

  row2.appendChild(tableWrapper);
  container.appendChild(row2);

  // ── ROW 3: Partner ROI Comparison horizontal bar chart ────────────────────
  const row3 = el('div', 'section-row');
  const roiWrapper = card('Partner ROI Comparison');

  const roiSubtitle = el('div', 'chart-subtitle');
  roiSubtitle.textContent = 'Higher ROI = better return on partner investment';
  roiWrapper.appendChild(roiSubtitle);

  const roiCanvas = canvas('b2b-roi');
  roiWrapper.appendChild(roiCanvas);

  row3.appendChild(roiWrapper);
  container.appendChild(row3);

  // ── Deferred chart init ───────────────────────────────────────────────────
  setTimeout(() => {
    if (!roiCanvas.isConnected) return;

    const partnerLabels = b.partners.map(p => p.name);
    const partnerRoi    = b.partners.map(p => p.roi);
    const partnerColors = partnerRoi.map(r => roiColor(r));

    createBarChart(roiCanvas, {
      labels: partnerLabels,
      datasets: [{ label: 'ROI', data: partnerRoi, colors: partnerColors }],
      horizontal: true,
    });
  }, 0);
}
