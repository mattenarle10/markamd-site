# markamd-site

landing page for [**marka.md**](https://github.com/mattenarle10/markamd) — a local macos markdown editor for the notes you share with ai.

**live:** https://markamd.vercel.app

## stack

- **astro 6** static-first; renders to plain html with island JS only where needed
- **tailwind v4** utility classes via `@tailwindcss/vite`
- **gsap + ScrollTrigger** for the scroll-scrubbed typewriter + hero orb parallax
- **lenis** smooth scroll, fed into GSAP via `motion.ts`
- **astro-icon** with `@iconify-json/lucide` + `@iconify-json/simple-icons` (apple + github marks)
- **@vercel/analytics** real-user metrics in production
- **bun** package manager + node 24 (`.nvmrc`)

## scripts

```sh
bun install
bun dev                # local dev server at http://localhost:4321
bun build              # static build to ./dist
bun preview            # serve the production build locally
bunx astro check       # type-check .astro + .ts files
```

## architecture notes

- **version + download url** fetched at build-time from the github releases api (`src/lib/version.ts`) — uses `/releases?per_page=1` so prereleases are included. falls back to the releases-page url if the api errors.
- after each `tauri-action` ships a new release, push an empty commit to this repo (`chore: force rebuild — pick up vX.Y.Z release artifact`) to trigger a vercel rebuild that picks up the new version + download url.
- **alias drift:** vercel doesn't always auto-alias `markamd.vercel.app` to the latest deploy on the betterbacolods scope. if the site shows a stale version after a rebuild, run `bunx vercel alias set <new-deploy-url> markamd.vercel.app`.
- **reduced-motion** guards: every scroll-driven script in `src/scripts/` checks `prefers-reduced-motion` before binding gsap timelines.
- **structure:**
  - `src/pages/index.astro` — hero, screen, keys, features, install, footer
  - `src/pages/privacy.astro` — privacy disclosure
  - `src/components/icons/` — wrapped iconify components
  - `src/layouts/Layout.astro` — `<head>` (meta, og, gsc verification, analytics)
  - `src/scripts/` — gsap timelines (typewriter, word-reveal, hero-ambient, motion)
  - `src/styles/global.css` — design tokens, base type, caret animation

## seo / analytics

- google search console: verified via `public/google634cdc7488eb03f9.html`
- vercel analytics injected from `Layout.astro` in production builds only
- `og:image` points at `/mascot/logo.png` for social cards

## license

mit · matt enarle ([@mattenarle10](https://github.com/mattenarle10))
