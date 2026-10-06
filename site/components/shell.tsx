"use client";
import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useMotionValue, useSpring } from "motion/react";
import { CommandPalette } from "@/components/command-palette";
import { AI_NAV, NAV, profile } from "@/lib/data";
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
    return () => window.removeEventListener("pointermove", f);
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

const DASH_NAV = [{ id: "top", label: "Dashboard" }];
const PAGES = [{ href: "/", label: "Home", key: "home" }, { href: "/ai-content", label: "AI & Content", key: "ai" }, { href: "/dashboard", label: "Dashboard", key: "dash" }];

/** Fixed top bar (pages + external links) and a left rail (sections of the current page). */
export function SiteNav({ variant = "home" }: { variant?: "home" | "ai" | "dash" }) {
  const items = variant === "home" ? NAV : variant === "ai" ? AI_NAV : DASH_NAV;
  const [active, setActive] = useState(items[0].id);
  const [open, setOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
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
            {variant !== "dash" && <p className="px-3 pb-2 pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-faint">On this page</p>}
            {variant !== "dash" && items.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-2.5 text-lg">{n.label}</a>)}
            <p className="px-3 pb-2 pt-4 font-mono text-[0.65rem] uppercase tracking-widest text-faint">Links</p>
            <a href={profile.linkedin} target="_blank" rel="noopener" className="block rounded-2xl px-3 py-2.5 text-lg">LinkedIn ↗</a>
            <a href={`mailto:${profile.email}`} className="block rounded-2xl px-3 py-2.5 text-lg text-accent">Email</a>
          </div>
        )}
      </header>
      {variant !== "dash" && <aside aria-label="On this page" className="fixed bottom-0 left-0 top-16 z-40 hidden w-44 flex-col justify-center pl-8 lg:flex">
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
