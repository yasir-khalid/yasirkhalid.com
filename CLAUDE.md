# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio + interactive learning lab for Yasir Khalid (AI engineer),
deployed on Vercel at the `yasirkhalid.com` repo. Single Next.js app: a
marketing homepage plus `/lab`, a set of hands-on visual explainers of CS /
systems concepts (inspired by samwho.dev and arjaythedev.com / encore.dev).

## Commands

```bash
npm run dev      # local dev at http://localhost:3000
npm run build    # production build — the gate; run this to verify changes
npm start        # serve the production build
npm run lint     # next lint
```

There is no test suite. **`npm run build` is the verification step** — it
type-checks and statically prerenders every route, so a clean build is the
signal a change is good. There is nothing smaller to run than a full build.

Next.js is pinned at **15.5.x** (≥15.5.19 patches CVE-2025-66478). The npm
audit flags a PostCSS advisory transitive *inside* Next's toolchain — do **not**
`npm audit fix --force`; it downgrades Next to v9.

## Architecture

**Stack:** Next.js 15 (App Router, all pages statically prerendered / `○`),
React 19, Tailwind CSS v4 (CSS-first config — no `tailwind.config`; tokens live
in `app/globals.css` under `@theme inline`), TypeScript. `@/*` path alias → repo
root.

**Design system is the spine.** `DESIGN.md` is the source of truth: a
Revolut-style **two-mode canvas** — true-black (`#000000`) storytelling bands
alternating with white catalogue bands, switched in full-bleed `<section>`s.
Type is **Inter Tight 500** (display) + **Inter** (body) + **IBM Plex Mono**
(technical/lab), loaded in `app/layout.tsx`. Brand accent is a **scarce** cobalt
violet (`--primary #494fdf`); the primary CTA is a white pill on black
(`.btn-primary`), dark pill on light is `.btn-dark`. No drop shadows — depth is
canvas + surface-luminance shifts. When editing UI, read `DESIGN.md` first and
reuse the token names / utility classes defined in `globals.css` (`.display`,
`.heading`, `.mono-label`, `.btn-*`, `.card-*`, `.pill-outline`, `.tag-mono`).

Note: `globals.css` keeps **legacy token aliases** (`--coral`→cobalt,
`--green`/`--navy`→black, `--stone`→surface-soft, etc.) re-pointed onto the new
palette, so older class references stay coherent without per-class rewrites.

**Homepage** (`app/page.tsx`) is one file: a sequence of full-bleed bands
(hero → pillars → trust → agentic-AI → experience → projects → lab CTA →
metrics → skills → contact → footer). All copy comes from **`lib/content.ts`**
— edit content there, not in the JSX.

**The lab is registry-driven.** `lib/lab.ts` exports `lab[]` (one `LabEntry`
per explainer: slug, title, blurb, kind `"essay" | "tool"`, topic, tags,
status). To add an explainer:
1. add an entry to `lib/lab.ts` (it then auto-appears on the `/lab` gallery and the homepage lab CTA chips),
2. create the interactive client component in `components/lab/`,
3. create `app/lab/<slug>/page.tsx` — a thin wrapper that pulls the entry via `getEntry(slug)` and renders `<LabShell entry={entry}><Component/></LabShell>`.

Shared lab building blocks live in **`components/lab/ui.tsx`** (`Panel`,
`Segmented`, `Slider`, `ActionButton`, `Stat`, `Note`) and `LabShell` / `LabNav`.
**Lab visualization stages are light-themed** (white / `surface-soft` + hairline
borders) for contrast, treated as "illustration surfaces" where the accent
palette is allowed: **teal = healthy, danger-red = overload/stale, cobalt =
active**. Explainer components are `"use client"` and self-contained; most run a
`setInterval` simulation loop driving local state (see `LoadBalancing`,
`Queueing`, `Retries`).

**Icons** are inline SVG components in `components/icons.tsx` (`currentColor`):
social glyphs (GitHub/X/LinkedIn/email) and latency-category glyphs
(chip/memory/storage/network used by the System Design Math latency panel).

`components/Reveal.tsx` is the IntersectionObserver scroll-reveal wrapper used
across the homepage.

## Conventions

- Display/heading text uses the `.display` / `.heading` utility classes (Inter
  Tight 500, tight negative tracking), never raw font weights.
- Keep cobalt scarce — one featured/brand element per viewport; accents belong
  inside lab visualizations and mockups, never as button surfaces.
- Reduced-motion is honoured globally (`prefers-reduced-motion` disables reveal
  + smooth scroll).
