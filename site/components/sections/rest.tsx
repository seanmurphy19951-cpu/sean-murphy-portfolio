"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Reveal, ScrollCount, SectionHead, Tag, TiltCard } from "@/components/ui/primitives";
import { profile, ROLE_INTRO, ROLE_STATS } from "@/lib/data";

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const h = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), { stiffness: 90, damping: 24 });
  return (
    <section id="experience" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHead eyebrow="03 · Experience" title={<>Six years, five seats,<br />one through-line.</>}>
        Each role is a seat where strategy has to become something live.
      </SectionHead>
      <div ref={ref} className="relative">
        <div aria-hidden className="absolute bottom-0 left-[11px] top-2 w-px bg-line md:left-[15px]">
          <motion.div style={{ height: h }} className="w-px bg-gradient-to-b from-accent via-accent to-violet shadow-[0_0_18px_rgb(198_255_61/0.7)]" />
        </div>
        <ol className="space-y-20">
          {profile.experience.map((j) => {
            const stats = ROLE_STATS[j.id] ?? [];
            return (
              <li key={j.id} id={`role-${j.id}`} className="relative pl-10 md:pl-16">
                <span aria-hidden className="absolute left-0 top-2 grid h-6 w-6 place-items-center rounded-full border border-accent bg-bg md:h-8 md:w-8"><span className="h-2 w-2 rounded-full bg-accent" /></span>
                <Reveal>
                  <p className="font-mono text-sm text-accent">{j.start} – {j.end}</p>
                  <h3 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] md:text-6xl">{j.company}</h3>
                  <p className="mt-2 text-lg text-muted">{j.title} · {j.location}{j.note ? ` · ${j.note}` : ""}</p>
                  <p className="mt-4 max-w-2xl text-fg/80">{ROLE_INTRO[j.id]}</p>
                  {stats.length > 0 && (
                    <ul className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
                      {stats.map(([v, l]) => (
                        <li key={l}><div className="font-display text-5xl font-bold tracking-[-0.04em] text-accent"><ScrollCount value={v} /></div><div className="mt-1 font-mono text-[0.68rem] uppercase tracking-widest text-faint">{l}</div></li>
                      ))}
                    </ul>
                  )}
                  <ul className="mt-8 max-w-3xl space-y-3 text-muted">
                    {j.bullets.map((b) => <li key={b} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70">{b}</li>)}
                  </ul>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="mt-24 grid gap-4 border-t border-line pt-10 md:grid-cols-[10rem_1fr]">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Education</h3>
        <ul>{profile.education.map((d) => <li key={d.degree}><strong className="font-display text-2xl">{d.degree}</strong><p className="text-muted">{d.school} · {d.location} · {d.date}</p></li>)}</ul>
      </div>
    </section>
  );
}

export function Recognition() {
  return (
    <section id="recognition" className="border-y border-white/10 bg-bg2 px-6 py-28 md:px-12 md:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow="04 · Recognition" title={<>Proof from outside<br />the building.</>} />
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <TiltCard className="h-full">
              <div className="p-10">
                <span className="font-display text-8xl font-bold tracking-[-0.05em] text-accent">2026</span>
                <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight">Editor&apos;s Choice Award</h3>
                {/* TODO(Sean): publication name + link. */}
                <p className="mt-4 text-muted">An industry editorial team selected one of Uneekor&apos;s products as a 2026 Editor&apos;s Choice winner, the result of ongoing trade-press relationships maintained alongside paid and creator programs.</p>
              </div>
            </TiltCard>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid h-full place-items-center rounded-3xl border border-dashed border-line p-10 text-center">
              <p className="max-w-xs font-mono text-xs uppercase tracking-[0.15em] text-faint">Recommendations coming soon</p>
              {/* QUOTES: replace with a card stack once Sean provides recommendations. */}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
      <SectionHead eyebrow="05 · Skills & tools" title={<>The stack I<br />actually use.</>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(profile.tools_verified).map(([k, v], i) => (
          <Reveal key={k} delay={(i % 3) * 0.06}>
            <div className="h-full rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-accent/40">
              <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-accent">{k}</h3>
              <div className="flex flex-wrap gap-2">{v.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div><h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-accent">Core skills</h3><div className="flex flex-wrap gap-2">{profile.skills_technical.map((t) => <Tag key={t}>{t}</Tag>)}</div></div>
        <div><h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-accent">Working style</h3><div className="flex flex-wrap gap-2">{profile.skills_soft.map((t) => <Tag key={t}>{t}</Tag>)}</div></div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <footer id="contact" className="noise relative overflow-hidden border-t border-white/10 px-6 pb-10 pt-28 md:px-12 md:pt-40">
      <div aria-hidden className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal><p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-accent">06 · Contact</p></Reveal>
        <Reveal delay={0.05}>
          <a href={`mailto:${profile.email}`} className="group block font-display text-[clamp(2.6rem,9vw,8rem)] font-bold leading-[0.95] tracking-[-0.045em]">
            <span className="text-gradient">Let&apos;s build</span><br /><span className="text-gradient">something</span> <span className="text-accent transition-all duration-500 group-hover:tracking-normal">live.</span>
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {[["Email", profile.email, `mailto:${profile.email}`], ["LinkedIn", "linkedin.com/in/seanmurphy19951", profile.linkedin], ["Location", profile.location, ""]].map(([k, v, href]) => (
              <li key={k} className="bg-bg p-6">
                <span className="font-mono text-[0.68rem] uppercase tracking-widest text-faint">{k}</span>
                {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="mt-2 block break-words text-fg underline-offset-4 hover:text-accent hover:underline">{v}</a> : <p className="mt-2">{v}</p>}
              </li>
            ))}
          </ul>
        </Reveal>
        <p className="mt-16 text-center font-mono text-xs text-faint">© 2026 Sean Murphy · Built with Next.js</p>
      </div>
    </footer>
  );
}
