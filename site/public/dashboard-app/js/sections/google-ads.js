import { createKPICard } from '../components/kpi-card.js';
import { createLineChart, createBarChart, createDoughnutChart, getChannelColor, getChartColor, addChartToggle } from '../components/chart-factory.js';
import { createDataTable } from '../components/data-table.js';
import { formatCurrency, formatNumber, formatPercent, formatDelta, formatDate, formatDuration } from '../formatters.js';

function el(tag, cls) { const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function card(title) { const w = el('div','chart-wrapper'); if(title) { const t = el('div','chart-title'); t.textContent = title; w.appendChild(t); } return w; }
function canvas(id) { const c = el('canvas'); c.id = id; return c; }
function grid(cols) { const g = el('div', `grid grid-${cols}`); return g; }

const TYPE_BADGE = {
  search:   'badge-search',
  shopping: 'badge-shopify',
  pmax:     'badge-b2b',
  display:  'badge-social',
};

const MATCH_BADGE = {
  exact:  'badge-search',
  phrase: 'badge-google',
  broad:  'badge-organic',
};

export function renderGoogleAds(data, container, compareData = null) {
  const g = data.google;

  // ── ROW 1: KPI Cards ──────────────────────────────────────────────────────
  const row1 = grid(4);

  const spendSparkline = g.dailyTimeSeries.map(d => d.spend);
  const convSparkline  = g.dailyTimeSeries.map(d => d.conversions);

  createKPICard(row1, {
    label:        'Spend',
    value:        formatCurrency(g.summary.spend),
    delta:        formatDelta(g.summary.spend, g.previousSummary.spend),
    invertDelta:  true,
    accentColor:  '#4285f4',
    sparkline:    spendSparkline,
  });

  createKPICard(row1, {
    label:     'ROAS',
    value:     `${g.summary.roas.toFixed(2)}×`,
    delta:     formatDelta(g.summary.roas, g.previousSummary.roas),
    sparkline: convSparkline,
  });

  createKPICard(row1, {
    label:     'Revenue',
    value:     formatCurrency(g.summary.revenue),
    delta:     formatDelta(g.summary.revenue, g.previousSummary.revenue),
    sparkline: convSparkline,
  });

  createKPICard(row1, {
    label:     'Clicks',
    value:     formatNumber(g.summary.clicks),
    delta:     formatDelta(g.summary.clicks, g.previousSummary.clicks),
    sparkline: g.dailyTimeSeries.map(d => d.clicks),
  });

  if (data._comparisonLabel) {
    const disclaimer = el('div', 'comparison-disclaimer');
    disclaimer.textContent = `% changes compared to ${data._comparisonLabel}`;
    row1.appendChild(disclaimer);
  }

  container.appendChild(row1);

  // ── ROW 2: Campaign Performance Table ─────────────────────────────────────
  const row2 = el('div', 'section-row');
  const tableWrapper = card('Campaign Performance');

  createDataTable(tableWrapper, {
    defaultSort: { key: 'spend', dir: 'desc' },
    columns: [
      {
        key:    'name',
        label:  'Campaign',
        type:   'text',
      },
      {
        key:   'type',
        label: 'Type',
        type:  'badge',
        badge: row => ({ text: row.type.charAt(0).toUpperCase() + row.type.slice(1), cls: TYPE_BADGE[row.type] || 'badge-search' }),
      },
      {
        key:   'status',
        label: 'Status',
        type:  'badge',
        badge: row => ({ text: row.status.charAt(0).toUpperCase() + row.status.slice(1), cls: row.status === 'active' ? 'badge-active' : 'badge-paused' }),
      },
      { key: 'spend',       label: 'Spend',       type: 'currency' },
      { key: 'clicks',      label: 'Clicks',      type: 'number' },
      { key: 'conversions', label: 'Conversions', type: 'number' },
      { key: 'cpa',         label: 'CPA',         type: 'currency' },
      { key: 'roas',        label: 'ROAS',        type: 'roas' },
    ],
    rows: g.campaigns,
    csvFilename: 'google-campaigns',
    rowClass: (row) => {
      if (row.roas < 1.0) return 'row-alert row-alert--critical';
      if (row.cpa > g.summary.cpa * 2) return 'row-alert row-alert--warning';
      return null;
    },
  });

  row2.appendChild(tableWrapper);
  container.appendChild(row2);

  // ── ROW 3: Charts ─────────────────────────────────────────────────────────
  const row3 = grid(2);

  // Left: Daily Performance dual-axis line chart
  const dailyWrapper = card('Daily Performance');
  const dailyCanvas  = canvas('google-daily');
  dailyWrapper.appendChild(dailyCanvas);

  row3.appendChild(dailyWrapper);

  // Right: Spend by Campaign Type doughnut
  const donutWrapper = card('Spend by Campaign Type');
  const donutCanvas  = canvas('google-type-donut');
  donutWrapper.appendChild(donutCanvas);

  row3.appendChild(donutWrapper);
  container.appendChild(row3);

  // ── ROW 4: Top Keywords Table ──────────────────────────────────────────────
  const row4 = el('div', 'section-row');
  const kwWrapper = card('Top Keywords');

  createDataTable(kwWrapper, {
    defaultSort: { key: 'conversions', dir: 'desc' },
    columns: [
      { key: 'keyword',   label: 'Keyword',    type: 'text' },
      {
        key:   'matchType',
        label: 'Match Type',
        type:  'badge',
        badge: row => ({
          text: row.matchType.charAt(0).toUpperCase() + row.matchType.slice(1),
          cls:  MATCH_BADGE[row.matchType] || 'badge-search',
        }),
      },
      { key: 'impressions',   label: 'Impressions', type: 'number' },
      { key: 'clicks',        label: 'Clicks',      type: 'number' },
      { key: 'ctr',           label: 'CTR',         type: 'percent' },
      { key: 'cpc',           label: 'CPC',         type: 'currency' },
      { key: 'conversions',   label: 'Conversions', type: 'number' },
      { key: 'qualityScore',  label: 'QS',          type: 'qs' },
    ],
    rows: g.topKeywords,
    csvFilename: 'google-keywords',
  });

  row4.appendChild(kwWrapper);
  container.appendChild(row4);

  // ── Deferred chart init ───────────────────────────────────────────────────
  setTimeout(() => {
    if (!dailyCanvas.isConnected) return;

    const dateLabels = g.dailyTimeSeries.map(d => formatDate(d.date));
    const datasets = [
      { label: 'Spend',       data: g.dailyTimeSeries.map(d => d.spend),       borderColor: '#4285f4' },
      { label: 'Conversions', data: g.dailyTimeSeries.map(d => d.conversions), borderColor: '#34a853' },
    ];

    // Overlay comparison data as dashed lines
    if (compareData && compareData.google) {
      const cg = compareData.google;
      datasets.push(
        { label: 'Spend (Compare)',       data: cg.dailyTimeSeries.map(d => d.spend),       borderColor: '#4285f4', borderDash: [5,4], fill: false, pointRadius: 0, backgroundColor: 'transparent' },
        { label: 'Conversions (Compare)', data: cg.dailyTimeSeries.map(d => d.conversions), borderColor: '#34a853', borderDash: [5,4], fill: false, pointRadius: 0, backgroundColor: 'transparent' },
      );
    }

    const dailyChartData = {
      labels:   dateLabels,
      datasets,
      dualAxis: true,
    };
    const dailyChart = createLineChart(dailyCanvas, dailyChartData);
    addChartToggle(dailyWrapper, dailyChart, 'bar', dailyChartData);

    const typeOrder  = ['search', 'shopping', 'pmax', 'display'];
    const typeLabels = ['Search', 'Shopping', 'PMax', 'Display'];
    const typeColors = ['#4285f4', '#34a853', '#ff6b35', '#9b59b6'];
    const typeSpend  = typeOrder.map(type =>
      g.campaigns.filter(c => c.type === type).reduce((s, c) => s + c.spend, 0)
    );

    createDoughnutChart(donutCanvas, {
      labels: typeLabels,
      data:   typeSpend,
      colors: typeColors,
    });
  }, 0);
}
