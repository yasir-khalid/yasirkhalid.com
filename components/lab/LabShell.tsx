import Link from "next/link";
import LabNav from "@/components/lab/LabNav";
import type { LabEntry } from "@/lib/lab";

// Shared page chrome for an individual explainer: nav, header block, the
// interactive body (children), and a footer with prev/next-ish back link.
export default function LabShell({
  entry,
  children,
}: {
  entry: LabEntry;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <LabNav />

      <article className="mx-auto max-w-[1100px] px-5 pb-28 pt-14 sm:px-8 sm:pt-20">
        <Link
          href="/lab"
          className="mono-label text-[var(--muted)] transition-colors hover:text-[var(--blue)]"
        >
          ← The Lab
        </Link>

        <header className="mt-6 border-b border-[var(--hairline)] pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="mono-label text-[var(--coral)]">{entry.topic}</span>
            <span className="text-[var(--hairline)]">·</span>
            <span className="mono-label text-[var(--muted)]">
              {entry.kind === "essay" ? "visual essay" : "interactive tool"}
            </span>
          </div>
          <h1 className="display mt-4 text-[clamp(2.4rem,6vw,4rem)] text-[var(--ink)]">
            {entry.title}
          </h1>
          <p className="mt-5 max-w-[60ch] text-[18px] leading-[1.55] text-[var(--slate)]">
            {entry.blurb}
          </p>
        </header>

        <div className="mt-12">{children}</div>
      </article>
    </main>
  );
}
