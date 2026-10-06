"use client";
import { useEffect, useState, type ReactNode } from "react";
import Lenis from "lenis";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useMotionValue, useSpring } from "motion/react";
import { AI_NAV, NAV } from "@/lib/data";
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
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[400px] w-[400px] rounded-full bg-accent/[0.05] blur-3xl md:block"
      />
    </>
  );
}

/** Floating glass pill; hides on scroll down, returns on scroll up; highlights the section in view. */
export function FloatingNav({ variant = "home" }: { variant?: "home" | "ai" }) {
  const home = variant === "home";
  const items = home ? NAV : AI_NAV;
  const href = (id: string) => (id === "home" ? "/" : `#${id}`);
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200);
  });
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    items.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <motion.header
      animate={{ y: hidden && !open ? -110 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav aria-label="Primary" className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-1.5 pl-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <a href={home ? "#top" : "/"} className="mr-3 font-display text-lg font-bold tracking-tight">SM<span className="text-accent">.</span></a>
        <div className="hidden items-center md:flex">
          {items.map((n) => (
            <a key={n.id} href={href(n.id)} className={cn("relative rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg", active === n.id && "text-[#08080b]")}>
              {active === n.id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative">{n.label}</span>
            </a>
          ))}
        </div>
        <a href="/Sean-Murphy-Resume.pdf" className="ml-1 hidden rounded-full border border-white/15 px-4 py-2 text-sm hover:border-accent hover:text-accent md:block">Résumé</a>
        <button aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)} className="rounded-full px-4 py-2 text-sm md:hidden">{open ? "Close" : "Menu"}</button>
      </nav>
      {open && (
        <div className="absolute top-16 w-[calc(100%-2rem)] max-w-sm rounded-3xl border border-white/10 bg-black/80 p-3 backdrop-blur-xl md:hidden">
          {items.map((n) => <a key={n.id} href={href(n.id)} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-lg hover:bg-white/5">{n.label}</a>)}
          <a href="/Sean-Murphy-Resume.pdf" className="block rounded-2xl px-4 py-3 text-lg text-accent">Résumé (PDF)</a>
        </div>
      )}
    </motion.header>
  );
}
