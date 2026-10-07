import Link from "next/link";
import { profile } from "@/lib/data";

const ORDER = [
  { key: "home", href: "/", title: "Home", blurb: "The overview" },
  { key: "ai", href: "/ai", title: "AI", blurb: "Automations and AI-built tools" },
  { key: "content", href: "/content", title: "Content", blurb: "Shoots, ads and email" },
  { key: "work", href: "/work", title: "Work", blurb: "Every case study" },
  { key: "dash", href: "/dashboard", title: "Dashboard", blurb: "The reporting dashboard" },
  { key: "okr", href: "/okr", title: "Example OKR", blurb: "A weekly OKR scorecard" },
] as const;

export type PageKey = (typeof ORDER)[number]["key"];

/** Shared page footer: previous page, contact in the middle, next page. */
export function Pager({ page }: { page: PageKey }) {
  const i = ORDER.findIndex((p) => p.key === page);
  const prev = ORDER[i - 1];
  const next = ORDER[i + 1];
  const side = "group flex flex-col gap-1 rounded-2xl border border-line bg-surface/60 p-5 transition-colors hover:border-accent/60";
  return (
    <nav aria-label="Next and previous pages" className="border-t border-white/10 px-6 py-14 md:px-12">
      <div className="mx-auto grid max-w-7xl items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
        {prev ? (
          <Link href={prev.href} className={side}>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-faint">← Previous</span>
            <span className="font-display text-2xl font-light tracking-tight transition-colors group-hover:text-accent">{prev.title}</span>
            <span className="text-sm text-muted">{prev.blurb}</span>
          </Link>
        ) : <span aria-hidden className="hidden md:block" />}

        <div className="flex flex-col items-center justify-center gap-3 px-2 py-2 text-center md:order-none">
          <a href={`mailto:${profile.email}`} className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-[#0a1224] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-8px_rgb(255_185_56/0.5)]">Get in touch</a>
          <a href={profile.linkedin} target="_blank" rel="noopener" className="font-mono text-xs text-muted underline-offset-4 hover:text-accent hover:underline">LinkedIn ↗</a>
        </div>

        {next ? (
          <Link href={next.href} className={`${side} md:items-end md:text-right`}>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-faint">Next →</span>
            <span className="font-display text-2xl font-light tracking-tight transition-colors group-hover:text-accent">{next.title}</span>
            <span className="text-sm text-muted">{next.blurb}</span>
          </Link>
        ) : (
          <Link href="/" className={`${side} md:items-end md:text-right`}>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-faint">Back to start ↑</span>
            <span className="font-display text-2xl font-light tracking-tight transition-colors group-hover:text-accent">Home</span>
            <span className="text-sm text-muted">The overview</span>
          </Link>
        )}
      </div>
      <p className="mt-10 text-center font-mono text-xs text-faint">© 2026 Sean Murphy</p>
    </nav>
  );
}
