# Yasir Khalid - Portfolio

A portfolio for an AI engineer, built with **Next.js 15 (App Router)** and **Tailwind CSS v4**, plus an interactive learning lab at `/lab`. The design follows a **Revolut-style two-mode canvas** (see [`DESIGN.md`](./DESIGN.md)): true-black storytelling bands alternating with white catalogue bands, **Inter Tight 500** display type with tight negative tracking, **Inter** body, a scarce **cobalt-violet** (`#494fdf`) brand stamp, pill-shaped buttons (white-on-black primary CTA), and flat depth via canvas + surface-luminance shifts - no drop shadows.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) - Next.js is auto-detected, no config needed.
3. Or from the CLI: `npm i -g vercel && vercel`.

## Structure

- `DESIGN.md` - the design guide (tokens, typography, components, do's & don'ts).
- `app/page.tsx` - all page sections (hero, pillars, experience, projects, metrics, skills, contact, footer).
- `app/globals.css` - design tokens + utility classes (canvas modes, pill buttons, typography, cards, lab animations).
- `app/lab/` - the interactive lab: `page.tsx` gallery + one route per explainer.
- `components/Nav.tsx` - sticky dark nav with mobile menu and social icons.
- `components/icons.tsx` - GitHub / X / LinkedIn / email glyphs.
- `components/lab/` - lab shell, shared controls (`ui.tsx`), and one component per explainer.
- `components/Reveal.tsx` - scroll-reveal wrapper.
- `lib/content.ts` - all CV content in one place; `lib/lab.ts` - the lab registry.
