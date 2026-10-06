"use client";
/* eslint-disable @next/next/no-img-element */
import { Reveal, SectionHead, TiltCard } from "@/components/ui/primitives";
import { Gallery, InfoCards, PageFooter, PageHero, Panel, ParallaxWall, STEPS, TiltedWall } from "./media-shared";

// TODO(Sean): confirm each automation and swap in real hours saved / counts where you have them.
const AUTOMATIONS = [
  { k: "Reporting", t: "Always-on performance reporting", d: "Ad platforms, Shopify and web analytics are pulled into one place on a schedule, so the weekly review starts from the numbers instead of from exports.", tags: ["Google Ads", "Meta", "Shopify", "GA4"] },
  { k: "Research", t: "Keyword and topic research", d: "Search data is clustered into the topics and scenes worth producing, then fed straight into the content and creative queue.", tags: ["SEO", "Briefs"] },
  { k: "Creative", t: "Image and video production line", d: "Basic renders become lifestyle scenes, people and short video, sized and named for each placement automatically.", tags: ["Image gen", "Video gen"] },
  { k: "Lifecycle", t: "Email build and QA helpers", d: "Drafts, subject-line variants and link and rendering checks are handled in a repeatable pass before anything is scheduled.", tags: ["Klaviyo", "QA"] },
  { k: "Operations", t: "Alerts and anomaly flags", d: "Spend spikes, tracking gaps and stock-outs that affect ads surface as flags rather than as end-of-month surprises.", tags: ["Alerts"] },
  { k: "Personal", t: "Job-search automation", d: "Discovers roles, screens and scores them, and drafts a tailored resume and cover letter per posting, with a human approving every submit.", tags: ["Agents", "Python"] },
];
const BUILDS = [
  { k: "Dashboard", t: "AI-built reporting dashboard", d: "A multi-channel dashboard with date ranges, period comparison, goals, promo overlays and automatic insights. Built and iterated with AI end to end.", tags: ["Next.js", "Charts"] },
  { k: "This site", t: "The portfolio you are on", d: "Designed, written and shipped with an AI coding agent: components, motion, data, deploys.", tags: ["Next.js", "Vercel"] },
  { k: "Tooling", t: "Small scripts and internal tools", d: "Bulk edits, naming and resizing, feed checks, data clean-ups: the small jobs that used to eat afternoons.", tags: ["CLI", "Python"] },
];
const STACK = [
  { k: "MCP", t: "Connected tools", d: "AI connected directly to the marketing stack through MCP servers, so it can read campaign, store and email data instead of working from pasted screenshots.", tags: ["Klaviyo", "Shopify", "Semrush"] },
  { k: "CLI", t: "Command line workflows", d: "Repeatable commands for builds, deploys, data pulls and file handling, run by me or by an agent with me approving the risky steps.", tags: ["Git", "Vercel", "Node"] },
  { k: "Data", t: "Source connections", d: "Ad platforms, storefront and analytics joined on one date and channel model, so numbers from different tools finally agree.", tags: ["APIs", "Exports", "Sheets"] },
];
const PRINCIPLES = [
  { t: "A human approves what goes out", d: "AI drafts and prepares; a person signs off anything customer-facing, spend-affecting or irreversible." },
  { t: "Repeatable beats clever", d: "If it can't be run again next week by someone else, it isn't done." },
  { t: "Measure the output", d: "Every automation is tied to a number: time saved, cost per asset, speed to launch, or revenue it supported." },
];

export function Ai() {
  return (
    <main>
      <PageHero eyebrow="AI & automation" lines={["AI in production,", "not in theory."]}
        intro="Automations, connected data, AI-built tools and AI-produced imagery that I use in the daily work of marketing. What I have set up, and what comes off the line."
        links={[["#automations", "See the automations"], ["#imagery", "AI imagery"], ["/dashboard", "AI-built dashboard ↗"]]} />

      <Panel id="automations">
        <SectionHead eyebrow="Automations" title={<>Work that runs<br />without me.</>}>The recurring jobs I have automated, so time goes to decisions instead of exports and formatting.</SectionHead>
        <InfoCards items={AUTOMATIONS} />
      </Panel>

      <Panel id="builds" alt>
        <SectionHead eyebrow="Built with AI" title={<>Tools I made,<br />not bought.</>}>Dashboards and tools created through AI, each solving a real reporting or workflow gap.</SectionHead>
        <InfoCards items={BUILDS} />
        <Reveal><a href="/dashboard" className="mt-8 inline-block rounded-full border border-white/15 px-7 py-3.5 text-sm transition hover:border-accent hover:text-accent">Open the dashboard ↗</a></Reveal>
      </Panel>

      <Panel id="stack">
        <SectionHead eyebrow="The connected stack" title={<>MCP, CLI and<br />live data.</>}>How AI plugs into the tools marketing already runs on.</SectionHead>
        <InfoCards items={STACK} />
      </Panel>

      <Panel id="pipeline" alt>
        <SectionHead eyebrow="The workflow" title={<>An AI production line,<br />step by step.</>}>A repeatable process that has been in service for months and applies to any product line.</SectionHead>
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t}>
              <Reveal delay={i * 0.07} className="h-full">
                <div className="h-full rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-accent/50">
                  <span className="font-display text-6xl font-light tracking-[-0.05em] text-accent/80">{i + 1}</span>
                  <h3 className="mt-4 font-display text-2xl font-light tracking-tight">{t}</h3>
                  <p className="mt-3 text-muted">{d}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel id="imagery">
        <SectionHead eyebrow="AI imagery" title={<>Unlimited content,<br />zero photoshoots.</>}>Every image here was generated with AI from basic product renders and room references: staged homes, bars and hotels that would each have cost a location scout, a crew and a shoot day.</SectionHead>
        <ParallaxWall />
        <TiltedWall />
        <h3 className="mb-6 mt-4 font-mono text-xs uppercase tracking-[0.18em] text-accent">Browse the full set</h3>
        <Gallery />
        <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <h3 className="font-display text-4xl font-light tracking-tight md:text-5xl">It doesn&apos;t stop at stills.</h3>
            <p className="mt-4 text-lg text-muted">The same pipeline produces motion. This clip was AI-generated end to end, showing product-in-motion and creator-style content without a crew.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <TiltCard><img src="/media/ai-generated-clip.gif" alt="AI-generated video clip, looping" loading="lazy" className="w-full" /></TiltCard>
            <p className="mt-3 text-sm text-muted">AI-generated clip, no cameras involved (auto-looping)</p>
          </Reveal>
        </div>
      </Panel>

      <Panel id="principles" alt>
        <SectionHead eyebrow="How I work with AI" title={<>Fast, but<br />in control.</>} />
        <InfoCards items={PRINCIPLES} />
      </Panel>

      <PageFooter href="/content" title="Content" blurb="Photo shoots, ad creative, email and lifecycle." />
    </main>
  );
}
