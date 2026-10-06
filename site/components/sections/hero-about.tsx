"use client";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { CountUp, FlipWords, Magnetic, Marquee, Reveal, SectionHead, WordReveal } from "@/components/ui/primitives";
import { HERO_STATS, MARQUEE } from "@/lib/data";

function HeroBackdrop() {
  const reduce = useReducedMotion();
  const mx = useSpring(useMotionValue(50), { stiffness: 60, damping: 20 });
  const my = useSpring(useMotionValue(30), { stiffness: 60, damping: 20 });
  const spot = useTransform([mx, my], ([x, y]) => `radial-gradient(600px circle at ${x}% ${y}%, rgb(255 185 56 / 0.10), transparent 60%)`);
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX - r.left) / r.width) * 100); my.set(((e.clientY - r.top) / r.height) * 100); }}
    >
      <div className="grid-bg absolute inset-0" />
      <motion.div style={{ background: spot }} className="absolute inset-0" />
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-violet/25 blur-[120px]"
        animate={reduce ? undefined : { x: [0, 90, 0], y: [0, 60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-20 h-[460px] w-[460px] rounded-full bg-accent/15 blur-[130px]"
        animate={reduce ? undefined : { x: [0, -80, 0], y: [0, 80, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}

export function Hero() {
  return (
    <>
      <header id="top" className="noise relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-20 pt-32 md:px-12">
        <HeroBackdrop />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal><p className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">E-commerce &amp; Digital Marketing Leader <span className="text-accent">/</span> Orange, CA</p></Reveal>
          <h1 className="font-display text-[clamp(4rem,15.5vw,13rem)] font-light leading-[0.84] tracking-[-0.05em]">
            <WordReveal lines={["Sean", "Murphy"]} wordClass="text-gradient" delay={0.1} />
          </h1>
          <Reveal delay={0.7}>
            <p className="mt-10 max-w-3xl font-display text-2xl leading-snug tracking-tight text-fg/90 md:text-4xl">
              <span className="mb-2 block text-fg/60 md:mb-3">I turn data into strategy.</span>
              I turn strategy into <span className="text-accent"><FlipWords words={["live campaigns", "shipped websites", "signed partner deals", "measurable growth"]} /></span>
            </p>
          </Reveal>
          <Reveal delay={0.85}>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Six years across paid media, lifecycle email, marketplaces, influencer programs and e-commerce operations, from golf technology to sportfishing, training and an agency serving 50+ businesses.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic><a href="#work" className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-[#0a1224] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgb(255_185_56/0.5)]">View case studies</a></Magnetic>
              <Magnetic><a href="#contact" className="rounded-full border border-white/15 px-7 py-3.5 text-sm transition hover:border-accent hover:text-accent">Get in touch</a></Magnetic>
            </div>
          </Reveal>
          <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-8 md:grid-cols-4">
            {HERO_STATS.map(([v, l], i) => (
              <Reveal key={l} delay={1.1 + i * 0.08}>
                <dt className="font-display text-5xl font-light tracking-[-0.04em] text-accent md:text-6xl"><CountUp value={v} /></dt>
                <dd className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">{l}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </header>
      <div className="border-y border-white/10 bg-bg2 py-8"><Marquee items={MARQUEE} /></div>
    </>
  );
}

const VALUES = [
  ["Numbers-driven", "I decide with data and steer spend in-flight rather than waiting for the report: ROAS, CPA, AOV and sell-through are the daily dashboard."],
  ["Owner mentality", "I take a project end to end. On Black Friday I owned the promotion, the partner deals, the invoicing and the reporting myself."],
  ["Builder", "I'd rather build it than write a brief: stores, code changes, ad creative, automations and AI workflows."],
  ["Collaborative", "Agencies, creators, retail partners and leadership all need the same plan, and I keep them aligned on it."],
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
      <SectionHead eyebrow="About" title={<>Strategy that<br />gets built.</>}>I run e-commerce marketing end to end, from the plan to the live campaign, site or partner deal.</SectionHead>
      <div ref={ref} className="grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/headshot.jpg" alt="Sean Murphy" width={546} height={546} className="mb-6 aspect-[4/5] w-full rounded-3xl border border-line object-cover object-[50%_20%] grayscale" />
            <dl className="divide-y divide-line border-y border-line text-sm">
              {[["Based", "Orange, CA"], ["Current role", "E-commerce Marketing Manager, Uneekor"], ["Education", "BA Management Studies, University of Leicester"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3"><dt className="font-mono text-[0.7rem] uppercase tracking-widest text-faint">{k}</dt><dd className="text-right">{v}</dd></div>
              ))}
            </dl>
          </Reveal>
        </aside>
        <div>
          <Reveal><p className="font-display text-3xl leading-[1.25] tracking-tight text-fg md:text-4xl">I&apos;m an e-commerce and digital marketing leader who started on the shop floor and now runs e-commerce marketing for a global golf-technology brand. Every role has been in the seat where strategy has to turn into a live campaign, a shipped website, or a signed partner deal by Friday.</p></Reveal>
          {/* TODO(Sean): origin story, 2-3 real sentences; one real example per value; soccer team / golf details. */}
          <Reveal delay={0.05}><p className="mt-8 max-w-2xl text-lg text-muted">I came up the hands-on way: working in UK retail first, where I learned how customers actually shop and what a business needs from its stock, its systems and its people. That led into e-commerce at a platform serving 50+ merchants, then freelance store builds, a fishing-tackle retailer, and today a global golf-technology brand, with a move from the UK to California along the way.</p></Reveal>
          <h3 className="mb-5 mt-16 font-mono text-xs uppercase tracking-[0.18em] text-accent">How I work</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {VALUES.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-accent/50">
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  <h4 className="mt-3 font-display text-2xl font-light tracking-tight">{t}</h4>
                  <p className="mt-3 text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <h3 className="mb-4 mt-16 font-mono text-xs uppercase tracking-[0.18em] text-accent">Outside work</h3>
          <Reveal><p className="max-w-2xl text-lg text-muted">Soccer, golf and fitness keep me moving, and I spend spare time tinkering with AI tools and automations, including the workflows behind this site.</p></Reveal>
        </div>
      </div>
    </section>
  );
}
