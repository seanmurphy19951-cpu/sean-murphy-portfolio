import { createLineChart, getChannelColor, getCSSVar, addChartToggle } from '../components/chart-factory.js';
import { formatDate, formatCurrency, formatNumber } from '../formatters.js';
import { getPromosInRange } from '../components/promo-annotations.js';
import { getAnnotationsInRange } from '../components/chart-annotations.js';

export function renderTrends(data, container, compareData = null) {
  const { computed } = data;
  container.innerHTML = '';

  const labels = compareData
    ? computed.dailyMerged.map((d, i) => `Day ${i + 1}`)
    : computed.dailyMerged.map(d => formatDate(d.date));

  // --- Intro description card ---
  const intro = document.createElement('div');
  intro.className = 'card intro-card';
  const dayCount = computed.dailyMerged.length;
  intro.textContent =
    `Cross-channel performance over the ${dayCount}-day reporting period. Toggle series to compare channels.`;
  container.appendChild(intro);

  // -----------------------------------------------------------------------
  // SECTION 1: Revenue & Spend Trends
  // -----------------------------------------------------------------------
  const revenueWrapper = buildChartWrapper('Revenue & Spend by Day', 'trends-revenue');
  container.appendChild(revenueWrapper);

  const revenueDatasets = [
    {
      label:           'Total Revenue',
      data:            computed.dailyMerged.map(d => d.revenue),
      borderColor:     getCSSVar('--color-shopify'),
      backgroundColor: 'transparent',
      fill:            false,
      tension:         0.3,
      pointRadius:     2,
      pointHoverRadius: 5,
    },
    {
      label:           'Google Spend',
      data:            computed.dailyMerged.map(d => d.googleSpend),
      borderColor:     getCSSVar('--color-google'),
      backgroundColor: 'transparent',
      fill:            false,
      tension:         0.3,
      pointRadius:     2,
      pointHoverRadius: 5,
    },
    {
      label:           'Meta Spend',
      data:            computed.dailyMerged.map(d => d.metaSpend),
      borderColor:     getCSSVar('--color-meta'),
      backgroundColor: 'transparent',
      fill:            false,
      tension:         0.3,
      pointRadius:     2,
      pointHoverRadius: 5,
    },
  ];

  // YoY overlays for revenue chart
  if (compareData) {
    const compDaily = compareData.computed.dailyMerged;
    revenueDatasets.push({
      label: 'Revenue (Compare)',
      data: compDaily.map(d => d.revenue),
      borderColor: getCSSVar('--color-shopify'),
      backgroundColor: 'transparent',
      borderDash: [5, 4],
      borderWidth: 1.5,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
    });
    revenueDatasets.push({
      label: 'Google Spend (Compare)',
      data: compDaily.map(d => d.googleSpend),
      borderColor: getCSSVar('--color-google'),
      backgroundColor: 'transparent',
      borderDash: [5, 4],
      borderWidth: 1.5,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
    });
  }

  appendLegend(revenueWrapper, [
    { label: 'Total Revenue', colorVar: '--color-shopify' },
    { label: 'Google Spend',  colorVar: '--color-google'  },
    { label: 'Meta Spend',    colorVar: '--color-meta'    },
  ]);

  // -----------------------------------------------------------------------
  // SECTION 2: Conversions Trend
  // -----------------------------------------------------------------------
  const conversionsWrapper = buildChartWrapper('Daily Conversions by Channel', 'trends-conversions');
  container.appendChild(conversionsWrapper);

  const googleColor = getCSSVar('--color-google');
  const metaColor   = getCSSVar('--color-meta');

  const conversionsDatasets = [
    {
      label:           'Google Conversions',
      data:            computed.dailyMerged.map(d => d.googleConversions),
      borderColor:     googleColor,
      backgroundColor: hexToRgba(googleColor, 0.1),
      fill:            true,
      tension:         0.3,
      pointRadius:     2,
      pointHoverRadius: 5,
    },
    {
      label:           'Meta Conversions',
      data:            computed.dailyMerged.map(d => d.metaConversions),
      borderColor:     metaColor,
      backgroundColor: hexToRgba(metaColor, 0.1),
      fill:            true,
      tension:         0.3,
      pointRadius:     2,
      pointHoverRadius: 5,
    },
  ];

  // YoY overlays for conversions chart
  if (compareData) {
    const compDaily = compareData.computed.dailyMerged;
    conversionsDatasets.push({
      label: 'Google Conv (Compare)',
      data: compDaily.map(d => d.googleConversions),
      borderColor: googleColor,
      backgroundColor: 'transparent',
      borderDash: [5, 4],
      borderWidth: 1.5,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
    });
    conversionsDatasets.push({
      label: 'Meta Conv (Compare)',
      data: compDaily.map(d => d.metaConversions),
      borderColor: metaColor,
      backgroundColor: 'transparent',
      borderDash: [5, 4],
      borderWidth: 1.5,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
    });
  }

  appendLegend(conversionsWrapper, [
    { label: 'Google Conversions', colorVar: '--color-google' },
    { label: 'Meta Conversions',   colorVar: '--color-meta'   },
  ]);

  // Sessions trend removed — see Website section for Sessions & Users chart

  // Build promo annotation config for charts
  const dateLabels = computed.dailyMerged.map(d => d.date);
  const promos = data.promos || [];
  const startDate = dateLabels[0];
  const endDate = dateLabels[dateLabels.length - 1];
  const visiblePromos = getPromosInRange(promos, startDate, endDate);
  const promoAnnotations = visiblePromos.length > 0 ? { promos: visiblePromos, dateLabels } : null;

  const annotations = data.annotations || [];
  const visibleAnnotations = getAnnotationsInRange(annotations, startDate, endDate);
  const chartAnnotations = visibleAnnotations.length > 0 ? { annotations: visibleAnnotations, dateLabels } : null;

  // Render all charts after DOM is ready
  const revenueChartData     = { labels, datasets: revenueDatasets,     aspectRatio: 3, promoAnnotations, chartAnnotations };
  const conversionsChartData = { labels, datasets: conversionsDatasets, aspectRatio: 3, promoAnnotations, chartAnnotations };

  setTimeout(() => {
    if (!document.getElementById('trends-revenue')?.isConnected) return;

    const rc = createLineChart(document.getElementById('trends-revenue'), revenueChartData);
    addChartToggle(revenueWrapper, rc, 'bar', revenueChartData);

    const cc = createLineChart(document.getElementById('trends-conversions'), conversionsChartData);
    addChartToggle(conversionsWrapper, cc, 'bar', conversionsChartData);
  }, 0);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a .chart-wrapper div containing a .chart-title and a <canvas>.
 * Returns the wrapper element; the canvas is already appended inside it.
 */
function buildChartWrapper(title, canvasId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'chart-wrapper';

  const heading = document.createElement('div');
  heading.className = 'chart-title';
  heading.textContent = title;

  const canvas = document.createElement('canvas');
  canvas.id = canvasId;

  wrapper.appendChild(heading);
  wrapper.appendChild(canvas);
  return wrapper;
}

/**
 * Append a .chart-legend row to a chart wrapper.
 * @param {HTMLElement} wrapper
 * @param {Array<{label: string, colorVar: string}>} series
 */
function appendLegend(wrapper, series) {
  const legend = document.createElement('div');
  legend.className = 'chart-legend';

  series.forEach(({ label, colorVar }) => {
    const item = document.createElement('span');
    item.className = 'chart-legend-item';

    const dot = document.createElement('span');
    dot.className = 'chart-legend-dot';
    dot.style.display         = 'inline-block';
    dot.style.width           = '10px';
    dot.style.height          = '10px';
    dot.style.borderRadius    = '50%';
    dot.style.backgroundColor = getCSSVar(colorVar);
    dot.style.marginRight     = '6px';
    dot.style.flexShrink      = '0';

    const text = document.createElement('span');
    text.textContent = label;

    item.appendChild(dot);
    item.appendChild(text);
    legend.appendChild(item);
  });

  wrapper.appendChild(legend);
}

/**
 * Convert a hex colour (or CSS colour string) returned by getCSSVar into an
 * rgba() string for use as a Chart.js fill colour.
 * Falls back gracefully when the value is already an rgb/rgba string.
 */
function hexToRgba(color, alpha) {
  if (!color) return `rgba(128,128,128,${alpha})`;

  // Strip whitespace (CSS vars can have leading spaces)
  color = color.trim();

  // Already rgb/rgba
  if (color.startsWith('rgb')) {
    // Replace alpha on existing rgba, or add it to rgb
    return color.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
      const parts = inner.split(',').slice(0, 3).join(',');
      return `rgba(${parts},${alpha})`;
    });
  }

  // Expand 3-digit hex
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  // 6-digit hex
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Unknown format — return semi-transparent grey as safe fallback
  return `rgba(128,128,128,${alpha})`;
}
