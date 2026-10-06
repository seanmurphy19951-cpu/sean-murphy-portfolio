"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cases, profile } from "@/lib/data";
import { cn } from "@/lib/utils";

type Item = { label: string; hint: string; href: string; external?: boolean };

const ITEMS: Item[] = [
  { label: "Home", hint: "Page", href: "/" },
  { label: "AI & Content", hint: "Page", href: "/ai-content" },
  { label: "About", hint: "Section", href: "/#about" },
  { label: "Highlights", hint: "Section", href: "/#featured" },
  { label: "Case studies", hint: "Section", href: "/#work" },
  { label: "Experience", hint: "Section", href: "/#experience" },
  { label: "Skills", hint: "Section", href: "/#skills" },
  { label: "Contact", hint: "Section", href: "/#contact" },
  ...cases.map((c) => ({ label: c.title, hint: `Case · ${c.employer}`, href: "/#work" })),
  { label: "Download résumé (PDF)", hint: "Link", href: "/Sean-Murphy-Resume.pdf", external: true },
  { label: "Email Sean", hint: "Link", href: `mailto:${profile.email}`, external: true },
  { label: "LinkedIn", hint: "Link", href: profile.linkedin, external: true },
  { label: "AI-built dashboard", hint: "Link", href: "https://reportingdashboard.vercel.app/", external: true },
];

/** ⌘K / Ctrl+K command palette to jump anywhere. Open it with the exported trigger or the keyboard. */
export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => ITEMS.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(q.toLowerCase())).slice(0, 8), [q]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(!open); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, setOpen]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);

  const go = (i?: Item) => {
    if (!i) return;
    setOpen(false);
    if (i.external) window.open(i.href, i.href.startsWith("mailto:") ? "_self" : "_blank", "noopener");
    else router.push(i.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-start justify-items-center bg-black/70 p-4 pt-[14vh] backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Command palette">
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.97 }} transition={{ duration: 0.2 }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-2xl shadow-black/60">
            <input
              ref={input} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} placeholder="Jump to a section, case study or link…" aria-label="Search"
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
                if (e.key === "Enter") go(results[sel]);
              }}
              className="w-full border-b border-line bg-transparent px-6 py-5 text-lg outline-none placeholder:text-faint"
            />
            <ul className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
              {results.length === 0 && <li className="px-4 py-6 text-center text-muted">No matches</li>}
              {results.map((r, i) => (
                <li key={r.label + r.hint}>
                  <button onMouseEnter={() => setSel(i)} onClick={() => go(r)} className={cn("flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left transition-colors", i === sel ? "bg-accent text-[#08080b]" : "text-fg")}>
                    <span className="truncate">{r.label}</span>
                    <span className={cn("shrink-0 font-mono text-[0.68rem] uppercase tracking-widest", i === sel ? "text-[#08080b]/70" : "text-faint")}>{r.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-3 font-mono text-[0.68rem] uppercase tracking-widest text-faint">↑↓ navigate · Enter open · Esc close</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
