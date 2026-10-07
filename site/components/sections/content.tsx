"use client";
/* eslint-disable @next/next/no-img-element */
import { CountUp, Reveal, SectionHead, TiltCard } from "@/components/ui/primitives";
import { Pager } from "@/components/pager";
import { CTV, GROWTH, InfoCards, PageHero, Panel, Slot, VIDEOS, VideoSlot } from "./media-shared";

// TODO(Sean): drop real shoot photos into public/media/shoots and swap the Slot placeholders.
const SHOOTS = ["Product hero set", "Lifestyle on location", "Studio detail shots", "Behind the scenes"];
const SEO_STATS = [
  ["+10", "first-page keywords", "Added on top of existing rankings after rewriting every page and product on a Shopify store; sales rose over 40% that year."],
  ["+35%", "click-through rate", "From SEO, paid search and on-site incentives guiding merchandising, with CPA down by more than $3."],
  ["50+", "businesses supported", "SEO, paid search and Google services for small ecommerce clients, lifting revenue by at least 30%."],
];
const SEO_WORK = [
  { k: "Research", t: "Keyword and topic research", d: "Semrush and Ahrefs data grouped into the topics, questions and product terms worth writing for, and ranked by how close they sit to a sale.", tags: ["Semrush", "Ahrefs"] },
  { k: "On-page", t: "Page and product copy", d: "Titles, descriptions, headings and body copy written for every page and product, so each one targets a clear search term.", tags: ["Copywriting", "Shopify"] },
  { k: "Technical", t: "Site health and speed", d: "Crawl audits, structured data and Core Web Vitals fixes, including faster pages from properly sized images.", tags: ["Screaming Frog", "Structured data", "Core Web Vitals"] },
  { k: "Tracking", t: "Search Console and Analytics", d: "Analytics, Merchant Center and Search Console connected from the start, so rankings, clicks and sales are read in one place.", tags: ["GA4", "Search Console", "Merchant Center"] },
  { k: "Content", t: "Blog and topic targeting", d: "Keyword research feeds an AI-assisted content queue, so articles and visuals are made for terms people actually search.", tags: ["Blog", "AI workflow"] },
  { k: "Next", t: "AI search (GEO)", d: "Writing and structuring pages so they are quoted by AI answers as well as ranked in classic results.", tags: ["GEO"] },
];
const FLOWS = [
  { k: "Welcome", t: "Welcome series", d: "Introduces the brand, sets expectations and earns the first purchase with a clear next step." },
  { k: "Browse & cart", t: "Abandonment flows", d: "Browse, cart and checkout reminders timed to intent, with product-aware content." },
  { k: "Post-purchase", t: "Onboarding and cross-sell", d: "Setup help, review requests and the next logical product, so a first order becomes a second." },
  { k: "Winback", t: "Lapsed customer winback", d: "Segmented by value and recency, with an offer only where it is needed." },
  { k: "Campaigns", t: "Promotional calendar", d: "Seasonal and product launches built to match paid and social creative." },
  { k: "Lists", t: "Segmentation and testing", d: "Engagement and purchase segments, plus a steady cadence of subject, send-time and content tests." },
];
const MORE = [
  { k: "Video", t: "Brand and product films", d: "A brand commercial, the 30-second brand film, product films and a website walkthrough, briefed and managed with agencies and in-house teams.", tags: ["Brand film", "Product film"] },
  { k: "Video", t: "Educational and AI video", d: "Annotated swing-analysis clips, AI-produced software walkthroughs and AI-generated product and lifestyle video.", tags: ["Explainers", "AI video"] },
  { k: "Photography", t: "Photo shoots and AI imagery", d: "Product and lifestyle shoots briefed from a shot list, plus AI lifestyle scenes built from basic product renders.", tags: ["Shoots", "AI imagery"] },
  { k: "Paid", t: "Paid social and search creative", d: "Static, short-form video and ad copy for paid social, search, Performance Max and connected TV, built to be tested.", tags: ["Meta", "Google", "CTV"] },
  { k: "Email", t: "Campaigns and lifecycle", d: "Promotional emails, welcome, cart and winback flows, and tailored mailers by customer type and purchase pattern.", tags: ["Klaviyo", "Lifecycle"] },
  { k: "Search", t: "SEO copy and blog topics", d: "Page and product copy for every page of a store, keyword-led blog targeting and structured data.", tags: ["SEO", "Blog"] },
  { k: "Social", t: "Organic social and creators", d: "Short-form video and creator-style clips planned around what works, with influencer and creator programmes alongside.", tags: ["Social", "Creators"] },
  { k: "Web", t: "Landing, product and store pages", d: "Page copy, imagery, bundles, cross-sells and limited-time deals tied to the campaign that sends the traffic.", tags: ["CRO", "Shopify"] },
  { k: "Marketplaces", t: "Amazon and catalog listings", d: "Listing content, product photography and catalog structure for Amazon and on-site merchandising.", tags: ["Amazon", "Catalog"] },
  { k: "Promotions", t: "Seasonal and promo calendars", d: "Cyber, holiday and product-launch promotions planned so paid, email and social tell one story.", tags: ["Promos", "Planning"] },
  { k: "B2B", t: "Reseller and partner content", d: "Materials and forms behind the reseller programme, plus event and trade-show collateral.", tags: ["Reseller", "Events"] },
  { k: "Testing", t: "Creative testing", d: "A simple loop: hypothesis, variants, a clear read, and the winner feeding the next batch.", tags: ["A/B tests"] },
];

export function Content() {
  return (
    <main>
      <PageHero eyebrow="Content" lines={["Creative", "that sells."]}
        intro="Ads, email, search and photography, built to be tested and tied to results."
        links={[["#ads", "Ad creative"], ["#email", "Email & lifecycle"], ["#seo", "SEO"]]} />

      <Panel id="ads">
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

      <Panel id="email" alt>
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
      </Panel>

      <Panel id="seo">
        <SectionHead eyebrow="SEO" title={<>Found by people<br />who are searching.</>}>Search work across several stores and brands: the keyword research, the writing, the technical set-up and the tracking that ties it to sales.</SectionHead>
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {SEO_STATS.map(([v, l, d], i) => (
            <Reveal key={l} delay={i * 0.06}>
              <TiltCard className="h-full"><div className="p-8">
                <div className="font-display text-6xl font-light tracking-[-0.045em] text-accent"><CountUp value={v} /></div>
                <div className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-faint">{l}</div>
                <p className="mt-4 text-muted">{d}</p>
              </div></TiltCard>
            </Reveal>
          ))}
        </div>
        <InfoCards items={SEO_WORK} />
      </Panel>

      <Panel id="more" alt>
        <SectionHead eyebrow="And the rest" title={<>Every kind of<br />content, in one place.</>}>The full range of content I have planned, briefed, written or produced.</SectionHead>
        <InfoCards items={MORE} />
      </Panel>

      <Panel id="shoots">
        <SectionHead eyebrow="Photo shoots" title={<>One shoot,<br />months of content.</>}>Briefs and shot lists built so a single shoot feeds ads, email, product pages and social.</SectionHead>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {SHOOTS.map((s, i) => <Reveal key={s} delay={i * 0.06}><Slot label={s} ratio="aspect-[4/5]" /></Reveal>)}
        </div>
      </Panel>

      <Panel id="growth" alt>
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

      <Pager page="content" />
    </main>
  );
}
