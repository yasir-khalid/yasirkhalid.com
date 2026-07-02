# Design Guide - yasirkhalid.com

## Copy Conventions

- **No em dashes (U+2014) anywhere on the site.** Not in copy, JSX, metadata titles, comments, or documentation. Use a regular hyphen (-) where a dash is needed, or rephrase. This is a hard rule - violations must be fixed before merging.

## Overview

This site's visual language is a faithful reskin of the real **fin.ai**
marketing site (checked live with a browser, not a generic "Fin/Intercom
brand" guess). fin.ai's actual homepage runs **cream/off-white end to end -
there is no dark band anywhere on it.** An earlier pass of this reskin
carried over the previous design's alternating dark/light bands, which does
not match the real site and was corrected. Emphasis panels (stats, the
closing CTA, customer quotes) use a **corner-tick registration-mark frame**
instead of ever switching to a dark canvas - that's fin.ai's actual device
for creating visual weight. Display headlines run in a **light serif**
(fin.ai's custom "Serrif" face; this site substitutes the free **Fraunces**),
set at `lineHeight: 1.0` with tight negative tracking. Body copy stays in
**Inter**. **Orange (`#FF5600`)** is fin.ai's single accent - used scarcely,
as a highlighter behind text, a chart/icon tint, or a big stat number,
**never** as a button fill. The dominant button/surface color is solid
off-black ink on the cream canvas - not the accent.

**Key Characteristics:**
- **Single cream canvas** (`{colors.canvas-light}` `#FAF9F6`) - the whole
  site, hero through footer. No full-bleed dark bands on the homepage or
  resume page (fin.ai's real homepage has none).
- **Corner-tick frame** (`.tick-frame` / `<CornerTicks />`) is the emphasis
  device fin.ai actually uses in place of a dark canvas: a soft-surface
  panel with four small square registration marks at its corners. Used for
  stat panels, the closing CTA, and quote cards.
- Display type is a **light serif** (Fraunces, standing in for fin.ai's
  Serrif) at 20-100px+, `lineHeight: 1.0`, tight negative letter-spacing.
  Hero headline runs at `font-weight: 300` for the true ultralight feel.
- The primary CTA (`{component.button-primary}`) is a **solid off-black
  pill**, 6px radius - not the accent color. This matches fin.ai's real
  "View demo" button exactly (measured 4-6px radius, not full pill).
- **Orange (`{colors.primary}` `#FF5600`)** is the single scarce accent -
  reserved for the quote-card highlighter mark, big stat numbers, chart
  fills, and icon tints. Orange **never carries white text** - pair it with
  `{colors.ink}` (`#111111`), same as the WHOOP-style pull-quote reference.
- The dark navy token (`{colors.canvas-dark}` `#020917`) is kept in
  `globals.css` for parity with fin.ai's interior pages (e.g. their
  `/customers` page has a dark video hero) but is **not used** as a section
  background on this site's homepage/resume - only as `--near-black` for
  small dark chips/badges inside lab illustrations, which is a different,
  legitimate use.
- No drop shadows. Depth comes from surface-luminance shifts and hairline
  borders/corner-tick frames, never a canvas-color switch.

## Colors

Measured directly off the live fin.ai site (devtools computed styles), not
guessed from brand-adjacent SaaS conventions.

### Brand & Accent
- **Fin Orange** (`{colors.primary}` - `#FF5600`): the one accent. Used as a
  highlighter mark behind quote text, icon tints at low opacity, and small
  badges - always paired with dark text, never white.
- **Orange Bright** (`{colors.primary-bright}` - `#FF6B1A`): hover state.
- **Orange Deep** (`{colors.primary-deep}` - `#D94800`): active/pressed.
- **On-Primary** (`{colors.on-primary}` - `#111111`): text on orange surfaces.

### Surface
- **Canvas Light** (`{colors.canvas-light}` - `#FAF9F6`): warm off-white, the
  default page background (fin.ai's measured `bg-off-white`).
- **Canvas Dark** (`{colors.canvas-dark}` - `#020917`): the storytelling
  canvas - near-black navy, not pure `#000000`.
- **Surface Soft** (`{colors.surface-soft}` - `#F4F3EC`): inset cards/bands
  inside light regions (quote-card background).
- **Surface Card** (`{colors.surface-card}` - `#ffffff`): pure white card
  surface floating on the cream canvas.
- **Surface Elevated** (`{colors.surface-elevated}` - `#10141f`): lifted
  panels on the dark canvas (AgentConsole mockup, lab dark panels).
- **Hairline Light** (`{colors.hairline-light}` - `#E7E3DB`): warm 1px
  dividers in light bands.
- **Hairline Strong** (`{colors.hairline-strong}` - `#D3CEC6`): structural
  dividers, quote-card corner ticks.
- **Hairline Dark** (`{colors.hairline-dark}` - `rgba(255,255,255,0.12)`):
  dividers in dark regions.

### Text
- **Ink** (`{colors.ink}` - `#111111`): primary text/headings - warm
  off-black, not pure black.
- **Body** (`{colors.body}` - `#313130`): long-form body, warm charcoal.
- **Mute** (`{colors.mute}` - `#626260`): supporting text.
- **Stone** (`{colors.stone}` - `#8d8a83`): metadata, timestamps.
- **Faint** (`{colors.faint}` - `#D3CEC6`): disabled foreground.
- **On-Dark** (`{colors.on-dark}` - `#ffffff`): text on the dark canvas.
- **On-Dark Mute** (`{colors.on-dark-mute}` - `rgba(255,255,255,0.72)`):
  secondary text on dark.

### Semantic / Illustration (lab & mockups only)
Unchanged from before - these are functional, not brand-name-specific:
- **Accent Teal** (`#00a87e`): healthy/positive state in mockups & lab.
- **Accent Warning** (`#ec7e00`), **Accent Danger** (`#e23b4a`): pending /
  overload states.
- **Link** (`{colors.link}` - `#376cd5`): default inline link color.

## Typography

### Font Family
- **Fraunces** - display sizes, weight 300 (hero) to 500 (smaller headings).
  Stand-in for fin.ai's custom "Serrif" - shares the light, warm serif
  character with tight negative tracking at large sizes.
- **Inter** - body, captions, metadata, nav.
- **IBM Plex Mono** - technical labels, mono tags, lab trace readouts.

### Principles
- Display sizes run `lineHeight: 1.0`-`1.08`, negative letter-spacing
  (`-0.01em` to `-0.02em`, scaling up at larger sizes).
- The homepage hero headline is the one place that goes `font-weight: 300`
  for the true fin.ai ultralight serif read; other display/heading text sits
  at 400.
- Never bump body Inter past weight 400/600 - matches fin.ai's plain,
  unstyled nav/body type.

## Layout

- Max content width 720-1040px depending on section (unchanged from the
  single-column read layout).
- Band padding: 80-120px vertical on desktop, tighter on mobile.
- Hairline dividers replace shadow throughout.

## Shapes

fin.ai's real buttons measure **4-6px radius**, not full pills - a subtler
geometry than most "SaaS pill" references. Cards read considerably rounder
(bento/quote-card feel).

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 6px | Buttons, inputs, small chips - measured off fin.ai. |
| `{rounded.md}` | 12px | Panels, lab controls. |
| `{rounded.lg}` | 20px | Feature cards, quote card, bento cards. |
| `{rounded.xl}` | 28px | Media/mockup containers. |
| `{rounded.full}` | 9999px | Avatars, dots, badges only - not buttons. |

## Components

### Buttons
- **`button-primary`** - solid off-black (`{colors.ink}`) fill, white label,
  6px radius, 44px+ min height. The loudest action anywhere on the page.
  **Never orange** - orange is not a button-fill color on the real site.
- **`button-outline-light`** - white bg, ink label, hairline border. The
  standard secondary button (the whole site is the light canvas now).
- **`button-dark`** / **`button-outline-dark`** - kept in `globals.css` for
  any future dark-canvas use (e.g. an interior page mirroring fin.ai's
  `/customers` video hero) but not used anywhere on this site today.

### Signature: corner-tick frame
`.tick-frame` + `<CornerTicks />` (`components/CornerTicks.tsx`) is fin.ai's
real device for emphasis - a soft-surface panel (`{colors.surface-soft}`)
with four small square registration marks at its corners, used in place of
ever switching to a dark canvas. Applied to: the testimonial quote
(`.quote-card`, `components/TestimonialCard.tsx`), the closing contact CTA,
and the agentic-AI/impact stat panels on the resume page. The quote card
additionally runs one phrase through an **orange highlighter** span
(`.quote-mark` - orange background, ink text, never a solid badge).

### Cards
- **`feature-card-light`** - `{colors.surface-card}` bg, hairline border,
  20px radius. Build/project cards.
- **`card-featured`** - orange bg, ink text. The single accent stamp.

## Do's and Don'ts

### Do
- Keep the **entire site on the cream canvas** - hero through footer, on
  every page. This is what fin.ai's real homepage actually does.
- Use the corner-tick frame (`.tick-frame`) for panels that need visual
  weight - stats, the closing CTA, quote cards - instead of a dark band.
- Use solid off-black as the loudest button color everywhere.
- Reserve orange for the quote-card highlight, big stat numbers, chart
  fills, and icon tints - a deliberate, scarce stamp.
- Pair orange with `{colors.ink}` text, never white.
- Set hero headlines in Fraunces at weight 300 with `lineHeight: 1.0`.

### Don't
- Don't reintroduce full-bleed dark bands on the homepage or resume page -
  the real fin.ai homepage has none; this was tried once and reverted.
- Don't use orange as a button surface.
- Don't use pure white for the light canvas - it's `#FAF9F6`.
- Don't put white text on orange.
- Don't make buttons full pills - fin.ai's real radius is 4-6px.
- Don't add drop shadows.

## Known Gaps
- The lab (`/lab`) stays a self-contained, deliberately light illustration
  surface independent of this reskin - see `CLAUDE.md`. Its own accent
  palette (teal/danger/orange-as-active) is untouched.
- `TestimonialCard` content is placeholder text/initials-avatar, not a real
  customer quote or photo.
