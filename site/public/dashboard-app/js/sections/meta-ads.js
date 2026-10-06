import { createKPICard } from '../components/kpi-card.js';
import { createLineChart, createBarChart, createDoughnutChart, getChannelColor, getChartColor, addChartToggle } from '../components/chart-factory.js';
import { createDataTable } from '../components/data-table.js';
import { formatCurrency, formatNumber, formatPercent, formatDelta, formatDate, formatDuration } from '../formatters.js';

function el(tag, cls) { const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function card(title) { const w = el('div','chart-wrapper'); if(title) { const t = el('div','chart-title'); t.textContent = title; w.appendChild(t); } return w; }
function canvas(id) { const c = el('canvas'); c.id = id; return c; }
function grid(cols) { const g = el('div', `grid grid-${cols}`); return g; }

const OBJECTIVE_BADGE = {
  conversions:   'badge-google',
  catalog_sales: 'badge-shopify',
};

const FORMAT_BADGE = {
  video:    'badge-video',
  image:    'badge-image',
  carousel: 'badge-social',
  dynamic:  'badge-b2b',
};

function roasColor(roas) {
  if (roas >= 2.5) return '#34a853';
  if (roas >= 1.5) return '#f4b400';
  return '#ff6b35';
}

export function renderMetaAds(data, container, compareData = null) {
  const m = data.meta;

  // ── ROW 1: KPI Cards ──────────────────────────────────────────────────────
  const row1 = grid(4);

  const spendSparkline = m.dailyTimeSeries.map(d => d.spend);
  const convSparkline  = m.dailyTimeSeries.map(d => d.conversions);

  createKPICard(row1, {
    label:       'Spend',
    value:       m.summary.spend,
    previous:    m.previousSummary.spend,
    format:      'currency',
    invertDelta: true,
    accentColor: '#1877f2',
    sparkline:   spendSparkline,
  });

  createKPICard(row1, {
    label:    'ROAS',
    value:    m.summary.roas,
    previous: m.previousSummary.roas,
    format:   'multiplier',
    sparkline: convSparkline,
  });

  createKPICard(row1, {
    label:    'Revenue',
    value:    m.summary.revenue,
    previous: m.previousSummary.revenue,
    format:   'currency',
    sparkline: convSparkline,
  });

  createKPICard(row1, {
    label:    'Clicks',
    value:    m.summary.clicks,
    previous: m.previousSummary.clicks,
    format:   'number',
    sparkline:   spendSparkline,
  });

  if (data._comparisonLabel) {
    const disclaimer = el('div', 'comparison-disclaimer');
    disclaimer.textContent = `% changes compared to ${data._comparisonLabel}`;
    row1.appendChild(disclaimer);
  }

  container.appendChild(row1);

  // ── ROW 2: Campaign Table ─────────────────────────────────────────────────
  const row2 = el('div', 'section-row');
  const tableWrapper = card('Campaign Performance');

  createDataTable(tableWrapper, {
    defaultSort: { key: 'spend', dir: 'desc' },
    columns: [
      { key: 'name', label: 'Campaign', type: 'text' },
      {
        key:   'objective',
        label: 'Objective',
        type:  'badge',
        badge: row => ({
          text: row.objective.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
          cls:  OBJECTIVE_BADGE[row.objective] || 'badge-search',
        }),
      },
      {
        key:   'status',
        label: 'Status',
        type:  'badge',
        badge: row => ({
          text: row.status.charAt(0).toUpperCase() + row.status.slice(1),
          cls:  row.status === 'active' ? 'badge-active' : 'badge-paused',
        }),
      },
      { key: 'spend',       label: 'Spend',       type: 'currency' },
      { key: 'reach',       label: 'Reach',       type: 'number' },
      { key: 'clicks',      label: 'Clicks',      type: 'number' },
      { key: 'conversions', label: 'Conversions', type: 'number' },
      { key: 'cpa',         label: 'CPA',         type: 'currency' },
      { key: 'roas',        label: 'ROAS',        type: 'roas' },
    ],
    rows: m.campaigns,
    csvFilename: 'meta-campaigns',
    rowClass: (row) => {
      if (row.roas < 1.0) return 'row-alert row-alert--critical';
      if (row.cpa > m.summary.cpa * 2) return 'row-alert row-alert--warning';
      return null;
    },
  });

  row2.appendChild(tableWrapper);
  container.appendChild(row2);

  // ── ROW 3: Charts ─────────────────────────────────────────────────────────
  const row3 = grid(2);

  // Left: Audience ROAS horizontal bar chart
  const audienceWrapper = card('Audience ROAS');
  const audienceCanvas  = canvas('meta-audience');
  audienceWrapper.appendChild(audienceCanvas);

  row3.appendChild(audienceWrapper);

  // Right: Creative Performance grouped bar chart (CTR vs Conversion Rate by format)
  const creativeWrapper = card('Creative Performance by Format');
  const creativeCanvas  = canvas('meta-creative');
  creativeWrapper.appendChild(creativeCanvas);

  row3.appendChild(creativeWrapper);
  container.appendChild(row3);

  // ── ROW 4: Creative Performance Table ─────────────────────────────────────
  const row4 = el('div', 'section-row');
  const creativeTableWrapper = card('Creative Performance');

  const subtitle = el('div', 'chart-subtitle');
  subtitle.textContent = 'Thumb Stop Rate: % of viewers who stop scrolling to watch';
  creativeTableWrapper.appendChild(subtitle);

  createDataTable(creativeTableWrapper, {
    defaultSort: { key: 'conversions', dir: 'desc' },
    columns: [
      { key: 'name', label: 'Creative', type: 'text' },
      {
        key:   'format',
        label: 'Format',
        type:  'badge',
        badge: row => ({
          text: row.format.charAt(0).toUpperCase() + row.format.slice(1),
          cls:  FORMAT_BADGE[row.format] || 'badge-image',
        }),
      },
      { key: 'spend',        label: 'Spend',          type: 'currency' },
      { key: 'impressions',  label: 'Impressions',    type: 'number' },
      { key: 'ctr',          label: 'CTR',            type: 'percent' },
      { key: 'conversions',  label: 'Conversions',    type: 'number' },
      { key: 'thumbStopRate', label: 'Thumb Stop Rate', type: 'percent' },
    ],
    rows: m.creativePerformance,
    csvFilename: 'meta-creatives',
  });

  row4.appendChild(creativeTableWrapper);
  container.appendChild(row4);

  // ── ROW 5: Audience Performance Table ─────────────────────────────────────
  if (m.audiences && m.audiences.length > 0) {
    const audienceTableWrapper = document.createElement('div');
    createDataTable(audienceTableWrapper, {
      columns: [
        { key: 'name',        label: 'Audience',    type: 'text' },
        { key: 'spend',       label: 'Spend',       type: 'currency' },
        { key: 'conversions', label: 'Conversions', type: 'number' },
        { key: 'cpa',         label: 'CPA',         type: 'currency' },
        { key: 'roas',        label: 'ROAS',        type: 'roas' },
      ],
      rows: m.audiences,
      csvFilename: 'meta-audiences',
      defaultSort: { key: 'roas', direction: 'desc' },
    });
    container.appendChild(audienceTableWrapper);
  }

  // ── Deferred chart init ───────────────────────────────────────────────────
  setTimeout(() => {
    if (!audienceCanvas.isConnected) return;

    const audienceLabels = m.audiences.map(a => a.name.length > 28 ? a.name.slice(0, 26) + '…' : a.name);
    const audienceRoas   = m.audiences.map(a => a.roas);
    const audienceColors = audienceRoas.map(r => roasColor(r));

    createBarChart(audienceCanvas, {
      labels:      audienceLabels,
      datasets: [{ label: 'ROAS', data: audienceRoas, backgroundColor: audienceColors }],
      horizontal: true,
    });

    const formats = ['video', 'carousel', 'image', 'dynamic'];
    const formatLabels = ['Video', 'Carousel', 'Image', 'Dynamic'];
    const formatStats = formats.map(fmt => {
      const items = m.creativePerformance.filter(c => c.format === fmt);
      if (!items.length) return { ctr: 0, convRate: 0 };
      const totalClicks      = items.reduce((s, c) => s + c.clicks, 0);
      const totalConversions = items.reduce((s, c) => s + c.conversions, 0);
      const totalImpressions = items.reduce((s, c) => s + c.impressions, 0);
      return {
        ctr:      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        convRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
      };
    });

    const creativeChartData = {
      labels: formatLabels,
      datasets: [
        { label: 'CTR %',        data: formatStats.map(f => parseFloat(f.ctr.toFixed(2))),      backgroundColor: '#1877f2' },
        { label: 'Conv. Rate %', data: formatStats.map(f => parseFloat(f.convRate.toFixed(2))), backgroundColor: '#42b72a' },
      ],
    };
    const creativeChart = createBarChart(creativeCanvas, creativeChartData);
    addChartToggle(creativeWrapper, creativeChart, 'line', creativeChartData);
  }, 0);
}
