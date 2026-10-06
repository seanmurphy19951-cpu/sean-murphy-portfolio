import { createBarChart, createDoughnutChart, createScatterChart, getChannelColor, addChartToggle } from '../components/chart-factory.js';
import { createDataTable } from '../components/data-table.js';
import { formatCurrency, formatNumber, formatPercent } from '../formatters.js';

function card(title) {
  const w = document.createElement('div');
  w.className = 'chart-wrapper';
  if (title) w.innerHTML = `<div class="chart-title">${title}</div>`;
  return w;
}

function canvas(id) {
  const c = document.createElement('canvas');
  c.id = id;
  return c;
}

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function renderChannelMix(data, container, compareData = null) {
  const { google, meta, b2b, shopify } = data;

  // ── ROW 1: Channel Comparison Table ─────────────────────────────────────────
  const row1 = card('Channel Performance Comparison');

  // Derive organic row from shopify.revenueBySource
  const organicSource = (shopify.revenueBySource || []).find(
    s => /organic/i.test(s.source)
  ) || { source: 'Organic Search', revenue: 0, orders: 0, percentage: 0 };

  const b2bRoas = b2b.summary.totalPartnerSpend > 0
    ? b2b.summary.revenue / b2b.summary.totalPartnerSpend
    : 0;
  const b2bCPA = b2b.summary.closedDeals > 0
    ? b2b.summary.totalPartnerSpend / b2b.summary.closedDeals
    : 0;

  const tableRows = [
    {
      channel:     { label: 'Google Ads',    badge: 'badge-google'  },
      spend:       google.summary.spend,
      revenue:     google.summary.revenue,
      roas:        google.summary.roas,
      conversions: google.summary.conversions,
      cpa:         google.summary.cpa,
      cpc:         google.summary.cpc,
      ctr:         google.summary.ctr,
    },
    {
      channel:     { label: 'Meta Ads',      badge: 'badge-meta'    },
      spend:       meta.summary.spend,
      revenue:     meta.summary.revenue,
      roas:        meta.summary.roas,
      conversions: meta.summary.conversions,
      cpa:         meta.summary.cpa,
      cpc:         meta.summary.cpc,
      ctr:         meta.summary.ctr,
    },
    {
      channel:     { label: 'B2B Partners',  badge: 'badge-b2b'     },
      spend:       b2b.summary.totalPartnerSpend,
      revenue:     b2b.summary.revenue,
      roas:        b2bRoas,
      conversions: b2b.summary.closedDeals,
      cpa:         b2bCPA,
      cpc:         null, // N/A
      ctr:         null, // N/A
    },
    {
      channel:     { label: 'Organic',       badge: 'badge-organic' },
      spend:       0,
      revenue:     organicSource.revenue,
      roas:        null, // N/A (no spend)
      conversions: organicSource.orders,
      cpa:         null,
      cpc:         null,
      ctr:         null,
    },
  ];

  // Sort by spend descending
  tableRows.sort((a, b) => b.spend - a.spend);

  const tableContainer = document.createElement('div');
  createDataTable(tableContainer, {
    defaultSort: { key: 'spend', dir: 'desc' },
    columns: [
      {
        key: 'channel',
        label: 'Channel',
        render: val => `<span class="badge ${val.badge}">${val.label}</span>`,
        sortValue: val => val.label,
      },
      {
        key: 'spend',
        label: 'Spend',
        render: val => formatCurrency(val),
        sortValue: val => val,
      },
      {
        key: 'revenue',
        label: 'Revenue',
        render: val => formatCurrency(val),
        sortValue: val => val,
      },
      {
        key: 'roas',
        label: 'ROAS',
        type: 'roas',
        render: val => val != null ? val.toFixed(2) + 'x' : '-',
        sortValue: val => val ?? -Infinity,
      },
      {
        key: 'conversions',
        label: 'Conversions',
        render: val => val != null ? formatNumber(val) : '-',
        sortValue: val => val ?? -Infinity,
      },
      {
        key: 'cpa',
        label: 'CPA',
        render: val => val != null ? formatCurrency(val) : '-',
        sortValue: val => val ?? -Infinity,
      },
    ],
    rows: tableRows,
    csvFilename: 'channel-mix',
  });

  row1.appendChild(tableContainer);
  container.appendChild(row1);

  // ── ROW 2: ROAS Bar + Revenue Attribution Doughnut ──────────────────────────
  const row2 = document.createElement('div');
  row2.className = 'grid grid-2';

  const roasCard = card('ROAS by Channel');
  const roasCanvas = canvas('channel-roas');
  roasCard.appendChild(roasCanvas);
  row2.appendChild(roasCard);

  const attrCard = card('Revenue Attribution');
  const attrCanvas = canvas('channel-attribution');
  attrCard.appendChild(attrCanvas);
  row2.appendChild(attrCard);

  container.appendChild(row2);

  // ── ROW 2b: Budget Recommendation + Efficiency Scatter ──────────────────────
  const row2b = document.createElement('div');
  row2b.className = 'grid grid-2';

  // Budget recommendation cards
  const budgetCard = card('Budget Efficiency Ranking');
  const paidChannels = tableRows.filter(r => r.spend > 0 && r.roas != null);
  paidChannels.sort((a, b) => (b.roas || 0) - (a.roas || 0));

  const rankList = document.createElement('div');
  rankList.className = 'budget-rank-list';
  paidChannels.forEach((ch, i) => {
    const item = document.createElement('div');
    item.className = 'budget-rank-item';
    const signal = ch.roas >= 3 ? 'scale' : ch.roas >= 1.5 ? 'maintain' : 'reduce';
    const signalClass = signal === 'scale' ? 'positive' : signal === 'maintain' ? 'neutral' : 'negative';
    item.innerHTML = `
      <span class="budget-rank-pos">#${i + 1}</span>
      <span class="budget-rank-name">${ch.channel.label}</span>
      <span class="budget-rank-roas">${ch.roas.toFixed(2)}x ROAS</span>
      <span class="budget-rank-signal budget-rank-signal--${signalClass}">${signal.toUpperCase()}</span>
    `;
    rankList.appendChild(item);
  });
  budgetCard.appendChild(rankList);
  row2b.appendChild(budgetCard);

  // Efficiency scatter plot
  const scatterCard = card('Channel Efficiency Map');
  const scatterCanvas = canvas('channel-scatter');
  scatterCard.appendChild(scatterCanvas);
  row2b.appendChild(scatterCard);

  container.appendChild(row2b);

  // ── Deferred chart init ────────────────────────────────────────────────────
  setTimeout(() => {
    if (!roasCanvas.isConnected) return;
    const colorGoogle  = getCSSVar('--color-google')  || '#4285f4';
    const colorMeta    = getCSSVar('--color-meta')    || '#1877f2';
    const colorB2B     = getCSSVar('--color-b2b')     || '#f59e0b';
    const colorOrganic = getChannelColor('organic')   || '#34a853';
    const colorDirect  = getChannelColor('direct')    || '#9b59b6';
    const colorEmail   = getChannelColor('email')     || '#e74c3c';
    const colorRef     = getChannelColor('referral')  || '#1abc9c';

    // ROAS horizontal bar chart
    const roasChartData = {
      labels: ['Google Ads', 'Meta Ads', 'B2B Partners'],
      datasets: [
        {
          label: 'ROAS',
          data: [
            google.summary.roas,
            meta.summary.roas,
            b2bRoas,
          ],
          backgroundColor: [colorGoogle, colorMeta, colorB2B],
        },
      ],
      horizontal: true,
    };
    const roasChart = createBarChart(roasCanvas, roasChartData);
    addChartToggle(roasCard, roasChart, 'line', { ...roasChartData, horizontal: false });

    // Revenue Attribution doughnut — map source names to channel colors
    const sourceColorMap = {
      'Paid Search':  colorGoogle,
      'Paid Social':  colorMeta,
      'Organic':      colorOrganic,
      'Organic Search': colorOrganic,
      'Direct':       colorDirect,
      'Email':        colorEmail,
      'Referral':     colorRef,
    };

    const sources = shopify.revenueBySource || [];
    createDoughnutChart(attrCanvas, {
      labels: sources.map(s => s.source),
      data:   sources.map(s => s.revenue),
      colors: sources.map(s => sourceColorMap[s.source] || '#aaa'),
      aspectRatio: 1.5,
    });

    // Efficiency scatter: CPA vs ROAS, bubble size = spend
    if (scatterCanvas.isConnected) {
      const scatterColors = [colorGoogle, colorMeta, colorB2B];
      const scatterData = paidChannels.map((ch, i) => ({
        x: ch.cpa || 0,
        y: ch.roas || 0,
        r: Math.max(Math.sqrt(ch.spend / 500), 5),
      }));
      createScatterChart(scatterCanvas, {
        datasets: paidChannels.map((ch, i) => ({
          label: ch.channel.label,
          data: [scatterData[i]],
          backgroundColor: scatterColors[i] || '#888',
        })),
        aspectRatio: 1.2,
      });
    }
  }, 0);
}
