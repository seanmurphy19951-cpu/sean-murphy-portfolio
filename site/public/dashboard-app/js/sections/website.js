import { createKPICard } from '../components/kpi-card.js';
import { createLineChart, createBarChart, createDoughnutChart, getChannelColor, getChartColor, addChartToggle } from '../components/chart-factory.js';
import { createDataTable } from '../components/data-table.js';
import { formatCurrency, formatNumber, formatPercent, formatDelta, formatDate, formatDuration } from '../formatters.js';

function el(tag, cls) { const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function card(title) { const w = el('div','chart-wrapper'); if(title) { const t = el('div','chart-title'); t.textContent = title; w.appendChild(t); } return w; }
function canvas(id) { const c = el('canvas'); c.id = id; return c; }
function grid(cols) { const g = el('div', `grid grid-${cols}`); return g; }

const CHANNEL_MAP = {
  'Paid Search':    'google',
  'Paid Social':    'meta',
  'Organic Search': 'organic',
  'Direct':         'direct',
  'Referral':       'referral',
  'Email':          'email',
};

const DEVICE_COLORS = ['#4285f4', '#34a853', '#ff6b35'];

export function renderWebsite(data, container, compareData = null) {
  const w = data.website;

  // ── ROW 1: KPI Cards ──────────────────────────────────────────────────────
  const row1 = grid(4);

  const sessionsSparkline = w.dailyTimeSeries.map(d => d.sessions);
  const usersSparkline    = w.dailyTimeSeries.map(d => d.users);

  createKPICard(row1, {
    label:       'Sessions',
    value:       formatNumber(w.summary.sessions),
    delta:       formatDelta(w.summary.sessions, w.previousSummary.sessions),
    accentColor: '#2ec4b6',
    sparkline:   sessionsSparkline,
  });

  createKPICard(row1, {
    label:     'Users',
    value:     formatNumber(w.summary.users),
    delta:     formatDelta(w.summary.users, w.previousSummary.users),
    sparkline: usersSparkline,
  });

  createKPICard(row1, {
    label:       'Bounce Rate',
    value:       formatPercent(w.summary.bounceRate),
    subtitle:    'lower is better',
    delta:       formatDelta(w.summary.bounceRate, w.previousSummary.bounceRate),
    invertDelta: true,
    sparkline:   sessionsSparkline,
  });

  createKPICard(row1, {
    label:     'Avg Session Duration',
    value:     formatDuration(w.summary.avgSessionDuration),
    subtitle:  'minutes:seconds',
    delta:     formatDelta(w.summary.avgSessionDuration, w.previousSummary.avgSessionDuration),
    sparkline: sessionsSparkline,
  });

  if (data._comparisonLabel) {
    const disclaimer = el('div', 'comparison-disclaimer');
    disclaimer.textContent = `% changes compared to ${data._comparisonLabel}`;
    row1.appendChild(disclaimer);
  }

  container.appendChild(row1);

  // ── ROW 2: Charts ─────────────────────────────────────────────────────────
  const row2 = grid(2);

  // Left: Traffic by Channel horizontal bar chart
  const trafficWrapper = card('Traffic by Channel');
  const trafficCanvas  = canvas('website-traffic');
  trafficWrapper.appendChild(trafficCanvas);

  row2.appendChild(trafficWrapper);

  // Right: Device Breakdown doughnut chart
  const deviceWrapper = card('Device Breakdown');
  const deviceCanvas  = canvas('website-device');
  deviceWrapper.appendChild(deviceCanvas);

  row2.appendChild(deviceWrapper);
  container.appendChild(row2);

  // ── ROW 3: Landing Page Performance Table ─────────────────────────────────
  const row3 = el('div', 'section-row');
  const pagesWrapper = card('Landing Page Performance');

  createDataTable(pagesWrapper, {
    defaultSort: { key: 'sessions', dir: 'desc' },
    columns: [
      { key: 'title',          label: 'Page',            type: 'text' },
      { key: 'path',           label: 'Path',            type: 'text', muted: true },
      { key: 'sessions',       label: 'Sessions',        type: 'number' },
      {
        key:   'bounceRate',
        label: 'Bounce Rate',
        type:  'percent',
        colorClass: row => row.bounceRate > 50 ? 'highlight-negative' : '',
      },
      {
        key:   'conversionRate',
        label: 'Conversion Rate',
        type:  'percent',
        colorClass: row => row.conversionRate > 4 ? 'highlight-positive' : '',
      },
      { key: 'avgDuration', label: 'Avg Duration', type: 'number' },
    ],
    rows: w.topLandingPages,
    csvFilename: 'landing-pages',
  });

  row3.appendChild(pagesWrapper);
  container.appendChild(row3);

  // ── ROW 4: Daily Sessions & Users dual-axis line chart ────────────────────
  const row4 = el('div', 'section-row');
  const sessionsWrapper = card('Daily Sessions & Users');
  const sessionsCanvas  = canvas('website-sessions');
  sessionsWrapper.appendChild(sessionsCanvas);

  row4.appendChild(sessionsWrapper);
  container.appendChild(row4);

  // ── Deferred chart init ───────────────────────────────────────────────────
  setTimeout(() => {
    if (!trafficCanvas.isConnected) return;

    const channelLabels   = w.trafficByChannel.map(c => c.channel);
    const channelSessions = w.trafficByChannel.map(c => c.sessions);
    const channelColors   = w.trafficByChannel.map(c => getChannelColor(CHANNEL_MAP[c.channel] || 'direct'));

    createBarChart(trafficCanvas, {
      labels: channelLabels,
      datasets: [{ label: 'Sessions', data: channelSessions, colors: channelColors }],
      horizontal: true,
    });

    const deviceLabels = w.deviceBreakdown.map(d => d.device);
    const deviceData   = w.deviceBreakdown.map(d => d.sessions);
    const totalSessionsCompact = w.summary.sessions >= 1000
      ? `${(w.summary.sessions / 1000).toFixed(0)}K`
      : String(w.summary.sessions);

    createDoughnutChart(deviceCanvas, {
      labels:     deviceLabels,
      data:       deviceData,
      colors:     DEVICE_COLORS,
      centerText: totalSessionsCompact,
    });

    const dateLabels = w.dailyTimeSeries.map(d => formatDate(d.date));
    const sessionsChartData = {
      labels: dateLabels,
      datasets: [
        { label: 'Sessions', data: w.dailyTimeSeries.map(d => d.sessions), borderColor: '#2ec4b6' },
        { label: 'Users',    data: w.dailyTimeSeries.map(d => d.users),    borderColor: '#4285f4' },
      ],
      dualAxis:    true,
      aspectRatio: 2.5,
    };
    const sessionsChart = createLineChart(sessionsCanvas, sessionsChartData);
    addChartToggle(sessionsWrapper, sessionsChart, 'bar', sessionsChartData);
  }, 0);
}
