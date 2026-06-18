# DESIGN.md — Yasir Khalid portfolio + The Lab

The design system for this site. Airtable-style **editorial** system: white canvas,
near-black ink type, generous whitespace, and full-bleed **signature surface cards**
(coral / forest / cream / dark navy) that punctuate the page for brand voltage.
Flat depth — color-block first, shadow second. No gradients, no mesh, no aurora.

All tokens below are implemented as CSS variables in `app/globals.css` and consumed
via Tailwind arbitrary values (`text-[var(--ink)]`, `bg-[var(--coral)]`) or the
utility classes (`.display`, `.heading`, `.btn-primary`, …).

## Overview

The base atmosphere is white canvas, dark ink type, and breathing room — nothing
fights for attention until a section needs to. Brand voltage comes from full-bleed
signature cards in `--coral`, `--forest`, `--surface-dark`, and `--cream`, never from
gradient washes or accent walls. Between signature bands the page reads like a print
magazine: headline, supporting copy, a small media cluster, then whitespace.

Type voice is Inter (the open substitute for Airtable's Haas Grotesk) at modest
weights — **400 for display, 500 for sub-titles and buttons**. Display headlines never
go bolder than 500; emphasis comes from size and color contrast, not weight. Body copy
stays at **14px / 400**.

**Key characteristics**
- Primary CTA is `--primary` (near-black ink) with white text and a `--radius-lg` (12px)
  corner — confident and final, never decorative. One per viewport.
- Secondary CTA is a `--canvas` button with `--ink` text and a hairline outline. The two
  together form the signature button pair (`.btn-primary` + `.btn-on-dark`).
- Hero is white canvas. No atmospheric gradient, mesh, or backdrop — type and buttons in
  clean whitespace.
- Brand voltage lives in signature surface cards (`--coral`, `--forest`, `--surface-dark`,
  `--cream`), full-bleed every few screens.
- Section rhythm resets to white canvas between every signature surface:
  white → coral signature band → white → cream callout → dark band → white.
- Border radius is hierarchical: `--radius-lg` (12px) for primary CTAs and large signature
  cards, `--radius-md` (10px) for content cards, `--radius-sm` (6px) for inputs/tags,
  `--radius-full` for icon buttons. `--radius-pill` is reserved for a pricing sub-system
  (not present on this site).
- Vertical rhythm is ~96px between major bands.

## Colors

### Brand & ink
| Token | Hex | Role |
|---|---|---|
| `--primary` / `--ink` | `#181d26` | Primary CTA bg, h1/h2 display type, dark signature surface. Black IS the primary — not blue. |
| `--primary-active` | `#0d1218` | Primary button press state |
| `--body` | `#333840` | Default running text |
| `--on-primary` | `#ffffff` | Text on primary / dark surfaces |

### Surface
| Token | Hex | Role |
|---|---|---|
| `--canvas` | `#ffffff` | Default page surface; floor of every editorial body |
| `--surface-soft` | `#f8fafc` | Neutral panels, lab stat strips, feature cards (`--stone` aliases here) |
| `--surface-strong` | `#e0e2e6` | Light-gray CTA banner near footer |
| `--surface-dark` | `#181d26` | Dark navy mid-page CTA cards (`--navy`/`--near-black` alias here) |
| `--surface-dark-elevated` | `#1d1f25` | Reserved (articles-hero base) |
| `--hairline` | `#dddddd` | 1px borders: inputs, dividers, secondary-button outline |
| `--border-light` / `--card-border` | `#ededed` | Section dividers, card rings |
| `--border-strong` | `#9297a0` | Disabled secondary-button outline |

### Signature card surfaces
Brand voltage. Used as **full-bleed card surfaces**, never as accents on a small element.
| Token | Hex | Role |
|---|---|---|
| `--coral` | `#aa2d00` | Largest signature band (the "agentic AI" proof band). Full-bleed dark coral, white type. Also the primary data-viz accent in the lab. |
| `--forest` | `#0a2e0e` | Deep-green signature band (contact CTA). `--green` aliases here. |
| `--cream` | `#f5e9d4` | Beige callout (hero "now" card). Soft surface holding dark type. |
| `--peach` `#fcab79` · `--mint` `#a8d8c4` · `--yellow` `#f4d35e` · `--mustard` `#d9a441` | — | Demo/pastel surfaces for small product-UI fragments. `--coral-soft` aliases `--peach`. |

### Semantic
| Token | Hex | Role |
|---|---|---|
| `--link` | `#1b61c9` | Inline links / anchor text (`--blue` aliases here). **Not** the primary button color. |
| `--link-active` | `#1a3866` | Link press |
| `--info` | `#254fad` | Info badges, focused-input outline |
| `--success` | `#006400` | Confirmation states |
| `--muted` | `#6b7079` | Eyebrows, captions, tiny meta |
| `--slate` | `#41454d` | Secondary running text |

> The most common mistake reading Airtable's CSS is treating link-blue (`#1b61c9`) as the
> brand action. It isn't — the primary button is near-black `--primary`.

## Typography

### Family
Inter (variable) for **both display and text**, substituting Haas Groot Disp / Haas Grotesk.
Loaded via `next/font/google` in `app/layout.tsx` at weights 400 / 500 / 600, exposed as
`--font-sans` (and reused for `--font-display`). Fallback chain:
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.

**IBM Plex Mono** (`--font-mono`) is retained for **data and code surfaces only** — the lab's
traces, tabular numbers, and technical tags. This is an extension beyond Airtable's
marketing guide, justified because the lab renders product-UI / data fragments.

### Hierarchy (utility classes + sizes used)
| Class / size | Weight | Line height | Use |
|---|---|---|---|
| `.display` @ clamp(2.4–6rem) | 400 | 1.15 | h1 hero, big section headlines |
| `.heading` @ 20–34px | 500 | 1.25 | Section + card titles, sub-titles |
| body @ 14–18px | 400 | 1.5 | Running copy, nav, footer |
| `.mono-label` @ 12px | 500 | — | Editorial eyebrow / small uppercase category tag (letter-spacing 0.08em, uppercase). Inter, **not** mono. |
| `.tag-mono` @ 12px | 400 | — | Technical tags on data surfaces — IBM Plex Mono |
| `.btn*` @ 16px | 500 | — | CTA button labels |

### Principles
Prefer weight 400 for display sizes — a 40px h1 is **not** bold. Emphasis is delegated to
size, color contrast, and signature surface cards. Where weight is wanted, pivot to 500
(sub-titles, buttons), never 600/700 in the editorial body. Bigger type before bolder type.

## Layout

- **Base unit:** 4px. Tokens: 4 / 8 / 12 / 16 / 24 / 32 / 48 / **96 (section)**.
- **Section padding (vertical):** ~96px top + bottom on every major band (`py-24`/`md:py-32`).
- **Max content width:** ~1280px (homepage) / ~1100px (lab), centered, with 20–48px horizontal
  breathing room.
- **Grids:** editorial body collapses 12→1 col on mobile; card grids reduce columns rather than
  scaling cards down (3-up → 2-up → 1-up).
- **Whitespace is the dominant atmospheric tool.** Heroes sit in 96px+ of pure whitespace with
  no decoration behind the type.

## Elevation & Depth

Color-block first, shadow second. Depth is delegated to the contrast between white canvas and
signature surface cards — there is no soft-glow / atmospheric-shadow language.
| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Body sections, nav, footer |
| Soft hairline | 1px `--hairline` | Inputs, secondary buttons, dividers, card rings |
| Card flat | No shadow; relies on color contrast | Signature coral/forest/dark cards, cream callouts, lab panels |

## Shapes

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 2px | Legal/cookie surfaces (system-required) |
| `--radius-sm` | 6px | Text inputs, tags (`.tag-mono`, `.chip-coral`) |
| `--radius-md` | 10px | Secondary content cards, outlined tags (`.pill-outline`) |
| `--radius-lg` | 12px | Primary CTAs, signature cards, lab panels (`Panel`) |
| `--radius-pill` | 9999px | **Pricing sub-system only** — not used on this site |
| `--radius-full` | 9999px | Circular icon buttons, avatars |

## Components

- **`top-nav` (`components/Nav.tsx`)** — light white bar on every page; wordmark left, menu
  center-left in 14px, primary `.btn-primary` + text links right. Never inverts over dark sections.
- **`.btn-primary`** — near-black `--primary`, white text, 12px radius, padding 14×24. One per viewport.
  Press → `--primary-active`.
- **`.btn-on-dark`** — white button, `--ink` text, hairline outline. The secondary pair; stays white
  over dark surfaces.
- **`.btn-text`** — underlined ink link; hover → `--link`.
- **`.pill-outline`** — outlined tag (skills), hairline border, 10px radius.
- **`.chip-coral`** — warm peach-toned badge, 6px radius.
- **`.tag-mono`** — mono technical tag for data surfaces, 6px radius.
- **Signature bands** — `bg-[var(--coral)]` (agentic proof), `bg-[var(--forest)]` (contact CTA),
  `bg-[var(--surface-dark)]` (metrics), each white-on-dark with 12px radius where carded.
- **`cream-callout`** — `bg-[var(--cream)]` hero "now" card, dark type.
- **Lab `Panel` (`components/lab/ui.tsx`)** — `tone="white" | "stone"(soft) | "ink"(dark)`, 12px radius.
  Lab controls (`Segmented`, `Slider`, `ActionButton`, `Stat`, `Note`) all derive from these tokens.

## Do's and Don'ts

**Do**
- Keep `.btn-primary` near-black. The brand action is `--primary`, not `--link`.
- Reserve `.btn-primary` for one primary action per viewport.
- Pair `.btn-primary` with `.btn-on-dark` (white + hairline outline).
- Trust whitespace as the hero atmosphere — no gradient, no mesh.
- Use coral / forest / dark / cream signature surfaces to break editorial monotony.
- Anchor every editorial band with ~96px vertical padding.
- Bigger type before bolder type; signature surface before solid accent.

**Don't**
- Don't make `--link` (#1b61c9) the primary button color.
- Don't add a gradient/mesh/aurora backdrop to the hero.
- Don't bold display-weight type (it's 400/500 by design).
- Don't use `--radius-pill` outside a pricing sub-system.
- Don't repeat the same surface mode in two consecutive bands.
- Don't introduce accent colors beyond the signature palette.

## Responsive Behavior

| Breakpoint | Width | Key changes |
|---|---|---|
| Mobile | < 768px | Single-column body; nav → hamburger; card grids 1-up; signature cards stay full-bleed |
| Tablet | 768–1024px | 2-up grids; nav tightens but stays horizontal |
| Desktop | 1024–1440px | 3-up grids; full nav |
| Wide | > 1440px | Same as desktop; content caps ~1280px, page adds outer margin rather than scaling type |

Touch targets: buttons render ≥ 44px tall; inputs 44px. Card grids reduce columns rather than
shrinking cards.

## Known Gaps / Deviations from the source guide

- **Fonts:** Haas Groot Disp / Haas Grotesk are licensed; this site substitutes **Inter Display**
  (open variable font) for both display and text, per the guide's substitution note.
- **Monospace:** IBM Plex Mono is retained for the lab's data/code surfaces — an intentional
  extension beyond the marketing-only guide.
- **Pricing sub-system** (Inter Display 475/575, `--radius-pill` buttons) is documented for
  completeness but **not implemented** — there is no pricing page.
- **Eyebrow voice:** section eyebrows still use a `// label` convention (a holdover); the visual
  treatment is now the editorial uppercase caption, but the `//` prefix is a content/voice choice
  that can be revisited.
- Pastel demo-grid hexes (`--peach`/`--mint`/`--yellow`/`--mustard`) are inferred from screenshot
  sampling in the source guide.
- Hover states beyond default/active and animation timings are out of scope.
