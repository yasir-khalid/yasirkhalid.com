import Link from "next/link";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import TestimonialCard from "@/components/TestimonialCard";
import CornerTicks from "@/components/CornerTicks";
import AgentConsole from "@/components/AgentConsole";
import { GitHubIcon, XIcon, LinkedInIcon, EmailIcon } from "@/components/icons";
import { BUILD_ICONS, BuildBadge } from "@/components/ProfileBlocks";
import {
  profile,
  trustMarks,
  pillars,
  capabilities,
  experience,
  projects,
  metrics,
} from "@/lib/content";

const footerColumns = [
  {
    heading: "Site",
    links: [
      { label: "Experience", href: "/#work" },
      { label: "Builds", href: "/#projects" },
      { label: "The Lab", href: "/lab" },
      { label: "Resume", href: "/resume" },
    ],
  },
  {
    heading: "Builds",
    links: [
      { label: "Sportscanner", href: "https://www.sportscanner.co.uk" },
      { label: "Traceyard", href: "/#projects" },
      { label: "Simulation Lab", href: "/lab" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Email", href: `mailto:${profile.email}` },
      { label: "LinkedIn", href: profile.linkedin },
      { label: "GitHub", href: profile.github },
      { label: "X / Twitter", href: profile.x },
    ],
  },
];

export default function Home() {
  return (
    <main id="top">
      <Nav />

      {/* ===================================================== 00 Hero */}
      <section className="bg-[var(--canvas-light)]">
        <div className="mx-auto grid max-w-[1100px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <h1 className="display max-w-[16ch] text-[clamp(2.5rem,2rem+4.5vw,5.25rem)] font-light leading-[0.98] tracking-tight text-[var(--ink)]">
                {profile.headline}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-7 max-w-[48ch] text-[18px] leading-[1.4] text-[var(--body)]">
                {profile.sub}
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#contact" className="btn btn-primary">
                  Get in touch
                </a>
                <Link href="/lab" className="btn btn-outline-light">
                  Explore simulation lab →
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={220}>
            <AgentConsole />
          </Reveal>
        </div>
      </section>

      {/* ===================================================== 01 Pillars */}
      <section id="about" className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex items-start gap-5">
              <span className="numeral">01</span>
              <h2 className="display mt-1 max-w-[20ch] text-[clamp(1.9rem,1.5rem+2vw,3rem)] font-light text-[var(--ink)]">
                I take ideas to production and own the whole loop.
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className="border-t border-[var(--hairline-light)] pt-6">
                  <p className="mono-label text-[var(--stone-text)]">{p.label}</p>
                  <h3 className="heading mt-4 text-[19px] text-[var(--ink)]">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-[1.5] text-[var(--mute)]">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== 02 Trust marks (logo grid) */}
      <section className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex items-start gap-5">
              <span className="numeral">02</span>
              <h2 className="display mt-1 max-w-[22ch] text-[clamp(1.9rem,1.5rem+2vw,3rem)] font-light text-[var(--ink)]">
                Shipped inside teams that can&apos;t afford to get it wrong.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-[var(--hairline-light)] pt-10 sm:grid-cols-5">
              {trustMarks.map((m) => (
                <span
                  key={m}
                  className="display text-center text-[22px] text-[var(--ink)] opacity-40 grayscale"
                >
                  {m}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================== 03 Agentic AI (gradient band) */}
      <section className="gradient-band border-t border-[var(--hairline-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex items-start gap-5">
              <span className="numeral">03</span>
              <h2 className="display mt-1 max-w-[20ch] text-[clamp(1.9rem,1.5rem+2vw,3rem)] font-light text-[var(--ink)]">
                Agentic AI, specifically.
              </h2>
            </div>
            <p className="mt-6 max-w-[58ch] pl-[52px] text-[16px] leading-[1.5] text-[var(--body)]">
              Evals, tracing, guardrails, and MCP - the unglamorous parts that
              decide whether agents actually work in production.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-x-10 gap-y-10 border-t border-[var(--hairline-strong)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div>
                  <h3 className="heading text-[18px] text-[var(--ink)]">{c.label}</h3>
                  <p className="mt-3 text-[14px] leading-[1.5] text-[var(--body)]">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== 04 Builds */}
      <section id="projects" className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex items-start gap-5">
              <span className="numeral">04</span>
              <h2 className="display mt-1 max-w-[20ch] text-[clamp(1.9rem,1.5rem+2vw,3rem)] font-light text-[var(--ink)]">
                Things I build and own, end to end.
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 flex flex-col border-t border-[var(--hairline-light)]">
            {projects.map((p, i) => {
              const Icon = BUILD_ICONS[p.name];
              const href = p.href;
              const isInternal = href?.startsWith("/");
              return (
                <Reveal key={p.name} delay={i * 60}>
                  <article className="flex flex-col gap-3 border-b border-[var(--hairline-light)] py-8">
                    <div className="flex flex-wrap items-center gap-3">
                      {Icon && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--primary)]/12 text-[var(--primary)]">
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <h3 className="heading text-[19px] text-[var(--ink)]">{p.name}</h3>
                      {p.badge && <BuildBadge label={p.badge} />}
                    </div>
                    <p className="max-w-[58ch] text-[15px] leading-[1.55] text-[var(--body)]">
                      {p.blurb}
                    </p>
                    <p className="font-mono text-[12px] text-[var(--stone-text)]">
                      {p.stack.join(" · ")}
                    </p>
                    {href && (
                      isInternal ? (
                        <Link
                          href={href}
                          className="mt-1 inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--mute)] transition-colors duration-[330ms] hover:text-[var(--ink)]"
                        >
                          yasirkhalid.com{href} &#8594;
                        </Link>
                      ) : (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--mute)] transition-colors duration-[330ms] hover:text-[var(--ink)]"
                        >
                          {href.replace(/^https?:\/\/(www\.)?/, "")} &#8594;
                        </a>
                      )
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================== 05 Experience */}
      <section id="work" className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex items-start gap-5">
              <span className="numeral">05</span>
              <h2 className="display mt-1 max-w-[20ch] text-[clamp(1.9rem,1.5rem+2vw,3rem)] font-light text-[var(--ink)]">
                Where I&apos;ve shipped.
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 flex flex-col border-t border-[var(--hairline-light)]">
            {experience.map((job, i) => (
              <Reveal key={job.company + job.period} delay={i * 40}>
                <article className="flex flex-col gap-2 border-b border-[var(--hairline-light)] py-7 md:flex-row md:items-baseline md:gap-8">
                  <div className="md:w-[200px] md:shrink-0">
                    <h3 className="heading text-[17px] text-[var(--ink)]">
                      {job.company}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-[var(--mute)]">
                      {job.role}
                    </p>
                  </div>
                  <p className="flex-1 text-[14px] leading-[1.5] text-[var(--body)]">
                    {job.points[0]}
                  </p>
                  <span className="mono-label shrink-0 text-[12px] text-[var(--stone-text)] md:text-right">
                    {job.period}
                  </span>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <Link
              href="/resume"
              className="mt-10 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink)] transition-colors hover:text-[var(--primary-deep)]"
            >
              Full resume - skills, education, certifications →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===================================================== Impact (tick-framed stat panel) */}
      <section className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-20 sm:px-8">
          <Reveal>
            <div className="tick-frame border border-[var(--hairline-light)] bg-[var(--surface-soft)]">
              <CornerTicks />
              <p className="mono-label text-[var(--charcoal)]">impact</p>
              <div className="mt-10 grid grid-cols-2 gap-x-10 gap-y-10 lg:grid-cols-4">
                {metrics.map((m, i) => (
                  <Reveal key={m.label} delay={i * 60}>
                    <div className="border-t border-[var(--hairline-strong)] pt-5">
                      <div className="display text-[clamp(1.7rem,3vw,2.4rem)] font-light text-[var(--primary)]">
                        {m.value}
                      </div>
                      <p className="mt-2 text-[14px] leading-snug text-[var(--mute)]">
                        {m.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================== Testimonial */}
      <section className="border-t border-[var(--hairline-light)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-[720px] px-5 py-20 sm:px-8">
          <Reveal>
            <TestimonialCard />
          </Reveal>
        </div>
      </section>

      {/* ===================================================== Contact CTA (tick-framed) */}
      <section id="contact" className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[720px] px-5 py-24 sm:px-8">
          <Reveal>
            <div className="tick-frame border border-[var(--hairline-light)] bg-[var(--surface-soft)]">
              <CornerTicks />
              <p className="mono-label text-[var(--charcoal)]">get in touch</p>
              <h2 className="display mt-6 max-w-[16ch] text-[clamp(1.9rem,4.5vw,3.2rem)] font-light text-[var(--ink)]">
                Let&apos;s build something dependable.
              </h2>
              <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.55] text-[var(--mute)]">
                Looking for a builder who takes things end to end - in agentic
                AI, data, or product. Let&apos;s talk.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:max-w-[360px]">
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
                  className="btn btn-outline-light justify-between"
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
                  className="btn btn-outline-light justify-between"
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
                  className="btn btn-outline-light justify-between"
                >
                  <span className="flex items-center gap-2">
                    <XIcon className="h-[16px] w-[16px]" />
                    X / Twitter
                  </span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================== Footer (multi-column, fin.ai style) */}
      <footer className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8">
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {footerColumns.map((col) => (
              <div key={col.heading} className="min-w-[140px]">
                <p className="mono-label text-[var(--stone-text)]">{col.heading}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("/") ? (
                        <Link
                          href={l.href}
                          className="text-[14px] text-[var(--body)] transition-colors hover:text-[var(--ink)]"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <a
                          href={l.href}
                          target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                          className="text-[14px] text-[var(--body)] transition-colors hover:text-[var(--ink)]"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-[var(--hairline-light)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-[var(--primary)] text-[11px] font-semibold text-[var(--ink)]">
                YK
              </span>
              <span className="display text-[15px] text-[var(--ink)]">Yasir Khalid</span>
              <span className="mono-label text-[12px] text-[var(--stone-text)]">
                {profile.location}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="text-[var(--mute)] transition-colors hover:text-[var(--ink)]"
              >
                <EmailIcon className="h-5 w-5" />
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-[var(--mute)] transition-colors hover:text-[var(--ink)]"
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
              <a
                href={profile.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-[var(--mute)] transition-colors hover:text-[var(--ink)]"
              >
                <XIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[var(--mute)] transition-colors hover:text-[var(--ink)]"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--hairline-light)]">
          <p className="mono-label mx-auto max-w-[1100px] px-5 py-5 text-[11px] text-[var(--stone-text)] sm:px-8">
            © {new Date().getFullYear()} Yasir Khalid - built with Next.js.
          </p>
        </div>
      </footer>
    </main>
  );
}
