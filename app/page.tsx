import Link from "next/link";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import { GitHubIcon, XIcon, LinkedInIcon, EmailIcon } from "@/components/icons";
import { liveLab } from "@/lib/lab";
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

function Bullets({ points, dark = false }: { points: string[]; dark?: boolean }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {points.map((p) => (
        <li
          key={p}
          className={`flex gap-3 text-[15px] leading-[1.5] ${
            dark ? "text-[var(--on-dark-mute)]" : "text-[var(--body)]"
          }`}
        >
          <span
            className={`mt-[9px] h-1 w-3 shrink-0 rounded-full ${
              dark ? "bg-white/40" : "bg-[var(--charcoal)]"
            }`}
            aria-hidden
          />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main id="top">
      <Nav />

      {/* ===================================================== Hero (dark band) */}
      <section className="bg-black">
        <div className="mx-auto max-w-[1040px] px-5 pb-20 pt-20 sm:px-8 sm:pt-28 md:pb-28">
          <Reveal>
            <h1 className="display max-w-[18ch] text-[clamp(2.1rem,5.2vw,3.9rem)] text-white">
              {profile.headline}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-7 max-w-[54ch] text-[16px] leading-[1.55] text-[var(--on-dark-mute)]">
              {profile.sub}
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#contact" className="btn btn-primary">
                Get in touch
              </a>
              <a href="#work" className="btn btn-outline-dark">
                Explore my work
              </a>
              <Link href="/lab" className="btn btn-outline-dark">
                Explore simulation lab →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================ Pillars (white catalogue) */}
      <section className="border-b border-[var(--hairline-light)] bg-white">
        <div className="mx-auto max-w-[1040px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">// in short</p>
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
      <section className="border-b border-[var(--hairline-light)] bg-white">
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
      <section className="bg-black text-white">
        <div className="mx-auto max-w-[1040px] px-5 py-24 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--on-dark-mute)]">// agentic AI, specifically</p>
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
      <section id="work" className="border-b border-[var(--hairline-light)] bg-white">
        <div className="mx-auto max-w-[1040px] px-5 py-24 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">// experience</p>
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

      {/* ============================================ Projects (feature cards) */}
      <section id="projects" className="border-b border-[var(--hairline-light)] bg-white">
        <div className="mx-auto max-w-[1040px] px-5 py-24 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">// building</p>
            <h2 className="heading mt-6 text-[clamp(1.6rem,3.6vw,2.5rem)] text-[var(--ink)]">
              Things I own end to end.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.name} delay={i * 70}>
                <article className="card-light flex h-full flex-col p-8">
                  <div className="flex items-center gap-3">
                    <h3 className="heading text-[28px] text-[var(--ink)]">
                      {p.name}
                    </h3>
                    {p.badge && <span className="badge-feature">{p.badge}</span>}
                  </div>
                  <p className="mt-2 text-[16px] text-[var(--body)]">{p.blurb}</p>
                  <div className="mt-5">
                    <Bullets points={p.points} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span key={s} className="tag-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                  {p.href && (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-text mt-7 w-fit"
                    >
                      {p.href.replace(/^https?:\/\/(www\.)?/, "")} →
                    </a>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================== Simulation lab (feature link) */}
      <section className="border-b border-[var(--hairline-light)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-[1040px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">// interactive</p>
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
              <span className="btn btn-cobalt">Open the lab</span>
            </Link>
            <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.55] text-[var(--mute)]">
              Visual, hands-on explainers — bloom filters, hashing, load
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
      <section className="bg-black text-white">
        <div className="mx-auto max-w-[1040px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--on-dark-mute)]">// impact</p>
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
      <section id="skills" className="border-b border-[var(--hairline-light)] bg-white">
        <div className="mx-auto grid max-w-[1040px] gap-16 px-5 py-24 sm:px-8 md:grid-cols-[1.7fr_1fr] md:py-24">
          <div>
            <Reveal>
              <p className="mono-label text-[var(--charcoal)]">// toolkit</p>
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
              <div className="rounded-[20px] bg-[var(--surface-soft)] p-7">
                <h3 className="mono-label text-[var(--mute)]">// speaking</h3>
                <p className="heading mt-5 text-[19px] leading-[1.2] text-[var(--ink)]">
                  {speaking.title}.
                </p>
                <p className="mt-2 text-[14px] text-[var(--mute)]">
                  {speaking.venue} · {speaking.when}
                </p>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="rounded-[20px] bg-[var(--surface-soft)] p-7">
                <h3 className="mono-label text-[var(--mute)]">// education</h3>
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
                <h3 className="mono-label text-[var(--mute)]">// certifications</h3>
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
                <h3 className="mono-label text-[var(--mute)]">// languages</h3>
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

      {/* ========================================================= Contact CTA */}
      <section id="contact" className="bg-black text-white">
        <div className="mx-auto max-w-[1040px] px-5 py-28 sm:px-8 md:py-28">
          <div className="grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-end">
            <Reveal>
              <p className="mono-label text-[var(--on-dark-mute)]">// get in touch</p>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(1.9rem,4.5vw,3.2rem)] text-white">
                Let&apos;s build something dependable.
              </h2>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-[var(--on-dark-mute)]">
                Looking for a builder who takes things end to end — in agentic
                AI, data, or product. Let&apos;s talk.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-col gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="btn btn-primary justify-between"
                >
                  <span className="flex items-center gap-2">
                    <EmailIcon className="h-[18px] w-[18px]" />
                    {profile.email}
                  </span>
                  <span>→</span>
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark justify-between"
                >
                  <span className="flex items-center gap-2">
                    <LinkedInIcon className="h-[18px] w-[18px]" />
                    LinkedIn
                  </span>
                  <span>→</span>
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark justify-between"
                >
                  <span className="flex items-center gap-2">
                    <GitHubIcon className="h-[18px] w-[18px]" />
                    GitHub
                  </span>
                  <span>→</span>
                </a>
                <a
                  href={profile.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-dark justify-between"
                >
                  <span className="flex items-center gap-2">
                    <XIcon className="h-[16px] w-[16px]" />
                    X / Twitter
                  </span>
                  <span>→</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================== Footer */}
      <footer className="bg-black text-white">
        <div className="mx-auto flex max-w-[1040px] flex-col gap-8 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-[var(--primary)] text-[11px] font-semibold text-white">
                YK
              </span>
              <span className="display text-[15px]">Yasir Khalid</span>
            </div>
            <p className="mono-label mt-4 text-[12px] text-[var(--stone-text)]">
              {profile.location} · {profile.role}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="text-[var(--on-dark-mute)] transition-colors hover:text-white"
            >
              <EmailIcon className="h-5 w-5" />
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-[var(--on-dark-mute)] transition-colors hover:text-white"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
            <a
              href={profile.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-[var(--on-dark-mute)] transition-colors hover:text-white"
            >
              <XIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[var(--on-dark-mute)] transition-colors hover:text-white"
            >
              <LinkedInIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="border-t border-[var(--hairline-dark)]">
          <p className="mono-label mx-auto max-w-[1040px] px-5 py-5 text-[11px] text-[var(--stone-text)] sm:px-8">
            © {new Date().getFullYear()} Yasir Khalid — built with Next.js.
          </p>
        </div>
      </footer>
    </main>
  );
}
