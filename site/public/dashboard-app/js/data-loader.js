/**
 * Data loader for the marketing performance dashboard.
 * Fetches config and all channel JSON files, then computes cross-channel aggregates.
 */

export async function loadAllData() {
  // 1. Fetch config
  const config = await fetch('data/config.json').then(r => {
    if (!r.ok) throw new Error(`Failed to load config: ${r.status}`);
    return r.json();
  });

  // 2. Parallel fetch all channel data + promos + goals
  const basePath = `data/${config.dataSource}`;
  const [google, meta, shopify, b2b, website, promos, goals, annotations] = await Promise.all([
    fetch(`${basePath}/google-ads.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load google-ads: ${r.status}`);
      return r.json();
    }),
    fetch(`${basePath}/meta-ads.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load meta-ads: ${r.status}`);
      return r.json();
    }),
    fetch(`${basePath}/shopify.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load shopify: ${r.status}`);
      return r.json();
    }),
    fetch(`${basePath}/b2b-partners.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load b2b-partners: ${r.status}`);
      return r.json();
    }),
    fetch(`${basePath}/website.json`).then(r => {
      if (!r.ok) throw new Error(`Failed to load website: ${r.status}`);
      return r.json();
    }),
    fetch(`${basePath}/promos.json`).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${basePath}/goals.json`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
    fetch(`${basePath}/annotations.json`).then(r => r.ok ? r.json() : []).catch(() => []),
  ]);

  // 3. Compute aggregates
  const computed = computeAggregates(google, meta, shopify, b2b, website);

  return { config, google, meta, shopify, b2b, website, computed, promos, goals, annotations };
}

/**
 * Compute cross-channel aggregate metrics from all data sources.
 */
function computeAggregates(google, meta, shopify, b2b, website) {
  // --- Current period ---
  const googleSpend = google.summary.spend || 0;
  const metaSpend = meta.summary.spend || 0;
  const b2bSpend = b2b.summary.totalPartnerSpend || 0;

  const totalSpend = googleSpend + metaSpend + b2bSpend;
  const totalRevenue = (shopify.summary.totalRevenue || 0) + (b2b.summary.revenue || 0);
  const blendedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const googleConversions = google.summary.conversions || 0;
  const metaConversions = meta.summary.conversions || 0;
  const totalConversions = googleConversions + metaConversions;

  // Blended CPA uses only paid ad spend (Google + Meta), not B2B partner spend
  const paidSpend = googleSpend + metaSpend;
  const blendedCPA = totalConversions > 0 ? paidSpend / totalConversions : 0;

  // --- Previous period ---
  const prevGoogleSpend = google.previousSummary.spend || 0;
  const prevMetaSpend = meta.previousSummary.spend || 0;
  const prevB2bSpend = b2b.previousSummary.totalPartnerSpend || 0;

  const previousTotalSpend = prevGoogleSpend + prevMetaSpend + prevB2bSpend;
  const previousTotalRevenue = (shopify.previousSummary.totalRevenue || 0) + (b2b.previousSummary?.revenue || 0);
  const previousBlendedROAS = previousTotalSpend > 0 ? previousTotalRevenue / previousTotalSpend : 0;

  const prevGoogleConversions = google.previousSummary.conversions || 0;
  const prevMetaConversions = meta.previousSummary.conversions || 0;
  const previousTotalConversions = prevGoogleConversions + prevMetaConversions;

  const prevPaidSpend = prevGoogleSpend + prevMetaSpend;
  const previousBlendedCPA = previousTotalConversions > 0 ? prevPaidSpend / previousTotalConversions : 0;

  // --- Merge daily time series ---
  const dailyMerged = mergeDailyData(google, meta, shopify, b2b, website);

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
 * Merge daily time series data across all channels by date.
 * Uses google daily data dates as the base (31 days in March 2026).
 */
function mergeDailyData(google, meta, shopify, b2b, website) {
  // Build lookup maps by date for each channel
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
      // Google Ads
      googleSpend: gDay.spend || 0,
      googleClicks: gDay.clicks || 0,
      googleImpressions: gDay.impressions || 0,
      googleConversions: gDay.conversions || 0,
      googleCTR: gDay.ctr || 0,
      googleCPC: gDay.cpc || 0,
      // Meta Ads
      metaSpend: mDay.spend || 0,
      metaClicks: mDay.clicks || 0,
      metaImpressions: mDay.impressions || 0,
      metaConversions: mDay.conversions || 0,
      metaCTR: mDay.ctr || 0,
      metaCPC: mDay.cpc || 0,
      // Shopify
      revenue: sDay.revenue || 0,
      orders: sDay.orders || 0,
      aov: sDay.aov || 0,
      // B2B Partners
      b2bLeads: bDay.leads || 0,
      b2bSpend: bDay.spend || 0,
      // Website
      sessions: wDay.sessions || 0,
      pageviews: wDay.pageviews || 0,
      bounceRate: wDay.bounceRate || 0,
      avgSessionDuration: wDay.avgSessionDuration || 0,
    };
  });
}

/**
 * Index an array of daily objects by their date field.
 */
function indexByDate(dailyArray) {
  const map = {};
  for (const entry of dailyArray) {
    if (entry.date) {
      map[entry.date] = entry;
    }
  }
  return map;
}
