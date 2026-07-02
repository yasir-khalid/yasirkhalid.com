# Design Guide - yasirkhalid.com

## Copy Conventions

- **No em dashes (U+2014) anywhere on the site.** Not in copy, JSX, metadata titles, comments, or documentation. Use a regular hyphen (-) where a dash is needed, or rephrase. This is a hard rule - violations must be fixed before merging.

## Overview

This site's visual language is a faithful reskin of the real **fin.ai**
marketing site (checked live, not a generic "Fin/Intercom brand" guess): a
**warm off-white canvas** hosting most content, with full-bleed **dark
navy-black bands** for the hero, builds list, and closing CTA - the same
two-mode rhythm as before, just re-hued. Display headlines run in a **light
serif** (fin.ai's custom "Serrif" face; this site substitutes the free
**Fraunces**), set at `lineHeight: 1.0` with tight negative tracking. Body
copy stays in **Inter**. **Orange (`#FF5600`)** is fin.ai's single accent -
used scarcely, as a highlighter behind text and small icon tints, **never**
as a button fill. The dominant button/surface color is off-black ink on the
cream canvas, or white on the dark canvas - not the accent.

**Key Characteristics:**
- Two-mode canvas - warm off-white (`{colors.canvas-light}` `#FAF9F6`) for
  browsing, dark navy-black (`{colors.canvas-dark}` `#020917`) for
  storytelling - switched in full-bleed bands.
- Display type is a **light serif** (Fraunces, standing in for fin.ai's
  Serrif) at 20-100px+, `lineHeight: 1.0`, tight negative letter-spacing.
  Hero headline runs at `font-weight: 300` for the true ultralight feel.
- The primary CTA (`{component.button-primary}`) is a **solid off-black
  pill**, 6px radius - not the accent color. This matches fin.ai's real
  "View demo" button exactly (measured 4-6px radius, not full pill).
- **Orange (`{colors.primary}` `#FF5600`)** is the single scarce accent -
  reserved for the quote-card highlighter mark, icon tints, and the odd
  small badge. Orange **never carries white text** - pair it with
  `{colors.ink}` (`#111111`), same as the WHOOP-style pull-quote reference.
- No drop shadows. Depth comes from canvas + surface-luminance shifts and
  hairline borders.

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
  6px radius, 44px+ min height. The loudest action on every canvas. **Never
  orange** - orange is not a button-fill color on the real site.
- **`button-dark`** - same off-black fill, used on the light canvas.
- **`button-outline-dark`** - transparent, white border/text, for secondary
  actions on the dark canvas.
- **`button-outline-light`** - white bg, ink label, hairline border, on the
  light canvas.

### Signature: quote card
The corner-registration-mark pull-quote (`.quote-card` in `globals.css`,
component in `components/TestimonialCard.tsx`) is fin.ai's customer-story
signature surface: a soft-surface card with four small corner tick marks, a
serif quote with one phrase run through an **orange highlighter** span
(`.quote-mark` - orange background, ink text, never a solid badge), a
headshot, name, and role. Content in `lib/content.ts` (`testimonial`) is
placeholder - swap in a real quote/name/photo when available.

### Cards
- **`feature-card-light`** - `{colors.surface-card}` bg, hairline border,
  20px radius.
- **`feature-card-dark`** - `{colors.surface-elevated}` bg, on the dark
  canvas.
- **`card-featured`** - orange bg, ink text. The single accent stamp.

## Do's and Don'ts

### Do
- Keep the two-mode canvas rhythm - cream for browsing, dark navy for
  storytelling - switched in full-bleed bands.
- Use solid off-black as the loudest action color on every band.
- Reserve orange for the quote-card highlight, icon tints, and the odd
  badge - a deliberate, scarce stamp.
- Pair orange with `{colors.ink}` text, never white.
- Set hero headlines in Fraunces at weight 300 with `lineHeight: 1.0`.

### Don't
- Don't use orange as a button surface.
- Don't use pure `#000000` for the dark canvas - it's `#020917`.
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
