"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/** Reveals text line by line, word by word, sliding up from a mask. */
export function WordReveal({ lines, className, wordClass, delay = 0 }: { lines: string[]; className?: string; wordClass?: string; delay?: number }) {
  const reduce = useReducedMotion();
  let n = 0;
  return (
    <span className={cn("block", className)} aria-label={lines.join(" ")}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((w, wi) => (
            <span key={wi} className="inline-block overflow-hidden pb-[0.2em] -mb-[0.12em] align-bottom">
              <motion.span
                className={cn("inline-block", wordClass)}
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: delay + 0.08 * n++, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/** Cycles through words with a blur/slide transition; reserves width of the longest word. */
export function FlipWords({ words, className }: { words: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [words.length, reduce]);
  return (
    <span className={cn("relative grid md:inline-grid", className)}>
      {words.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1 whitespace-nowrap">{w}</span>
      ))}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          className="absolute left-0 top-0 whitespace-nowrap"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Counts a stat like "$15M", "4×+", "+35%" or "−$3+" up from zero when it scrolls into view. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const m = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [text, setText] = useState(reduce || !m ? value : `${m[1]}0${m[3]}`);
  useEffect(() => {
    if (!m || reduce || !inView) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const dec = m[2].includes(".") ? m[2].split(".")[1].length : 0;
    const c = animate(0, target, {
      duration: 1.6, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setText(`${m[1]}${v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}${m[3]}`),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return <span ref={ref} className={className} aria-label={value}>{text}</span>;
}

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={cn("marquee relative overflow-hidden", className)} aria-label={items.join(", ")}>
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap" aria-hidden>
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-medium tracking-tight text-fg/80 md:text-4xl">
            {t}
            <span className="text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Card with 3D tilt, moving glare and a cursor-following glow border. */
export function TiltCard({ children, className, onClick, label }: { children: ReactNode; className?: string; onClick?: () => void; label?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glow = useTransform([gx, gy], ([x, y]) => `radial-gradient(420px circle at ${x}% ${y}%, rgb(255 185 56 / 0.16), transparent 55%)`);
  const edge = useTransform([gx, gy], ([x, y]) => `radial-gradient(260px circle at ${x}% ${y}%, rgb(255 185 56 / 0.9), transparent 60%)`);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gx.set(px * 100); gy.set(py * 100);
    if (!reduce) { ry.set((px - 0.5) * 8); rx.set((0.5 - py) * 8); }
  };
  const leave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("group relative rounded-3xl bg-line/60 p-px transition-shadow duration-300 hover:shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)]", onClick && "cursor-pointer", className)}
    >
      <motion.div aria-hidden style={{ background: edge }} className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-surface">
        <motion.div aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative h-full">{children}</div>
      </div>
    </motion.div>
  );
}

export function Reveal({ children, className, delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-10 max-w-3xl">
      <Reveal><p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-accent"><Scramble text={eyebrow} /></p></Reveal>
      <Reveal delay={0.05}><h2 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] md:text-6xl">{title}</h2></Reveal>
      {children && <Reveal delay={0.1}><p className="mt-6 max-w-2xl text-lg text-muted">{children}</p></Reveal>}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-full border border-line bg-white/[0.02] px-3 py-1 text-[0.78rem] text-muted transition-colors hover:border-accent/60 hover:text-fg">{children}</span>;
}

/** Pulls its child toward the cursor like a magnet. */
export function Magnetic({ children, className, strength = 0.3 }: { children: ReactNode; className?: string; strength?: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cn("inline-block", className)}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/** Text that decodes from random glyphs when it scrolls into view (and again on hover). */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const run = () => {
    if (reduce) return;
    if (timer.current) clearInterval(timer.current);
    const glyphs = "!<>-_/[]{}=+*^?#";
    let f = 0;
    timer.current = setInterval(() => {
      f++;
      setOut(text.split("").map((c, i) => (c === " " || i < f / 2 ? c : glyphs[Math.floor(Math.random() * glyphs.length)])).join(""));
      if (f / 2 >= text.length && timer.current) { clearInterval(timer.current); setOut(text); }
    }, 30);
  };
  useEffect(() => { if (inView) run(); return () => { if (timer.current) clearInterval(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return <span ref={ref} className={className} onMouseEnter={run} aria-label={text}>{out}</span>;
}

/** Stat whose number is scrubbed by scroll position (counts up as it passes through the viewport). */
export function ScrollCount({ value, className }: { value: string; className?: string }) {
  const m = value.match(/^([^0-9]*)([\d,.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 55%"] });
  const [text, setText] = useState(value);
  const render = (p: number) => {
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const dec = m[2].includes(".") ? m[2].split(".")[1].length : 0;
    setText(`${m[1]}${(target * Math.min(1, Math.max(0, p))).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}${m[3]}`);
  };
  useMotionValueEvent(scrollYProgress, "change", (p) => { if (!reduce) render(p); });
  return <span ref={ref} className={className} aria-label={value}>{text}</span>;
}


/** Horizontal snap carousel (touch/trackpad swipe, arrow buttons, keyboard) with a progress line. */
export function Swiper({ children, itemClass = "w-[85vw] md:w-[30rem]", label }: { children: ReactNode[]; itemClass?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const by = (d: number) => { const el = ref.current; if (el) el.scrollBy({ left: d * el.clientWidth * 0.7, behavior: "smooth" }); };
  const onScroll = () => { const el = ref.current; if (el) setP(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)); };
  const btn = "grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent";
  return (
    <div>
      <div
        ref={ref} onScroll={onScroll} tabIndex={0} role="region" aria-label={label}
        onKeyDown={(e) => { if (e.key === "ArrowRight") by(1); if (e.key === "ArrowLeft") by(-1); }}
        className="flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children.map((c, i) => <div key={i} className={cn("shrink-0 snap-start", itemClass)}>{c}</div>)}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-px flex-1 bg-line"><div className="h-px bg-accent transition-[width] duration-200" style={{ width: `${Math.max(8, p * 100)}%` }} /></div>
        <button aria-label="Previous" onClick={() => by(-1)} className={btn}>←</button>
        <button aria-label="Next" onClick={() => by(1)} className={btn}>→</button>
      </div>
    </div>
  );
}
