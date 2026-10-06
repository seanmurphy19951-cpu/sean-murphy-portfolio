import { createKPICard } from '../components/kpi-card.js';
import { createFunnel } from '../components/funnel.js';
import { formatPercent, formatCurrency, formatNumber } from '../formatters.js';

function card(title) {
  const w = document.createElement('div');
  w.className = 'chart-wrapper';
  if (title) w.innerHTML = `<div class="chart-title">${title}</div>`;
  return w;
}

export function renderFunnelAnalysis(data, container, compareData = null) {
  const { shopify, b2b } = data;
  const shopifyPrev = shopify.previousSummary || {};
  const b2bPrev     = b2b.previousSummary     || {};

  // Convenience aliases for funnel step values
  const ecomFunnel = shopify.conversionFunnel || {};
  const b2bFunnel  = b2b.leadFunnel           || {};

  const sessions        = ecomFunnel.sessions        ?? shopify.summary.sessions   ?? 0;
  const productViews    = ecomFunnel.productViews    ?? 0;
  const addToCart       = ecomFunnel.addToCart       ?? 0;
  const checkoutStarted = ecomFunnel.checkoutStarted ?? 0;
  const ecomOrders      = ecomFunnel.orders          ?? shopify.summary.orders     ?? 0;

  const totalLeads    = b2bFunnel.totalLeads    ?? b2b.summary.totalLeads    ?? 0;
  const qualifiedLeads= b2bFunnel.qualifiedLeads?? b2b.summary.qualifiedLeads?? 0;
  const opportunities = b2bFunnel.opportunities ?? b2b.summary.opportunities ?? 0;
  const proposals     = b2bFunnel.proposals     ?? 0;
  const closedDeals   = b2bFunnel.closedDeals   ?? b2b.summary.closedDeals   ?? 0;

  // ── ROW 1: Two Funnels ───────────────────────────────────────────────────────
  const row1 = document.createElement('div');
  row1.className = 'grid grid-2';

  // Left: E-Commerce Funnel
  const ecomCard = card('E-Commerce Funnel');
  const ecomFunnelEl = document.createElement('div');
  createFunnel(ecomFunnelEl, {
    steps: [
      { label: 'Sessions',          value: sessions,        color: '#4285f4' },
      { label: 'Product Views',     value: productViews,    color: '#34a853' },
      { label: 'Add to Cart',       value: addToCart,       color: '#ff6b35' },
      { label: 'Checkout Started',  value: checkoutStarted, color: '#9b59b6' },
      { label: 'Orders',            value: ecomOrders,      color: '#27ae60' },
    ],
  });
  ecomCard.appendChild(ecomFunnelEl);
  row1.appendChild(ecomCard);

  // Right: B2B Lead Funnel
  const b2bCard = card('B2B Lead Funnel');
  const b2bFunnelEl = document.createElement('div');
  createFunnel(b2bFunnelEl, {
    steps: [
      { label: 'Total Leads',   value: totalLeads,     color: '#ff6b35' },
      { label: 'Qualified',     value: qualifiedLeads, color: '#e67e22' },
      { label: 'Opportunities', value: opportunities,  color: '#f39c12' },
      { label: 'Proposals',     value: proposals,      color: '#f1c40f' },
      { label: 'Closed Deals',  value: closedDeals,    color: '#27ae60' },
    ],
  });
  b2bCard.appendChild(b2bFunnelEl);
  row1.appendChild(b2bCard);

  container.appendChild(row1);

  // ── ROW 1b: Drop-off Cost Analysis ─────────────────────────────────────────
  const aov = shopify.summary.aov || 0;
  if (aov > 0) {
    const dropOffRow = document.createElement('div');
    dropOffRow.className = 'funnel-dropoff-costs';

    const dropOffTitle = document.createElement('div');
    dropOffTitle.className = 'chart-title';
    dropOffTitle.textContent = 'Revenue Lost at Each Stage';
    dropOffRow.appendChild(dropOffTitle);

    const stages = [
      { from: 'Product Views', to: 'Add to Cart', lost: Math.max(productViews - addToCart, 0) },
      { from: 'Add to Cart', to: 'Checkout', lost: Math.max(addToCart - checkoutStarted, 0) },
      { from: 'Checkout', to: 'Purchase', lost: Math.max(checkoutStarted - ecomOrders, 0) },
    ];

    const stageGrid = document.createElement('div');
    stageGrid.className = 'grid grid-3';

    stages.forEach(({ from, to, lost }) => {
      const lostRevenue = lost * aov;
      const item = document.createElement('div');
      item.className = 'dropoff-card';
      item.innerHTML = `
        <div class="dropoff-card__label">${from} \u2192 ${to}</div>
        <div class="dropoff-card__value">${formatCurrency(lostRevenue)}</div>
        <div class="dropoff-card__detail">${formatNumber(lost)} visitors lost \u00d7 ${formatCurrency(aov)} AOV</div>
      `;
      stageGrid.appendChild(item);
    });

    dropOffRow.appendChild(stageGrid);
    container.appendChild(dropOffRow);
  }

  // ── ROW 2: 4 Funnel Metric KPI Cards ─────────────────────────────────────────
  const row2 = document.createElement('div');
  row2.className = 'grid grid-4';

  // 1. Cart Abandonment Rate
  const abandonEl = document.createElement('div');
  createKPICard(abandonEl, {
    label: 'Cart Abandonment Rate',
    value: shopify.summary.cartAbandonmentRate,
    previous: shopifyPrev.cartAbandonmentRate,
    format: 'percent',
    invertDelta: true,
    subtitle: 'vs 70% benchmark',
    estimated: true,
  });
  row2.appendChild(abandonEl);

  // 2. View-to-Cart Rate (no delta — static calculation)
  const viewToCartRate = productViews > 0
    ? (addToCart / productViews) * 100
    : 0;
  const viewCartEl = document.createElement('div');
  createKPICard(viewCartEl, {
    label: 'View-to-Cart Rate',
    value: viewToCartRate,
    format: 'percent',
    subtitle: 'of product views',
  });
  row2.appendChild(viewCartEl);

  // 3. Cart-to-Purchase Rate (no delta — static calculation)
  const cartToPurchaseRate = addToCart > 0
    ? (ecomOrders / addToCart) * 100
    : 0;
  const cartPurchaseEl = document.createElement('div');
  createKPICard(cartPurchaseEl, {
    label: 'Cart-to-Purchase Rate',
    value: cartToPurchaseRate,
    format: 'percent',
    subtitle: 'of carts convert',
  });
  row2.appendChild(cartPurchaseEl);

  // 4. B2B Lead-to-Close Rate
  const leadCloseEl = document.createElement('div');
  createKPICard(leadCloseEl, {
    label: 'B2B Lead-to-Close',
    value: b2b.summary.leadToCloseRate,
    previous: b2bPrev.leadToCloseRate,
    format: 'percent',
    estimated: true,
  });
  row2.appendChild(leadCloseEl);

  container.appendChild(row2);
}
