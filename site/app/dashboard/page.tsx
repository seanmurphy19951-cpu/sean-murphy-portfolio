import type { Metadata } from "next";
import { SiteNav } from "@/components/shell";

export const metadata: Metadata = {
  title: "Dashboard · Sean Murphy",
  description: "An AI-built reporting dashboard.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <SiteNav variant="dash" />
      <main className="flex h-svh flex-col pt-16">
        <div className="flex items-center justify-between border-b border-line px-4 py-2 md:px-8">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint">AI-built reporting dashboard</p>
          <a href="https://reportingdashboard.vercel.app/" target="_blank" rel="noopener" className="text-sm text-muted transition-colors hover:text-accent">Open in new tab ↗</a>
        </div>
        <iframe src="https://reportingdashboard.vercel.app/" title="AI-built reporting dashboard" className="w-full flex-1 border-0 bg-white" loading="lazy" />
      </main>
    </>
  );
}
