"use client";
import { CountUp, Reveal, SectionHead, Swiper, Tag } from "@/components/ui/primitives";
import { profile, ROLE_INTRO, ROLE_STATS } from "@/lib/data";

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-24">
      <SectionHead eyebrow="Experience" title={<>Six years, one habit:<br />make it measurable.</>}>From the retail floor to a global brand, every role tied to numbers.</SectionHead>
      <Reveal>
        <Swiper label="Work experience" itemClass="w-[88vw] md:w-[38rem]">
          {profile.experience.map((j) => {
            const stats = ROLE_STATS[j.id] ?? [];
            return (
              <article key={j.id} id={`role-${j.id}`} className="h-full rounded-[2rem] border border-line bg-surface p-8 md:p-10">
                <p className="font-mono text-sm text-accent">{j.start} – {j.end}</p>
                <h3 className="mt-3 font-display text-4xl font-light tracking-[-0.03em] md:text-5xl">{j.company}</h3>
                <p className="mt-2 text-muted">{j.title} · {j.location}{j.note ? ` · ${j.note}` : ""}</p>
                <p className="mt-4 text-fg/80">{ROLE_INTRO[j.id]}</p>
                {stats.length > 0 && (
                  <ul className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-line py-6">
                    {stats.map(([v, l]) => (
                      <li key={l}><div className="font-display text-4xl font-light tracking-[-0.04em] text-accent"><CountUp value={v} /></div><div className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-faint">{l}</div></li>
                    ))}
                  </ul>
                )}
                <ul className="mt-6 space-y-3 text-muted">
                  {j.bullets.map((b) => <li key={b} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent/70">{b}</li>)}
                </ul>
              </article>
            );
          })}
        </Swiper>
      </Reveal>
      <div className="mt-14 grid gap-4 border-t border-line pt-8 md:grid-cols-[10rem_1fr]">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Education</h3>
        <ul>{profile.education.map((d) => <li key={d.degree}><strong className="font-display text-2xl">{d.degree}</strong><p className="text-muted">{d.school} · {d.location} · {d.date}</p></li>)}</ul>
      </div>
    </section>
  );
}

export function Recognition() {
  return (
    <section id="recognition" className="border-y border-white/10 bg-bg2 px-6 py-14 md:px-12 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:gap-14">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-accent">Recognition</p>
          <span className="font-display text-7xl font-light tracking-[-0.05em] text-accent md:text-8xl">2026</span>
        </div>
        <div className="max-w-2xl">
          {/* TODO(Sean): publication name + link; add recommendation quotes as more cards here. */}
          <h3 className="font-display text-3xl font-light tracking-tight">Editor&apos;s Choice Award</h3>
          <p className="mt-3 text-muted">An industry editorial team selected one of Uneekor&apos;s products as a 2026 Editor&apos;s Choice winner, the result of ongoing trade-press relationships maintained alongside paid and creator programs.</p>
        </div>
      </div>
    </section>
  );
}

export function Skills() {
  const card = "h-full rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/40";
  const head = "mb-3 font-mono text-xs uppercase tracking-[0.15em] text-accent";
  return (
    <section id="skills" className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-24">
      <SectionHead eyebrow="Skills & tools" title={<>What I<br />work with.</>}>The platforms and methods I use day to day.</SectionHead>
      <Reveal>
        <Swiper label="Skills and tools" itemClass="w-[78vw] md:w-72">
          {[
            ...Object.entries(profile.tools_verified).map(([k, v]) => <div key={k} className={card}><h3 className={head}>{k}</h3><div className="flex flex-wrap gap-1.5">{v.map((t) => <Tag key={t}>{t}</Tag>)}</div></div>),
            <div key="soft" className={card}><h3 className={head}>Working style</h3><div className="flex flex-wrap gap-1.5">{profile.skills_soft.map((t) => <Tag key={t}>{t}</Tag>)}</div></div>,
          ]}
        </Swiper>
      </Reveal>
    </section>
  );
}

export function Contact() {
  return (
    <footer id="contact" className="noise relative overflow-hidden border-t border-white/10 px-6 pb-10 pt-28 md:px-12 md:pt-40">
      <div aria-hidden className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal><p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-accent">Contact</p></Reveal>
        <Reveal delay={0.05}>
          <a href={`mailto:${profile.email}`} className="group block font-display text-[clamp(2.6rem,9vw,8rem)] font-light leading-[0.95] tracking-[-0.045em]">
            <span className="text-gradient">Let&apos;s talk</span><br /><span className="text-gradient">about your</span> <span className="text-accent transition-all duration-500 group-hover:tracking-normal">next move.</span>
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
      </div>
    </footer>
  );
}
