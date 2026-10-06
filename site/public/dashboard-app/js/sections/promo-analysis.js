/**
 * Promo Analysis section.
 * Shows a before / during / after comparison for each promotional window
 * that overlaps the selected date range.
 */

import { createKPICard } from '../components/kpi-card.js';
import { formatCurrency, formatNumber, formatPercent } from '../formatters.js';

export function renderPromoAnalysis(data, container) {
  container.innerHTML = '';

  const promos = data.promos || [];
  const daily = data.computed.dailyMerged || [];
  if (!promos.length || !daily.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.textContent = 'No promotional events found in the selected date range.';
    container.appendChild(empty);
    return;
  }

  const rangeStart = daily[0].date;
  const rangeEnd = daily[daily.length - 1].date;

  // Filter promos to those overlapping the current date range
  const visiblePromos = promos.filter(
    p => p.startDate <= rangeEnd && p.endDate >= rangeStart
  );

  if (!visiblePromos.length) {
    const empty = document.createElement('div');
    empty.className = 'card';
    empty.textContent = 'No promotions overlap the selected date range.';
    container.appendChild(empty);
    return;
  }

  // Build a date-indexed lookup for daily data
  const byDate = {};
  for (const d of daily) byDate[d.date] = d;

  for (const promo of visiblePromos) {
    const promoCard = document.createElement('div');
    promoCard.className = 'card';
    promoCard.style.marginBottom = '24px';

    // Promo header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;';
    const dot = document.createElement('span');
    dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${promo.color || '#ffb938'};flex-shrink:0;`;
    const title = document.createElement('span');
    title.style.cssText = 'font-weight:700;font-size:1rem;color:#fff;text-transform:uppercase;letter-spacing:0.06em;';
    title.textContent = promo.name;
    const dates = document.createElement('span');
    dates.style.cssText = 'font-family:var(--font-mono);font-size:0.75rem;color:#555;letter-spacing:0.04em;';
    dates.textContent = `${promo.startDate} — ${promo.endDate}`;
    if (promo.discountPercent) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.style.cssText = `background:rgba(255,185,56,0.1);color:#ffb938;border-color:rgba(255,185,56,0.25);`;
      badge.textContent = `${promo.discountPercent}% OFF`;
      header.appendChild(badge);
    }
    header.appendChild(dot);
    header.appendChild(title);
    header.appendChild(dates);
    promoCard.appendChild(header);

    // Calculate period durations
    const promoDays = getDaysInRange(daily, promo.startDate, promo.endDate);
    const promoLength = promoDays.length;

    // Before period: same length immediately before promo
    const beforeEnd = subtractDays(promo.startDate, 1);
    const beforeStart = subtractDays(promo.startDate, promoLength);
    const beforeDays = getDaysInRange(daily, beforeStart, beforeEnd);

    // After period: same length immediately after promo
    const afterStart = addDays(promo.endDate, 1);
    const afterEnd = addDays(promo.endDate, promoLength);
    const afterDays = getDaysInRange(daily, afterStart, afterEnd);

    // Compute metrics for each period
    const beforeMetrics = computeMetrics(beforeDays);
    const duringMetrics = computeMetrics(promoDays);
    const afterMetrics = computeMetrics(afterDays);

    // Render the three-period comparison
    const grid = document.createElement('div');
    grid.className = 'grid grid-3';
    grid.style.gap = '12px';

    renderPeriodColumn(grid, 'Before', `${beforeDays.length} days`, beforeMetrics, '#555');
    renderPeriodColumn(grid, 'During Promo', `${promoDays.length} days`, duringMetrics, promo.color || '#ffb938');
    renderPeriodColumn(grid, 'After', `${afterDays.length} days`, afterMetrics, '#555');

    promoCard.appendChild(grid);

    // Lift metrics
    if (beforeMetrics.revenue > 0 && duringMetrics.revenue > 0) {
      const lift = document.createElement('div');
      lift.style.cssText = 'margin-top:16px;display:flex;gap:24px;flex-wrap:wrap;';

      const revLift = ((duringMetrics.revenue - beforeMetrics.revenue) / beforeMetrics.revenue * 100).toFixed(1);
      const ordLift = beforeMetrics.orders > 0
        ? ((duringMetrics.orders - beforeMetrics.orders) / beforeMetrics.orders * 100).toFixed(1) : 'N/A';
      const recoveryPct = afterMetrics.revenue > 0 && beforeMetrics.revenue > 0
        ? ((afterMetrics.revenue / beforeMetrics.revenue) * 100).toFixed(0) : 'N/A';

      addLiftBadge(lift, 'Revenue Lift', `${revLift > 0 ? '+' : ''}${revLift}%`, revLift > 0);
      addLiftBadge(lift, 'Order Lift', `${ordLift > 0 ? '+' : ''}${ordLift}%`, ordLift > 0);
      addLiftBadge(lift, 'Post-Promo Recovery', `${recoveryPct}% of baseline`, parseInt(recoveryPct) >= 90);

      promoCard.appendChild(lift);
    }

    container.appendChild(promoCard);
  }
}

function getDaysInRange(daily, start, end) {
  return daily.filter(d => d.date >= start && d.date <= end);
}

function computeMetrics(days) {
  if (!days.length) return { revenue: 0, orders: 0, spend: 0, sessions: 0, conversions: 0, aov: 0 };
  const revenue = days.reduce((s, d) => s + (d.revenue || 0), 0);
  const orders = days.reduce((s, d) => s + (d.orders || 0), 0);
  const spend = days.reduce((s, d) => s + (d.googleSpend || 0) + (d.metaSpend || 0), 0);
  const sessions = days.reduce((s, d) => s + (d.sessions || 0), 0);
  const conversions = days.reduce((s, d) => s + (d.googleConversions || 0) + (d.metaConversions || 0), 0);
  return {
    revenue,
    orders,
    spend,
    sessions,
    conversions,
    aov: orders > 0 ? revenue / orders : 0,
    dailyAvgRevenue: revenue / days.length,
  };
}

function renderPeriodColumn(grid, label, subtitle, metrics, color) {
  const col = document.createElement('div');
  col.style.cssText = `background:#0e1730;border-radius:8px;padding:16px;border-left:3px solid ${color};`;

  const hdr = document.createElement('div');
  hdr.style.cssText = 'margin-bottom:12px;';
  const h = document.createElement('div');
  h.style.cssText = 'font-weight:700;font-size:0.85rem;color:#fff;text-transform:uppercase;letter-spacing:0.08em;';
  h.textContent = label;
  const sub = document.createElement('div');
  sub.style.cssText = 'font-family:var(--font-mono);font-size:9px;color:#444;letter-spacing:0.1em;margin-top:2px;';
  sub.textContent = subtitle;
  hdr.appendChild(h);
  hdr.appendChild(sub);
  col.appendChild(hdr);

  addMetricRow(col, 'Revenue', formatCurrency(metrics.revenue));
  addMetricRow(col, 'Orders', formatNumber(metrics.orders));
  addMetricRow(col, 'Ad Spend', formatCurrency(metrics.spend));
  addMetricRow(col, 'Conversions', formatNumber(metrics.conversions));
  addMetricRow(col, 'AOV', formatCurrency(metrics.aov));
  addMetricRow(col, 'Daily Avg Rev', formatCurrency(metrics.dailyAvgRevenue));

  grid.appendChild(col);
}

function addMetricRow(parent, label, value) {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1a1a1a;';
  const l = document.createElement('span');
  l.style.cssText = 'font-size:0.78rem;color:#666;';
  l.textContent = label;
  const v = document.createElement('span');
  v.style.cssText = 'font-size:0.78rem;font-weight:600;color:#ddd;font-variant-numeric:tabular-nums;';
  v.textContent = value;
  row.appendChild(l);
  row.appendChild(v);
  parent.appendChild(row);
}

function addLiftBadge(parent, label, value, positive) {
  const badge = document.createElement('div');
  badge.style.cssText = `
    background:${positive ? 'rgba(0,208,132,0.08)' : 'rgba(255,77,77,0.08)'};
    border:1px solid ${positive ? 'rgba(0,208,132,0.25)' : 'rgba(255,77,77,0.25)'};
    border-radius:6px;padding:8px 14px;
  `;
  const l = document.createElement('div');
  l.style.cssText = 'font-family:var(--font-mono);font-size:8px;color:#555;text-transform:uppercase;letter-spacing:0.12em;';
  l.textContent = label;
  const v = document.createElement('div');
  v.style.cssText = `font-size:1rem;font-weight:700;color:${positive ? '#00d084' : '#ff4d4d'};margin-top:2px;`;
  v.textContent = value;
  badge.appendChild(l);
  badge.appendChild(v);
  parent.appendChild(badge);
}

function subtractDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - n);
  return fmtDate(d);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
