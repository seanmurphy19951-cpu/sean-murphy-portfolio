/**
 * Main entry point for the marketing performance dashboard.
 * Orchestrates data loading, chart configuration, and section rendering.
 */

import { loadAllData } from './data-loader.js';
import { configureChartDefaults } from './chart-defaults.js';
import { promoAnnotationsPlugin } from './components/promo-annotations.js';
import { chartAnnotationsPlugin } from './components/chart-annotations.js';
import { renderExecutiveSummary } from './sections/executive-summary.js';
import { renderChannelMix } from './sections/channel-mix.js';
import { renderFunnelAnalysis } from './sections/funnel-analysis.js';
import { renderGoogleAds } from './sections/google-ads.js';
import { renderMetaAds } from './sections/meta-ads.js';
import { renderShopify } from './sections/shopify.js';
import { renderB2BPartners } from './sections/b2b-partners.js';
import { renderWebsite } from './sections/website.js';
import { generateInsights } from './insights-engine.js';
import { renderInsights } from './sections/insights.js';
import { renderTrends } from './sections/trends.js';
import { renderPromoAnalysis } from './sections/promo-analysis.js';
import { initSidebar, getCurrentSection, navigateTo } from './components/sidebar.js';
import { destroyAllCharts } from './utils/chart-registry.js';
import { initDateRangeState, getDateRange, getComparisonRange, getDefaultComparisonRange, getComparisonPeriodLabel, COMPARE_MODES, setCustomCompareRange, subscribe } from './state/date-range-state.js';
import { filterDataByRange } from './utils/data-filter.js';
import { initDateFilterBar } from './components/date-filter-bar.js';
import { exportDashboardPDF } from './utils/export.js';

let rawData = null;

async function main() {
  try {
    // Show loading state
    showLoading(true);

    // Load all data
    rawData = await loadAllData();

    // Configure Chart.js (Chart is a global from the CDN script)
    configureChartDefaults(Chart);
    Chart.register(promoAnnotationsPlugin);
    Chart.register(chartAnnotationsPlugin);

    // Update header with config info
    updateHeader(rawData.config);

    // Initialize date range state from config
    initDateRangeState(rawData.config.reportPeriod);

    // Initialize the date filter bar
    const filterMount = document.getElementById('date-filter-bar-mount');
    if (filterMount) {
      initDateFilterBar(filterMount);
    }

    // Init sidebar navigation (page-based, one section at a time)
    initSidebar();

    // Subscribe to date range changes
    subscribe(handleRangeChange);

    // Hide loading, reveal sections
    showLoading(false);

    // Initial render with current range
    handleRangeChange(getDateRange());

  } catch (error) {
    console.error('Dashboard initialization failed:', error);
    showError(error.message);
  }
}

/**
 * Handle date range or compare mode changes — re-render the entire dashboard.
 */
function handleRangeChange(range) {
  if (!rawData) return;

  destroyAllCharts();

  // Filter data to the selected range
  const filtered = filterDataByRange(rawData, range);

  // Always compute a contextual comparison for delta percentages.
  // YoY toggle overrides to same-period-last-year; otherwise use the
  // default comparison (prev month, prev quarter, prev YTD, etc.)
  const isExplicitCompare = range.compareMode === COMPARE_MODES.YOY
    || range.compareMode === COMPARE_MODES.QOQ
    || range.compareMode === COMPARE_MODES.CUSTOM;
  const deltaRange = isExplicitCompare
    ? getComparisonRange()
    : getDefaultComparisonRange();

  let deltaData = null;
  if (deltaRange) {
    deltaData = filterDataByRange(rawData, deltaRange);
  }

  // Apply the comparison data to previousSummary fields so all KPI cards
  // and section renderers pick up the correct deltas automatically.
  if (deltaData) {
    filtered.computed.previousTotalSpend = deltaData.computed.totalSpend;
    filtered.computed.previousTotalRevenue = deltaData.computed.totalRevenue;
    filtered.computed.previousBlendedROAS = deltaData.computed.blendedROAS;
    filtered.computed.previousTotalConversions = deltaData.computed.totalConversions;
    filtered.computed.previousBlendedCPA = deltaData.computed.blendedCPA;

    filtered.google.previousSummary = deltaData.google.summary;
    filtered.meta.previousSummary = deltaData.meta.summary;
    filtered.shopify.previousSummary = deltaData.shopify.summary;
    filtered.b2b.previousSummary = deltaData.b2b.summary;
    filtered.website.previousSummary = deltaData.website.summary;
  }

  // Attach comparison label to the data so sections can display it
  filtered._comparisonLabel = getComparisonPeriodLabel();

  // Pass promos, goals, and annotations through to sections
  filtered.promos = rawData.promos || [];
  filtered.goals = rawData.goals || {};
  filtered.annotations = rawData.annotations || [];

  // Chart overlays shown when any explicit compare mode is active
  const chartCompareData = isExplicitCompare ? deltaData : null;

  renderDashboard(filtered, chartCompareData);
  updatePeriodDisplay(range);
}

/**
 * Render all dashboard sections.
 */
function renderDashboard(data, compareData = null) {
  // Clear all section containers before re-rendering
  document.querySelectorAll('.section-content').forEach(el => { el.innerHTML = ''; });

  renderExecutiveSummary(data, document.querySelector('#executive-summary .section-content'), compareData);
  renderChannelMix(data, document.querySelector('#channel-mix .section-content'), compareData);
  renderFunnelAnalysis(data, document.querySelector('#funnel-analysis .section-content'), compareData);
  renderGoogleAds(data, document.querySelector('#google-ads .section-content'), compareData);
  renderMetaAds(data, document.querySelector('#meta-ads .section-content'), compareData);
  renderShopify(data, document.querySelector('#shopify .section-content'), compareData);
  renderB2BPartners(data, document.querySelector('#b2b-partners .section-content'), compareData);
  renderWebsite(data, document.querySelector('#website .section-content'), compareData);

  const insights = generateInsights(data);
  renderInsights(insights, document.querySelector('#insights .section-content'));

  renderTrends(data, document.querySelector('#trends .section-content'), compareData);

  const promoEl = document.querySelector('#promo-analysis .section-content');
  if (promoEl) renderPromoAnalysis(data, promoEl);

  // Re-apply page navigation — keep only active section visible
  const active = getCurrentSection() || 'executive-summary';
  navigateTo(active, false);
}

/**
 * Toggle the loading state overlay and section visibility.
 */
function showLoading(show) {
  const el = document.getElementById('loading-state');
  if (el) el.style.display = show ? 'block' : 'none';

  if (show) {
    document.querySelectorAll('.dashboard-section').forEach(s => {
      s.style.display = 'none';
    });
  } else {
    // After loading, re-apply page navigation (show only the active section)
    const active = getCurrentSection() || 'executive-summary';
    navigateTo(active, false);
  }
}

/**
 * Display an error message in the main content area.
 */
function showError(message) {
  const content = document.querySelector('.content');
  if (!content) return;

  content.innerHTML = `
    <div style="text-align:center;padding:60px;color:var(--negative);">
      <h2>Failed to load dashboard</h2>
      <p style="margin-top:8px;color:var(--text-secondary);">${message}</p>
      <p style="margin-top:16px;font-size:0.85rem;color:var(--text-muted);">
        Make sure you're running a local HTTP server (e.g., npx serve .)
      </p>
    </div>`;
}

/**
 * Update the page header with the report period and data source from config.
 */
function updateHeader(config) {
  const periodEl = document.getElementById('header-period');
  const liveLabel = document.getElementById('live-label');
  const sidebarPeriodEl = document.getElementById('sidebar-period');
  const sidebarPeriodFooter = document.getElementById('sidebar-period-footer');

  let periodText = '';
  if (config.reportPeriod) {
    const [year, month] = config.reportPeriod.split('-');
    const date = new Date(year, parseInt(month, 10) - 1);
    periodText = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  if (periodEl && periodText)          periodEl.textContent = periodText;
  if (sidebarPeriodEl && periodText)   sidebarPeriodEl.textContent = periodText;
  if (sidebarPeriodFooter && periodText) sidebarPeriodFooter.textContent = periodText;

  if (liveLabel && config.dataSource) {
    const src = config.dataSource.toUpperCase();
    liveLabel.textContent = src === 'CURRENT' ? 'LIVE DATA' : `${src} DATA`;
  }

  // Add PDF export button to header
  const headerMeta = document.querySelector('.header-meta');
  if (headerMeta && !headerMeta.querySelector('.pdf-export-btn')) {
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'pdf-export-btn';
    pdfBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Export PDF</span>`;
    pdfBtn.addEventListener('click', exportDashboardPDF);
    headerMeta.appendChild(pdfBtn);
  }
}

/**
 * Update sidebar/header period display based on active range.
 */
function updatePeriodDisplay(range) {
  const sidebarPeriodEl = document.getElementById('sidebar-period');
  const sidebarPeriodFooter = document.getElementById('sidebar-period-footer');

  if (!range.start) return;

  const start = new Date(range.start + 'T00:00:00');
  const end = new Date(range.end + 'T00:00:00');
  let label = '';

  if (range.preset === 'MTD' || range.preset === 'PREV_YEAR') {
    label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (range.preset === 'QTD') {
    const q = Math.floor(start.getMonth() / 3) + 1;
    label = `Q${q} ${end.getFullYear()}`;
  } else if (range.preset === 'YTD') {
    label = `YTD ${end.getFullYear()}`;
  } else if (range.preset === 'CUSTOM') {
    const fmt = { month: 'short', day: 'numeric' };
    label = `${start.toLocaleDateString('en-US', fmt)} – ${end.toLocaleDateString('en-US', fmt)}, ${end.getFullYear()}`;
  }

  if (sidebarPeriodEl && label) sidebarPeriodEl.textContent = label;
  if (sidebarPeriodFooter && label) sidebarPeriodFooter.textContent = label;
}

// Start the app
main();
