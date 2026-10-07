"use client";
import { useMemo, useState } from "react";
import { SectionHead } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { BRANDS, CURRENT_WEEK, CURVE, HEALTH, OBJECTIVES, SHARE, WEEKS, WOBBLE, type Fmt, type Measure } from "./data";

/** Website sales = the four dollar measures that make up site revenue, so the headline always equals the rows below. */
const WEBSITE_IDS = ["m1", "m3", "m9", "m12"];
const WEEK_LABEL = (w: number) => { const s = new Date(Date.UTC(2026, 9, 1 + (w - 1) * 7)); const e = new Date(Date.UTC(2026, 9, 7 + (w - 1) * 7)); const f = (d: Date) => `${d.getUTCDate()} ${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}`; return `W${w} · ${f(s)} to ${f(e)}`; };

function fmt(v: number, f: Fmt) {
  if (f === "usd") return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${Math.round(v).toLocaleString("en-US")}`;
  if (f === "pct") return `${v.toFixed(2)}%`;
  if (f === "x") return `${v.toFixed(1)}×`;
  return Math.round(v).toLocaleString("en-US");
}
const fmtTarget = (m: Measure) => (m.kind === "level" && (m.fmt === "pct" || m.fmt === "x") ? `≥ ${m.target}${m.fmt === "pct" ? "%" : "×"}` : fmt(m.target, m.fmt));

/** Value of a measure after each week (index 0 = end of week 1), for one brand or all. */
function series(m: Measure, brand: string): number[] {
  const share = brand === "All brands" ? 1 : SHARE[brand];
  const scale = m.fmt === "pct" || m.fmt === "x" ? 1 : share;
  if (m.kind === "level") return CURVE.map((c) => ((m.start ?? 0) + (m.end - (m.start ?? 0)) * c) * scale);
  const inc = CURVE.map((c, i) => (c - (CURVE[i - 1] ?? 0)) * WOBBLE[i]);
  const total = inc.reduce((a, b) => a + b, 0);
  let acc = 0;
  return inc.map((x) => (acc += (x / total) * m.end * scale));
}
const scaledTarget = (m: Measure, brand: string) => (brand === "All brands" || m.fmt === "pct" || m.fmt === "x" ? m.target : m.target * SHARE[brand]);

function status(m: Measure, v: number, w: number, brand: string) {
  const t = scaledTarget(m, brand);
  const r = m.kind === "sum" ? v / (t * CURVE[w - 1]) : v / t;
  if (r >= 0.95) return { label: "On track", color: "#7fd1a8" };
  if (r >= 0.8) return { label: "Watch", color: "#ffb938" };
  return { label: "Behind", color: "#ff8f8f" };
}
const Dot = ({ color }: { color: string }) => <span aria-hidden className="mr-2 inline-block size-2 rounded-full align-middle" style={{ background: color }} />;

function Bars({ values, week, f }: { values: number[]; week: number; f: Fmt }) {
  const inc = values.map((v, i) => (i ? v - values[i - 1] : v));
  const max = Math.max(...values.map((_, i) => (i < week ? values[i] : 0)), 1);
  return (
    <div role="img" aria-label={`Weekly trend, latest ${fmt(values[week - 1], f)}`} className="flex h-20 items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${i < week ? Math.max(6, (v / max) * 100) : 6}%`, background: i === week - 1 ? "var(--color-accent)" : i < week ? "rgba(255,185,56,.38)" : "rgba(255,255,255,.07)" }} title={i < week ? `W${i + 1}: ${fmt(f === "usd" || f === "num" ? inc[i] : v, f)}` : `W${i + 1}`} />
      ))}
    </div>
  );
}

function MeasureCard({ m, week, brand }: { m: Measure; week: number; brand: string }) {
  const vals = useMemo(() => series(m, brand), [m, brand]);
  const v = vals[week - 1];
  const t = scaledTarget(m, brand);
  const st = status(m, v, week, brand);
  const wk = m.kind === "sum" ? v - (vals[week - 2] ?? 0) : v - (vals[week - 2] ?? v);
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base text-fg">{m.name}</h4>
        <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-widest text-faint">{m.commit}</span>
      </div>
      <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-widest text-faint">{m.owner}</p>
      <div className="mt-5 font-display text-5xl font-light tracking-[-0.04em] text-accent">{fmt(v, m.fmt)}</div>
      <p className="mt-1 text-sm text-muted">of {m.kind === "level" && m.fmt !== "num" ? fmtTarget({ ...m, target: t }) : fmt(t, m.fmt)} target · <Dot color={st.color} />{st.label}</p>
      <p className="mt-1 text-sm text-faint">{m.kind === "sum" ? "▲" : wk >= 0 ? "▲" : "▼"} {m.kind === "level" && m.fmt === "pct" ? `${Math.abs(wk).toFixed(2)} pts` : fmt(Math.abs(wk), m.fmt)} this week</p>
      <div className="mt-5"><Bars values={vals} week={week} f={m.fmt} /></div>
      <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-faint"><span>W1</span><span>W{WEEKS}</span></div>
      <p className="mt-3 text-sm text-faint">{m.note}</p>
      {brand === "All brands" && m.fmt !== "pct" && m.fmt !== "x" && (
        <details className="mt-4 border-t border-line pt-3">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-muted hover:text-accent">By brand</summary>
          <ul className="mt-3 space-y-2">
            {BRANDS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 text-muted">{b}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-accent/70" style={{ width: `${(SHARE[b] / 0.46) * 100}%` }} /></span>
                <span className="w-16 text-right font-mono text-xs">{fmt(v * SHARE[b], m.fmt)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function Okr() {
  const [week, setWeek] = useState(CURRENT_WEEK);
  const [brand, setBrand] = useState<string>("All brands");
  const [tab, setTab] = useState("summary");
  const obj = OBJECTIVES.find((o) => o.n === tab);
  const all = OBJECTIVES.flatMap((o) => o.measures);
  const score = useMemo(() => {
    const parts = all.map((m) => Math.min(1, series(m, brand)[week - 1] / scaledTarget(m, brand)));
    return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
  }, [all, brand, week]);
  const web = all.filter((m) => WEBSITE_IDS.includes(m.id));
  const gmv = CURVE.map((_, i) => web.reduce((a, m) => a + series(m, brand)[i], 0));
  const gmvTarget = web.reduce((a, m) => a + scaledTarget(m, brand), 0);
  const chip = (on: boolean) => cn("rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors", on ? "border-accent bg-accent text-[#0a1224]" : "border-line text-muted hover:border-accent hover:text-accent");

  return (
    <div className="px-6 pb-24 pt-32 md:px-12 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead h1 eyebrow="Example OKR" title={<>A quarterly scorecard,<br />week by week.</>}>
          Inspired by the weekly scorecard I built for a marketing and ecommerce team: five objectives, thirteen measures, weekly updates. Every brand, name and number here is invented.
        </SectionHead>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="okr-week">Week</label>
          <select id="okr-week" value={week} onChange={(e) => setWeek(Number(e.target.value))} className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-fg">
            {Array.from({ length: WEEKS }, (_, i) => i + 1).map((w) => <option key={w} value={w} disabled={w > CURRENT_WEEK}>{WEEK_LABEL(w)}{w > CURRENT_WEEK ? " (upcoming)" : ""}</option>)}
          </select>
          <button onClick={() => setWeek(CURRENT_WEEK)} className={chip(false)}>Go to current week</button>
          <span className="ml-auto font-mono text-xs uppercase tracking-widest text-faint">Q4 2026 · example data</span>
        </div>

        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Brand">
          {["All brands", ...BRANDS].map((b) => <button key={b} aria-pressed={brand === b} onClick={() => setBrand(b)} className={chip(brand === b)}>{b}</button>)}
        </div>

        <div role="tablist" aria-label="Objectives" className="mb-10 flex gap-6 overflow-x-auto border-b border-line" data-lenis-prevent>
          {[{ n: "summary", t: "Summary" }, ...OBJECTIVES.map((o) => ({ n: o.n, t: `${o.n}  ${o.title}` }))].map((x) => (
            <button key={x.n} role="tab" aria-selected={tab === x.n} onClick={() => setTab(x.n)} className={cn("-mb-px whitespace-nowrap border-b-2 pb-3 text-sm transition-colors", tab === x.n ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg")}>{x.t}</button>
          ))}
        </div>

        {!obj ? (
          <div>
            <h3 className="font-display text-4xl font-light tracking-tight">Q4 summary</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[["OKR score", `${score}%`, "average of each measure's progress to its quarter target, capped at 100%"], ["Website sales", fmt(gmv[week - 1], "usd"), `of ${fmt(gmvTarget, "usd")} quarter target (ads, other site, email, free search)`], ["This week", `+${fmt(gmv[week - 1] - (gmv[week - 2] ?? 0), "usd")}`, WEEK_LABEL(week).split(" · ")[1]]].map(([l, v, s]) => (
                <div key={l} className="rounded-2xl border border-line bg-surface p-6">
                  <div className="font-mono text-xs uppercase tracking-widest text-faint">{l}</div>
                  <div className="mt-2 font-display text-5xl font-light tracking-[-0.04em] text-accent">{v}</div>
                  <div className="mt-1 text-sm text-muted">{s}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line" data-lenis-prevent>
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead><tr className="bg-surface font-mono text-[0.68rem] uppercase tracking-widest text-faint">{["Measure", "So far", "Target", "Progress", "This week", "Status"].map((h) => <th key={h} className="px-4 py-3 font-normal">{h}</th>)}</tr></thead>
                <tbody>
                  {OBJECTIVES.map((o) => (
                    <FragmentRows key={o.n}>
                      <tr className="border-t border-line bg-bg2"><td colSpan={6} className="px-4 py-3"><button onClick={() => setTab(o.n)} className="text-left hover:text-accent"><span className="font-display text-xl">{o.n} {o.title}</span> <span className="ml-2 text-muted">{o.goal}</span></button></td></tr>
                      {o.measures.map((m) => {
                        const vals = series(m, brand); const v = vals[week - 1]; const t = scaledTarget(m, brand); const st = status(m, v, week, brand);
                        const wk = m.kind === "sum" ? v - (vals[week - 2] ?? 0) : v - (vals[week - 2] ?? v);
                        return (
                          <tr key={m.id} className="border-t border-line">
                            <td className="px-4 py-3">{m.name} <span className="ml-1 font-mono text-[0.62rem] uppercase tracking-widest text-faint">{m.commit}</span><div className="text-xs text-faint">{m.owner}</div></td>
                            <td className="px-4 py-3 font-mono">{fmt(v, m.fmt)}</td>
                            <td className="px-4 py-3 font-mono text-muted">{fmtTarget({ ...m, target: t })}</td>
                            <td className="px-4 py-3"><div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (v / t) * 100)}%`, background: st.color }} /></div><span className="mt-1 block font-mono text-[0.68rem] text-faint">{Math.round((v / t) * 100)}%</span></td>
                            <td className="px-4 py-3 font-mono text-muted">{m.kind === "level" && m.fmt === "pct" ? `${wk >= 0 ? "+" : "−"}${Math.abs(wk).toFixed(2)}` : `${wk >= 0 ? "+" : "−"}${fmt(Math.abs(wk), m.fmt)}`}</td>
                            <td className="px-4 py-3 whitespace-nowrap"><Dot color={st.color} />{st.label}</td>
                          </tr>
                        );
                      })}
                    </FragmentRows>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-12">
              <h3 className="font-display text-3xl font-light tracking-tight">Health checks</h3>
              <p className="mt-1 text-muted">Numbers we keep an eye on, not scored.</p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {HEALTH.map(([l, v]) => <li key={l} className="rounded-2xl border border-line bg-surface p-5"><div className="font-display text-4xl font-light text-accent">{v}</div><div className="mt-1 text-sm text-muted">{l}</div></li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-faint">Owner · {obj.owner}</p>
            <h3 className="mt-2 font-display text-4xl font-light tracking-tight md:text-5xl"><span className="text-accent">{obj.n}</span> {obj.goal}</h3>
            <div className={cn("mt-8 grid gap-4", obj.measures.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
              {obj.measures.map((m) => <MeasureCard key={m.id} m={m} week={week} brand={brand} />)}
            </div>
            <h4 className="mt-14 font-display text-2xl font-light">What&apos;s driving it</h4>
            <p className="mt-1 text-sm text-faint">Programs · not scored</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {obj.drivers.map((d) => (
                <div key={d.name} className="rounded-2xl border border-line bg-surface p-6">
                  <div className="flex items-center justify-between"><h5 className="text-lg">{d.name}</h5><span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-widest text-accent">{d.status}</span></div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-widest text-faint">{d.owner}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-3">{d.stats.map(([k, v]) => <div key={k}><dt className="text-xs text-faint">{k}</dt><dd className="font-display text-2xl text-fg">{v}</dd></div>)}</dl>
                  <p className="mt-4 text-sm text-muted">{d.note}</p>
                </div>
              ))}
            </div>
            <h4 className="mt-14 font-display text-2xl font-light">Next actions</h4>
            <ul className="mt-4 space-y-2">{obj.actions.map((a) => <li key={a} className="flex gap-3 text-muted"><span className="text-accent">→</span>{a}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

function FragmentRows({ children }: { children: React.ReactNode }) { return <>{children}</>; }
