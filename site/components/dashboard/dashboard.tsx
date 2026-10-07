// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import "./dashboard.css";
import { SectionHead } from "@/components/ui/primitives";
import { loadAllData, filterDataByRange } from "./data";
import {
  COMPARE, comparisonRange, defaultComparisonRange, isExplicitCompare, comparisonPeriodLabel,
  rangeDisplayLabel, compareBadgeLabel, presetRange, dataBounds,
} from "./range";
import {
  ExecutiveSummary, ChannelMix, FunnelAnalysis, GoogleAds, MetaAds, Shopify, B2BPartners, Website, Insights, Trends, PromoAnalysis,
} from "./sections";

const SECTIONS = [["executive-summary", "Summary"], ["channel-mix", "Channels"], ["funnel-analysis", "Funnel"], ["google-ads", "Google Ads"], ["meta-ads", "Meta Ads"], ["shopify", "E-Commerce"], ["b2b-partners", "B2B"], ["website", "Website"], ["insights", "Insights"], ["trends", "Trends"], ["promo-analysis", "Promos"]];
const PRESETS = [["MTD", "MTD"], ["QTD", "QTD"], ["YTD", "YTD"], ["PREV_YEAR", "PREV YR"]];

export function Dashboard() {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(false);
  const [range, setRange] = useState(null);

  useEffect(() => {
    let live = true;
    loadAllData()
      .then((d) => {
        if (!live) return;
        const r = presetRange("MTD", d.config.reportPeriod, {});
        setRaw(d);
        setRange({ preset: "MTD", ...r, compareMode: COMPARE.NONE, compareStart: "", compareEnd: "" });
      })
      .catch(() => live && setError(true));
    return () => { live = false; };
  }, []);

  const view = useMemo(() => {
    if (!raw || !range) return null;
    const filtered = filterDataByRange(raw, { start: range.start, end: range.end });
    const dr = isExplicitCompare(range) ? comparisonRange(range) : defaultComparisonRange(range);
    const deltaData = dr ? filterDataByRange(raw, dr) : null;
    if (deltaData) {
      const c = filtered.computed;
      const d = deltaData.computed;
      c.previousTotalSpend = d.totalSpend;
      c.previousTotalRevenue = d.totalRevenue;
      c.previousBlendedROAS = d.blendedROAS;
      c.previousTotalConversions = d.totalConversions;
      c.previousBlendedCPA = d.blendedCPA;
      for (const k of ["google", "meta", "shopify", "b2b", "website"]) {
        if (filtered[k] && deltaData[k]) filtered[k].previousSummary = deltaData[k].summary;
      }
    }
    filtered._comparisonLabel = comparisonPeriodLabel(range);
    filtered.promos = raw.promos;
    filtered.goals = raw.goals;
    filtered.annotations = raw.annotations;
    return { data: filtered, compare: isExplicitCompare(range) ? deltaData : null };
  }, [raw, range]);

  if (error) return <div className="dash"><p className="no-data" style={{ padding: 48 }}>Couldn’t load the dashboard data.</p></div>;
  if (!view) return <div className="dash"><div style={{ padding: 48 }}><h1 className="font-display text-4xl font-light">Example dashboard</h1><p className="no-data">An example dashboard created for performance reporting. Loading the live charts…</p></div></div>;

  const period = raw.config.reportPeriod;
  const bounds = dataBounds(period);
  const setPreset = (p) => setRange((r) => ({ ...r, preset: p, ...presetRange(p, period, r) }));
  const toggleCompare = (mode) => setRange((r) => ({ ...r, compareMode: r.compareMode === mode ? COMPARE.NONE : mode }));
  const badge = compareBadgeLabel(range);

  return (
    <div className="px-6 pb-16 pt-32 md:px-12 md:pt-40">
    <div className="mx-auto max-w-7xl">
      <SectionHead h1 eyebrow="Example dashboard" title={<>Performance reporting,<br />in one place.</>}>
        An example dashboard created for performance reporting: ads, ecommerce, email and web in a single view, with date ranges, period comparison, goals and automatic insights. It uses sample data and invented figures.
      </SectionHead>
      <nav aria-label="Dashboard sections" className="mb-10 flex flex-wrap gap-2 lg:hidden">
        {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full border border-line px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent">{label}</a>)}
      </nav>
    <div className="dash">
      <div className="date-filter-bar" style={{ position: "sticky", top: 64, zIndex: 49 }}>
        <div className="filter-bar-section">
          {PRESETS.map(([p, label]) => (
            <button key={p} type="button" className={`filter-preset-btn${range.preset === p ? " active" : ""}`} onClick={() => setPreset(p)}>{label}</button>
          ))}
          <button type="button" className={`filter-preset-btn filter-custom-btn${range.preset === "CUSTOM" ? " active" : ""}`} onClick={() => setRange((r) => ({ ...r, preset: "CUSTOM" }))}>Custom</button>
          {range.preset === "CUSTOM" && (
            <>
              <input type="date" aria-label="Start date" min={bounds.min} max={range.end || bounds.max} value={range.start} onChange={(e) => e.target.value && setRange((r) => ({ ...r, start: e.target.value }))} />
              <input type="date" aria-label="End date" min={range.start || bounds.min} max={bounds.max} value={range.end} onChange={(e) => e.target.value && setRange((r) => ({ ...r, end: e.target.value }))} />
            </>
          )}
          <span className="filter-divider" />
          <button type="button" className={`filter-preset-btn filter-compare-toggle${range.compareMode === COMPARE.YOY ? " active" : ""}`} onClick={() => toggleCompare(COMPARE.YOY)}>YoY</button>
          <button type="button" className={`filter-preset-btn filter-compare-toggle${range.compareMode === COMPARE.QOQ ? " active" : ""}`} onClick={() => toggleCompare(COMPARE.QOQ)}>QoQ</button>
          {badge && <span className="filter-compare-badge">{badge}</span>}
        </div>
        <div className="filter-bar-right">
          <span className="filter-range-label">{rangeDisplayLabel(range)}</span>
          <span className="filter-divider" />
          <span className="filter-range-label">SAMPLE DATA</span>
        </div>
      </div>
      <div className="dash-content">
        <ExecutiveSummary data={view.data} compareData={view.compare} />
        <ChannelMix data={view.data} compareData={view.compare} />
        <FunnelAnalysis data={view.data} compareData={view.compare} />
        <GoogleAds data={view.data} compareData={view.compare} />
        <MetaAds data={view.data} compareData={view.compare} />
        <Shopify data={view.data} compareData={view.compare} />
        <B2BPartners data={view.data} compareData={view.compare} />
        <Website data={view.data} compareData={view.compare} />
        <Insights data={view.data} compareData={view.compare} />
        <Trends data={view.data} compareData={view.compare} />
        <PromoAnalysis data={view.data} compareData={view.compare} />
      </div>
    </div>
    </div>
    </div>
  );
}
