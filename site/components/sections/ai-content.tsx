"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CountUp, Magnetic, Reveal, SectionHead, TiltCard, WordReveal } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const seq = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `/media/ai/${prefix}-${pad(i + 1)}.jpg`);
const RES = seq("residential", 40);
const PEOPLE = seq("residential-people", 19);
const COMM = [...seq("commercial", 9), "/media/ai/commercial-bar-01.jpg", "/media/ai/commercial-bar-02.jpg", "/media/ai/commercial-hotel-01.jpg"];
const GALLERIES = [
  { id: "res", label: "Residential", items: RES },
  { id: "people", label: "With people", items: PEOPLE },
  { id: "comm", label: "Commercial", items: COMM },
];

const STEPS = [
  ["Inputs", "Basic product renders, room and venue references, and SEO keyword research that decides which topics and scenes are worth producing."],
  ["Generate", "AI turns raw renders into polished lifestyle scenes, adds people matched to the brand's real customer, and produces video, including creator-style clips."],
  ["Finish", "Selection, correction and resizing for each placement: paid social, email, product pages, blog and sales decks."],
  ["Ship & measure", "Published into campaigns and tracked in the reporting dashboard, so what works gets more of the next batch."],
];

const GROWTH = [
  ["+58%", "online purchases YoY", "13K+ purchases versus roughly 8.5K the year before, measured in Google Analytics."],
  ["+133%", "paid-media revenue YoY", "June 2026 monthly reporting across Google, Meta and CTV, at a healthy 16× marketing efficiency ratio."],
  ["3.3×", "organic social new users", "From about 44K to 145K new users in a year. Content and creators did this, not spend."],
  ["+22%", "US active users", "About 450K versus 365K, while international audiences grew alongside."],
  ["+85%", "value per paid-search user", "120-day user value nearly doubled while paid-search volume was deliberately cut."],
  ["+144%", "form starts", "About 43K versus 17.5K, the pipeline metric behind reseller and B2B growth."],
];

const CTV: [string, string][] = [["2.8M", "impressions"], ["515K", "video views"], ["3.3×", "attributed ROAS"]];

const VIDEOS = [
  "Launch-monitor product film", "Compact launch-monitor product film", "Website modernization walkthrough",
  "Brand film, 30 seconds", "\"You In\" brand campaign film", "AI software + launch-monitor ad",
  "AI training product hero film", "Launch-monitor hero film", "Game-day software hero film",
  "Compact launch-monitor promo ad", "Simulator bundle promo ad",
];

function VideoSlot({ label }: { label: string }) {
  return (
    <figure>
      <div className="video-placeholder grid aspect-video place-items-center rounded-2xl border border-dashed border-line" role="img" aria-label="Video coming soon">
        <span className="font-mono text-xs uppercase tracking-widest text-faint">▶ Video coming soon</span>
      </div>
      <figcaption className="mt-3 text-sm text-muted">{label}</figcaption>
    </figure>
  );
}

/** Columns of images drifting at different scroll speeds. */
function ParallaxWall() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y0 = useTransform(scrollYProgress, [0, 1], [60, -120]);
  const y1 = useTransform(scrollYProgress, [0, 1], [-60, 120]);
  const all = [...RES, ...PEOPLE, ...COMM];
  const cols = [0, 1, 2, 3].map((c) => all.filter((_, i) => i % 4 === c).slice(0, 5));
  return (
    <div ref={ref} className="relative -mx-6 h-[130svh] overflow-hidden md:-mx-12">
      <div className="absolute inset-0 grid grid-cols-2 gap-4 px-6 md:grid-cols-4 md:px-12">
        {cols.map((col, ci) => (
          <motion.div key={ci} style={{ y: reduce ? 0 : ci % 2 ? y1 : y0 }} className={cn("flex flex-col gap-4", ci % 2 ? "-mt-24" : "mt-0")}>
            {col.map((src) => <img key={src} src={src} alt="AI-generated lifestyle scene" loading="lazy" decoding="async" className="aspect-[4/5] w-full rounded-2xl object-cover" />)}
          </motion.div>
        ))}
      </div>
      <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-t from-transparent to-bg2" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg2" />
    </div>
  );
}

/** Rows of images drifting in opposite directions on a tilted 3D plane. */
function TiltedWall() {
  const rows = [0, 1, 2].map((r) => [...RES, ...PEOPLE, ...COMM].filter((_, i) => i % 3 === r).slice(0, 8));
  return (
    <div aria-hidden className="relative my-24 h-[34rem] overflow-hidden [perspective:1400px]">
      <div className="absolute left-1/2 top-1/2 w-[160%] -translate-x-1/2 -translate-y-1/2 [transform:rotateX(28deg)_rotateZ(-14deg)] [transform-style:preserve-3d]">
        {rows.map((row, ri) => (
          <div key={ri} className="mb-5 overflow-hidden">
            <div className={cn("flex w-max gap-5", ri % 2 ? "animate-marquee-rev" : "animate-marquee")}>
              {[...row, ...row].map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" className="h-44 w-72 shrink-0 rounded-2xl object-cover" />)}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-bg2)_75%)]" />
    </div>
  );
}

function Gallery() {
  const [tab, setTab] = useState("res");
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const g = GALLERIES.find((x) => x.id === tab)!;
  const shown = all ? g.items : g.items.slice(0, 12);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <div>
      <div role="tablist" className="mb-8 flex flex-wrap gap-2">
        {GALLERIES.map((x) => (
          <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => { setTab(x.id); setAll(false); }}
            className={cn("rounded-full border px-5 py-2 text-sm transition", tab === x.id ? "border-accent bg-accent text-[#08080b]" : "border-line text-muted hover:border-accent/60 hover:text-fg")}>
            {x.label} <span className="font-mono text-xs opacity-60">{x.items.length}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((src, i) => (
          <motion.button key={src} onClick={() => setOpen(src)} aria-label={`Open image ${i + 1}`}
            initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-5% 0px" }} transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
            className="group overflow-hidden rounded-2xl border border-line">
            <img src={src} alt={`${g.label} AI scene ${i + 1}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
          </motion.button>
        ))}
      </div>
      {!all && g.items.length > 12 && (
        <button onClick={() => setAll(true)} className="mt-8 rounded-full border border-white/15 px-6 py-3 text-sm transition hover:border-accent hover:text-accent">Show all {g.items.length}</button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label="Image preview">
            <motion.img src={open} alt="AI-generated scene, enlarged" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} className="max-h-[90svh] max-w-full rounded-2xl" />
            <button className="absolute right-5 top-5 rounded-full border border-line px-4 py-2 font-mono text-xs hover:border-accent hover:text-accent">Close ✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AiContent() {
  return (
    <main>
      <header id="top" className="noise relative isolate flex min-h-[90svh] flex-col justify-center overflow-hidden px-6 pb-20 pt-32 md:px-12">
        <div aria-hidden className="grid-bg absolute inset-0" />
        <div aria-hidden className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-violet/25 blur-[130px]" />
        <div aria-hidden className="absolute -right-32 top-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[130px]" />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal><p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">Sean Murphy <span className="text-accent">/</span> AI &amp; automation</p></Reveal>
          <h1 className="font-display text-[clamp(3.4rem,11vw,10rem)] font-bold leading-[0.88] tracking-[-0.05em]">
            <WordReveal lines={["AI in production,", "not in theory."]} wordClass="text-gradient" delay={0.1} />
          </h1>
          <Reveal delay={0.7}><p className="mt-10 max-w-2xl text-lg text-muted">I build AI and automation into the daily work of marketing: image and video generation, keyword research and reporting. This page shows what comes off the line, and the growth it supported.</p></Reveal>
          <Reveal delay={0.85}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic><a href="#gallery" className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-[#08080b] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgb(198_255_61/0.5)]">See the AI gallery</a></Magnetic>
              <Magnetic><a href="#growth" className="rounded-full border border-white/15 px-7 py-3.5 text-sm transition hover:border-accent hover:text-accent">Jump to the numbers</a></Magnetic>
              <Magnetic><a href="https://reportingdashboard.vercel.app/" target="_blank" rel="noopener" className="rounded-full border border-white/15 px-7 py-3.5 text-sm transition hover:border-accent hover:text-accent">AI-built dashboard ↗</a></Magnetic>
            </div>
          </Reveal>
        </div>
      </header>

      <section id="pipeline" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-36">
        <SectionHead eyebrow="00 · The workflow" title={<>An AI production line,<br />step by step.</>}>Not a novelty: a repeatable process that has been in service for months and applies to any product line.</SectionHead>
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="h-full rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-accent/50">
                  <span className="font-display text-6xl font-bold tracking-[-0.05em] text-accent/80">{i + 1}</span>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{t}</h3>
                  <p className="mt-3 text-muted">{d}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section id="gallery" className="border-y border-white/10 bg-bg2 px-6 py-28 md:px-12 md:py-36">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow="01 · AI image production" title={<>Unlimited content,<br />zero photoshoots.</>}>Every image here was generated with AI from basic product renders and room references: staged homes, bars and hotels that would each have cost a location scout, a crew and a shoot day.</SectionHead>
          <ParallaxWall />
          <TiltedWall />
          <h3 className="mb-6 mt-4 font-mono text-xs uppercase tracking-[0.18em] text-accent">Browse the full set</h3>
          <Gallery />
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <Reveal>
              <h3 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">It doesn&apos;t stop at stills.</h3>
              <p className="mt-4 text-lg text-muted">The same pipeline produces motion. This clip was AI-generated end to end, showing product-in-motion and creator-style content without a crew.</p>
            </Reveal>
            <Reveal delay={0.08}>
              <TiltCard><img src="/media/ai-generated-clip.gif" alt="AI-generated video clip, looping" loading="lazy" className="w-full" /></TiltCard>
              <p className="mt-3 text-sm text-muted">AI-generated clip, no cameras involved (auto-looping)</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="films" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-36">
        <SectionHead eyebrow="02 · Films & ad creative" title={<>Brand films and the ads<br />behind the numbers.</>}>Produced with agencies and in-house teams I managed. The &ldquo;You In&rdquo; film is the creative behind the CTV campaign in the growth section below; several of the others lean on the AI workflow above.</SectionHead>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((v, i) => <Reveal key={v} delay={(i % 3) * 0.06}><VideoSlot label={v} /></Reveal>)}
        </div>
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[["/media/ads/black-friday-promo.webp", "Black Friday promo, 1:1 paid social"], ["/media/ads/product-launch.webp", "Product launch, 1:1 social"], ["/media/ads/person-feature.webp", "Lifestyle feature, 1:1 social"]].map(([src, cap], i) => (
            <Reveal key={src} delay={i * 0.07}>
              <TiltCard><img src={src} alt={cap} loading="lazy" className="aspect-square w-full object-cover" /></TiltCard>
              <p className="mt-3 text-sm text-muted">{cap}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="email" className="border-y border-white/10 bg-bg2 px-6 py-28 md:px-12 md:py-36">
        <div className="mx-auto max-w-7xl">
          <SectionHead eyebrow="03 · Email & lifecycle" title={<>Lifecycle email,<br />on brand and on schedule.</>}>Campaign and lifecycle email built to match the paid and social creative, so a customer sees one coherent brand from ad to inbox.</SectionHead>
          <div className="grid gap-6 md:grid-cols-2">
            {[["/media/emails/independence-day.webp", "Independence Day campaign email (scroll to view)"], ["/media/emails/email-02.webp", "Full-length campaign email (scroll to view)"]].map(([src, cap]) => (
              <Reveal key={src}>
                <div data-lenis-prevent className="max-h-[34rem] overflow-y-auto rounded-2xl border border-line bg-white"><img src={src} alt={cap} loading="lazy" className="w-full" /></div>
                <p className="mt-3 text-sm text-muted">{cap}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
            <Reveal><h3 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Show the problem, then show it moving.</h3><p className="mt-4 text-lg text-muted">Educational content that earns trust: a single annotated frame flags the swing fault, and the clip shows it live. Same insight, two formats, built for different placements.</p></Reveal>
            <Reveal delay={0.08}>
              <div className="grid gap-4 sm:grid-cols-2">
                <figure><img src="/media/lack-of-knee-flex.jpg" alt="Annotated swing analysis still: lack of knee flex" loading="lazy" className="aspect-video w-full rounded-2xl object-cover" /><figcaption className="mt-3 text-sm text-muted">The still: one frame, fault annotated</figcaption></figure>
                <VideoSlot label="The motion: same fault, shown live" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="growth" className="relative mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
        <SectionHead eyebrow="04 · YoY growth" title={<>The numbers behind<br />the story.</>}>Everything above is output. This is what it supported: June 2025 to June 2026 versus the prior twelve months, from Google Analytics, ad-platform exports and monthly performance reporting.</SectionHead>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GROWTH.map(([v, l, d], i) => (
            <Reveal key={l} delay={(i % 3) * 0.06}>
              <TiltCard className="h-full">
                <div className="p-8">
                  <div className="font-display text-7xl font-bold tracking-[-0.045em] text-accent"><CountUp value={v} /></div>
                  <div className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">{l}</div>
                  <p className="mt-4 text-muted">{d}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-16 rounded-3xl border border-line bg-surface p-8 md:p-12">
            <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">CTV: awareness that converts</h3>
            <p className="mt-3 max-w-2xl text-muted">A connected-TV flight (January to May 2026) built on the &ldquo;You In&rdquo; film, planned and reported with the media agency I managed.</p>
            <ul className="mt-8 flex flex-wrap gap-x-14 gap-y-6">
              {CTV.map(([v, l]) => <li key={l}><div className="font-display text-6xl font-bold tracking-[-0.04em] text-accent"><CountUp value={v} /></div><div className="mt-1 font-mono text-[0.68rem] uppercase tracking-widest text-faint">{l}</div></li>)}
            </ul>
            <p className="mt-8 text-sm text-faint">Placements spanned national sports and news networks and golf&apos;s biggest creator channels. Awareness spend that still paid for itself.</p>
          </div>
        </Reveal>
      </section>

      <footer className="noise relative overflow-hidden border-t border-white/10 px-6 pb-10 pt-24 md:px-12">
        <div className="relative mx-auto max-w-7xl">
          <Link href="/#work" className="group block">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Next</p>
            <p className="mt-4 font-display text-[clamp(2.4rem,8vw,7rem)] font-bold leading-[0.95] tracking-[-0.045em]"><span className="text-gradient">Case studies</span> <span className="text-accent transition-all duration-500 group-hover:ml-3">→</span></p>
            <p className="mt-4 text-muted">The roles, results and projects behind this work.</p>
          </Link>
          <p className="mt-16 text-center font-mono text-xs text-faint">© 2026 Sean Murphy · <Link href="/" className="hover:text-accent">Home</Link></p>
        </div>
      </footer>
    </main>
  );
}
