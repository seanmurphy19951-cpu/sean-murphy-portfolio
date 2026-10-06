import { createKPICard } from '../components/kpi-card.js';
import { createLineChart, createBarChart, createDoughnutChart, getChannelColor, getChartColor, addChartToggle } from '../components/chart-factory.js';
import { createDataTable } from '../components/data-table.js';
import { formatCurrency, formatNumber, formatPercent, formatDelta, formatDate, formatDuration } from '../formatters.js';

function el(tag, cls) { const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function card(title) { const w = el('div','chart-wrapper'); if(title) { const t = el('div','chart-title'); t.textContent = title; w.appendChild(t); } return w; }
function canvas(id) { const c = el('canvas'); c.id = id; return c; }
function grid(cols) { const g = el('div', `grid grid-${cols}`); return g; }

const SOURCE_CHANNEL_MAP = {
  'Paid Search':    'google',
  'Paid Social':    'meta',
  'Organic Search': 'organic',
  'Direct':         'direct',
  'Email':          'email',
  'Referral':       'referral',
};

export function renderShopify(data, container, compareData = null) {
  const s = data.shopify;

  // ── ROW 1: KPI Cards ──────────────────────────────────────────────────────
  const row1 = grid(6);

  const revenueSparkline = s.dailyTimeSeries.map(d => d.revenue);
  const ordersSparkline  = s.dailyTimeSeries.map(d => d.orders);

  createKPICard(row1, {
    label:       'Revenue',
    value:       formatCurrency(s.summary.totalRevenue),
    delta:       formatDelta(s.summary.totalRevenue, s.previousSummary.totalRevenue),
    accentColor: '#96bf48',
    sparkline:   revenueSparkline,
  });

  createKPICard(row1, {
    label:     'Orders',
    value:     formatNumber(s.summary.orders),
    delta:     formatDelta(s.summary.orders, s.previousSummary.orders),
    sparkline: ordersSparkline,
  });

  createKPICard(row1, {
    label:     'Avg Order Value',
    value:     formatCurrency(s.summary.aov),
    subtitle:  'per transaction',
    delta:     formatDelta(s.summary.aov, s.previousSummary.aov),
    sparkline: revenueSparkline,
  });

  createKPICard(row1, {
    label:     'Conversion Rate',
    value:     formatPercent(s.summary.conversionRate),
    subtitle:  'sessions to orders',
    delta:     formatDelta(s.summary.conversionRate, s.previousSummary.conversionRate),
    sparkline: ordersSparkline,
  });

  createKPICard(row1, {
    label:     'Returning Customers',
    value:     formatPercent(s.summary.returningCustomerRate),
    delta:     formatDelta(s.summary.returningCustomerRate, s.previousSummary.returningCustomerRate),
    estimated: true,
  });

  createKPICard(row1, {
    label:       'Refund Rate',
    value:       formatPercent(s.summary.refundRate),
    delta:       formatDelta(s.summary.refundRate, s.previousSummary.refundRate),
    invertDelta: true,
    estimated:   true,
  });

  if (data._comparisonLabel) {
    const disclaimer = document.createElement('div');
    disclaimer.className = 'comparison-disclaimer';
    disclaimer.textContent = `% changes compared to ${data._comparisonLabel}`;
    row1.appendChild(disclaimer);
  }

  container.appendChild(row1);

  // ── ROW 2: Charts ─────────────────────────────────────────────────────────
  const row2 = grid(2);

  const revenueWrapper = card('Daily Revenue');
  const revenueCanvas  = canvas('shopify-revenue');
  revenueWrapper.appendChild(revenueCanvas);
  row2.appendChild(revenueWrapper);

  const sourceWrapper = card('Revenue by Source');
  const sourceCanvas  = canvas('shopify-source');
  sourceWrapper.appendChild(sourceCanvas);
  row2.appendChild(sourceWrapper);

  container.appendChild(row2);

  // ── ROW 2b: New vs Returning Customers Chart ──────────────────────────────
  const newRetWrapper = card('New vs Returning Customers');
  const newRetCanvas = canvas('shopify-new-ret');
  newRetWrapper.appendChild(newRetCanvas);
  container.appendChild(newRetWrapper);

  // ── ROW 3: Top Products Table ──────────────────────────────────────────────
  const row3 = el('div', 'section-row');
  const productsWrapper = card('Top Products');

  createDataTable(productsWrapper, {
    defaultSort: { key: 'revenue', dir: 'desc' },
    columns: [
      { key: 'name',          label: 'Product',    type: 'text' },
      { key: 'sku',           label: 'SKU',        type: 'text', muted: true },
      { key: 'revenue',       label: 'Revenue',    type: 'currency' },
      { key: 'units',         label: 'Units Sold', type: 'number' },
      { key: 'marginPercent', label: 'Margin %',   type: 'percent' },
      { key: 'grossProfit',   label: 'Gross Profit', type: 'currency' },
    ],
    rows: s.topProducts,
    csvFilename: 'top-products',
  });

  row3.appendChild(productsWrapper);
  container.appendChild(row3);

  // ── Deferred chart init ───────────────────────────────────────────────────
  setTimeout(() => {
    if (!revenueCanvas.isConnected) return;

    const dateLabels = s.dailyTimeSeries.map(d => formatDate(d.date));
    const revenueChartData = {
      labels: dateLabels,
      datasets: [{
        label:       'Revenue',
        data:        s.dailyTimeSeries.map(d => d.revenue),
        borderColor: '#96bf48',
        fill:        true,
      }],
      aspectRatio: 2,
    };
    const revenueChart = createLineChart(revenueCanvas, revenueChartData);
    addChartToggle(revenueWrapper, revenueChart, 'bar', revenueChartData);

    const sourceLabels = s.revenueBySource.map(r => r.source);
    const sourceData   = s.revenueBySource.map(r => r.revenue);
    const sourceColors = s.revenueBySource.map(r => getChannelColor(SOURCE_CHANNEL_MAP[r.source] || 'direct'));

    createBarChart(sourceCanvas, {
      labels: sourceLabels,
      datasets: [{
        label:  'Revenue',
        data:   sourceData,
        colors: sourceColors,
      }],
      horizontal: true,
    });

    // New vs Returning stacked bar chart
    if (newRetCanvas.isConnected) {
      const newRetChartData = {
        labels: dateLabels,
        datasets: [
          {
            label: 'New Customers',
            data: s.dailyTimeSeries.map(d => d.newOrders || 0),
            backgroundColor: '#4285f4',
          },
          {
            label: 'Returning Customers',
            data: s.dailyTimeSeries.map(d => d.returningOrders || 0),
            backgroundColor: '#00d084',
          },
        ],
        stacked: true,
        aspectRatio: 3,
      };
      createBarChart(newRetCanvas, newRetChartData);
    }
  }, 0);
}
