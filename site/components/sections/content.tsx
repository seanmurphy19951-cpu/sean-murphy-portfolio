"use client";
/* eslint-disable @next/next/no-img-element */
import { CountUp, Reveal, SectionHead, TiltCard } from "@/components/ui/primitives";
import { CTV, GROWTH, InfoCards, PageFooter, PageHero, Panel, Slot, VIDEOS, VideoSlot } from "./media-shared";

// TODO(Sean): drop real shoot photos into public/media/shoots and swap the Slot placeholders.
const SHOOTS = ["Product hero set", "Lifestyle on location", "Studio detail shots", "Behind the scenes"];
const FLOWS = [
  { k: "Welcome", t: "Welcome series", d: "Introduces the brand, sets expectations and earns the first purchase with a clear next step." },
  { k: "Browse & cart", t: "Abandonment flows", d: "Browse, cart and checkout reminders timed to intent, with product-aware content." },
  { k: "Post-purchase", t: "Onboarding and cross-sell", d: "Setup help, review requests and the next logical product, so a first order becomes a second." },
  { k: "Winback", t: "Lapsed customer winback", d: "Segmented by value and recency, with an offer only where it is needed." },
  { k: "Campaigns", t: "Promotional calendar", d: "Seasonal and product launches built to match paid and social creative." },
  { k: "Lists", t: "Segmentation and testing", d: "Engagement and purchase segments, plus a steady cadence of subject, send-time and content tests." },
];
const MORE = [
  { t: "Social and creator content", d: "Short-form video and creator-style clips planned around what is working in paid and organic." },
  { t: "Landing and product pages", d: "Page copy and imagery built to convert, tied to the campaign that sends the traffic." },
  { t: "Creative testing framework", d: "A simple loop: hypothesis, variants, a clear read, and the winner feeding the next batch." },
];

export function Content() {
  return (
    <main>
      <PageHero eyebrow="Content" lines={["Creative", "that sells."]}
        intro="Photo shoots, ads and email, built to be tested and tied to results."
        links={[["#shoots", "Photo shoots"], ["#ads", "Ad creative"], ["#email", "Email & lifecycle"]]} />

      <Panel id="shoots">
        <SectionHead eyebrow="Photo shoots" title={<>One shoot,<br />months of content.</>}>Briefs and shot lists built so a single shoot feeds ads, email, product pages and social.</SectionHead>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {SHOOTS.map((s, i) => <Reveal key={s} delay={i * 0.06}><Slot label={s} ratio="aspect-[4/5]" /></Reveal>)}
        </div>
      </Panel>

      <Panel id="ads" alt>
        <SectionHead eyebrow="Ad creative" title={<>Ads and films<br />behind the numbers.</>}>Produced with agencies and in-house teams I managed. The &ldquo;You In&rdquo; film is the creative behind the CTV campaign below.</SectionHead>
        <div className="grid gap-4 md:grid-cols-3">
          {[["/media/ads/black-friday-promo.webp", "Black Friday promo, 1:1 paid social"], ["/media/ads/product-launch.webp", "Product launch, 1:1 social"], ["/media/ads/person-feature.webp", "Lifestyle feature, 1:1 social"]].map(([src, cap], i) => (
            <Reveal key={src} delay={i * 0.07}>
              <TiltCard><img src={src} alt={cap} loading="lazy" className="aspect-square w-full object-cover" /></TiltCard>
              <p className="mt-3 text-sm text-muted">{cap}</p>
            </Reveal>
          ))}
        </div>
        <h3 className="mb-6 mt-20 font-mono text-xs uppercase tracking-[0.18em] text-accent">Films</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map(([v, f], i) => <Reveal key={f} delay={(i % 3) * 0.06}><VideoSlot label={v} file={f} /></Reveal>)}
        </div>
      </Panel>

      <Panel id="email">
        <SectionHead eyebrow="Email & lifecycle" title={<>Email that<br />matches the ads.</>}>Campaign and lifecycle email built to match paid and social creative, so customers see one brand from ad to inbox.</SectionHead>
        <InfoCards items={FLOWS} />
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {[["/media/emails/independence-day.webp", "Independence Day campaign email (scroll to view)"], ["/media/emails/email-02.webp", "Full-length campaign email (scroll to view)"]].map(([src, cap]) => (
            <Reveal key={src}>
              <div data-lenis-prevent className="max-h-[34rem] overflow-y-auto rounded-2xl border border-line bg-white"><img src={src} alt={cap} loading="lazy" className="w-full" /></div>
              <p className="mt-3 text-sm text-muted">{cap}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-24 grid items-center gap-10 md:grid-cols-2">
          <Reveal><h3 className="font-display text-4xl font-light tracking-tight md:text-5xl">Show the problem, then show it moving.</h3><p className="mt-4 text-lg text-muted">Educational content that earns trust: a single annotated frame flags the swing fault, and the clip shows it live. Same insight, two formats, built for different placements.</p></Reveal>
          <Reveal delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-2">
              <figure><img src="/media/lack-of-knee-flex.jpg" alt="Annotated swing analysis still: lack of knee flex" loading="lazy" className="aspect-video w-full rounded-2xl object-cover" /><figcaption className="mt-3 text-sm text-muted">The still: one frame, fault annotated</figcaption></figure>
              <VideoSlot label="The motion: same fault, shown live" file="lack-of-knee-flex" />
            </div>
          </Reveal>
        </div>
      </Panel>

      <Panel id="more" alt>
        <SectionHead eyebrow="And the rest" title={<>The rest of<br />the brand work.</>}>Social, landing pages and creative testing.</SectionHead>
        <InfoCards items={MORE} />
      </Panel>

      <Panel id="growth">
        <SectionHead eyebrow="YoY growth" title={<>Where the growth<br />came from.</>}>June 2025 to June 2026 versus the prior twelve months, from Google Analytics, ad-platform exports and monthly performance reporting.</SectionHead>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GROWTH.map(([v, l, d], i) => (
            <Reveal key={l} delay={(i % 3) * 0.06}>
              <TiltCard className="h-full">
                <div className="p-8">
                  <div className="font-display text-7xl font-light tracking-[-0.045em] text-accent"><CountUp value={v} /></div>
                  <div className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">{l}</div>
                  <p className="mt-4 text-muted">{d}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-16 rounded-3xl border border-line bg-surface p-8 md:p-12">
            <h3 className="font-display text-3xl font-light tracking-tight md:text-4xl">CTV: awareness that converts</h3>
            <p className="mt-3 max-w-2xl text-muted">A connected-TV flight (January to May 2026) built on the &ldquo;You In&rdquo; film, planned and reported with the media agency I managed.</p>
            <ul className="mt-8 flex flex-wrap gap-x-14 gap-y-6">
              {CTV.map(([v, l]) => <li key={l}><div className="font-display text-6xl font-light tracking-[-0.04em] text-accent"><CountUp value={v} /></div><div className="mt-1 font-mono text-[0.68rem] uppercase tracking-widest text-faint">{l}</div></li>)}
            </ul>
          </div>
        </Reveal>
      </Panel>

      <PageFooter href="/work" title="Work" blurb="Every case study, with the problem, approach and result." />
    </main>
  );
}
