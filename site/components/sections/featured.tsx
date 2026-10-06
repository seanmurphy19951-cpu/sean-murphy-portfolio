"use client";
import { Reveal, SectionHead, Swiper } from "@/components/ui/primitives";
import { cases } from "@/lib/data";

export const FEATURED_IDS = ["reseller-growth", "black-friday", "amazon", "paid-media"];
const FEATURED = FEATURED_IDS
  .map((id) => cases.find((c) => c.id === id))
  .filter((c): c is NonNullable<typeof c> => !!c);

/** Four headline results as a swipeable row. */
export function Featured() {
  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-24">
      <SectionHead eyebrow="Highlights" title={<>The results<br />I&apos;d start with.</>}>Four outcomes across e-commerce, paid media and partnerships. Full case studies follow.</SectionHead>
      <Reveal>
        <Swiper label="Headline results" itemClass="w-[85vw] md:w-[34rem]">
          {FEATURED.map((c, i) => (
            <article key={c.id} className="flex h-full min-h-[26rem] flex-col rounded-[2rem] border border-line bg-surface p-8 transition-colors hover:border-accent/50 md:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-faint">0{i + 1} · {c.employer}</p>
              <div className="mt-6 font-display text-7xl font-light leading-none tracking-[-0.05em] text-accent md:text-8xl">{c.stats[0]?.[0]}</div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">{c.stats[0]?.[1]}</div>
              <h3 className="mt-auto pt-8 font-display text-2xl font-light leading-tight tracking-tight md:text-3xl">{c.title}</h3>
              <p className="mt-3 text-muted">{c.result}</p>
            </article>
          ))}
        </Swiper>
      </Reveal>
    </section>
  );
}
