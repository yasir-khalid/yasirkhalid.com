import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { lab, type LabEntry } from "@/lib/lab";

export const metadata: Metadata = {
  title: "The Lab — Interactive explainers · Yasir Khalid",
  description:
    "Hands-on, visual explanations of computer science and systems concepts — bloom filters, hashing, load balancing, caching, big-O, and system design. Built to think out loud.",
};

// Feature the two system-design overviews at the top, everything else below.
const FEATURED = ["system-design-math", "system-evolution"];
const featured = FEATURED.map((s) => lab.find((e) => e.slug === s)).filter(
  (e): e is LabEntry => Boolean(e)
);
const rest = lab.filter((e) => !FEATURED.includes(e.slug));

function LabGroup({ label, entries }: { label: string; entries: LabEntry[] }) {
  return (
    <div>
      <Reveal>
        <p className="mono-label text-[var(--charcoal)]">{label}</p>
      </Reveal>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {entries.map((e, i) => {
          const card = (
            <div
              className={`group flex h-full flex-col rounded-[22px] p-7 ring-1 transition-all ${
                e.status === "live"
                  ? "bg-white ring-[var(--card-border)] hover:ring-[var(--ink)]"
                  : "bg-[var(--stone)] ring-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="mono-label text-[var(--primary)]">{e.topic}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                    e.kind === "essay"
                      ? "bg-[var(--surface-soft)] text-[var(--charcoal)]"
                      : "bg-[rgba(73,79,223,0.1)] text-[var(--primary)]"
                  }`}
                >
                  {e.kind === "essay" ? "visual essay" : "tool"}
                </span>
              </div>

              <h2 className="heading mt-5 flex items-center gap-2 text-[27px] text-[var(--ink)]">
                {e.title}
                {e.status === "live" && (
                  <span className="text-[var(--muted)] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </h2>
              <p className="mt-3 flex-1 text-[15px] leading-[1.55] text-[var(--slate)]">
                {e.blurb}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span key={t} className="tag-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );

          return (
            <Reveal key={e.slug} delay={(i % 2) * 60}>
              {e.status === "live" ? (
                <Link href={`/lab/${e.slug}`} className="block h-full">
                  {card}
                </Link>
              ) : (
                card
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default function LabIndex() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-[var(--border-light)] bg-white">
        <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--hairline-strong)] px-4 py-2 text-[14px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-soft)]"
          >
            ← Back to portfolio
          </Link>
          <Reveal>
            <p className="mono-label mt-8 text-[var(--muted)]">// the lab</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="display mt-6 max-w-[18ch] text-[clamp(2.6rem,7vw,5rem)] text-[var(--ink)]">
              Concepts you can poke at.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-7 max-w-[62ch] text-[18px] leading-[1.55] text-[var(--ink)]">
              A growing set of interactive, visual explainers — built to make
              abstract systems and algorithms concrete. Drag a slider, send a
              request, trip a false positive. The best way to understand
              something is to play with it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Gallery — system design featured, then the rest */}
      <section className="bg-white">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-14 px-5 py-16 sm:px-8 md:py-20">
          <LabGroup label="// system design — start here" entries={featured} />
          <LabGroup label="// concepts" entries={rest} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--near-black)] text-white">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="mono-label text-[12px] text-[var(--muted)]">
            Inspired by samwho.dev & arjaythedev.com · built with Next.js
          </p>
          <Link
            href="/"
            className="text-[14px] text-white/70 transition-colors hover:text-white"
          >
            ← Back to portfolio
          </Link>
        </div>
      </footer>
    </main>
  );
}
