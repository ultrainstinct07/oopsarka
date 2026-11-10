<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## OopsArka project notes

- **Commands:** `npm run dev`, `build`, `lint`, `typecheck`, `test` (Vitest), `test:e2e` (Playwright on port 3200 against `next start`; build first), `typegen` (Sanity), `cn` (class-merge tables), `media`, `seed`.
- **Content access:** components never fetch data themselves. Everything goes through `src/lib/content/index.ts`, which is `'use cache'` + `cacheTag` + `cacheLife('hours')`.
  - When you add a read, tag it, and map the tag in `src/lib/revalidate.ts` so the Sanity webhook refreshes it.
  - `source-local.ts` and `source-sanity.ts` must return the same domain types (`src/lib/content/types.ts`).
- **Cache Components rules:**
  - No `export const dynamic`.
  - Read `searchParams`, `cookies()` and `connection()` inside `<Suspense>`.
  - Call `new Date()` only inside cached functions.
  - `generateStaticParams` must return at least one entry; placeholders `notFound()`.
- **Class merging:** `cn` (in `@/lib/utils`) uses tables compiled from `globals.css` by `cn build` (`src/lib/cn-tables.ts`, generated; refreshed by `withCn` on dev/build). Custom theme tokens such as `text-lede` merge correctly only because of this.
- **Keep the initial bundle lean:**
  - Use `zod/mini`, not `zod`, in anything the browser loads.
  - Keep motion, Base UI dialogs, the React Bits effects and three.js behind `lazy()`/`dynamic()` and their existing gates.
- **Pinned on purpose:**
  - `three`/`@types/three` 0.182.0, because r183+ deprecates `THREE.Clock` and R3F 9.8 warns.
  - TypeScript 6.0.3 (typescript-eslint support) and ESLint 9.
  - `npx shadcn add @react-bits/...` downgrades `motion` to 12.x, so re-pin `motion@14.3.0` afterwards.
- **Honesty rules from the brief:**
  - Never show "subscribed" or "sent" without the provider's confirmation.
  - Never invent photos of Arka, social URLs, his favourites, or details about his human.
  - Sample posts carry `sample: true` and a visible label.
  - Structured data carries no ratings or SearchAction.
- **Media:** `Photos/` holds the untouched originals. `npm run media` rebuilds `public/images/arka` and `public/media/arka`, stripping audio and cropping the burned-in caption.
- **Windows:** after rebuilding, stop any old `next start` on 3100/3200 first. A stale server serves old asset hashes, so pages render unstyled.
- **Scroll reveals:** add `data-reveal` (`up`, `pop`, `left`, `right`, `fade`) to an element, or `data-reveal-stagger` to a group. Don't put it on above-the-fold headings or the LCP image, since it starts them at opacity 0.
- **Local content while `.env.local` points at Sanity:** run builds and tests with `NEXT_PUBLIC_SANITY_PROJECT_ID=` (empty) to use the sample content the E2E suite expects.
