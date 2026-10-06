"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CountUp, Magnetic, Reveal, SectionHead, TiltCard, WordReveal } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const seq = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `/media/ai/${prefix}-${pad(i + 1)}.jpg`);
export const RES = seq("residential", 40);
export const PEOPLE = seq("residential-people", 19);
export const COMM = [...seq("commercial", 9), "/media/ai/commercial-bar-01.jpg", "/media/ai/commercial-bar-02.jpg", "/media/ai/commercial-hotel-01.jpg"];
const GALLERIES = [
  { id: "res", label: "Residential", items: RES },
  { id: "people", label: "With people", items: PEOPLE },
  { id: "comm", label: "Commercial", items: COMM },
];

export const STEPS = [
  ["Inputs", "Basic product renders, room and venue references, and SEO keyword research that decides which topics and scenes are worth producing."],
  ["Generate", "AI turns raw renders into polished lifestyle scenes, adds people matched to the brand's real customer, and produces video, including creator-style clips."],
  ["Finish", "Selection, correction and resizing for each placement: paid social, email, product pages, blog and sales decks."],
  ["Ship & measure", "Published into campaigns and tracked in the reporting dashboard, so what works gets more of the next batch."],
];

export const GROWTH = [
  ["+58%", "online purchases YoY", "13K+ purchases versus roughly 8.5K the year before, measured in Google Analytics."],
  ["+133%", "paid-media revenue YoY", "June 2026 monthly reporting across Google, Meta and CTV, at a healthy 16× marketing efficiency ratio."],
  ["3.3×", "organic social new users", "From about 44K to 145K new users in a year. Content and creators did this, not spend."],
  ["+22%", "US active users", "About 450K versus 365K, while international audiences grew alongside."],
  ["+85%", "value per paid-search user", "120-day user value nearly doubled while paid-search volume was deliberately cut."],
  ["+144%", "form starts", "About 43K versus 17.5K, the pipeline metric behind reseller and B2B growth."],
];

export const CTV: [string, string][] = [["2.8M", "impressions"], ["515K", "video views"], ["3.3×", "attributed ROAS"]];

export const VIDEOS: [label: string, file: string][] = [
  ["Launch-monitor product film", "product-film-01"], ["Compact launch-monitor product film", "product-film-02"], ["Website modernization walkthrough", "website-modernization"],
  ["Brand film, 30 seconds", "brand-film-30s"], ["\"You In\" brand campaign film", "brand-you-in"], ["AI software + launch-monitor ad", "ad-ai-software"],
  ["AI training product hero film", "ai-trainer-hero"], ["Launch-monitor hero film", "hero-launch-monitor"], ["Game-day software hero film", "game-day-hero"],
  ["Compact launch-monitor promo ad", "promo-ad-compact"], ["Simulator bundle promo ad", "promo-ad-bundle"],
];

export function VideoSlot({ label, file }: { label: string; file?: string }) {
  return (
    <figure>
      {file ? (
        <video controls playsInline preload="none" poster={`/media/videos/${file}.jpg`} aria-label={label} className="aspect-video w-full rounded-2xl border border-line bg-black object-cover">
          <source src={`/media/videos/${file}.mp4`} type="video/mp4" />
        </video>
      ) : (
        <div className="video-placeholder grid aspect-video place-items-center rounded-2xl border border-dashed border-line" role="img" aria-label="Video coming soon">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">▶ Video coming soon</span>
        </div>
      )}
      <figcaption className="mt-3 text-sm text-muted">{label}</figcaption>
    </figure>
  );
}

/** Columns of images drifting at different scroll speeds. */
export function ParallaxWall() {
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
export function TiltedWall() {
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

export function Gallery() {
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
            className={cn("rounded-full border px-5 py-2 text-sm transition", tab === x.id ? "border-accent bg-accent text-[#0a1224]" : "border-line text-muted hover:border-accent/60 hover:text-fg")}>
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


export function PageHero({ eyebrow, lines, intro, links }: { eyebrow: string; lines: string[]; intro: string; links: [string, string][] }) {
  return (
    <header id="top" className="noise relative isolate flex min-h-[80svh] flex-col justify-center overflow-hidden px-6 pb-20 pt-32 md:px-12">
      <div aria-hidden className="grid-bg absolute inset-0" />
      <div aria-hidden className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-violet/25 blur-[130px]" />
      <div aria-hidden className="absolute -right-32 top-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[130px]" />
      <div className="relative mx-auto w-full max-w-7xl">
        <Reveal><p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">Sean Murphy <span className="text-accent">/</span> {eyebrow}</p></Reveal>
        <h1 className="font-display text-[clamp(3.4rem,11vw,10rem)] font-light leading-[0.88] tracking-[-0.05em]">
          <WordReveal lines={lines} wordClass="text-gradient" delay={0.1} />
        </h1>
        <Reveal delay={0.25}><p className="mt-10 max-w-2xl text-lg text-muted">{intro}</p></Reveal>
        <Reveal delay={0.35}>
          <div className="mt-10 flex flex-wrap gap-3">
            {links.map(([href, label], i) => (
              <Magnetic key={href}>
                <a href={href} className={i === 0 ? "rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-[#0a1224] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgb(255_185_56/0.5)]" : "rounded-full border border-white/15 px-7 py-3.5 text-sm transition hover:border-accent hover:text-accent"}>{label}</a>
              </Magnetic>
            ))}
          </div>
        </Reveal>
      </div>
    </header>
  );
}

export function PageFooter({ href, title, blurb }: { href: string; title: string; blurb: string }) {
  return (
    <footer className="noise relative overflow-hidden border-t border-white/10 px-6 pb-10 pt-24 md:px-12">
      <div className="relative mx-auto max-w-7xl">
        <Link href={href} className="group block">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Next</p>
          <p className="mt-4 font-display text-[clamp(2.4rem,8vw,7rem)] font-light leading-[0.95] tracking-[-0.045em]"><span className="text-gradient">{title}</span> <span className="text-accent transition-all duration-500 group-hover:ml-3">→</span></p>
          <p className="mt-4 text-muted">{blurb}</p>
        </Link>
        <p className="mt-16 text-center font-mono text-xs text-faint">© 2026 Sean Murphy · <Link href="/" className="hover:text-accent">Home</Link></p>
      </div>
    </footer>
  );
}

export function Panel({ id, alt, children }: { id: string; alt?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("px-6 py-20 md:px-12 md:py-24", alt && "border-y border-white/10 bg-bg2")}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

/** Card grid used for automations, stack, principles. */
export function InfoCards({ items, cols = "md:grid-cols-3" }: { items: { k?: string; t: string; d: string; tags?: string[] }[]; cols?: string }) {
  return (
    <div className={cn("grid gap-4", cols)}>
      {items.map((it, i) => (
        <Reveal key={it.t} delay={(i % 3) * 0.06} className="h-full">
          <div className="h-full rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-accent/50">
            {it.k && <p className="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-accent">{it.k}</p>}
            <h3 className="mt-3 font-display text-2xl font-light tracking-tight">{it.t}</h3>
            <p className="mt-3 text-muted">{it.d}</p>
            {it.tags && <div className="mt-5 flex flex-wrap gap-2">{it.tags.map((t) => <span key={t} className="rounded-full border border-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-faint">{t}</span>)}</div>}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Slot({ label, ratio = "aspect-[4/3]" }: { label: string; ratio?: string }) {
  return (
    <figure>
      <div className={cn("grid place-items-center rounded-2xl border border-dashed border-line", ratio)} role="img" aria-label="Image coming soon">
        <span className="font-mono text-xs uppercase tracking-widest text-faint">Image coming soon</span>
      </div>
      <figcaption className="mt-3 text-sm text-muted">{label}</figcaption>
    </figure>
  );
}
