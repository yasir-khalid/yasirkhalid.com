import Link from "next/link";
import type { LabEntry } from "@/lib/lab";

// Shared page chrome for an individual explainer: a back button, the header
// block, and the interactive body (children). No persistent nav bar.
export default function LabShell({
  entry,
  children,
  wide = false,
}: {
  entry: LabEntry;
  children: React.ReactNode;
  /** widen the content column for dashboard-style two-pane explainers */
  wide?: boolean;
}) {
  return (
    <main className="min-h-screen bg-white">
      <article
        className={`mx-auto px-5 pb-28 pt-10 sm:px-8 sm:pt-14 ${
          wide ? "max-w-[1320px]" : "max-w-[1100px]"
        }`}
      >
        <Link
          href="/lab"
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--hairline-strong)] px-4 py-2 text-[14px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-soft)]"
        >
          ← Back to The Lab
        </Link>

        <header className="mt-8 border-b border-[var(--hairline)] pb-10">
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
