"use client";
import { Pager } from "@/components/pager";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SectionHead, Tag, TiltCard } from "@/components/ui/primitives";
import { cases, type Case } from "@/lib/data";
import { FEATURED_IDS } from "./featured";
import { cn } from "@/lib/utils";

const more = cases.filter((c) => !FEATURED_IDS.includes(c.id));
const num = (i: number) => String(i + 1).padStart(2, "0");

export function CaseCard({ c, i, onOpen, big = false }: { c: Case; i: number; onOpen: () => void; big?: boolean }) {
  const [value, label] = c.stats[0] ?? ["", ""];
  return (
    <motion.div layoutId={`case-${c.id}`} className={cn(big && "md:col-span-2 lg:col-span-2")} style={{ borderRadius: 24 }}>
      <TiltCard onClick={onOpen} label={c.title} className="h-full">
        <article className={cn("flex h-full min-h-[22rem] flex-col p-7", big && "md:min-h-[26rem] md:p-10")}>
          <div className="flex items-start justify-between">
            <span className="font-mono text-xs text-faint">{num(i)}</span>
            <span className="rounded-full border border-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-faint">{c.tags[0]}</span>
          </div>
          {value && (
            <div className="mt-8">
              <div className={cn("font-display font-light leading-none tracking-[-0.04em] text-accent", big ? "text-7xl md:text-9xl" : "text-6xl")}>{value}</div>
              <div className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">{label}</div>
            </div>
          )}
          <h3 className={cn("mt-auto pt-8 font-display font-light leading-tight tracking-tight", big ? "text-3xl md:text-4xl" : "text-2xl")}>{c.title}</h3>
          <div className="mt-5 flex items-center justify-between font-mono text-xs text-muted">
            <span>{c.tools.slice(0, 2).join(" · ")}</span>
            <span className="text-accent transition-transform duration-300 group-hover:translate-x-1">Read →</span>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}

export function CaseModal({ c, i, onClose }: { c: Case; i: number; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.documentElement.style.overflow = prev; };
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center p-4 md:p-10" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}>
      <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        layoutId={`case-${c.id}`} role="dialog" aria-modal="true" aria-label={c.title} data-lenis-prevent
        className="relative max-h-[90svh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-surface p-8 md:p-12"
        style={{ borderRadius: 28 }}
      >
        <button onClick={onClose} className="absolute right-5 top-5 rounded-full border border-line px-4 py-2 font-mono text-xs hover:border-accent hover:text-accent">Close ✕</button>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{num(i)} · {c.tags[0]}</p>
        <h3 className="mt-4 max-w-2xl pr-20 font-display text-3xl font-light leading-tight tracking-tight md:text-5xl">{c.title}</h3>
        {c.stats.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-y border-line py-6">
            {c.stats.map(([v, l]) => (
              <li key={l}><div className="font-display text-5xl font-light tracking-[-0.04em] text-accent">{v}</div><div className="mt-1 font-mono text-[0.68rem] uppercase tracking-widest text-faint">{l}</div></li>
            ))}
          </ul>
        )}
        <dl className="mt-8 grid gap-7">
          {([["Problem", c.problem], ["Approach", c.approach], ["Result", c.result]] as const).map(([k, v]) => (
            <div key={k} className="grid gap-2 md:grid-cols-[8rem_1fr] md:gap-8">
              <dt className="pt-1 font-mono text-xs uppercase tracking-[0.15em] text-violet">{k}</dt>
              <dd className={cn("text-lg leading-relaxed", k === "Result" ? "text-fg" : "text-muted")}>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-2">{c.tools.map((t) => <Tag key={t}>{t}</Tag>)}</div>
        {c.footnote && <p className="mt-6 text-sm italic text-faint">{c.footnote}</p>}
        {c.link && <a href={c.link[0]} className="mt-6 inline-block font-mono text-sm text-accent hover:underline">{c.link[1]} →</a>}
      </motion.div>
    </motion.div>
  );
}

export function Work() {
  const [open, setOpen] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const idx = cases.findIndex((c) => c.id === open);
  return (
    <section id="work" className="relative border-y border-white/10 bg-bg2 px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Case studies" title={<>Ten more problems,<br />ten more results.</>}>The four above, plus ten more, each laid out as problem, approach and result. Partners, retailers and talent are anonymized and figures rounded.</SectionHead>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(all ? more : more.slice(0, 6)).map((c) => <CaseCard key={c.id} c={c} i={cases.indexOf(c)} big={c === more[0]} onOpen={() => setOpen(c.id)} />)}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => setAll(!all)} className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent">{all ? "Show fewer" : `Show all ${more.length} here`}</button>
          <a href="/work" className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-[#0a1224]">Open the Work page →</a>
        </div>
      </div>
      <AnimatePresence>{idx >= 0 && <CaseModal key={open} c={cases[idx]} i={idx} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}

export function WorkPage() {
  const [open, setOpen] = useState<string | null>(null);
  const idx = cases.findIndex((c) => c.id === open);
  const shown = cases.map((c, i) => ({ c, i }));
  return (
    <main id="top" className="px-6 pb-24 pt-32 md:px-12 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="Work" title={<>The full portfolio<br />of work.</>}>Open any project for the detail. Employers, partners, retailers and talent are anonymized and figures rounded.</SectionHead>
        <div id="cases" className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ c, i }) => <CaseCard key={c.id} c={c} i={i} big={i === 0} onOpen={() => setOpen(c.id)} />)}
        </div>
      </div>
      <AnimatePresence>{idx >= 0 && <CaseModal key={open} c={cases[idx]} i={idx} onClose={() => setOpen(null)} />}</AnimatePresence>
      <Pager page="work" />
    </main>
  );
}
