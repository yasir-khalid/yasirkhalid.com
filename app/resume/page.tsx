import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import { liveLab } from "@/lib/lab";
import { BuildCard, Bullets } from "@/components/ProfileBlocks";
import {
  profile,
  trustMarks,
  pillars,
  capabilities,
  experience,
  projects,
  metrics,
  speaking,
  skills,
  certifications,
  languages,
  education,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Resume - Yasir Khalid",
  description:
    "Full resume for Yasir Khalid - experience, projects, skills, education, and certifications.",
};

export default function ResumePage() {
  return (
    <main id="top">
      <Nav />

      {/* ===================================================== Header (dark band) */}
      <section className="bg-[var(--canvas-dark)]">
        <div className="mx-auto w-full max-w-[1040px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <p className="mono-label text-[var(--on-dark-mute)]">full resume</p>
            <h1 className="display mt-6 max-w-[20ch] text-[clamp(1.9rem,4.5vw,3.2rem)] text-white">
              {profile.name}
            </h1>
            <p className="mt-4 max-w-[54ch] text-[16px] leading-[1.55] text-[var(--on-dark-mute)]">
              {profile.current} · {profile.location}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-8">
              <Link href="/" className="btn btn-outline-dark">
                ← Back to homepage
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================ Pillars (white catalogue) */}
      <section className="border-b border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1040px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">in short</p>
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className="border-t border-[var(--hairline-light)] pt-6">
                  <p className="mono-label text-[var(--stone-text)]">{p.label}</p>
                  <h3 className="heading mt-4 text-[21px] text-[var(--ink)]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.5] text-[var(--mute)]">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================== Trust strip */}
      <section className="border-b border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1040px] px-5 py-14 text-center sm:px-8">
          <Reveal>
            <p className="mono-label text-[var(--stone-text)]">Built &amp; shipped with</p>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {trustMarks.map((m) => (
                <span
                  key={m}
                  className="display text-[20px] text-[var(--ink)] opacity-50 sm:text-[24px]"
                >
                  {m}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ====================================== Agentic AI proof (dark band) */}
      <section className="bg-[var(--canvas-dark)] text-white">
        <div className="mx-auto max-w-[1040px] px-5 py-24 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--on-dark-mute)]">agentic AI, specifically</p>
            <h2 className="heading mt-6 max-w-[20ch] text-[clamp(1.6rem,3.6vw,2.5rem)] text-white">
              The parts that decide whether agents work in production.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div className="border-t border-[var(--hairline-dark)] pt-6">
                  <h3 className="heading text-[20px] text-white">{c.label}</h3>
                  <p className="mt-3 text-[15px] leading-[1.5] text-[var(--on-dark-mute)]">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ Experience (table) */}
      <section className="border-b border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1040px] px-5 py-24 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">experience</p>
            <h2 className="heading mt-6 text-[clamp(1.6rem,3.6vw,2.5rem)] text-[var(--ink)]">
              Where I&apos;ve shipped.
            </h2>
          </Reveal>

          <div className="mt-14 border-t border-[var(--hairline-light)]">
            {experience.map((job, i) => (
              <Reveal key={job.company + job.period} delay={i * 40}>
                <article className="grid gap-4 border-b border-[var(--hairline-light)] py-9 md:grid-cols-[0.85fr_2fr_auto] md:gap-10">
                  <div>
                    <h3 className="heading text-[24px] text-[var(--ink)]">
                      {job.company}
                    </h3>
                    <p className="mt-1 text-[14px] text-[var(--mute)]">
                      {job.role}
                    </p>
                  </div>
                  <div>
                    <Bullets points={job.points} />
                    <div className="mt-5 flex flex-wrap gap-2">
                      {job.tags.map((t) => (
                        <span key={t} className="tag-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:text-right">
                    <span className="mono-label text-[var(--stone-text)]">
                      {job.period}
                    </span>
                    <p className="mt-1 text-[13px] text-[var(--stone-text)]">
                      {job.location}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================== Builds (dark showcase) */}
      <section id="projects" className="bg-[var(--canvas-dark)]">
        <div className="mx-auto max-w-[1040px] px-5 py-24 sm:px-8 md:py-28">
          <Reveal>
            <p className="mono-label text-[var(--on-dark-mute)]">builds</p>
            <h2 className="heading mt-6 max-w-[22ch] text-[clamp(1.6rem,3.6vw,2.5rem)] text-white">
              Things I build and own, end to end.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.6] text-white/50">
              Each one started with a real problem. Each one is still running.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <BuildCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================== Simulation lab (feature link) */}
      <section className="border-b border-[var(--hairline-light)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-[1040px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">interactive</p>
            <Link
              href="/lab"
              className="group mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5"
            >
              <h2 className="display max-w-[15ch] text-[clamp(1.9rem,4.5vw,3.2rem)] text-[var(--ink)]">
                Step inside the simulation lab
                <span className="ml-3 inline-block text-[var(--primary)] transition-transform group-hover:translate-x-2">
                  →
                </span>
              </h2>
              <span className="btn btn-primary">Open the lab</span>
            </Link>
            <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.55] text-[var(--mute)]">
              Visual, hands-on explainers - bloom filters, hashing, load
              balancing, caching, big-O and more. Drag a slider, send a request,
              watch the idea click into place.
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {liveLab.map((e) => (
              <Link
                key={e.slug}
                href={`/lab/${e.slug}`}
                className="pill-outline bg-white transition-colors hover:border-[var(--ink)]"
              >
                {e.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================== Metrics (dark band) */}
      <section className="bg-[var(--canvas-dark)] text-white">
        <div className="mx-auto max-w-[1040px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--on-dark-mute)]">impact</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-12 lg:grid-cols-4">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 60}>
                <div className="border-t border-[var(--hairline-dark)] pt-5">
                  <div className="display text-[clamp(1.7rem,3vw,2.4rem)] text-white">
                    {m.value}
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-[var(--on-dark-mute)]">
                    {m.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== Skills + sidebar */}
      <section className="border-b border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto grid max-w-[1040px] gap-16 px-5 py-24 sm:px-8 md:grid-cols-[1.7fr_1fr] md:py-24">
          <div>
            <Reveal>
              <p className="mono-label text-[var(--charcoal)]">toolkit</p>
              <h2 className="heading mt-6 text-[clamp(1.5rem,3.2vw,2.2rem)] text-[var(--ink)]">
                The stack I reach for.
              </h2>
            </Reveal>
            <div className="mt-12 flex flex-col gap-10">
              {skills.map((s, i) => (
                <Reveal key={s.group} delay={i * 50}>
                  <div className="border-t border-[var(--hairline-light)] pt-6">
                    <h3 className="mono-label text-[var(--mute)]">{s.group}</h3>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {s.items.map((it) => (
                        <span key={it} className="pill-outline">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Reveal>
              <div className="rounded-[12px] bg-[var(--surface-soft)] p-7">
                <h3 className="mono-label text-[var(--mute)]">speaking</h3>
                <p className="heading mt-5 text-[19px] leading-[1.2] text-[var(--ink)]">
                  {speaking.title}.
                </p>
                <p className="mt-2 text-[14px] text-[var(--mute)]">
                  {speaking.venue} · {speaking.when}
                </p>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="rounded-[12px] bg-[var(--surface-soft)] p-7">
                <h3 className="mono-label text-[var(--mute)]">education</h3>
                <div className="mt-5 flex flex-col gap-5">
                  {education.map((e) => (
                    <div key={e.school}>
                      <p className="text-[15px] font-medium text-[var(--ink)]">
                        {e.degree}
                      </p>
                      <p className="mt-0.5 text-[14px] text-[var(--mute)]">
                        {e.school}
                      </p>
                      <p className="mono-label mt-1 text-[12px] text-[var(--stone-text)]">
                        {e.period}
                        {e.result ? ` · ${e.result}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="card-light p-7">
                <h3 className="mono-label text-[var(--mute)]">certifications</h3>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {certifications.map((c) => (
                    <li
                      key={c}
                      className="text-[15px] leading-snug text-[var(--body)]"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="card-light p-7">
                <h3 className="mono-label text-[var(--mute)]">languages</h3>
                <div className="mt-5 flex flex-col gap-3">
                  {languages.map((l) => (
                    <div key={l.name} className="flex items-center justify-between">
                      <span className="text-[15px] text-[var(--ink)]">{l.name}</span>
                      <span className="text-[13px] text-[var(--stone-text)]">
                        {l.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================================================= Footer link back */}
      <section className="bg-[var(--canvas-dark)]">
        <div className="mx-auto max-w-[1040px] px-5 py-16 text-center sm:px-8">
          <Link href="/#contact" className="btn btn-primary">
            Get in touch →
          </Link>
        </div>
      </section>
    </main>
  );
}
