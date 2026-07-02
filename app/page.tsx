import Link from "next/link";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import TestimonialCard from "@/components/TestimonialCard";
import CornerTicks from "@/components/CornerTicks";
import { GitHubIcon, XIcon, LinkedInIcon, EmailIcon } from "@/components/icons";
import { BUILD_ICONS, BuildBadge } from "@/components/ProfileBlocks";
import { profile, experience, projects } from "@/lib/content";

export default function Home() {
  return (
    <main id="top">
      <Nav />

      {/* ===================================================== Hero (cream, unframed) */}
      <section className="flex min-h-[70vh] items-center bg-[var(--canvas-light)]">
        <div className="mx-auto w-full max-w-[720px] px-5 py-24 sm:px-8">
          <Reveal>
            <h1 className="display max-w-[18ch] text-[clamp(2.1rem,5.2vw,3.9rem)] font-light text-[var(--ink)]">
              {profile.headline}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-7 max-w-[54ch] text-[16px] leading-[1.55] text-[var(--mute)]">
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
      </section>

      {/* ============================================== Builds (cream, plain numbered list) */}
      <section id="projects" className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[720px] px-5 py-20 sm:px-8">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">builds</p>
            <h2 className="heading mt-4 text-[clamp(1.4rem,3vw,1.9rem)] text-[var(--ink)]">
              Things I build and own, end to end.
            </h2>
          </Reveal>

          <div className="mt-12 flex flex-col border-t border-[var(--hairline-light)]">
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

      {/* ================================================ Experience (compact list) */}
      <section id="work" className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto max-w-[720px] px-5 py-20 sm:px-8">
          <Reveal>
            <p className="mono-label text-[var(--charcoal)]">experience</p>
            <h2 className="heading mt-4 text-[clamp(1.4rem,3vw,1.9rem)] text-[var(--ink)]">
              Where I&apos;ve shipped.
            </h2>
          </Reveal>

          <div className="mt-12 flex flex-col border-t border-[var(--hairline-light)]">
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

      {/* ============================================== Testimonial (catalogue) */}
      <section className="border-t border-[var(--hairline-light)] bg-[var(--surface-soft)]">
        <div className="mx-auto max-w-[720px] px-5 py-20 sm:px-8">
          <Reveal>
            <TestimonialCard />
          </Reveal>
        </div>
      </section>

      {/* ========================================================= Contact CTA (tick-framed, like fin.ai's closing panel) */}
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

      {/* ============================================================== Footer (cream, plain black text) */}
      <footer className="border-t border-[var(--hairline-light)] bg-[var(--canvas-light)]">
        <div className="mx-auto flex max-w-[720px] flex-col gap-8 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-[var(--primary)] text-[11px] font-semibold text-[var(--ink)]">
                YK
              </span>
              <span className="display text-[15px] text-[var(--ink)]">Yasir Khalid</span>
            </div>
            <p className="mono-label mt-4 text-[12px] text-[var(--stone-text)]">
              {profile.location} · {profile.role}
            </p>
            <Link
              href="/resume"
              className="mono-label mt-3 inline-block text-[12px] text-[var(--mute)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Full CV & skills →
            </Link>
          </div>
          <div className="flex items-center gap-6">
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
        <div className="border-t border-[var(--hairline-light)]">
          <p className="mono-label mx-auto max-w-[720px] px-5 py-5 text-[11px] text-[var(--stone-text)] sm:px-8">
            © {new Date().getFullYear()} Yasir Khalid - built with Next.js.
          </p>
        </div>
      </footer>
    </main>
  );
}
