import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import AgentConsole from "@/components/AgentConsole";
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

function Bullets({ points }: { points: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {points.map((p) => (
        <li
          key={p}
          className="flex gap-3 text-[15px] leading-[1.5] text-[var(--ink)]"
        >
          <span
            className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-[var(--coral)]"
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

      {/* ============================================================== Hero */}
      <section className="border-b border-[var(--border-light)] bg-white">
        <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-20 sm:px-8 sm:pt-28 md:pb-24">
          <Reveal>
            <p className="mono-label text-[var(--muted)]">{profile.current}</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.8rem,8.5vw,6rem)] text-[var(--ink)]">
              {profile.headline}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-[60ch] text-[18px] leading-[1.55] text-[var(--ink)]">
              {profile.sub}
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <a href="#contact" className="btn btn-primary">
                Get in touch
              </a>
              <a href="#work" className="btn-text">
                Explore my work
              </a>
            </div>
          </Reveal>

          {/* Two-card media composition */}
          <div className="mt-16 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <Reveal delay={120}>
              <AgentConsole />
            </Reveal>
            <Reveal delay={200}>
              <div className="flex h-full flex-col justify-between rounded-[12px] bg-[var(--cream)] p-7">
                <p className="mono-label text-[var(--slate)]">// now</p>
                <div>
                  <p className="heading mt-6 text-[24px] leading-[1.15] text-[var(--ink)]">
                    Owning a multi-agent platform in regulated banking.
                  </p>
                  <p className="mt-4 text-[15px] leading-[1.5] text-[var(--slate)]">
                    Evals on every PR · OpenTelemetry tracing · MCP tool calling
                    · Kubernetes-native.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================================== Pillars (who) */}
      <section className="border-b border-[var(--border-light)] bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-[var(--muted)]">// in short</p>
          </Reveal>
          <div className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className="border-t border-[var(--hairline)] pt-6">
                  <p className="mono-label text-[var(--coral)]">{p.label}</p>
                  <h3 className="heading mt-4 text-[21px] text-[var(--ink)]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.5] text-[var(--slate)]">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================== Trust strip */}
      <section className="border-b border-[var(--border-light)] bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-14 text-center sm:px-8">
          <Reveal>
            <p className="mono-label text-[var(--muted)]">
              Built &amp; shipped with
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {trustMarks.map((m) => (
                <span
                  key={m}
                  className="display text-[20px] text-[var(--ink)] opacity-60 sm:text-[24px]"
                >
                  {m}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ Agentic AI proof (coral signature band) */}
      <section className="bg-[var(--coral)] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 md:py-32">
          <Reveal>
            <p className="mono-label text-white/50">// agentic AI, specifically</p>
            <h2 className="heading mt-6 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)] text-white">
              The parts that decide whether agents work in production.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div className="border-t border-white/15 pt-6">
                  <h3 className="heading text-[20px] text-white">{c.label}</h3>
                  <p className="mt-3 text-[15px] leading-[1.5] text-white/70">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ Experience (table) */}
      <section id="work" className="border-b border-[var(--border-light)] bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 md:py-32">
          <Reveal>
            <p className="mono-label text-[var(--muted)]">// experience</p>
            <h2 className="heading mt-6 text-[clamp(2rem,5vw,3.4rem)] text-[var(--ink)]">
              Where I&apos;ve shipped.
            </h2>
          </Reveal>

          <div className="mt-14 border-t border-[var(--hairline)]">
            {experience.map((job, i) => (
              <Reveal key={job.company + job.period} delay={i * 40}>
                <article className="grid gap-4 border-b border-[var(--hairline)] py-9 md:grid-cols-[0.85fr_2fr_auto] md:gap-10">
                  <div>
                    <h3 className="heading text-[24px] text-[var(--ink)]">
                      {job.company}
                    </h3>
                    <p className="mt-1 text-[14px] text-[var(--slate)]">
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
                    <span className="mono-label text-[var(--muted)]">
                      {job.period}
                    </span>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">
                      {job.location}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ Projects (white cards) */}
      <section
        id="projects"
        className="border-b border-[var(--border-light)] bg-[var(--blue-wash)]"
      >
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 md:py-32">
          <Reveal>
            <p className="mono-label text-[var(--muted)]">// building</p>
            <h2 className="heading mt-6 text-[clamp(2rem,5vw,3.4rem)] text-[var(--ink)]">
              Things I own end to end.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.name} delay={i * 70}>
                <article className="flex h-full flex-col rounded-[12px] bg-white p-8 ring-1 ring-[var(--card-border)]">
                  <div className="flex items-center gap-3">
                    <h3 className="heading text-[28px] text-[var(--ink)]">
                      {p.name}
                    </h3>
                    {p.badge && <span className="chip-coral">{p.badge}</span>}
                  </div>
                  <p className="mt-2 text-[16px] text-[var(--ink)]">{p.blurb}</p>
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

      {/* ============================================== Metrics (navy band) */}
      <section className="bg-[var(--navy)] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 md:py-24">
          <Reveal>
            <p className="mono-label text-white/45">// impact</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-12 lg:grid-cols-4">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 60}>
                <div className="border-t border-white/15 pt-5">
                  <div className="display text-[clamp(2.2rem,4vw,3.2rem)] text-white">
                    {m.value}
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-white/55">
                    {m.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== Skills + sidebar */}
      <section
        id="skills"
        className="border-b border-[var(--border-light)] bg-white"
      >
        <div className="mx-auto grid max-w-[1280px] gap-16 px-5 py-24 sm:px-8 md:grid-cols-[1.7fr_1fr] md:py-32">
          <div>
            <Reveal>
              <p className="mono-label text-[var(--muted)]">// toolkit</p>
              <h2 className="heading mt-6 text-[clamp(1.9rem,4.5vw,3rem)] text-[var(--ink)]">
                The stack I reach for.
              </h2>
            </Reveal>
            <div className="mt-12 flex flex-col gap-10">
              {skills.map((s, i) => (
                <Reveal key={s.group} delay={i * 50}>
                  <div className="border-t border-[var(--hairline)] pt-6">
                    <h3 className="mono-label text-[var(--slate)]">{s.group}</h3>
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

          <div className="flex flex-col gap-10">
            <Reveal>
              <div className="rounded-[12px] bg-[var(--stone)] p-7">
                <h3 className="mono-label text-[var(--slate)]">// speaking</h3>
                <p className="heading mt-5 text-[19px] leading-[1.2] text-[var(--ink)]">
                  {speaking.title}.
                </p>
                <p className="mt-2 text-[14px] text-[var(--slate)]">
                  {speaking.venue} · {speaking.when}
                </p>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="rounded-[12px] bg-[var(--green-wash)] p-7">
                <h3 className="mono-label text-[var(--green)]">// education</h3>
                <div className="mt-5 flex flex-col gap-5">
                  {education.map((e) => (
                    <div key={e.school}>
                      <p className="text-[15px] font-medium text-[var(--ink)]">
                        {e.degree}
                      </p>
                      <p className="mt-0.5 text-[14px] text-[var(--slate)]">
                        {e.school}
                      </p>
                      <p className="mono-label mt-1 text-[12px] text-[var(--muted)]">
                        {e.period}
                        {e.result ? ` · ${e.result}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-[12px] bg-white p-7 ring-1 ring-[var(--card-border)]">
                <h3 className="mono-label text-[var(--slate)]">
                  // certifications
                </h3>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {certifications.map((c) => (
                    <li
                      key={c}
                      className="text-[15px] leading-snug text-[var(--ink)]"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="rounded-[12px] bg-white p-7 ring-1 ring-[var(--card-border)]">
                <h3 className="mono-label text-[var(--slate)]">// languages</h3>
                <div className="mt-5 flex flex-col gap-3">
                  {languages.map((l) => (
                    <div
                      key={l.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[15px] text-[var(--ink)]">
                        {l.name}
                      </span>
                      <span className="text-[13px] text-[var(--muted)]">
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
      <section id="contact" className="bg-[var(--green)] text-white">
        <div className="mx-auto max-w-[1280px] px-5 py-28 sm:px-8 md:py-36">
          <div className="grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-end">
            <Reveal>
              <p className="mono-label text-[#7ef0d8]">// get in touch</p>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(2.4rem,6vw,4.5rem)] text-white">
                Let&apos;s build something dependable.
              </h2>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-white/70">
                Looking for a builder who takes things end to end — in agentic
                AI, data, or product. Let&apos;s talk.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-col gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="btn btn-on-dark justify-between"
                >
                  {profile.email} <span>→</span>
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn justify-between border border-white/25 text-white hover:bg-white/10"
                >
                  LinkedIn <span>→</span>
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn justify-between border border-white/25 text-white hover:bg-white/10"
                >
                  GitHub <span>→</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================== Footer */}
      <footer className="bg-[var(--near-black)] text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-white text-[11px] font-medium text-[var(--near-black)]">
                YK
              </span>
              <span className="display text-[15px]">Yasir Khalid</span>
            </div>
            <p className="mono-label mt-4 text-[12px] text-[var(--muted)]">
              {profile.location} · {profile.role}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[14px]">
            <a
              href={`mailto:${profile.email}`}
              className="text-white/70 hover:text-white"
            >
              Email
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white"
            >
              GitHub
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white"
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mono-label mx-auto max-w-[1280px] px-5 py-5 text-[11px] text-[var(--muted)] sm:px-8">
            © {new Date().getFullYear()} Yasir Khalid — built with Next.js.
          </p>
        </div>
      </footer>
    </main>
  );
}
