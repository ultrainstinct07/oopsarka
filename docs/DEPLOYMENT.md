# Deployment (Vercel)

## 1. Create the project

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository. The framework preset is **Next.js**; keep the default build command (`next build`) and install command.
3. Choose Node.js **24.x** under **Settings → Build and Deployment**. That's the version the site was built and tested with.

The site deploys and works without any environment variables, using the local sample content. To go fully live, set these up first: [SANITY.md](SANITY.md) for content, then [INTEGRATIONS.md](INTEGRATIONS.md) for the forms.

## 2. Environment variables

Every variable is listed with comments in [`.env.example`](../.env.example). Set them under **Settings → Environment Variables**:

| Variable                                                      | Production    | Preview  | Notes                                                     |
| ------------------------------------------------------------- | ------------- | -------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | ✓             | ✓        | Previews then show CMS content too.                       |
| `SANITY_API_READ_TOKEN`                                       | ✓             | ✓        | Viewer token, for draft previews.                         |
| `SANITY_REVALIDATE_SECRET`                                    | ✓             |          | The webhook points at production.                         |
| `BUTTONDOWN_API_KEY`                                          | ✓             | optional | Previews would really subscribe people.                   |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`    | ✓             | optional | Previews would really send email.                         |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`          | ✓             | ✓        |                                                           |
| `RATE_LIMIT_SALT`                                             | ✓             | ✓        | Any long random string.                                   |
| `LEADERBOARD_ENABLED`                                         | `1` if wanted |          | Shared Playroom leaderboard; needs the Upstash variables. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`      | ✓             | **no**   | Tokens are checked against the production hostname.       |
| `NEXT_PUBLIC_VERCEL_ANALYTICS`                                | `1` if wanted |          | Also enable Analytics in the dashboard.                   |

**Leave `NEXT_PUBLIC_SITE_URL` unset.** It defaults to `https://oopsarka.space`, so canonicals, the sitemap, RSS and Open Graph URLs always point at the real domain, even on previews.

Preview deployments are also `noindex` with a `robots.txt` that disallows everything. That's driven by `VERCEL_ENV`, which Vercel sets automatically.

Redeploy after changing variables. `NEXT_PUBLIC_` values and the static pages are built with them.

## 3. Domain

1. Go to **Settings → Domains**, add `oopsarka.space`, then add `www.oopsarka.space`.
2. For `www`, choose **Redirect to `oopsarka.space`** (308). The apex is the canonical domain. `next.config.ts` also redirects `www` → apex as a safety net.
3. At your registrar, create **exactly the records Vercel shows** for each domain: usually an `A` record for the apex and a `CNAME` for `www`. Alternatively, switch the domain's nameservers to Vercel. Vercel issues HTTPS certificates automatically once DNS resolves.
4. Resend's email records (SPF, DKIM and the bounce MX on a subdomain) live alongside these. They don't conflict. See [INTEGRATIONS.md](INTEGRATIONS.md).

> **HSTS.** The site sends `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Browsers that visit will insist on HTTPS for `oopsarka.space` _and every subdomain_ for two years. That's right for this site. But the `preload` directive alone does nothing: submitting the domain to [hstspreload.org](https://hstspreload.org) is a separate, slow-to-undo step. Do it only deliberately.

## 4. Hook up Sanity

Once the production URL works:

- Add `https://oopsarka.space` as a CORS origin with credentials.
- Create the publish webhook pointing to `https://oopsarka.space/api/revalidate`.

Both steps are in [SANITY.md](SANITY.md).

## 5. Post-deploy checks

```bash
curl -sI https://oopsarka.space | grep -iE "^(HTTP|content-security-policy|strict-transport|x-frame|referrer)"
curl -sI https://www.oopsarka.space | grep -iE "^(HTTP|location)"   # 308 → https://oopsarka.space/
curl -s https://oopsarka.space/robots.txt                            # Allow, plus the sitemap URL
curl -s https://oopsarka.space/rss.xml | head -20
```

- **Canonicals.** View the source of a story and check that `<link rel="canonical">` and `og:url` start with `https://oopsarka.space`.
- **Structured data.** Paste a story URL into Google's [Rich Results Test](https://search.google.com/test/rich-results); it should find `BlogPosting` and `BreadcrumbList`. Then submit `https://oopsarka.space/sitemap.xml` in Search Console.
- **Social cards.** Check a story URL in a card preview tool: the image should be the story's generated card, with its title, category and cover.
- **Newsletter.** Subscribe with a real address. You should get Buttondown's confirmation email, and after you click it the address appears as a subscriber.
- **Contact.** Send a message. It should arrive at `CONTACT_TO_EMAIL`, and replying should go to the sender.
- **Webhook.** Publish an edit in the Studio. The webhook's **Attempts** should show `200`, and the change should be live within seconds.
- **Performance.** Run [PageSpeed Insights](https://pagespeed.web.dev) on `/`, a story, `/diary` and `/gallery`, on mobile and desktop. Once there's traffic, it also shows real-visitor (CrUX) data, which matters more than lab scores.
- **End-to-end tests.** `E2E_BASE_URL=https://oopsarka.space npx playwright test` runs the suite against the live site. It expects the sample stories' URLs, so update the slugs in `tests/e2e/` once the content is your own.

## Measured performance (lab)

These are Lighthouse 13.5.0 results with default simulated throttling (mobile: slow 4G, 4× CPU slowdown; desktop preset), using Playwright's Chromium. They were measured on **2026-10-25** against a local `next start` production build, which means HTTP/1.1 with gzip and no CDN. A Vercel deployment (HTTP/2 or 3, Brotli, edge cache) should do at least as well. Re-measure it rather than relying on these numbers.

| Page                                              | Mobile perf                      | Desktop perf               | Accessibility · Best practices · SEO |
| ------------------------------------------------- | -------------------------------- | -------------------------- | ------------------------------------ |
| `/`                                               | 83 (LCP 4.6 s, TBT 80 ms, CLS 0) | 92 (LCP 1.2 s, TBT 180 ms) | 100 · 100 · 100                      |
| `/diary/why-my-human-cant-use-the-bathroom-alone` | 87 (LCP 4.0 s)                   | 100 (LCP 0.8 s)            | 100 · 100 · 100                      |
| `/diary`                                          | 83 (LCP 4.5 s)                   | 99 (LCP 0.9 s)             | 100 · 100 · 100                      |
| `/gallery`                                        | 86 (LCP 4.2 s)                   | 99 (LCP 0.9 s)             | 100 · 100 · 100                      |

**Where the mobile time goes.**

- The hero photo (the LCP element) is preloaded with `fetchpriority="high"`, is discoverable in the HTML, and loaded in about 150 ms locally.
- Most of the remaining simulated LCP comes from main-thread work: React hydrating a deliberately interactive page while the throttled network delivers about 229 KB of gzipped JavaScript.
- FCP is about 1.1 s and CLS is 0.

**What was done to get there.** The first full measurement had mobile `/` at 76 and desktop `/` at 74. Since then:

- These now load only when needed: motion, the dialogs (Base UI), the marquee, the rotating badge, the footer's proximity effect and the lightbox.
- The 3D yarn ball now waits for the first pointer movement on a wide, fine-pointer screen.
- Form validation moved to zod/mini, which saved about 30 KB gzipped.
- The class merger uses project-compiled tables.
- Video posters are lazy images.

**Bundle facts.**

- three.js and react-three-fiber form one 237 KB (gzipped) chunk that never loads on mobile, with reduced motion, or with Save-Data.
- The Sanity Studio's bundle loads only on `/studio`.
- No third-party scripts run on public pages unless Turnstile (on `/contact` only) or Vercel Analytics is enabled.

## Decisions and trade-offs

- **Content Security Policy uses `'unsafe-inline'` for scripts.** Next's bootstrap scripts and the pre-paint theme script are inline. A nonce-based policy would force every page to render on demand instead of being static. Everything else is locked down: `object-src 'none'`, `frame-ancestors 'self'`, and an allowlist for images, media, frames and connections. The Studio has its own looser policy and an `X-Robots-Tag: noindex`.
- **`partialPrefetching: false`** in `next.config.ts`. With it on, unknown story and category URLs would stream a not-found page with a 200 status. Off, they return a real 404. Revisit once Next 17 makes Partial Prefetching the default.
- **`experimental.inlineCss` was tried and not kept.** It removed the render-blocking stylesheet request, but Next inlines the CSS twice (once in a style tag, once in the RSC payload). That took the home page HTML from 41 KB to 93 KB gzipped, for no measurable Lighthouse gain.
- **Image optimisation.** Local images go through Vercel's image optimiser. Sanity images are served directly from Sanity's CDN with a custom loader (AVIF/WebP, crop and hotspot), so they don't count against Vercel's image quota.
- **Rate limiting** falls back to per-instance memory without Upstash. That's adequate for a small blog, but Upstash gives one shared limit.
