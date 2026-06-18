# Yasir Khalid — Portfolio

A single-page portfolio (plus **The Lab** — interactive CS/systems explainers) for an AI engineer, built with **Next.js 15 (App Router)** and **Tailwind CSS v4**. The design follows an **Airtable-style editorial system**: white canvas, near-black ink type, generous whitespace, and full-bleed **signature surface cards** (coral / forest / cream / dark navy) for brand voltage — flat depth, color-block first, no gradients. Type is Inter at modest weights (400 display / 500 sub-titles & buttons); the primary CTA is a near-black 12px-radius button. See **[DESIGN.md](./DESIGN.md)** for the full system.

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
2. Import it at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected, no config needed.
3. Or from the CLI: `npm i -g vercel && vercel`.

## Structure

- `app/page.tsx` — all page sections (hero, summary, experience, projects, skills, speaking, education, contact, footer).
- `app/globals.css` — design tokens + utility classes (mesh gradient, elevation, buttons, typography).
- `components/Nav.tsx` — sticky nav with mobile menu.
- `components/Reveal.tsx` — scroll-reveal wrapper.
- `lib/content.ts` — all CV content in one place; edit here to update the site.
