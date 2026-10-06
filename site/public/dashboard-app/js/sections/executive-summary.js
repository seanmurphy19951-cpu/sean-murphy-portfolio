import { createKPICard } from '../components/kpi-card.js';
import { formatCurrency, formatNumber, formatPercent } from '../formatters.js';

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function renderExecutiveSummary(data, container, compareData = null) {
  const { computed, google, meta, b2b, shopify } = data;
  const daily = computed.dailyMerged;
  const goals = (data.goals && data.goals.monthly) || {};

  // Compute pace info from daily time series
  const daysElapsed = daily.length;
  const lastDate = daily.length > 0 ? new Date(daily[daily.length - 1].date + 'T00:00:00') : null;
  const daysInPeriod = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0).getDate() : 31;

  // ── ROW 1: 5 KPI Cards ──────────────────────────────────────────────────────
  const row1 = document.createElement('div');
  row1.className = 'grid grid-5';

  // 1. Total Revenue
  const revenueEl = document.createElement('div');
  createKPICard(revenueEl, {
    label: 'Total Revenue',
    value: computed.totalRevenue,
    previous: computed.previousTotalRevenue,
    format: 'currency',
    accentColor: getCSSVar('--color-shopify'),
    sparkline: daily.map(d => d.revenue),
    goal: goals.revenue,
    daysElapsed,
    daysInPeriod,
  });
  row1.appendChild(revenueEl);

  // 2. Total Spend
  const spendEl = document.createElement('div');
  createKPICard(spendEl, {
    label: 'Total Spend',
    value: computed.totalSpend,
    previous: computed.previousTotalSpend,
    format: 'currency',
    accentColor: getCSSVar('--color-google'),
    invertDelta: true,
    sparkline: daily.map(d => d.googleSpend + d.metaSpend),
    goal: goals.spend,
    daysElapsed,
    daysInPeriod,
  });
  row1.appendChild(spendEl);

  // 3. Blended ROAS
  const roasEl = document.createElement('div');
  createKPICard(roasEl, {
    label: 'Blended ROAS',
    value: computed.blendedROAS,
    previous: computed.previousBlendedROAS,
    format: 'multiplier',
    accentColor: getCSSVar('--chart-2'),
    goal: goals.roas,
  });
  row1.appendChild(roasEl);

  // 4. Total Conversions
  const convsEl = document.createElement('div');
  createKPICard(convsEl, {
    label: 'Total Conversions',
    value: computed.totalConversions,
    previous: computed.previousTotalConversions,
    format: 'number',
    accentColor: getCSSVar('--chart-3'),
    goal: goals.conversions,
    daysElapsed,
    daysInPeriod,
  });
  row1.appendChild(convsEl);

  // 5. Blended CPA
  const cpaEl = document.createElement('div');
  createKPICard(cpaEl, {
    label: 'Blended CPA',
    value: computed.blendedCPA,
    previous: computed.previousBlendedCPA,
    format: 'currency',
    invertDelta: true,
    accentColor: getCSSVar('--chart-4'),
    goal: goals.cpa,
  });
  row1.appendChild(cpaEl);

  // Comparison disclaimer
  if (data._comparisonLabel) {
    const disclaimer = document.createElement('div');
    disclaimer.className = 'comparison-disclaimer';
    disclaimer.textContent = `% changes compared to ${data._comparisonLabel}`;
    row1.appendChild(disclaimer);
  }

  container.appendChild(row1);

  // ── Narrative Block ──────────────────────────────────────────────────────────
  const narrative = generateNarrative(computed, google, meta, shopify, b2b, goals);
  if (narrative) {
    const narBlock = document.createElement('div');
    narBlock.className = 'exec-narrative';
    narBlock.innerHTML = `<div class="exec-narrative__icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 10 18.469V19a2 2 0 1 0 4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div><p>${narrative}</p>`;
    container.appendChild(narBlock);
  }

  // ── ROW 1b: Profitability KPIs ─────────────────────────────────────────────
  const row1b = document.createElement('div');
  row1b.className = 'grid grid-4';

  // Gross Profit
  const gpEl = document.createElement('div');
  const grossProfit = shopify.summary.grossProfit || 0;
  const prevGrossProfit = shopify.previousSummary?.grossProfit || 0;
  createKPICard(gpEl, {
    label: 'Gross Profit',
    value: grossProfit,
    previous: prevGrossProfit,
    format: 'currency',
    accentColor: '#00d084',
    goal: goals.grossProfit,
  });
  row1b.appendChild(gpEl);

  // Contribution Margin (Gross Profit - Total Ad Spend)
  const contribMargin = grossProfit - computed.totalSpend;
  const prevContribMargin = prevGrossProfit - computed.previousTotalSpend;
  const cmEl = document.createElement('div');
  createKPICard(cmEl, {
    label: 'Contribution Margin',
    value: contribMargin,
    previous: prevContribMargin,
    format: 'currency',
    subtitle: 'profit after ad spend',
  });
  row1b.appendChild(cmEl);

  // Gross Margin %
  const gmPct = shopify.summary.grossMarginPercent || 0;
  const prevGmPct = shopify.previousSummary?.grossMarginPercent || 0;
  const gmEl = document.createElement('div');
  createKPICard(gmEl, {
    label: 'Gross Margin',
    value: gmPct,
    previous: prevGmPct,
    format: 'percent',
  });
  row1b.appendChild(gmEl);

  // MER (Media Efficiency Ratio) = Total Revenue / Total Ad Spend
  const mer = computed.totalSpend > 0 ? computed.totalRevenue / computed.totalSpend : 0;
  const prevMer = computed.previousTotalSpend > 0 ? computed.previousTotalRevenue / computed.previousTotalSpend : 0;
  const merEl = document.createElement('div');
  createKPICard(merEl, {
    label: 'MER',
    value: mer,
    previous: prevMer,
    format: 'multiplier',
    subtitle: 'revenue per $1 spent',
  });
  row1b.appendChild(merEl);

  container.appendChild(row1b);
}

function generateNarrative(computed, google, meta, shopify, b2b, goals) {
  const parts = [];
  const pctChange = (curr, prev) => prev ? ((curr - prev) / Math.abs(prev)) * 100 : 0;

  // Revenue direction
  const revDelta = pctChange(computed.totalRevenue, computed.previousTotalRevenue);
  const revDir = revDelta > 1 ? 'up' : revDelta < -1 ? 'down' : 'flat';
  if (revDir === 'flat') {
    parts.push(`Revenue is holding steady at ${formatCurrency(computed.totalRevenue)}.`);
  } else {
    // Identify top driver
    const gRevDelta = pctChange(google.summary.revenue, google.previousSummary?.revenue);
    const mRevDelta = pctChange(meta.summary.revenue, meta.previousSummary?.revenue);
    const driver = Math.abs(gRevDelta) > Math.abs(mRevDelta) ? 'Google Ads' : 'Meta Ads';
    parts.push(`Revenue is ${revDir} ${Math.abs(revDelta).toFixed(0)}% to ${formatCurrency(computed.totalRevenue)}, driven by ${driver}.`);
  }

  // CPA watch
  const cpaDelta = pctChange(computed.blendedCPA, computed.previousBlendedCPA);
  if (cpaDelta > 5) {
    parts.push(`Blended CPA rose ${cpaDelta.toFixed(0)}% — monitor acquisition costs.`);
  } else if (cpaDelta < -5) {
    parts.push(`CPA improved ${Math.abs(cpaDelta).toFixed(0)}%, making acquisition more efficient.`);
  }

  // Goal pace
  if (goals.revenue && computed.totalRevenue) {
    const goalPct = (computed.totalRevenue / goals.revenue) * 100;
    if (goalPct >= 95) {
      parts.push(`On track to hit the revenue target.`);
    } else if (goalPct >= 70) {
      parts.push(`At ${goalPct.toFixed(0)}% of revenue goal — needs acceleration.`);
    } else {
      parts.push(`Behind on revenue goal (${goalPct.toFixed(0)}%) — action needed.`);
    }
  }

  return parts.join(' ');
}
