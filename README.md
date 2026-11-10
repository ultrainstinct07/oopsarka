# OopsArka

**A tiny Persian cat. A giant personality. An endless supply of oops moments.**

The source for [oopsarka.space](https://oopsarka.space): a playful-editorial blog about Arka, a fluffy Persian cat. It has a real blog engine behind it: Sanity CMS, search, archives, a gallery, forms that tell the truth, feeds, structured data and tests.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No accounts or keys are needed to start. With no Sanity project configured, the site runs on the **local sample content** in `src/content/local/`, and a small banner says so in development. The forms say honestly that they aren't connected yet. `/studio` shows a setup screen until a Sanity project ID exists.

To go live, work through these in order:

1. [docs/SANITY.md](docs/SANITY.md): create the Sanity project, seed it with the sample content, set up preview and the publish webhook.
2. [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md): Buttondown (newsletter), Resend (contact form), and the optional Upstash, Turnstile and Vercel Analytics.
3. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Vercel, the domain, DNS, and post-deploy checks.
4. [docs/CONTENT.md](docs/CONTENT.md): writing stories, adding photos and clips, replacing the sample content.

[docs/DESIGN.md](docs/DESIGN.md) describes the design system. [`.env.example`](.env.example) lists every environment variable.

## Scripts

| Script                            | What it does                                                                                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Development server (Turbopack).                                                                                                                                                                                                                       |
| `npm run build` / `npm start`     | Production build / serve it.                                                                                                                                                                                                                          |
| `npm run lint`                    | ESLint (flat config, `eslint-config-next`).                                                                                                                                                                                                           |
| `npm run typecheck`               | `next typegen` (route types), then `tsc --noEmit`.                                                                                                                                                                                                    |
| `npm run format` / `format:check` | Prettier, with Tailwind class sorting.                                                                                                                                                                                                                |
| `npm test`                        | Unit tests (Vitest): content layer, search, forms and integrations, SEO output, colour contrast, class merging.                                                                                                                                       |
| `npm run test:e2e`                | Playwright against a production build on port 3200: desktop and Pixel 7, axe accessibility checks in both themes, link crawl, overflow, reduced motion, SEO and feeds. Run `npm run build` first. Set `E2E_BASE_URL` to test a deployed site instead. |
| `npm run typegen`                 | Extract the Sanity schema, then regenerate `src/sanity/sanity.types.ts` from the GROQ queries.                                                                                                                                                        |
| `npm run seed`                    | Upload the sample content and media to your Sanity dataset (see docs/SANITY.md).                                                                                                                                                                      |
| `npm run cn`                      | Regenerate `src/lib/cn-tables.ts`, the class-merge tables. `next dev`/`next build` also do this automatically.                                                                                                                                        |
| `npm run media`                   | Rebuild the web copies of the photos and clips in `Photos/` (needs ffmpeg: set `FFMPEG_PATH`, or have `ffmpeg` on `PATH`).                                                                                                                            |

## Project structure

```
Photos/                    The original photos and clips. Never modified; the media script reads from here.
public/images/arka/        Web copies of the photos, plus video posters and stills
public/media/arka/         Web copies of the clips (audio removed, caption cropped out)
public/images/illustrations/  Original riso-style SVG covers for stories without a photo
src/app/                   Routes (App Router)
  (site)/                  The public site: home, diary, categories, tags, about, gallery, search, contact, newsletter, legal pages, and the Playroom mini games at /play
  studio/                  Embedded Sanity Studio at /studio
  api/                     Sanity webhook (/api/revalidate) and Draft Mode for previews
  rss.xml, sitemap.ts, robots.ts, opengraph-image.tsx, search-index.json, manifest.ts
src/components/            home/, article/, story/, gallery/, search/, forms/, layout/, media/, fx/ (motion and 3D), ui/
src/lib/content/           The content facade (cached, tagged), domain types, search, pagination
src/lib/integrations/      Buttondown, Resend, Turnstile, rate limiting (server only)
src/lib/seo/               Metadata, JSON-LD, RSS, OG image rendering
src/content/local/         Sample content used when Sanity isn't configured
src/sanity/                Schemas, Studio structure, queries, client, generated types
scripts/                   process-media.mjs, seed-sanity.ts
tests/unit, tests/e2e      Vitest and Playwright
docs/                      Setup and editorial guides
```

All pages read content through `src/lib/content` only. That layer returns the same domain types whether the data comes from Sanity or from the local fixtures, and every read is cached with `'use cache'` plus cache tags. The Sanity webhook refreshes exactly the tags a publish touches.

## Stack

- **Next.js 16.4** (App Router, Turbopack, Cache Components, typed routes) and **React 19.3** (stable `<ViewTransition>`).
- **TypeScript 6.0.3**, pinned because typescript-eslint doesn't support 6.1+ yet.
- **Tailwind CSS 4.3**, with shadcn/ui on **Base UI** primitives (dialogs, autocomplete) and **lucide-react** icons.
- **Sanity Studio v6** + next-sanity 13: Portable Text, image CDN with hotspots, Presentation tool previews, TypeGen.
- **Motion 14** for the few JavaScript animations; most motion is CSS (scroll-driven reveals, the reading-progress bar).
- **three 0.182 + @react-three/fiber 9.8** for the one 3D object, the yarn ball. It loads only on wide screens with a fine pointer, motion allowed and no Save-Data, after the first pointer movement. three is held at 0.182 because r183+ deprecates `THREE.Clock`, which R3F 9.8 still uses (console warning).
- **MiniSearch** for site search, **zod/mini** for form validation shared by browser and server, **Buttondown** and **Resend** for email, **@upstash/ratelimit** optional.
- Fonts are self-hosted: Fraunces (custom variable subsets, see `src/app/fonts/OFL.txt`), Manrope and Kalam.

Dependencies are pinned exactly (`.npmrc`: `save-exact=true`).

### Credits

- Adapted from [React Bits](https://reactbits.dev) by David Haz (MIT + Commons Clause): `VariableProximity`, `Magnet`, `CircularText`, `ScrollVelocity`. Each file keeps its attribution header and notes its changes.
- `HoverImageList` is adapted from [SmoothUI](https://smoothui.dev) (MIT).
- Cover illustrations, doodles and the cat-ear frame are original to this project.
- Every photo and clip shows Arka himself. The site never presents stock or AI-generated cats as Arka.
