# Design Guide — yasirkhalid.com

## Overview

This site runs a high-contrast **two-mode canvas system** adapted from
Revolut's marketing language: a **true-black storytelling canvas**
(`{colors.canvas-dark}` — `#000000`) that hosts the hero, the agentic-AI
band, the impact metrics, and the closing CTA, alternating with **white
catalogue bands** (`{colors.canvas-light}` — `#ffffff`) that host the
pillars, experience table, projects, and skills. The two modes switch in
full-bleed bands rather than soft transitions — sections slam against each
other to create a magazine-spread rhythm.

The display typography is **Inter Tight at weight 500** (the open-source
substitute for Aeonik Pro), used from 20px to ~120px. The flagship hero sits
at 64–120px with `lineHeight: 1.0` and tight negative letter-spacing. Body
type is **Inter** at weight 400 — paired with slightly positive tracking
(`0.16–0.24px`) on UI labels for mechanical, fintech precision. A monospace
(`IBM Plex Mono`) is reserved for technical labels and the interactive lab.

The brand accent is `{colors.primary}` (`#494fdf`) — a saturated cobalt
violet — but it appears **scarcely**. The actual primary CTA is the
**white pill on black** ("Get in touch"); cobalt is reserved for a single
featured surface per viewport (the hero "now" card), the brand glyph, and
secondary CTAs inside white bands. A wide accent palette lives only inside
**illustrations** — the AgentConsole mockup and the interactive lab
visualizations — never as button surfaces.

**Key Characteristics:**
- Two-mode canvas — `{colors.canvas-dark}` (true black) for storytelling,
  `{colors.canvas-light}` (white) for browsing — switched in full-bleed bands.
- Display type is **Inter Tight 500** at 20–120px with tight `lineHeight: 1.0`
  and negative letter-spacing that scales with size.
- The primary CTA is `{component.button-primary}` — a **white pill with black
  text**, the brightest pixel on the dark canvas. Cobalt `{colors.primary}` is
  reserved for the featured card and secondary CTAs.
- The accent palette (teal, pink, light-green, yellow, etc.) lives inside
  illustrations and the lab only — never as button surfaces.
- All buttons are pill-shaped (`{rounded.full}`); cards use `{rounded.lg}`
  (20px); inputs and chips use `{rounded.md}` (12px); lab panels use
  `{rounded.lg}`.
- No drop shadows. Depth comes from canvas + surface-luminance shifts.

## Colors

### Brand & Accent
- **Cobalt Violet** (`{colors.primary}` — `#494fdf`): the brand accent.
  Reserved for the featured card (`{component.card-featured}`), the brand
  glyph, and secondary CTAs in white-canvas regions.
- **Cobalt Bright** (`{colors.primary-bright}` — `#4f55f1`): inline link colour
  and accent-photo headers.
- **Cobalt Deep** (`{colors.primary-deep}` — `#3a40c4`): active/pressed state.
- **On-Primary** (`{colors.on-primary}` — `#ffffff`): label on cobalt surfaces.

### Surface
- **Canvas Light** (`{colors.canvas-light}` — `#ffffff`): the white catalogue mode.
- **Canvas Dark** (`{colors.canvas-dark}` — `#000000`): the storytelling canvas — true black, never near-black.
- **Surface Soft** (`{colors.surface-soft}` — `#f4f4f4`): off-white for inset cards inside white bands.
- **Surface Card** (`{colors.surface-card}` — `#ffffff`): pure white card surface.
- **Surface Deep** (`{colors.surface-deep}` — `#0a0a0a`): inset cards inside black regions.
- **Surface Elevated** (`{colors.surface-elevated}` — `#16181a`): lifted cards on the black canvas (hero "now" card frame, lab dark panels).
- **Hairline Light** (`{colors.hairline-light}` — `#e2e2e7`): 1px dividers in white bands.
- **Hairline Dark** (`{colors.hairline-dark}` — `rgba(255,255,255,0.12)`): dividers in dark regions.
- **Hairline Strong** (`{colors.hairline-strong}` — `#191c1f`): structural dividers and light-card outlines.

### Text
- **Ink** (`{colors.ink}` — `#191c1f`): primary text — warmer than pure black.
- **Body** (`{colors.body}` — `#1f2226`): long-form body.
- **Charcoal** (`{colors.charcoal}` — `#3a3d40`): captions, secondary nav, mono labels on light.
- **Mute** (`{colors.mute}` — `#505a63`): supporting text.
- **Ash** (`{colors.ash}` — `#5c5e60`): tertiary text, footer copy.
- **Stone** (`{colors.stone}` — `#8d969e`): metadata, subtle captions.
- **Faint** (`{colors.faint}` — `#c9c9cd`): disabled foreground.
- **On-Dark** (`{colors.on-dark}` — `#ffffff`): primary text on the dark canvas.
- **On-Dark Mute** (`{colors.on-dark-mute}` — `rgba(255,255,255,0.72)`): secondary text in dark regions.

### Semantic / Illustration (lab & mockups only)
- **Accent Teal** (`{colors.accent-teal}` — `#00a87e`): healthy/positive state in mockups & lab.
- **Accent Light Blue** (`{colors.accent-light-blue}` — `#007bc2`).
- **Accent Blue Link** (`{colors.accent-blue-link}` — `#376cd5`): default inline link on white.
- **Accent Light Green** (`{colors.accent-light-green}` — `#428619`).
- **Accent Yellow** (`{colors.accent-yellow}` — `#b09000`): caution/pending in mockups.
- **Accent Warning** (`{colors.accent-warning}` — `#ec7e00`).
- **Accent Pink** (`{colors.accent-pink}` — `#e61e49`).
- **Accent Danger** (`{colors.accent-danger}` — `#e23b4a`): error/overload state.
- **Accent Deep Red** (`{colors.accent-deep-red}` — `#8b0000`): inline error text.
- **Accent Brown** (`{colors.accent-brown}` — `#936d62`).
- **Link** (`{colors.link}` — `#376cd5`): default inline link colour.

## Typography

### Font Family
- **Inter Tight** — display sizes (20px+) at weight 500. Substitute for Aeonik
  Pro; shares the warm geometric character and tightens with negative
  letter-spacing at large sizes.
- **Inter** — body, button labels, captions, metadata. Weight 400 or 600, with
  positive tracking (`0.16–0.24px`) on UI labels.
- **IBM Plex Mono** — technical labels, the lab's mono tags and trace readouts.

When Aeonik Pro can be licensed, swap it in for Inter Tight at display sizes;
keep `lineHeight: 1.0` and apply ~-1% letter-spacing.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | clamp 48→120px | 500 | 1.0 | -2px | The flagship hero. One per page. |
| `{typography.display-xl}` | clamp 32→80px | 500 | 1.0 | -0.8px | Section openers. |
| `{typography.display-lg}` | 48px | 500 | 1.05 | -0.48px | Sub-section titles. |
| `{typography.display-md}` | 40px | 500 | 1.1 | -0.4px | Feature card titles. |
| `{typography.heading-lg}` | 32px | 500 | 1.1 | -0.32px | Card titles. |
| `{typography.heading-md}` | 24px | 500 | 1.25 | 0 | Section sub-titles. |
| `{typography.heading-sm}` | 20px | 500 | 1.4 | 0 | List headers, prominent labels. |
| `{typography.body-lg}` | 18px | 400 | 1.55 | -0.09px | Marketing prose. |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0.24px | Default body. |
| `{typography.body-sm}` | 14px | 400 | 1.43 | 0 | Captions, metadata. |
| `{typography.mono-label}` | 13px | 400 | 1.4 | 0.04em UC | Technical labels (`// section`, lab tags). |
| `{typography.button-md}` | 16px | 600 | 1.5 | 0.24px | Default button label. |

### Principles
- Display sizes run at weight 500 with `lineHeight: 1.0` (loosen to ~1.1 below 48px). Negative letter-spacing scales with size.
- Body Inter sits at weight 400 with positive tracking (`0.24px`).
- Never bump body Inter to weight 500 — use 400 (default) or 600 (emphatic).
- Mono labels are uppercase `{colors.charcoal}` on light, `{colors.on-dark-mute}` on dark.

## Layout

### Spacing
- Base unit 4px. Tokens: `xs` 8 · `sm` 12 · `md` 16 · `lg` 24 · `xl` 32 · `block` 80 · `section` 88 · `band` 120.
- Band padding: 88px vertical between bands; 120px on the hero and closing CTA.
- Card padding: 32px (`{spacing.xl}`).

### Grid & Container
- Max content width 1280px on the marketing site, 1100px in the lab.
- Pillars/skills grids: 4-up desktop → 2-up tablet → 1-up mobile.
- Feature/project cards: 2-up desktop → 1-up mobile.

### Whitespace
- Generous and editorial — bands breathe at 88–120px so display headlines register without crowding.
- Hairline dividers replace shadow: `{colors.hairline-light}` on white, `{colors.hairline-dark}` on black.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — flat | No shadow, no border | Default canvas bands, hero. |
| 1 — surface card | `{colors.surface-card}` on `{colors.surface-soft}` band, 1px `{colors.hairline-light}` | Cards in light bands. |
| 2 — surface elevated | `{colors.surface-elevated}` on `{colors.canvas-dark}` | Cards/panels in dark regions (AgentConsole, hero frame). |
| 3 — featured | `{colors.primary}` on `{colors.canvas-dark}` | The single cobalt featured card. |
| 4 — illustration | Light stage (`{colors.surface-soft}` / white + hairline) with accent-coded elements | The interactive lab visualizations — kept light for contrast/legibility. |

No drop-shadow language. Depth = canvas switches + surface-luminance shifts.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Hero bands, full-bleed sections, footer. |
| `{rounded.sm}` | 8px | Inline tags, small chips. |
| `{rounded.md}` | 12px | Form inputs, download tiles, lab controls. |
| `{rounded.lg}` | 20px | Feature cards, plan cards, lab panels. |
| `{rounded.xl}` | 28px | Media / mockup containers. |
| `{rounded.full}` | 9999px | Buttons, pills, badges, tabs. |

## Components

### Buttons
- **`button-primary`** — white pill on dark. Bg `{colors.canvas-light}`, label `{colors.canvas-dark}`, `{rounded.full}`, padding `14px 28px`, height 48px. The primary CTA on every dark band.
- **`button-dark`** — dark pill on light. Bg `{colors.canvas-dark}`, label `{colors.on-dark}`, `{rounded.full}`. Used in white bands.
- **`button-soft`** — soft surface CTA. Bg `{colors.surface-soft}`, label `{colors.ink}`, `{rounded.full}`.
- **`button-outline-light`** — white bg, `{colors.ink}` label, 1px `{colors.hairline-strong}`, `{rounded.full}`.
- **`button-outline-dark`** — dark bg, `{colors.on-dark}` label, 1px `{colors.on-dark}`, `{rounded.full}`. Tertiary action on dark bands.
- **`button-text`** — underlined text link, `{colors.ink}` → `{colors.link}` on hover.

### Cards
- **`feature-card-light`** — bg `{colors.surface-card}`, 1px `{colors.hairline-light}`, `{rounded.lg}`, padding 32px. Projects, feature comparisons.
- **`feature-card-dark`** — bg `{colors.surface-elevated}`, text `{colors.on-dark}`, `{rounded.lg}`, padding 32px.
- **`card-featured`** — bg `{colors.primary}`, text `{colors.on-primary}`, `{rounded.lg}`. The single cobalt stamp (hero "now" card).

### Navigation
- **`nav-bar`** — bg `{colors.canvas-dark}`, text `{colors.on-dark}`, height 64px. Left: wordmark. Centre: links. Right: GitHub/X icons + `{component.button-primary}`.

### Signature
- **`badge-tag`** — bg `{colors.surface-soft}`, text `{colors.ink}`, `{rounded.full}`, `4px 12px`.
- **`badge-feature`** — bg `{colors.primary}`, text `{colors.on-primary}`, `{rounded.full}`. "Live", "Most popular".
- **`social-icon`** — 20px monochrome glyph (GitHub, X), `{colors.on-dark-mute}` → `{colors.on-dark}` on hover in dark regions; `{colors.charcoal}` → `{colors.ink}` on light.
- **`footer`** — bg `{colors.canvas-dark}`, text `{colors.on-dark-mute}`, `{rounded.none}`, padding `80px 24px`.

## Do's and Don'ts

### Do
- Switch full bands between `{colors.canvas-dark}` and `{colors.canvas-light}`. The two-mode rhythm is core.
- Use `{component.button-primary}` (white pill on dark) as the loudest action on every dark band.
- Reserve `{colors.primary}` for the featured card and the brand glyph — a deliberate stamp, not a theme.
- Set hero headlines in **Inter Tight 500** with `lineHeight: 1.0` and negative letter-spacing.
- Keep accent colours inside illustrations and the lab only.
- Apply `{rounded.full}` to buttons, `{rounded.lg}` to cards, `{rounded.md}` to inputs.

### Don't
- Don't use accent colours as button surfaces.
- Don't use a near-black canvas — the brand is `#000000`.
- Don't pair white prose with cobalt — `{colors.primary}` is a surface, not body text.
- Don't add drop shadows. Elevation is canvas + surface-luminance.
- Don't introduce a second brand colour. Cobalt is the only stamp.
- Don't loosen display `lineHeight` past 1.0 above 48px.
- Don't bump body Inter to weight 500.

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Desktop | ≥ 1280px | Full grids, max content 1280 (1100 in lab). |
| Tablet | 768–1279px | 4-up → 2-up grids; feature grid 2-up. |
| Mobile | ≤ 767px | All grids 1-up; nav collapses to hamburger; hero `display-xxl` clamps to 48px; band padding → 64px. |

### Touch Targets
- Buttons ship at min 48px tall. Inputs at 56px. Lab pill chips bump to 44px on mobile.

## Known Gaps
- Pressed/active states are documented for buttons only; other components rely on the browser focus ring.
- The lab visualizations are treated as illustration surfaces on **light stages** (`{colors.surface-soft}` / white with hairline borders) for maximum contrast — the accent palette (teal = healthy, danger = overload, cobalt = active) is used freely there for legibility, per the "accents live in illustrations" rule.
- Aeonik Pro is substituted with Inter Tight; swap in the licensed face at display sizes when available.
