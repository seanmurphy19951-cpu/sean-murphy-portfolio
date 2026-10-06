// @ts-nocheck
export async function loadAllData() {
  const get = (p, fb) => fetch(`/dashboard-data/${p}`).then(r => (r.ok ? r.json() : fb !== undefined ? fb : Promise.reject(new Error(`Failed to load ${p}: ${r.status}`)))).catch(e => { if (fb !== undefined) return fb; throw e; });
  const config = await get("config.json");
  const [google, meta, shopify, b2b, website, promos, goals, annotations] = await Promise.all([
    get("google-ads.json"), get("meta-ads.json"), get("shopify.json"), get("b2b-partners.json"), get("website.json"),
    get("promos.json", []), get("goals.json", {}), get("annotations.json", []),
  ]);
  const computed = computeAggregates(google, meta, shopify, b2b, website);
  return { config, google, meta, shopify, b2b, website, computed, promos, goals, annotations };
}
/**
 * Pure functions to filter dashboard data by date range
 * and produce comparison-period data for YoY overlays.
 *
 * Returns objects in the same shape as loadAllData() so section
 * renderers need zero structural changes.
 */

/**
 * Filter all channel data to a specific date range.
 * Recomputes summaries from the filtered daily rows.
 */
export function filterDataByRange(rawData, { start, end }) {
  const google = filterChannel(rawData.google, start, end, aggregateGoogleSummary);
  const meta = filterChannel(rawData.meta, start, end, aggregateMetaSummary);
  const shopify = filterChannel(rawData.shopify, start, end, aggregateShopifySummary);
  const b2b = filterChannel(rawData.b2b, start, end, aggregateB2BSummary);
  const website = filterChannel(rawData.website, start, end, aggregateWebsiteSummary);

  // Derive Google/Meta revenue from Shopify revenueBySource instead of conversions*40
  attributeRevenueFromShopify(google, meta, shopify, rawData.shopify);

  // Carry over margin data from raw Shopify summary to filtered summary
  const rawMargin = rawData.shopify.summary.grossMarginPercent || 0;
  shopify.summary.grossMarginPercent = rawMargin;
  shopify.summary.cogs = Math.round(shopify.summary.totalRevenue * (1 - rawMargin / 100));
  shopify.summary.grossProfit = shopify.summary.totalRevenue - shopify.summary.cogs;

  // Rebuild computed aggregates
  const computed = computeAggregates(google, meta, shopify, b2b, website);

  return {
    config: rawData.config,
    google,
    meta,
    shopify,
    b2b,
    website,
    computed,
  };
}

/**
 * Get data for the comparison period (shifted 12 months back).
 */
export function getComparisonData(rawData, { start, end }) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  s.setFullYear(s.getFullYear() - 1);
  e.setFullYear(e.getFullYear() - 1);
  const compStart = fmtDate(s);
  const compEnd = fmtDate(e);

  return filterDataByRange(rawData, { start: compStart, end: compEnd });
}

/**
 * Attribute revenue from Shopify revenueBySource to Google (Paid Search)
 * and Meta (Paid Social) instead of using fabricated conversions * $40.
 * Uses the source percentage split from the full dataset, applied to
 * the filtered Shopify revenue for the selected date range.
 */
function attributeRevenueFromShopify(google, meta, shopify, rawShopify) {
  const sources = rawShopify.revenueBySource || [];
  const paidSearch = sources.find(s => s.source === 'Paid Search');
  const paidSocial = sources.find(s => s.source === 'Paid Social');

  const paidSearchPct = paidSearch ? paidSearch.percentage / 100 : 0;
  const paidSocialPct = paidSocial ? paidSocial.percentage / 100 : 0;

  const filteredRevenue = shopify.summary.totalRevenue || 0;

  google.summary.revenue = Math.round(filteredRevenue * paidSearchPct);
  google.summary.roas = google.summary.spend > 0
    ? Math.round(google.summary.revenue / google.summary.spend * 100) / 100 : 0;

  meta.summary.revenue = Math.round(filteredRevenue * paidSocialPct);
  meta.summary.roas = meta.summary.spend > 0
    ? Math.round(meta.summary.revenue / meta.summary.spend * 100) / 100 : 0;
}

// --- Internal helpers ---

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function filterChannel(channelData, start, end, aggregateFn) {
  const filtered = (channelData.dailyTimeSeries || []).filter(
    d => d.date >= start && d.date <= end
  );

  const summary = aggregateFn(filtered);

  // Preserve non-daily fields (campaigns, partners, etc.)
  return {
    ...channelData,
    dailyTimeSeries: filtered,
    summary,
    // previousSummary stays as-is for now; overridden by compareData in renderers
  };
}

function sum(arr, key) {
  return arr.reduce((acc, row) => acc + (row[key] || 0), 0);
}

function avg(arr, key) {
  if (arr.length === 0) return 0;
  return sum(arr, key) / arr.length;
}

function aggregateGoogleSummary(rows) {
  const spend = sum(rows, 'spend');
  const clicks = sum(rows, 'clicks');
  const impressions = sum(rows, 'impressions');
  const conversions = sum(rows, 'conversions');
  // Revenue will be set by attributeRevenueFromShopify(); placeholder 0 here
  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue: 0,
    ctr: impressions > 0 ? Math.round(clicks / impressions * 10000) / 100 : 0,
    cpc: clicks > 0 ? Math.round(spend / clicks * 100) / 100 : 0,
    cpa: conversions > 0 ? Math.round(spend / conversions * 100) / 100 : 0,
    roas: 0, // recalculated after revenue attribution
    qualityScoreAvg: 7.2, // estimated — not in daily data
  };
}

function aggregateMetaSummary(rows) {
  const spend = sum(rows, 'spend');
  const clicks = sum(rows, 'clicks');
  const impressions = sum(rows, 'impressions');
  const conversions = sum(rows, 'conversions');
  const reach = sum(rows, 'reach');
  // Revenue will be set by attributeRevenueFromShopify(); placeholder 0 here
  return {
    spend,
    impressions,
    reach,
    clicks,
    conversions,
    revenue: 0,
    ctr: impressions > 0 ? Math.round(clicks / impressions * 10000) / 100 : 0,
    cpc: clicks > 0 ? Math.round(spend / clicks * 100) / 100 : 0,
    cpa: conversions > 0 ? Math.round(spend / conversions * 100) / 100 : 0,
    roas: 0, // recalculated after revenue attribution
    frequency: reach > 0 ? Math.round(impressions / reach * 100) / 100 : 0,
  };
}

function aggregateShopifySummary(rows) {
  const totalRevenue = sum(rows, 'revenue');
  const orders = sum(rows, 'orders');
  const sessions = sum(rows, 'sessions');
  return {
    totalRevenue,
    orders,
    aov: orders > 0 ? Math.round(totalRevenue / orders * 100) / 100 : 0,
    conversionRate: sessions > 0 ? Math.round(orders / sessions * 10000) / 100 : 0,
    sessions,
    returningCustomerRate: 38.5, // estimated — not in daily data
    cartAbandonmentRate: 68.2,   // estimated — not in daily data
    refundRate: 4.1,             // estimated — not in daily data
    // Profit fields use summary-level grossMarginPercent (set by filterDataByRange)
    grossMarginPercent: 0,
    cogs: 0,
    grossProfit: 0,
  };
}

function aggregateB2BSummary(rows) {
  const totalLeads = sum(rows, 'leads');
  const totalPartnerSpend = sum(rows, 'spend');
  return {
    totalLeads,
    qualifiedLeads: Math.round(totalLeads * 0.304), // preserve ratio from monthly
    opportunities: Math.round(totalLeads * 0.132),
    closedDeals: Math.round(totalLeads * 0.039),
    revenue: Math.round(totalLeads * 0.039) * 10105,
    avgDealSize: 10105,
    leadToCloseRate: 3.91,
    totalPartnerSpend,
  };
}

function aggregateWebsiteSummary(rows) {
  const sessions = sum(rows, 'sessions');
  const users = sum(rows, 'users');
  const pageviews = sum(rows, 'pageviews');
  return {
    sessions,
    users,
    pageviews,
    bounceRate: avg(rows, 'bounceRate') ? Math.round(avg(rows, 'bounceRate') * 10) / 10 : 0,
    avgSessionDuration: Math.round(avg(rows, 'avgSessionDuration')),
    pagesPerSession: sessions > 0 ? Math.round(pageviews / sessions * 100) / 100 : 0,
    newUsers: Math.round(users * 0.661),
    newUserRate: 66.1,
  };
}

/**
 * Compute cross-channel aggregates (mirrors data-loader.js computeAggregates).
 */
function computeAggregates(google, meta, shopify, b2b, website) {
  const googleSpend = google.summary.spend || 0;
  const metaSpend = meta.summary.spend || 0;
  const b2bSpend = b2b.summary.totalPartnerSpend || 0;

  const totalSpend = googleSpend + metaSpend + b2bSpend;
  const totalRevenue = (shopify.summary.totalRevenue || 0) + (b2b.summary.revenue || 0);
  const blendedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const googleConversions = google.summary.conversions || 0;
  const metaConversions = meta.summary.conversions || 0;
  const totalConversions = googleConversions + metaConversions;

  const paidSpend = googleSpend + metaSpend;
  const blendedCPA = totalConversions > 0 ? paidSpend / totalConversions : 0;

  // Merge daily data
  const dailyMerged = mergeDailyFiltered(google, meta, shopify, b2b, website);

  // Compute previous period aggregates from channel previousSummary
  const prevGoogleSpend = google.previousSummary?.spend || 0;
  const prevMetaSpend = meta.previousSummary?.spend || 0;
  const prevB2bSpend = b2b.previousSummary?.totalPartnerSpend || 0;
  const previousTotalSpend = prevGoogleSpend + prevMetaSpend + prevB2bSpend;
  const previousTotalRevenue = (shopify.previousSummary?.totalRevenue || 0) + (b2b.previousSummary?.revenue || 0);
  const previousBlendedROAS = previousTotalSpend > 0 ? previousTotalRevenue / previousTotalSpend : 0;
  const prevGoogleConversions = google.previousSummary?.conversions || 0;
  const prevMetaConversions = meta.previousSummary?.conversions || 0;
  const previousTotalConversions = prevGoogleConversions + prevMetaConversions;
  const prevPaidSpend = prevGoogleSpend + prevMetaSpend;
  const previousBlendedCPA = previousTotalConversions > 0 ? prevPaidSpend / previousTotalConversions : 0;

  return {
    totalSpend,
    totalRevenue,
    blendedROAS,
    totalConversions,
    blendedCPA,
    previousTotalSpend,
    previousTotalRevenue,
    previousBlendedROAS,
    previousTotalConversions,
    previousBlendedCPA,
    dailyMerged,
  };
}

/**
 * Merge filtered daily time series across channels.
 */
function mergeDailyFiltered(google, meta, shopify, b2b, website) {
  const metaByDate = indexByDate(meta.dailyTimeSeries || []);
  const shopifyByDate = indexByDate(shopify.dailyTimeSeries || []);
  const b2bByDate = indexByDate(b2b.dailyTimeSeries || []);
  const websiteByDate = indexByDate(website.dailyTimeSeries || []);

  const googleDaily = google.dailyTimeSeries || [];

  return googleDaily.map(gDay => {
    const date = gDay.date;
    const mDay = metaByDate[date] || {};
    const sDay = shopifyByDate[date] || {};
    const bDay = b2bByDate[date] || {};
    const wDay = websiteByDate[date] || {};

    return {
      date,
      googleSpend: gDay.spend || 0,
      googleClicks: gDay.clicks || 0,
      googleImpressions: gDay.impressions || 0,
      googleConversions: gDay.conversions || 0,
      googleCTR: gDay.ctr || 0,
      googleCPC: gDay.cpc || 0,
      metaSpend: mDay.spend || 0,
      metaClicks: mDay.clicks || 0,
      metaImpressions: mDay.impressions || 0,
      metaConversions: mDay.conversions || 0,
      metaCTR: mDay.ctr || 0,
      metaCPC: mDay.cpc || 0,
      revenue: sDay.revenue || 0,
      orders: sDay.orders || 0,
      aov: sDay.aov || 0,
      b2bLeads: bDay.leads || 0,
      b2bSpend: bDay.spend || 0,
      sessions: wDay.sessions || 0,
      pageviews: wDay.pageviews || 0,
      bounceRate: wDay.bounceRate || 0,
      avgSessionDuration: wDay.avgSessionDuration || 0,
    };
  });
}

function indexByDate(dailyArray) {
  const map = {};
  for (const entry of dailyArray) {
    if (entry.date) map[entry.date] = entry;
  }
  return map;
}
