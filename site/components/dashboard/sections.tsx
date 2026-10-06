// @ts-nocheck
"use client";

import { memo } from "react";
import { formatCurrency, formatNumber, formatPercent, formatDelta, formatDate, formatDuration } from "./format";
import { generateInsights } from "./insights";
import { ChartCard, channelColor, chartColor } from "./charts";
import { Kpi, DataTable, Funnel, InsightsView } from "./ui";
import { getPromosInRange, getAnnotationsInRange } from "./overlays";

/* ── helpers ─────────────────────────────────────────────────────────────── */

export const SECTION_META = [
  ["executive-summary", "Executive Summary", "High-level performance across all channels"],
  ["channel-mix", "Cross-Channel Performance", "Compare efficiency and ROI across channels"],
  ["funnel-analysis", "Conversion Funnel", "Track drop-off from awareness to purchase"],
  ["google-ads", "Google Ads", "Search, Shopping, and Display campaign performance"],
  ["meta-ads", "Meta Ads", "Facebook and Instagram advertising performance"],
  ["shopify", "E-Commerce", "Shopify revenue, products, and customer metrics"],
  ["b2b-partners", "B2B Partners", "Partner lead generation and deal pipeline"],
  ["website", "Website Analytics", "Traffic, engagement, and user behavior"],
  ["insights", "Insights & Recommendations", "Auto-generated actionable takeaways"],
  ["trends", "Cross-Channel Trends", "Performance trends over time"],
  ["promo-analysis", "Promo Analysis", "Before / during / after promotional window comparison"],
];

function Shell({ id, children }) {
  const [, title, sub] = SECTION_META.find((m) => m[0] === id);
  return (
    <section id={id} className="dashboard-section visible">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{sub}</p>
      </div>
      <div className="section-content">{children}</div>
    </section>
  );
}

const Disclaimer = ({ data }) =>
  data._comparisonLabel ? <p className="comparison-disclaimer">% changes compared to {data._comparisonLabel}</p> : null;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const daysInMonthOf = (iso) => {
  if (!iso) return 31;
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m, 0).getDate();
};
const SOURCE_CHANNEL = { "Paid Search": "google", "Paid Social": "meta", "Organic Search": "organic", Direct: "direct", Email: "email", Referral: "referral" };

/* ── 1. executive summary ────────────────────────────────────────────────── */

function ExecutiveSummaryImpl({ data }) {
  const { computed: c, google, meta, shopify, goals } = data;
  const daily = c.dailyMerged || [];
  const gm = goals?.monthly || {};
  const elapsed = daily.length;
  const period = daysInMonthOf(daily[daily.length - 1]?.date);
  const spark = (fn) => daily.map(fn);

  const revDelta = c.previousTotalRevenue > 0 ? ((c.totalRevenue - c.previousTotalRevenue) / c.previousTotalRevenue) * 100 : 0;
  const gDelta = Math.abs((google.summary.revenue || 0) - (google.previousSummary?.revenue || 0));
  const mDelta = Math.abs((meta.summary.revenue || 0) - (meta.previousSummary?.revenue || 0));
  const driver = gDelta >= mDelta ? "Google Ads" : "Meta Ads";
  const parts = [];
  parts.push(
    Math.abs(revDelta) <= 1
      ? `Revenue is flat at ${formatCurrency(c.totalRevenue, true)}.`
      : `Revenue is ${revDelta > 0 ? "up" : "down"} ${Math.abs(revDelta).toFixed(1)}% to ${formatCurrency(c.totalRevenue, true)}, driven by ${driver}.`,
  );
  const cpaDelta = c.previousBlendedCPA > 0 ? ((c.blendedCPA - c.previousBlendedCPA) / c.previousBlendedCPA) * 100 : 0;
  if (cpaDelta > 5) parts.push(`Blended CPA rose ${cpaDelta.toFixed(1)}% — monitor acquisition costs.`);
  else if (cpaDelta < -5) parts.push(`CPA improved ${Math.abs(cpaDelta).toFixed(1)}%, making acquisition more efficient.`);
  if (gm.revenue > 0) {
    const gp = (c.totalRevenue / gm.revenue) * 100;
    if (gp >= 95) parts.push("On track to hit the revenue target.");
    else if (gp >= 70) parts.push(`At ${Math.round(gp)}% of revenue goal — needs acceleration.`);
    else parts.push(`Behind on revenue goal (${Math.round(gp)}%) — action needed.`);
  }

  const sp = shopify.summary;
  const prev = shopify.previousSummary || {};
  const contribution = (sp.grossProfit || 0) - c.totalSpend;
  const prevContribution = (prev.grossProfit || 0) - (c.previousTotalSpend || 0);
  const mer = c.totalSpend > 0 ? c.totalRevenue / c.totalSpend : 0;
  const prevMer = c.previousTotalSpend > 0 ? c.previousTotalRevenue / c.previousTotalSpend : 0;

  return (
    <Shell id="executive-summary">
      <Disclaimer data={data} />
      <div className="grid grid-5">
        <Kpi index={0} label="Total Revenue" value={c.totalRevenue} previous={c.previousTotalRevenue} format="currency" accentColor={channelColor("shopify")} sparkline={spark((d) => d.revenue)} goal={gm.revenue} daysElapsed={elapsed} daysInPeriod={period} />
        <Kpi index={1} label="Total Spend" value={c.totalSpend} previous={c.previousTotalSpend} format="currency" invertDelta accentColor={channelColor("google")} sparkline={spark((d) => d.googleSpend + d.metaSpend)} goal={gm.spend} daysElapsed={elapsed} daysInPeriod={period} />
        <Kpi index={2} label="Blended ROAS" value={c.blendedROAS} previous={c.previousBlendedROAS} format="multiplier" accentColor={chartColor(1)} goal={gm.roas} />
        <Kpi index={3} label="Total Conversions" value={c.totalConversions} previous={c.previousTotalConversions} format="number" accentColor={chartColor(2)} sparkline={spark((d) => d.googleConversions + d.metaConversions)} goal={gm.conversions} daysElapsed={elapsed} daysInPeriod={period} />
        <Kpi index={4} label="Blended CPA" value={c.blendedCPA} previous={c.previousBlendedCPA} format="currency" invertDelta accentColor={chartColor(3)} goal={gm.cpa} />
      </div>
      <div className="exec-narrative">
        <div className="exec-narrative__icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" /></svg>
        </div>
        <p>{parts.join(" ")}</p>
      </div>
      <div className="grid grid-4">
        <Kpi index={0} label="Gross Profit" value={sp.grossProfit} previous={prev.grossProfit} format="currency" accentColor="#00d084" goal={gm.grossProfit} />
        <Kpi index={1} label="Contribution Margin" value={contribution} previous={prevContribution} format="currency" subtitle="profit after ad spend" />
        <Kpi index={2} label="Gross Margin" value={sp.grossMarginPercent} previous={prev.grossMarginPercent} format="percent" />
        <Kpi index={3} label="MER" value={mer} previous={prevMer} format="multiplier" subtitle="revenue per $1 spent" />
      </div>
    </Shell>
  );
}

/* ── 2. channel mix ──────────────────────────────────────────────────────── */

function ChannelMixImpl({ data }) {
  const { google: g, meta: m, shopify: s, b2b: b } = data;
  const organicSrc = (s.revenueBySource || []).find((r) => /organic/i.test(r.source));
  const b2bSpend = b.summary.totalPartnerSpend || 0;
  const rows = [
    { channel: "Google Ads", key: "google", badge: "badge-google", spend: g.summary.spend, revenue: g.summary.revenue, roas: g.summary.roas, conversions: g.summary.conversions, cpa: g.summary.cpa },
    { channel: "Meta Ads", key: "meta", badge: "badge-meta", spend: m.summary.spend, revenue: m.summary.revenue, roas: m.summary.roas, conversions: m.summary.conversions, cpa: m.summary.cpa },
    { channel: "B2B Partners", key: "b2b", badge: "badge-b2b", spend: b2bSpend, revenue: b.summary.revenue, roas: b2bSpend > 0 ? b.summary.revenue / b2bSpend : null, conversions: b.summary.closedDeals, cpa: b.summary.closedDeals > 0 ? b2bSpend / b.summary.closedDeals : null },
    { channel: "Organic", key: "organic", badge: "badge-organic", spend: 0, revenue: organicSrc ? organicSrc.revenue : 0, roas: null, conversions: null, cpa: null },
  ];
  const cols = [
    { key: "channel", label: "Channel", badge: (r) => ({ text: r.channel, cls: r.badge }) },
    { key: "spend", label: "Spend", type: "currency" },
    { key: "revenue", label: "Revenue", type: "currency" },
    { key: "roas", label: "ROAS", type: "number", render: (v) => (v == null ? "-" : `${Number(v).toFixed(2)}x`), sortValue: (r) => r.roas ?? -1 },
    { key: "conversions", label: "Conversions", type: "number", render: (v) => (v == null ? "-" : formatNumber(v)), sortValue: (r) => r.conversions ?? -1 },
    { key: "cpa", label: "CPA", type: "currency", render: (v) => (v == null ? "-" : formatCurrency(v)), sortValue: (r) => r.cpa ?? -1 },
  ];
  const roasRows = rows.filter((r) => ["google", "meta", "b2b"].includes(r.key));
  const src = s.revenueBySource || [];
  const ranked = rows.filter((r) => r.spend > 0 && r.roas != null).sort((a, b2) => b2.roas - a.roas);
  const bubbles = ranked.map((r) => ({ label: r.channel, backgroundColor: channelColor(r.key), data: [{ x: r.cpa || 0, y: r.roas, r: Math.max(Math.sqrt(r.spend / 500), 5) }] }));

  return (
    <Shell id="channel-mix">
      <Disclaimer data={data} />
      <DataTable title="Channel Performance Comparison" columns={cols} rows={rows} defaultSort={{ key: "spend", dir: "desc" }} csvFilename="channel-mix" />
      <div className="grid grid-2">
        <ChartCard title="ROAS by Channel" kind="bar" toggle spec={{ labels: roasRows.map((r) => r.channel), datasets: [{ label: "ROAS", data: roasRows.map((r) => r.roas || 0), colors: roasRows.map((r) => channelColor(r.key)) }], horizontal: true }} />
        <ChartCard title="Revenue Attribution" kind="doughnut" spec={{ labels: src.map((r) => r.source), data: src.map((r) => r.revenue), colors: src.map((r) => channelColor(SOURCE_CHANNEL[r.source] || "direct")), aspectRatio: 1.5 }} />
      </div>
      <div className="grid grid-2">
        <div className="chart-wrapper">
          <div className="chart-title">Budget Efficiency Ranking</div>
          <div className="budget-rank-list">
            {ranked.map((r, i) => {
              const sig = r.roas >= 3 ? ["positive", "SCALE"] : r.roas >= 1.5 ? ["neutral", "MAINTAIN"] : ["negative", "REDUCE"];
              return (
                <div className="budget-rank-item" key={r.key}>
                  <span className="budget-rank-pos">#{i + 1}</span>
                  <span className="budget-rank-name">{r.channel}</span>
                  <span className="budget-rank-roas">{r.roas.toFixed(2)} ROAS</span>
                  <span className={`budget-rank-signal budget-rank-signal--${sig[0]}`}>{sig[1]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <ChartCard title="Channel Efficiency Map" kind="bubble" spec={{ datasets: bubbles, aspectRatio: 1.2 }} />
      </div>
    </Shell>
  );
}

/* ── 3. funnel ───────────────────────────────────────────────────────────── */

function FunnelImpl({ data }) {
  const { shopify, b2b } = data;
  const sp = shopify.previousSummary || {};
  const bp = b2b.previousSummary || {};
  const ef = shopify.conversionFunnel || {};
  const bf = b2b.leadFunnel || {};
  const sessions = ef.sessions ?? shopify.summary.sessions ?? 0;
  const views = ef.productViews ?? 0;
  const cart = ef.addToCart ?? 0;
  const checkout = ef.checkoutStarted ?? 0;
  const orders = ef.orders ?? shopify.summary.orders ?? 0;
  const aov = shopify.summary.aov || 0;
  const stages = [
    ["Product Views", "Add to Cart", Math.max(views - cart, 0)],
    ["Add to Cart", "Checkout", Math.max(cart - checkout, 0)],
    ["Checkout", "Purchase", Math.max(checkout - orders, 0)],
  ];
  return (
    <Shell id="funnel-analysis">
      <Disclaimer data={data} />
      <div className="grid grid-2">
        <div className="chart-wrapper">
          <div className="chart-title">E-Commerce Funnel</div>
          <Funnel steps={[
            { label: "Sessions", value: sessions, color: "#4285f4" },
            { label: "Product Views", value: views, color: "#34a853" },
            { label: "Add to Cart", value: cart, color: "#ff6b35" },
            { label: "Checkout Started", value: checkout, color: "#9b59b6" },
            { label: "Orders", value: orders, color: "#27ae60" },
          ]} />
        </div>
        <div className="chart-wrapper">
          <div className="chart-title">B2B Lead Funnel</div>
          <Funnel steps={[
            { label: "Total Leads", value: bf.totalLeads ?? b2b.summary.totalLeads ?? 0, color: "#ff6b35" },
            { label: "Qualified", value: bf.qualifiedLeads ?? b2b.summary.qualifiedLeads ?? 0, color: "#e67e22" },
            { label: "Opportunities", value: bf.opportunities ?? b2b.summary.opportunities ?? 0, color: "#f39c12" },
            { label: "Proposals", value: bf.proposals ?? 0, color: "#f1c40f" },
            { label: "Closed Deals", value: bf.closedDeals ?? b2b.summary.closedDeals ?? 0, color: "#27ae60" },
          ]} />
        </div>
      </div>
      {aov > 0 && (
        <div className="funnel-dropoff-costs">
          <div className="chart-title">Revenue Lost at Each Stage</div>
          <div className="grid grid-3">
            {stages.map(([from, to, lost]) => (
              <div className="dropoff-card" key={from}>
                <div className="dropoff-card__label">{from} → {to}</div>
                <div className="dropoff-card__value">{formatCurrency(lost * aov)}</div>
                <div className="dropoff-card__detail">{formatNumber(lost)} visitors lost × {formatCurrency(aov)} AOV</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-4">
        <Kpi index={0} label="Cart Abandonment Rate" value={shopify.summary.cartAbandonmentRate} previous={sp.cartAbandonmentRate} format="percent" invertDelta subtitle="vs 70% benchmark" estimated />
        <Kpi index={1} label="View-to-Cart Rate" value={views > 0 ? (cart / views) * 100 : 0} format="percent" subtitle="of product views" />
        <Kpi index={2} label="Cart-to-Purchase Rate" value={cart > 0 ? (orders / cart) * 100 : 0} format="percent" subtitle="of carts convert" />
        <Kpi index={3} label="B2B Lead-to-Close" value={b2b.summary.leadToCloseRate} previous={bp.leadToCloseRate} format="percent" estimated />
      </div>
    </Shell>
  );
}

/* ── 4. google ads ───────────────────────────────────────────────────────── */

const rowAlert = (avgCpa) => (r) =>
  r.roas != null && r.roas < 1.0 ? "row-alert row-alert--critical" : avgCpa && r.cpa > avgCpa * 2 ? "row-alert row-alert--warning" : undefined;

function GoogleImpl({ data, compareData }) {
  const g = data.google;
  const gp = g.previousSummary || {};
  const daily = g.dailyTimeSeries || [];
  const cmp = compareData?.google?.dailyTimeSeries;
  const typeBadge = { search: "badge-search", shopping: "badge-shopify", pmax: "badge-b2b", display: "badge-social" };
  const matchBadge = { exact: "badge-search", phrase: "badge-google", broad: "badge-organic" };
  const types = [["Search", "#4285f4", "search"], ["Shopping", "#34a853", "shopping"], ["PMax", "#ff6b35", "pmax"], ["Display", "#9b59b6", "display"]];
  const typeSpend = types.map(([, , t]) => (g.campaigns || []).filter((c) => c.type === t).reduce((a, c) => a + (c.spend || 0), 0));
  const kpi = (label, key, fmt, extra = {}) => ({
    label, value: fmt(g.summary[key]), delta: formatDelta(g.summary[key], gp[key], extra.invert), sparkline: daily.map((d) => d[extra.spark || key]), ...extra,
  });
  const dailySets = [
    { label: "Spend", data: daily.map((d) => d.spend), borderColor: "#4285f4" },
    { label: "Conversions", data: daily.map((d) => d.conversions), borderColor: "#34a853" },
  ];
  if (cmp) {
    dailySets.push({ label: "Spend (Compare)", data: cmp.map((d) => d.spend), borderColor: "#4285f4", borderDash: [5, 4], fill: false, pointRadius: 0, backgroundColor: "transparent" });
    dailySets.push({ label: "Conversions (Compare)", data: cmp.map((d) => d.conversions), borderColor: "#34a853", borderDash: [5, 4], fill: false, pointRadius: 0, backgroundColor: "transparent" });
  }
  const labels = daily.map((d) => formatDate(d.date));

  return (
    <Shell id="google-ads">
      <Disclaimer data={data} />
      <div className="grid grid-4">
        <Kpi index={0} accentColor="#4285f4" sparklineColor="#4285f4" {...kpi("Spend", "spend", (v) => formatCurrency(v, true), { invert: true })} invertDelta />
        <Kpi index={1} accentColor="#4285f4" sparklineColor="#4285f4" {...kpi("ROAS", "roas", (v) => `${Number(v).toFixed(2)}×`, { spark: "conversions" })} />
        <Kpi index={2} accentColor="#4285f4" sparklineColor="#4285f4" {...kpi("Revenue", "revenue", (v) => formatCurrency(v, true), { spark: "conversions" })} />
        <Kpi index={3} accentColor="#4285f4" sparklineColor="#4285f4" {...kpi("Clicks", "clicks", (v) => formatNumber(v))} />
      </div>
      <DataTable
        title="Campaign Performance" csvFilename="google-campaigns" rows={g.campaigns || []} defaultSort={{ key: "spend", dir: "desc" }} rowClass={rowAlert(g.summary.cpa)}
        columns={[
          { key: "name", label: "Campaign" },
          { key: "type", label: "Type", badge: (r) => ({ text: r.type === "pmax" ? "PMax" : cap(r.type), cls: typeBadge[r.type] || "badge-google" }) },
          { key: "status", label: "Status", badge: (r) => ({ text: cap(r.status), cls: r.status === "active" ? "badge-active" : "badge-paused" }) },
          { key: "spend", label: "Spend", type: "currency" },
          { key: "clicks", label: "Clicks", type: "number" },
          { key: "conversions", label: "Conv.", type: "number" },
          { key: "cpa", label: "CPA", type: "currency" },
          { key: "roas", label: "ROAS", type: "roas" },
        ]}
      />
      <div className="grid grid-2">
        <ChartCard title="Daily Performance" kind="line" toggle spec={{ labels, datasets: dailySets, dualAxis: true }} />
        <ChartCard title="Spend by Campaign Type" kind="doughnut" spec={{ labels: types.map((t) => t[0]), data: typeSpend, colors: types.map((t) => t[1]) }} />
      </div>
      <DataTable
        title="Top Keywords" csvFilename="google-keywords" rows={g.topKeywords || []} defaultSort={{ key: "conversions", dir: "desc" }}
        columns={[
          { key: "keyword", label: "Keyword" },
          { key: "matchType", label: "Match", badge: (r) => ({ text: cap(r.matchType), cls: matchBadge[r.matchType] || "badge-google" }) },
          { key: "impressions", label: "Impr.", type: "number" },
          { key: "clicks", label: "Clicks", type: "number" },
          { key: "ctr", label: "CTR", type: "percent" },
          { key: "cpc", label: "CPC", type: "currency" },
          { key: "conversions", label: "Conv.", type: "number" },
          { key: "qualityScore", label: "QS", type: "qs" },
        ]}
      />
      {(g.devices || []).length > 0 && (
        <div className="grid grid-2">
          <ChartCard title="Spend by Device" kind="doughnut" spec={{ labels: g.devices.map((d) => d.device), data: g.devices.map((d) => d.spend), colors: ["#4285f4", "#34a853", "#f4b400"] }} />
          <ChartCard title="ROAS by Device" kind="bar" spec={{ labels: g.devices.map((d) => d.device), datasets: [{ label: "ROAS", data: g.devices.map((d) => d.roas), colors: g.devices.map((d) => (d.roas >= 2.5 ? "#34a853" : d.roas >= 1.5 ? "#f4b400" : "#ff6b35")) }] }} />
        </div>
      )}
      {g.impressionShare && (
        <div className="grid grid-4">
          <Kpi index={0} label="Search Impr. Share" value={g.impressionShare.search} previous={g.impressionShare.previous?.search} format="percent" accentColor="#4285f4" />
          <Kpi index={1} label="Lost to Budget" value={g.impressionShare.lostBudget} previous={g.impressionShare.previous?.lostBudget} format="percent" invertDelta accentColor="#4285f4" />
          <Kpi index={2} label="Lost to Rank" value={g.impressionShare.lostRank} previous={g.impressionShare.previous?.lostRank} format="percent" invertDelta accentColor="#4285f4" />
          <Kpi index={3} label="Top of Page Rate" value={g.impressionShare.topOfPage} format="percent" accentColor="#4285f4" />
        </div>
      )}
      {(g.searchTerms || []).length > 0 && (
        <DataTable
          title="Search Terms" subtitle="Queries that triggered ads" csvFilename="google-search-terms" rows={g.searchTerms} defaultSort={{ key: "revenue", dir: "desc" }}
          columns={[
            { key: "term", label: "Search Term" },
            { key: "matchType", label: "Match", badge: (r) => ({ text: cap(r.matchType), cls: matchBadge[r.matchType] || "badge-google" }) },
            { key: "campaign", label: "Campaign", muted: true },
            { key: "spend", label: "Spend", type: "currency" },
            { key: "clicks", label: "Clicks", type: "number" },
            { key: "conversions", label: "Conv.", type: "number" },
            { key: "cpa", label: "CPA", type: "currency" },
            { key: "roas", label: "ROAS", type: "roas" },
          ]}
        />
      )}
      {(g.shoppingProducts || []).length > 0 && (
        <DataTable
          title="Shopping Products" csvFilename="google-shopping-products" rows={g.shoppingProducts} defaultSort={{ key: "revenue", dir: "desc" }}
          columns={[
            { key: "product", label: "Product" },
            { key: "spend", label: "Spend", type: "currency" },
            { key: "clicks", label: "Clicks", type: "number" },
            { key: "conversions", label: "Conv.", type: "number" },
            { key: "revenue", label: "Revenue", type: "currency" },
            { key: "roas", label: "ROAS", type: "roas" },
          ]}
        />
      )}
      {(g.geo || []).length > 0 && (
        <ChartCard title="ROAS by Region" kind="bar" spec={{ labels: g.geo.map((r) => r.region), datasets: [{ label: "ROAS", data: g.geo.map((r) => r.roas), colors: g.geo.map((r) => (r.roas >= 2.5 ? "#34a853" : r.roas >= 1.5 ? "#f4b400" : "#ff6b35")) }], horizontal: true }} />
      )}
    </Shell>
  );
}

/* ── 5. meta ads ─────────────────────────────────────────────────────────── */

function MetaImpl({ data }) {
  const m = data.meta;
  const mp = m.previousSummary || {};
  const daily = m.dailyTimeSeries || [];
  const objBadge = { conversions: "badge-google", catalog_sales: "badge-shopify" };
  const fmtBadge = { video: "badge-video", image: "badge-image", carousel: "badge-social", dynamic: "badge-b2b" };
  const aud = m.audiences || [];
  const cr = m.creativePerformance || [];
  const roasColor = (r) => (r >= 2.5 ? "#34a853" : r >= 1.5 ? "#f4b400" : "#ff6b35");
  const formats = ["video", "carousel", "image", "dynamic"];
  const agg = formats.map((f) => {
    const items = cr.filter((c) => c.format === f);
    const imp = items.reduce((a, c) => a + (c.impressions || 0), 0);
    const clk = items.reduce((a, c) => a + (c.clicks || 0), 0);
    const cv = items.reduce((a, c) => a + (c.conversions || 0), 0);
    return [imp > 0 ? +((clk / imp) * 100).toFixed(2) : 0, clk > 0 ? +((cv / clk) * 100).toFixed(2) : 0];
  });
  const trunc = (s) => (s.length > 28 ? s.slice(0, 26) + "…" : s);
  const sparkC = "#1877f2";

  return (
    <Shell id="meta-ads">
      <Disclaimer data={data} />
      <div className="grid grid-4">
        <Kpi index={0} label="Spend" value={m.summary.spend} previous={mp.spend} format="currency" invertDelta accentColor={sparkC} sparkline={daily.map((d) => d.spend)} sparklineColor={sparkC} />
        <Kpi index={1} label="ROAS" value={m.summary.roas} previous={mp.roas} format="multiplier" accentColor={sparkC} sparkline={daily.map((d) => d.conversions)} sparklineColor={sparkC} />
        <Kpi index={2} label="Revenue" value={m.summary.revenue} previous={mp.revenue} format="currency" accentColor={sparkC} sparkline={daily.map((d) => d.conversions)} sparklineColor={sparkC} />
        <Kpi index={3} label="Clicks" value={m.summary.clicks} previous={mp.clicks} format="number" accentColor={sparkC} sparkline={daily.map((d) => d.clicks)} sparklineColor={sparkC} />
      </div>
      <DataTable
        title="Campaign Performance" csvFilename="meta-campaigns" rows={m.campaigns || []} defaultSort={{ key: "spend", dir: "desc" }} rowClass={rowAlert(m.summary.cpa)}
        columns={[
          { key: "name", label: "Campaign" },
          { key: "objective", label: "Objective", badge: (r) => ({ text: String(r.objective).split("_").map(cap).join(" "), cls: objBadge[r.objective] || "badge-google" }) },
          { key: "status", label: "Status", badge: (r) => ({ text: cap(r.status), cls: r.status === "active" ? "badge-active" : "badge-paused" }) },
          { key: "spend", label: "Spend", type: "currency" },
          { key: "reach", label: "Reach", type: "number" },
          { key: "clicks", label: "Clicks", type: "number" },
          { key: "conversions", label: "Conv.", type: "number" },
          { key: "cpa", label: "CPA", type: "currency" },
          { key: "roas", label: "ROAS", type: "roas" },
        ]}
      />
      <div className="grid grid-2">
        <ChartCard title="Audience ROAS" kind="bar" spec={{ labels: aud.map((a) => trunc(a.name)), datasets: [{ label: "ROAS", data: aud.map((a) => a.roas), colors: aud.map((a) => roasColor(a.roas)) }], horizontal: true }} />
        <ChartCard title="Creative Performance by Format" kind="bar" toggle spec={{ labels: formats.map(cap), datasets: [{ label: "CTR %", data: agg.map((a) => a[0]), backgroundColor: "#1877f2", borderColor: "#1877f2" }, { label: "Conv. Rate %", data: agg.map((a) => a[1]), backgroundColor: "#42b72a", borderColor: "#42b72a" }] }} />
      </div>
      <DataTable
        title="Creative Performance" subtitle="Thumb Stop Rate: % of viewers who stop scrolling to watch" csvFilename="meta-creatives" rows={cr}
        columns={[
          { key: "name", label: "Creative" },
          { key: "format", label: "Format", badge: (r) => ({ text: cap(r.format), cls: fmtBadge[r.format] || "badge-image" }) },
          { key: "spend", label: "Spend", type: "currency" },
          { key: "impressions", label: "Impr.", type: "number" },
          { key: "ctr", label: "CTR", type: "percent" },
          { key: "conversions", label: "Conv.", type: "number" },
          { key: "thumbStopRate", label: "Thumb Stop", type: "percent" },
        ]}
      />
      {aud.length > 0 && (
        <DataTable
          title="Audiences" csvFilename="meta-audiences" rows={aud} defaultSort={{ key: "roas", dir: "desc" }}
          columns={[
            { key: "name", label: "Audience" },
            { key: "spend", label: "Spend", type: "currency" },
            { key: "conversions", label: "Conv.", type: "number" },
            { key: "cpa", label: "CPA", type: "currency" },
            { key: "roas", label: "ROAS", type: "roas" },
          ]}
        />
      )}
    </Shell>
  );
}

/* ── 6. e-commerce ───────────────────────────────────────────────────────── */

function ShopifyImpl({ data }) {
  const s = data.shopify;
  const sp = s.previousSummary || {};
  const daily = s.dailyTimeSeries || [];
  const src = s.revenueBySource || [];
  const green = "#96bf48";
  const sk = (d, key) => daily.map((x) => x[key]);
  const K = (i, label, key, fmt, extra = {}) => (
    <Kpi index={i} label={label} value={fmt(s.summary[key])} delta={formatDelta(s.summary[key], sp[key], extra.invertDelta)} {...extra} />
  );
  return (
    <Shell id="shopify">
      <Disclaimer data={data} />
      <div className="grid grid-6">
        {K(0, "Revenue", "totalRevenue", (v) => formatCurrency(v, true), { accentColor: green, sparkline: sk(0, "revenue"), sparklineColor: green })}
        {K(1, "Orders", "orders", (v) => formatNumber(v), { sparkline: sk(0, "orders"), sparklineColor: green })}
        {K(2, "Avg Order Value", "aov", (v) => formatCurrency(v), { subtitle: "per transaction" })}
        {K(3, "Conversion Rate", "conversionRate", (v) => formatPercent(v), { subtitle: "sessions to orders" })}
        {K(4, "Returning Customers", "returningCustomerRate", (v) => formatPercent(v), { estimated: true })}
        {K(5, "Refund Rate", "refundRate", (v) => formatPercent(v), { estimated: true, invertDelta: true })}
      </div>
      <div className="grid grid-2">
        <ChartCard title="Daily Revenue" kind="line" toggle spec={{ labels: daily.map((d) => formatDate(d.date)), datasets: [{ label: "Revenue", data: daily.map((d) => d.revenue), borderColor: green }], aspectRatio: 2 }} />
        <ChartCard title="Revenue by Source" kind="bar" spec={{ labels: src.map((r) => r.source), datasets: [{ label: "Revenue", data: src.map((r) => r.revenue), colors: src.map((r) => channelColor(SOURCE_CHANNEL[r.source] || "direct")) }], horizontal: true }} />
      </div>
      <ChartCard title="New vs Returning Customers" kind="bar" spec={{ labels: daily.map((d) => formatDate(d.date)), datasets: [{ label: "New", data: daily.map((d) => d.newOrders || 0), backgroundColor: "#4285f4" }, { label: "Returning", data: daily.map((d) => d.returningOrders || 0), backgroundColor: "#00d084" }], stacked: true, aspectRatio: 3 }} />
      <DataTable
        title="Top Products" csvFilename="top-products" rows={s.topProducts || []} defaultSort={{ key: "revenue", dir: "desc" }}
        columns={[
          { key: "name", label: "Product" },
          { key: "sku", label: "SKU", muted: true },
          { key: "revenue", label: "Revenue", type: "currency" },
          { key: "units", label: "Units", type: "number" },
          { key: "marginPercent", label: "Margin", type: "percent" },
          { key: "grossProfit", label: "Gross Profit", type: "currency" },
        ]}
      />
    </Shell>
  );
}

/* ── 7. b2b ──────────────────────────────────────────────────────────────── */

function B2BImpl({ data }) {
  const b = data.b2b;
  const bp = b.previousSummary || {};
  const partners = b.partners || [];
  const roiColor = (r) => (r >= 5 ? "#34a853" : r >= 3 ? "#7ab648" : r >= 2 ? "#f4b400" : r >= 1 ? "#ff8c42" : "#ff6b35");
  return (
    <Shell id="b2b-partners">
      <Disclaimer data={data} />
      <div className="grid grid-4">
        <Kpi index={0} label="Total Leads" value={b.summary.totalLeads} previous={bp.totalLeads} format="number" accentColor="#ff6b35" />
        <Kpi index={1} label="Closed Deals" value={b.summary.closedDeals} previous={bp.closedDeals} format="number" estimated />
        <Kpi index={2} label="Pipeline Revenue" value={b.summary.revenue} previous={bp.revenue} format="currency" subtitle="from closed deals" estimated />
        <Kpi index={3} label="Avg Deal Size" value={b.summary.avgDealSize} previous={bp.avgDealSize} format="currency" subtitle="per closed deal" estimated />
      </div>
      <DataTable
        title="Partner Performance" csvFilename="b2b-partners" rows={partners} defaultSort={{ key: "revenue", dir: "desc" }}
        columns={[
          { key: "name", label: "Partner" },
          { key: "type", label: "Type", badge: (r) => ({ text: cap(r.type), cls: "badge-b2b" }) },
          { key: "spend", label: "Spend", type: "currency" },
          { key: "leads", label: "Leads", type: "number" },
          { key: "qualifiedLeads", label: "Qualified", type: "number" },
          { key: "closedDeals", label: "Closed", type: "number" },
          { key: "revenue", label: "Revenue", type: "currency" },
          { key: "cpl", label: "CPL", type: "currency" },
          { key: "roi", label: "ROI", type: "roas" },
        ]}
      />
      <ChartCard title="Partner ROI Comparison" subtitle="Higher ROI = better return on partner investment" kind="bar" spec={{ labels: partners.map((p) => p.name), datasets: [{ label: "ROI", data: partners.map((p) => p.roi), colors: partners.map((p) => roiColor(p.roi)) }], horizontal: true }} />
    </Shell>
  );
}

/* ── 8. website ──────────────────────────────────────────────────────────── */

const WEB_CHANNEL = { "Paid Search": "google", "Paid Social": "meta", "Organic Search": "organic", Direct: "direct", Referral: "referral", Email: "email" };

function WebsiteImpl({ data }) {
  const w = data.website;
  const wp = w.previousSummary || {};
  const daily = w.dailyTimeSeries || [];
  const teal = "#2ec4b6";
  const ch = w.trafficByChannel || [];
  const dev = w.deviceBreakdown || [];
  const total = w.summary.sessions;
  return (
    <Shell id="website">
      <Disclaimer data={data} />
      <div className="grid grid-4">
        <Kpi index={0} label="Sessions" value={formatNumber(w.summary.sessions)} delta={formatDelta(w.summary.sessions, wp.sessions)} accentColor={teal} sparkline={daily.map((d) => d.sessions)} sparklineColor={teal} />
        <Kpi index={1} label="Users" value={formatNumber(w.summary.users)} delta={formatDelta(w.summary.users, wp.users)} accentColor={teal} sparkline={daily.map((d) => d.users)} sparklineColor={teal} />
        <Kpi index={2} label="Bounce Rate" value={formatPercent(w.summary.bounceRate)} delta={formatDelta(w.summary.bounceRate, wp.bounceRate, true)} subtitle="lower is better" invertDelta={false} accentColor={teal} />
        <Kpi index={3} label="Avg Session Duration" value={formatDuration(w.summary.avgSessionDuration)} delta={formatDelta(w.summary.avgSessionDuration, wp.avgSessionDuration)} subtitle="minutes:seconds" accentColor={teal} />
      </div>
      <div className="grid grid-2">
        <ChartCard title="Traffic by Channel" kind="bar" spec={{ labels: ch.map((c) => c.channel), datasets: [{ label: "Sessions", data: ch.map((c) => c.sessions), colors: ch.map((c) => channelColor(WEB_CHANNEL[c.channel] || "direct")) }], horizontal: true }} />
        <ChartCard title="Device Breakdown" kind="doughnut" spec={{ labels: dev.map((d) => d.device), data: dev.map((d) => d.sessions), colors: ["#4285f4", "#34a853", "#ff6b35"], centerText: total >= 1000 ? `${(total / 1000).toFixed(0)}K` : String(total) }} />
      </div>
      <DataTable
        title="Landing Page Performance" csvFilename="landing-pages" rows={w.topLandingPages || []} defaultSort={{ key: "sessions", dir: "desc" }}
        columns={[
          { key: "title", label: "Page" },
          { key: "path", label: "Path", muted: true },
          { key: "sessions", label: "Sessions", type: "number" },
          { key: "bounceRate", label: "Bounce", type: "percent", colorClass: (r) => (r.bounceRate > 50 ? "highlight-negative" : "") },
          { key: "conversionRate", label: "Conv. Rate", type: "percent", colorClass: (r) => (r.conversionRate > 4 ? "highlight-positive" : "") },
          { key: "avgDuration", label: "Avg Duration", type: "number" },
        ]}
      />
      <ChartCard title="Daily Sessions & Users" kind="line" toggle spec={{ labels: daily.map((d) => formatDate(d.date)), datasets: [{ label: "Sessions", data: daily.map((d) => d.sessions), borderColor: teal }, { label: "Users", data: daily.map((d) => d.users), borderColor: "#4285f4" }], dualAxis: true, aspectRatio: 2.5 }} />
    </Shell>
  );
}

/* ── 9. insights ─────────────────────────────────────────────────────────── */

function InsightsImpl({ data }) {
  return (
    <Shell id="insights">
      <InsightsView insights={generateInsights(data)} />
    </Shell>
  );
}

/* ── 10. trends ──────────────────────────────────────────────────────────── */

function TrendsImpl({ data, compareData }) {
  const daily = data.computed.dailyMerged || [];
  const cmp = compareData?.computed?.dailyMerged;
  const labels = daily.map((d, i) => (compareData ? `Day ${i + 1}` : formatDate(d.date)));
  const dates = daily.map((d) => d.date);
  const start = dates[0];
  const end = dates[dates.length - 1];
  const promos = getPromosInRange(data.promos || [], start, end);
  const anns = getAnnotationsInRange(data.annotations || [], start, end);
  const overlay = {
    promoAnnotations: promos.length ? { promos, dateLabels: dates } : null,
    chartAnnotations: anns.length ? { annotations: anns, dateLabels: dates } : null,
  };
  const shop = channelColor("shopify");
  const goog = channelColor("google");
  const metaC = channelColor("meta");
  const dash = { borderDash: [5, 4], fill: false, borderWidth: 1.5, pointRadius: 0, backgroundColor: "transparent" };
  const s1 = [
    { label: "Total Revenue", data: daily.map((d) => d.revenue), borderColor: shop, fill: false, tension: 0.3, pointRadius: 2 },
    { label: "Google Spend", data: daily.map((d) => d.googleSpend), borderColor: goog, fill: false, tension: 0.3, pointRadius: 2 },
    { label: "Meta Spend", data: daily.map((d) => d.metaSpend), borderColor: metaC, fill: false, tension: 0.3, pointRadius: 2 },
  ];
  if (cmp) {
    s1.push({ label: "Revenue (Compare)", data: cmp.map((d) => d.revenue), borderColor: shop, ...dash });
    s1.push({ label: "Google Spend (Compare)", data: cmp.map((d) => d.googleSpend), borderColor: goog, ...dash });
  }
  const s2 = [
    { label: "Google Conversions", data: daily.map((d) => d.googleConversions), borderColor: goog, tension: 0.3, pointRadius: 2 },
    { label: "Meta Conversions", data: daily.map((d) => d.metaConversions), borderColor: metaC, tension: 0.3, pointRadius: 2 },
  ];
  if (cmp) {
    s2.push({ label: "Google Conv. (Compare)", data: cmp.map((d) => d.googleConversions), borderColor: goog, ...dash });
    s2.push({ label: "Meta Conv. (Compare)", data: cmp.map((d) => d.metaConversions), borderColor: metaC, ...dash });
  }
  const legend1 = [{ label: "Total Revenue", colorVar: "--color-shopify" }, { label: "Google Spend", colorVar: "--color-google" }, { label: "Meta Spend", colorVar: "--color-meta" }];
  const legend2 = [{ label: "Google Conversions", colorVar: "--color-google" }, { label: "Meta Conversions", colorVar: "--color-meta" }];

  return (
    <Shell id="trends">
      <div className="card intro-card">
        Cross-channel performance over the {daily.length}-day reporting period. Toggle series to compare channels.
      </div>
      <ChartCard title="Revenue & Spend by Day" kind="line" toggle legend={legend1} spec={{ labels, datasets: s1, aspectRatio: 3, ...overlay }} />
      <ChartCard title="Daily Conversions by Channel" kind="line" toggle legend={legend2} spec={{ labels, datasets: s2, aspectRatio: 3, ...overlay }} />
    </Shell>
  );
}

/* ── 11. promo analysis ──────────────────────────────────────────────────── */

const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const inRange = (daily, s, e) => daily.filter((d) => d.date >= s && d.date <= e);
function metrics(days) {
  const sum = (f) => days.reduce((a, d) => a + f(d), 0);
  const revenue = sum((d) => d.revenue || 0);
  const orders = sum((d) => d.orders || 0);
  return {
    revenue, orders,
    spend: sum((d) => (d.googleSpend || 0) + (d.metaSpend || 0)),
    conversions: sum((d) => (d.googleConversions || 0) + (d.metaConversions || 0)),
    aov: orders > 0 ? revenue / orders : 0,
    dailyAvg: days.length ? revenue / days.length : 0,
  };
}

function PeriodColumn({ label, days, m, color }) {
  const rows = [["Revenue", formatCurrency(m.revenue)], ["Orders", formatNumber(m.orders)], ["Ad Spend", formatCurrency(m.spend)], ["Conversions", formatNumber(m.conversions)], ["AOV", formatCurrency(m.aov)], ["Daily Avg Rev", formatCurrency(m.dailyAvg)]];
  return (
    <div style={{ background: "#0e1730", borderRadius: 8, padding: 16, borderLeft: `3px solid ${color}` }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#7280a0", letterSpacing: "0.1em", marginTop: 2 }}>{days} days</div>
      </div>
      {rows.map(([l, v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #26365a" }}>
          <span style={{ fontSize: "0.78rem", color: "#aab4cd" }}>{l}</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f3efe6", fontVariantNumeric: "tabular-nums" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function LiftBadge({ label, value, positive }) {
  const c = positive ? "0,208,132" : "255,77,77";
  return (
    <div style={{ background: `rgba(${c},0.08)`, border: `1px solid rgba(${c},0.25)`, borderRadius: 6, padding: "8px 14px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "#7280a0", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: positive ? "#00d084" : "#ff4d4d", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function PromoImpl({ data }) {
  const promos = data.promos || [];
  const daily = data.computed.dailyMerged || [];
  let body;
  if (!promos.length || !daily.length) body = <div className="card">No promotional events found in the selected date range.</div>;
  else {
    const rs = daily[0].date;
    const re = daily[daily.length - 1].date;
    const visible = promos.filter((p) => p.startDate <= re && p.endDate >= rs);
    if (!visible.length) body = <div className="card">No promotions overlap the selected date range.</div>;
    else
      body = visible.map((p) => {
        const during = inRange(daily, p.startDate, p.endDate);
        const len = during.length;
        const before = inRange(daily, addDays(p.startDate, -len), addDays(p.startDate, -1));
        const after = inRange(daily, addDays(p.endDate, 1), addDays(p.endDate, len));
        const bm = metrics(before), dm = metrics(during), am = metrics(after);
        const color = p.color || "#ffb938";
        let lift = null;
        if (bm.revenue > 0 && dm.revenue > 0) {
          const rl = ((dm.revenue - bm.revenue) / bm.revenue) * 100;
          const ol = bm.orders > 0 ? ((dm.orders - bm.orders) / bm.orders) * 100 : null;
          const rec = am.revenue > 0 ? (am.revenue / bm.revenue) * 100 : null;
          lift = (
            <div style={{ marginTop: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
              <LiftBadge label="Revenue Lift" value={`${rl > 0 ? "+" : ""}${rl.toFixed(1)}%`} positive={rl > 0} />
              <LiftBadge label="Order Lift" value={ol == null ? "N/A" : `${ol > 0 ? "+" : ""}${ol.toFixed(1)}%`} positive={ol != null && ol > 0} />
              <LiftBadge label="Post-Promo Recovery" value={rec == null ? "N/A" : `${rec.toFixed(0)}% of baseline`} positive={rec != null && rec >= 90} />
            </div>
          );
        }
        return (
          <div className="card" key={p.name + p.startDate} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.name}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#7280a0", letterSpacing: "0.04em" }}>{p.startDate} — {p.endDate}</span>
              {p.discountPercent ? <span className="badge" style={{ background: "rgba(255,185,56,0.1)", color: "#ffb938", borderColor: "rgba(255,185,56,0.25)" }}>{p.discountPercent}% OFF</span> : null}
            </div>
            <div className="grid grid-3" style={{ gap: 12 }}>
              <PeriodColumn label="Before" days={before.length} m={bm} color="#555" />
              <PeriodColumn label="During Promo" days={during.length} m={dm} color={color} />
              <PeriodColumn label="After" days={after.length} m={am} color="#555" />
            </div>
            {lift}
          </div>
        );
      });
  }
  return <Shell id="promo-analysis">{body}</Shell>;
}

export const ExecutiveSummary = memo(ExecutiveSummaryImpl);
export const ChannelMix = memo(ChannelMixImpl);
export const FunnelAnalysis = memo(FunnelImpl);
export const GoogleAds = memo(GoogleImpl);
export const MetaAds = memo(MetaImpl);
export const Shopify = memo(ShopifyImpl);
export const B2BPartners = memo(B2BImpl);
export const Website = memo(WebsiteImpl);
export const Insights = memo(InsightsImpl);
export const Trends = memo(TrendsImpl);
export const PromoAnalysis = memo(PromoImpl);
