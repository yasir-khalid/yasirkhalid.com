import React from "react";
import Link from "next/link";
import { SportIcon, TraceIcon, LabFlaskIcon } from "@/components/icons";
import type { Project } from "@/lib/content";

// Icon mapping for each project - by name
export const BUILD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sportscanner: SportIcon,
  Traceyard: TraceIcon,
  "Simulation Lab": LabFlaskIcon,
};

// Status badge color: live products get teal, in-progress get amber, open get blue
export function BuildBadge({ label }: { label: string }) {
  const lower = label.toLowerCase();
  const cls = lower.includes("live") || lower.includes("open")
    ? "bg-[var(--accent-teal)]/15 text-[var(--accent-teal)]"
    : "bg-[var(--accent-warning)]/15 text-[var(--accent-warning)]";
  return (
    <span className={`rounded-[4px] px-2 py-0.5 font-mono text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function BuildCard({ project }: { project: Project }) {
  const Icon = BUILD_ICONS[project.name];
  const linkClass = "mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-[var(--mute)] transition-colors duration-[330ms] hover:text-[var(--ink)]";

  return (
    <article className="card-light flex h-full flex-col p-7">
      {/* Icon */}
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--primary)]/12 text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* Name + badge */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-2">
        <h3 className="heading text-[21px] text-[var(--ink)]">{project.name}</h3>
        {project.badge && <BuildBadge label={project.badge} />}
      </div>

      {/* Blurb */}
      <p className="mt-2 text-[14px] leading-[1.6] text-[var(--body)]">{project.blurb}</p>

      {/* Bullets */}
      <ul className="mt-5 flex flex-col gap-2.5">
        {project.points.map((pt) => (
          <li key={pt} className="flex items-start gap-3 text-[14px] leading-[1.5] text-[var(--body)]">
            <span className="mt-[8px] block h-px w-3 shrink-0 bg-[var(--hairline-strong)]" aria-hidden />
            {pt}
          </li>
        ))}
      </ul>

      {/* Stack tags */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-[4px] border border-[var(--hairline-light)] px-2 py-0.5 font-mono text-[11px] text-[var(--mute)]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Link */}
      {project.href && (
        project.href.startsWith("/") ? (
          <Link href={project.href} className={linkClass}>
            yasirkhalid.com{project.href} &#8594;
          </Link>
        ) : (
          <a href={project.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {project.href.replace(/^https?:\/\/(www\.)?/, "")} &#8594;
          </a>
        )
      )}
    </article>
  );
}

export function Bullets({ points }: { points: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {points.map((p) => (
        <li key={p} className="flex gap-3 text-[15px] leading-[1.5] text-[var(--body)]">
          <span
            className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-[var(--charcoal)]"
            aria-hidden
          />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}
