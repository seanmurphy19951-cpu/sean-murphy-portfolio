"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionHead } from "@/components/ui/primitives";
import { cases } from "@/lib/data";
import { cn } from "@/lib/utils";

const FEATURED = ["reseller-growth", "black-friday", "amazon", "paid-media"]
  .map((id) => cases.find((c) => c.id === id))
  .filter((c): c is NonNullable<typeof c> => !!c);

/** Sticky-scroll story: the stat panel stays pinned while the case text scrolls past and swaps it. */
export function Featured() {
  const [active, setActive] = useState(0);
  const cur = FEATURED[active];
  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHead eyebrow="Highlights" title={<>The four results<br />I&apos;d lead with.</>}>Scroll through the headline wins; every case is in the full grid below.</SectionHead>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          {FEATURED.map((c, i) => (
            <motion.article
              key={c.id}
              onViewportEnter={() => setActive(i)}
              viewport={{ amount: 0.55 }}
              animate={{ opacity: active === i ? 1 : 0.35 }}
              transition={{ duration: 0.4 }}
              className="flex min-h-[70svh] flex-col justify-center py-10"
            >
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">0{i + 1} · {c.employer}</p>
              <h3 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">{c.title}</h3>
              <div className="mt-6 lg:hidden"><span className="font-display text-6xl font-bold tracking-[-0.04em] text-accent">{c.stats[0]?.[0]}</span><span className="ml-3 font-mono text-[0.7rem] uppercase tracking-widest text-faint">{c.stats[0]?.[1]}</span></div>
              <p className="mt-6 max-w-lg text-lg text-muted">{c.result}</p>
            </motion.article>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-28 grid aspect-square place-items-center overflow-hidden rounded-[2rem] border border-line bg-surface">
            <div aria-hidden className={cn("absolute inset-0 transition-opacity duration-700", "bg-[radial-gradient(circle_at_50%_40%,rgb(198_255_61/0.14),transparent_65%)]")} />
            <AnimatePresence mode="wait">
              <motion.div key={cur.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.4 }} className="relative px-8 text-center">
                <div className="font-display text-[clamp(5rem,11vw,10rem)] font-bold leading-none tracking-[-0.05em] text-accent">{cur.stats[0]?.[0]}</div>
                <div className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-muted">{cur.stats[0]?.[1]}</div>
                <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
                  {cur.stats.slice(1, 3).map(([v, l]) => <li key={l}><span className="font-display text-2xl font-semibold">{v}</span> <span className="font-mono text-[0.65rem] uppercase tracking-widest text-faint">{l}</span></li>)}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
