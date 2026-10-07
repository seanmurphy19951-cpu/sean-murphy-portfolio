"use client";
import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useMotionValue, useSpring } from "motion/react";
import { CommandPalette } from "@/components/command-palette";
import { AI_NAV, CONTENT_NAV, NAV, WORK_NAV, profile } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    let id = requestAnimationFrame(function raf(t) { lenis.raf(t); id = requestAnimationFrame(raf); });
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, [reduce]);
  return <>{children}</>;
}

/** Thin accent progress bar across the top plus a soft cursor glow on desktop. */
export function SkipLink() {
  return (
    <a
      href="#main"
      onClick={(e) => { e.preventDefault(); const m = document.querySelector("main"); if (m) { m.setAttribute("tabindex", "-1"); (m as HTMLElement).focus(); m.scrollIntoView(); } }}
      className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-[#0a1224] focus:translate-y-0"
    >Skip to content</a>
  );
}

export function Ambient() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 120, damping: 20 });
  const sy = useSpring(my, { stiffness: 120, damping: 20 });
  useEffect(() => {
    const f = (e: PointerEvent) => { mx.set(e.clientX - 200); my.set(e.clientY - 200); };
    window.addEventListener("pointermove", f);
    // stop the browser's middle-click auto-scroll widget from popping up
    const mid = (e: MouseEvent) => { if (e.button === 1 && !(e.target as HTMLElement).closest("a")) e.preventDefault(); };
    window.addEventListener("mousedown", mid);
    return () => { window.removeEventListener("pointermove", f); window.removeEventListener("mousedown", mid); };
  }, [mx, my]);
  return (
    <>
      <motion.div style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent" />
      <motion.div
        aria-hidden
        style={{ x: sx, y: sy }}
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[400px] w-[400px] rounded-full bg-accent/[0.06] blur-3xl md:block"
      />
    </>
  );
}

const DASH_NAV = [
  { id: "executive-summary", label: "Executive Summary" },
  { id: "channel-mix", label: "Cross-Channel Performance" },
  { id: "funnel-analysis", label: "Conversion Funnel" },
  { id: "google-ads", label: "Google Ads" },
  { id: "meta-ads", label: "Meta Ads" },
  { id: "shopify", label: "E-Commerce" },
  { id: "b2b-partners", label: "B2B Partners" },
  { id: "website", label: "Website Analytics" },
  { id: "insights", label: "Insights & Recommendations" },
  { id: "trends", label: "Cross-Channel Trends" },
  { id: "promo-analysis", label: "Promo Analysis" },
];
const PAGES = [{ href: "/", label: "Home", key: "home" }, { href: "/ai", label: "AI", key: "ai" }, { href: "/content", label: "Content", key: "content" }, { href: "/work", label: "Work", key: "work" }];
const BOARDS = [{ href: "/dashboard", label: "Example dashboard", note: "Performance reporting", key: "dash" }, { href: "/okr", label: "Example OKR", note: "Weekly scorecard", key: "okr" }];

/** Fixed top bar (pages + external links) and a left rail (sections of the current page). */
export function SiteNav({ variant = "home" }: { variant?: "home" | "ai" | "content" | "work" | "dash" | "okr" }) {
  const items = variant === "home" ? NAV : variant === "ai" ? AI_NAV : variant === "content" ? CONTENT_NAV : variant === "work" ? WORK_NAV : variant === "okr" || variant === "dash" ? [] : DASH_NAV;
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    const seen = new Set<string>();
    const watch = () => items.forEach((n) => { const el = document.getElementById(n.id); if (el && !seen.has(n.id)) { seen.add(n.id); io.observe(el); } });
    watch();
    // dashboard sections render after their data loads client-side
    const poll = seen.size < items.length ? setInterval(() => { watch(); if (seen.size === items.length) clearInterval(poll); }, 400) : undefined;
    return () => { io.disconnect(); if (poll) clearInterval(poll); };
  }, [items]);
  const boardActive = variant === "dash" || variant === "okr";
  const ext = "rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent";
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/75 backdrop-blur-xl">
        <nav aria-label="Pages" className="mx-auto flex h-16 max-w-[90rem] items-center gap-2 px-4 md:px-8">
          <Link href="/" className="mr-4 font-display text-xl font-light tracking-tight">SM<span className="text-accent">.</span></Link>
          <div className="hidden items-center gap-1 md:flex">
            {PAGES.map((pg) => (
              <Link key={pg.key} href={pg.href} aria-current={pg.key === variant ? "page" : undefined} className={cn("relative rounded-full px-4 py-2 text-sm transition-colors", pg.key === variant ? "bg-accent text-[#0a1224]" : "text-muted hover:text-fg")}>{pg.label}</Link>
            ))}
            <div className="group relative">
              <button type="button" aria-haspopup="menu" className={cn("flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors", boardActive ? "bg-accent text-[#0a1224]" : "text-muted hover:text-fg group-focus-within:text-fg")}>Performance boards <span aria-hidden className="text-[0.6rem]">▾</span></button>
              <div role="menu" className="invisible absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="rounded-2xl border border-line bg-bg2 p-2 shadow-2xl">
                  {BOARDS.map((b) => (
                    <Link key={b.key} role="menuitem" href={b.href} className={cn("block rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5", b.key === variant && "text-accent")}>
                      <span className="block text-sm">{b.label}</span><span className="block text-xs text-faint">{b.note}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <a href={profile.linkedin} target="_blank" rel="noopener" className={cn(ext, "hidden lg:block")}>LinkedIn ↗</a>
            <a href={`mailto:${profile.email}`} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#0a1224] transition hover:-translate-y-0.5">Email</a>
          </div>
          <button aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)} className="ml-auto rounded-full border border-line px-4 py-2 text-sm md:hidden">{open ? "Close" : "Menu"}</button>
        </nav>
        {open && (
          <div className="max-h-[80svh] overflow-y-auto border-t border-line bg-bg p-4 md:hidden" data-lenis-prevent>
            <p className="px-3 pb-2 font-mono text-[0.65rem] uppercase tracking-widest text-faint">Pages</p>
            {PAGES.map((pg) => <Link key={pg.key} href={pg.href} onClick={() => setOpen(false)} className={cn("block rounded-2xl px-3 py-2.5 text-lg", pg.key === variant && "text-accent")}>{pg.label}</Link>)}
            <p className="px-3 pb-2 pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-faint">Performance boards</p>
            {BOARDS.map((b) => <Link key={b.key} href={b.href} onClick={() => setOpen(false)} className={cn("block rounded-2xl px-3 py-2.5 text-lg", b.key === variant && "text-accent")}>{b.label}</Link>)}
            {items.length > 0 && <p className="px-3 pb-2 pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-faint">On this page</p>}
            {items.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-2.5 text-lg">{n.label}</a>)}
            <p className="px-3 pb-2 pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-faint">Links</p>
            <a href={profile.linkedin} target="_blank" rel="noopener" className="block rounded-2xl px-3 py-2.5 text-lg">LinkedIn ↗</a>
            <a href={`mailto:${profile.email}`} className="block rounded-2xl px-3 py-2.5 text-lg text-accent">Email</a>
          </div>
        )}
      </header>
      {items.length > 0 && <aside aria-label="On this page" className="fixed bottom-0 left-0 top-16 z-40 hidden w-44 flex-col justify-center pl-8 lg:flex">
        <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-faint">On this page</p>
        <ul className="space-y-1 border-l border-line">
          {items.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className={cn("-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors", active === n.id ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg")}>{n.label}</a>
            </li>
          ))}
        </ul>
      </aside>}
      <CommandPalette open={palette} setOpen={setPalette} />
    </>
  );
}
