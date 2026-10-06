// Each insight: { type: "positive"|"warning"|"critical", channel, message, detail }

export function generateInsights(data) {
  const insights = [];
  const { google, meta, shopify, b2b, website, computed } = data;

  // --- 1. PERIOD-OVER-PERIOD CHANGES (>10% threshold) ---

  // Google ROAS: 2.87 vs 2.71
  const googleROASChange = pctChange(google.summary.roas, google.previousSummary.roas);
  if (Math.abs(googleROASChange) >= 5) {
    insights.push({
      type: googleROASChange > 0 ? 'positive' : 'warning',
      channel: 'Google Ads',
      message: `ROAS ${googleROASChange > 0 ? 'improved' : 'declined'} ${Math.abs(googleROASChange).toFixed(1)}% vs last month`,
      detail: `Current: ${google.summary.roas.toFixed(2)}x | Previous: ${google.previousSummary.roas.toFixed(2)}x`
    });
  }

  // Meta ROAS: 1.92 vs 1.74 (+10.3%) — should trigger
  const metaROASChange = pctChange(meta.summary.roas, meta.previousSummary.roas);
  if (Math.abs(metaROASChange) >= 5) {
    insights.push({
      type: metaROASChange > 0 ? 'positive' : 'warning',
      channel: 'Meta Ads',
      message: `ROAS ${metaROASChange > 0 ? 'improved' : 'declined'} ${Math.abs(metaROASChange).toFixed(1)}% vs last month`,
      detail: `Current: ${meta.summary.roas.toFixed(2)}x | Previous: ${meta.previousSummary.roas.toFixed(2)}x. ${metaROASChange > 0 ? 'Consider scaling top-performing audiences.' : 'Review underperforming campaigns.'}`
    });
  }

  // B2B closed deals: 19 vs 15 (+26.7%)
  const b2bDealsChange = pctChange(b2b.summary.closedDeals, b2b.previousSummary.closedDeals);
  if (Math.abs(b2bDealsChange) >= 10) {
    insights.push({
      type: b2bDealsChange > 0 ? 'positive' : 'critical',
      channel: 'B2B Partners',
      message: `Closed deals ${b2bDealsChange > 0 ? 'up' : 'down'} ${Math.abs(b2bDealsChange).toFixed(0)}% — ${b2b.summary.closedDeals} deals this month`,
      detail: `Revenue from partners: $${(b2b.summary.revenue / 1000).toFixed(0)}K. Previous month: ${b2b.previousSummary.closedDeals} deals.`
    });
  }

  // Shopify revenue change
  const shopifyRevChange = pctChange(shopify.summary.totalRevenue, shopify.previousSummary.totalRevenue);
  if (Math.abs(shopifyRevChange) >= 5) {
    insights.push({
      type: shopifyRevChange > 0 ? 'positive' : 'critical',
      channel: 'E-Commerce',
      message: `Revenue ${shopifyRevChange > 0 ? 'grew' : 'dropped'} ${Math.abs(shopifyRevChange).toFixed(1)}% to $${(shopify.summary.totalRevenue / 1000).toFixed(0)}K`,
      detail: `${shopify.summary.orders} orders at $${shopify.summary.aov.toFixed(2)} AOV. Previous: $${(shopify.previousSummary.totalRevenue / 1000).toFixed(0)}K.`
    });
  }

  // Cart abandonment
  const cartChange = pctChange(shopify.summary.cartAbandonmentRate, shopify.previousSummary.cartAbandonmentRate);
  if (cartChange < -2) {
    insights.push({
      type: 'positive',
      channel: 'E-Commerce',
      message: `Cart abandonment improved to ${shopify.summary.cartAbandonmentRate.toFixed(1)}% (was ${shopify.previousSummary.cartAbandonmentRate.toFixed(1)}%)`,
      detail: `Down ${Math.abs(cartChange).toFixed(1)}% vs last month. Still above the 68% industry benchmark — room to improve checkout UX.`
    });
  } else if (shopify.summary.cartAbandonmentRate > 70) {
    insights.push({
      type: 'warning',
      channel: 'E-Commerce',
      message: `Cart abandonment at ${shopify.summary.cartAbandonmentRate.toFixed(1)}% — above 70% benchmark`,
      detail: `Review checkout flow for friction points. Abandoned cart email sequences can recover 5-15% of lost sales.`
    });
  }

  // --- 2. CAMPAIGN EFFICIENCY THRESHOLDS ---

  // Google campaigns with ROAS < 1.5
  google.campaigns.forEach(c => {
    if (c.roas < 1.5) {
      insights.push({
        type: c.roas < 1.0 ? 'critical' : 'warning',
        channel: 'Google Ads',
        message: `"${c.name}" ROAS at ${c.roas.toFixed(2)}x — below efficiency threshold`,
        detail: `Spend: $${c.spend.toLocaleString()} | Conversions: ${c.conversions} | CPA: $${c.cpa.toFixed(2)}. ${c.roas < 1.0 ? 'Consider pausing this campaign.' : 'Review targeting and bidding strategy.'}`
      });
    }
  });

  // Google campaigns with CPA > 2x channel average
  const googleAvgCPA = google.summary.cpa;
  google.campaigns.forEach(c => {
    if (c.cpa > googleAvgCPA * 2) {
      insights.push({
        type: 'critical',
        channel: 'Google Ads',
        message: `"${c.name}" CPA ($${c.cpa.toFixed(2)}) is ${(c.cpa / googleAvgCPA).toFixed(1)}x the channel average`,
        detail: `Channel avg CPA: $${googleAvgCPA.toFixed(2)}. Review ad copy, landing pages, and keyword match types for this campaign.`
      });
    }
  });

  // Keywords with QS < 5
  google.topKeywords.forEach(kw => {
    if (kw.qualityScore < 5) {
      insights.push({
        type: 'warning',
        channel: 'Google Ads',
        message: `Keyword "${kw.keyword}" has low Quality Score (${kw.qualityScore}/10)`,
        detail: `Low QS increases CPC and reduces ad rank. Improve ad relevance, expected CTR, and landing page experience.`
      });
    }
  });

  // --- 3. CROSS-CHANNEL COMPARISONS ---

  // Retargeting vs prospecting (Meta)
  const retargeting = meta.audiences.filter(a =>
    a.name.includes('Visitors') || a.name.includes('Abandoners') || a.name.includes('Email')
  );
  const prospecting = meta.audiences.filter(a =>
    a.name.includes('Lookalike') || a.name.includes('Interest')
  );
  if (retargeting.length && prospecting.length) {
    const avgRetROAS = retargeting.reduce((s, a) => s + a.roas, 0) / retargeting.length;
    const avgProspROAS = prospecting.reduce((s, a) => s + a.roas, 0) / prospecting.length;
    const uplift = pctChange(avgRetROAS, avgProspROAS);
    if (uplift > 30) {
      insights.push({
        type: 'positive',
        channel: 'Meta Ads',
        message: `Retargeting audiences outperform prospecting by ${uplift.toFixed(0)}% ROAS`,
        detail: `Avg retargeting ROAS: ${avgRetROAS.toFixed(2)}x vs prospecting: ${avgProspROAS.toFixed(2)}x. Consider shifting 10-15% of prospecting budget to retargeting.`
      });
    }
  }

  // Mobile vs desktop conversion gap
  const mobile = website.deviceBreakdown.find(d => d.device === 'Mobile');
  const desktop = website.deviceBreakdown.find(d => d.device === 'Desktop');
  if (mobile && desktop) {
    const gap = pctChange(desktop.conversionRate, mobile.conversionRate);
    if (gap > 30) {
      insights.push({
        type: 'warning',
        channel: 'Website',
        message: `Mobile converts ${gap.toFixed(0)}% lower than desktop (${mobile.conversionRate}% vs ${desktop.conversionRate}%)`,
        detail: `${mobile.percentage}% of sessions come from mobile. A mobile UX audit could significantly improve overall conversion rate.`
      });
    }
  }

  // Video creative outperformance
  const videoCreatives = meta.creativePerformance.filter(c => c.format === 'video');
  const nonVideoCreatives = meta.creativePerformance.filter(c => c.format !== 'video');
  if (videoCreatives.length && nonVideoCreatives.length) {
    const avgVideoConvRate = videoCreatives.reduce((s, c) => s + c.conversions / c.spend, 0) / videoCreatives.length;
    const avgNonVideoConvRate = nonVideoCreatives.reduce((s, c) => s + c.conversions / c.spend, 0) / nonVideoCreatives.length;
    const videoUplift = pctChange(avgVideoConvRate, avgNonVideoConvRate);
    if (videoUplift > 20) {
      insights.push({
        type: 'positive',
        channel: 'Meta Ads',
        message: `Video creatives drive ${videoUplift.toFixed(0)}% more conversions per dollar than static`,
        detail: `Avg thumb stop rates: ${(videoCreatives.reduce((s, c) => s + c.thumbStopRate, 0) / videoCreatives.length).toFixed(1)}% for video. Scale video production budget.`
      });
    }
  }

  // B2B lead qualification rate
  const qualRate = (b2b.summary.qualifiedLeads / b2b.summary.totalLeads * 100);
  if (qualRate < 25) {
    insights.push({
      type: 'warning',
      channel: 'B2B Partners',
      message: `Lead qualification rate is ${qualRate.toFixed(1)}% — review lead quality`,
      detail: `Only ${b2b.summary.qualifiedLeads} of ${b2b.summary.totalLeads} leads are qualified. Work with partners on targeting criteria to improve quality.`
    });
  }

  // High-performing landing page
  const bestPage = [...website.topLandingPages].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  if (bestPage && bestPage.conversionRate > 5) {
    insights.push({
      type: 'positive',
      channel: 'Website',
      message: `"${bestPage.title}" is your top converting page at ${bestPage.conversionRate}% CVR`,
      detail: `${bestPage.sessions.toLocaleString()} sessions with ${bestPage.bounceRate}% bounce rate. Use this page as a template for other product pages.`
    });
  }

  // High bounce page
  const worstBounce = [...website.topLandingPages].sort((a, b) => b.bounceRate - a.bounceRate)[0];
  if (worstBounce && worstBounce.bounceRate > 55) {
    insights.push({
      type: 'warning',
      channel: 'Website',
      message: `"${worstBounce.title}" has ${worstBounce.bounceRate}% bounce rate — highest among top pages`,
      detail: `${worstBounce.sessions.toLocaleString()} sessions. Test new hero content, clearer CTAs, or faster page load time.`
    });
  }

  // Sort: critical first, then warning, then positive
  const order = { critical: 0, warning: 1, positive: 2 };
  return insights.sort((a, b) => order[a.type] - order[b.type]);
}

function pctChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
