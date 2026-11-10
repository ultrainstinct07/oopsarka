# Sanity setup

OopsArka uses [Sanity](https://www.sanity.io) as its CMS. The Studio is part of this app at **`/studio`**, so there is nothing separate to host. Until a project ID is configured, the site runs on the local sample content and `/studio` shows a setup screen.

The free plan is enough. It gives public datasets, which suit a public blog; drafts still require a login to read.

## 1. Create the project

Either use the dashboard at [sanity.io/manage](https://www.sanity.io/manage) (**Create new project**, dataset `production`, public), or use the CLI from this folder:

```bash
npx sanity login
npx sanity projects create "OopsArka" --dataset production --dataset-visibility public
```

Copy the project ID into `.env.local`, which the Sanity CLI also reads:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123de
NEXT_PUBLIC_SANITY_DATASET=production
```

## 2. Allow the site's origins (CORS)

The Studio runs in the browser on your own domain, so Sanity must accept authenticated requests from it:

```bash
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add https://oopsarka.space --credentials
```

Add any other origin you edit from the same way, such as a Vercel preview URL. Avoid wildcard origins with credentials.

## 3. Seed it with the starter content

This uploads the photos, clips, posters and illustrations from `public/`. It then creates the five categories, the tags, both authors, the eleven sample posts (marked as samples), Arka's profile, the gallery and the site settings:

```bash
npx sanity exec scripts/seed-sanity.ts -- --dry-run   # shows what it would write; uploads nothing
npm run seed                                          # the real thing (uses your `sanity login` token)
```

The seed is idempotent. Documents have fixed IDs such as `post-the-3-am-zoomies-incident` and are written with `createOrReplace`, so a second run resets those documents to the sample versions. **Don't re-run it after you've started editing** unless you mean to.

Once seeded, open `http://localhost:3000/studio`, log in, and you'll see:

- **Stories**, newest first
- **Categories**, **Tags** and **Authors**
- **Arka's profile**, **The Arka Files** (the gallery) and **Site settings**. These three are singletons: there is exactly one of each and they can't be deleted.

## 4. Draft previews (Presentation tool)

The Studio's **Presentation** tab shows the real site with your unpublished changes and click-to-edit overlays. It needs a read token on the server:

1. Go to [sanity.io/manage](https://www.sanity.io/manage), then your project, then **API**, then **Tokens**, then **Add API token**. Name it "Next.js preview" and choose the **Viewer** permission.
2. Set it as `SANITY_API_READ_TOKEN` in `.env.local` and in Vercel. Never give it a `NEXT_PUBLIC_` name: it can read drafts.

Presentation turns on Next.js Draft Mode through `/api/draft-mode/enable`. That route verifies Sanity's preview secret, so a random visitor can't turn it on. While Draft Mode is on, pages read drafts and refresh as you edit in Presentation, and a **Draft preview · Exit** button sits in the corner. Public visitors never load any preview code.

## 5. Publish → live site (webhook)

Pages are pre-rendered and cached by content tags. A webhook tells the site which tags to refresh when you publish. Without it, changes still appear, but only after the hourly cache lifetime runs out.

1. Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Set it as `SANITY_REVALIDATE_SECRET` in Vercel (Production), then redeploy.
3. Go to [sanity.io/manage](https://www.sanity.io/manage), then **API**, then **Webhooks**, then **Create webhook**, and fill it in:

| Field       | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| URL         | `https://oopsarka.space/api/revalidate`                                                |
| Dataset     | `production`                                                                           |
| Trigger on  | Create, Update, Delete                                                                 |
| Filter      | `_type in ["post", "category", "tag", "author", "profile", "gallery", "siteSettings"]` |
| Projection  | `{_type, "slug": slug.current}`                                                        |
| HTTP method | POST                                                                                   |
| Drafts      | Off (only published changes)                                                           |
| Secret      | the secret from step 1                                                                 |

The route rejects unsigned requests with 401. It answers 503 if the secret isn't set, and 400 for document types it doesn't know. To test it, publish a small edit and look at the webhook's **Attempts** log in the dashboard; it should show `200` and `{"revalidated":[…]}`.

Which tags each type refreshes is defined in `src/lib/revalidate.ts`. For example, a post refreshes `posts` plus `post:<slug>`, and a category refreshes `categories` and `posts`.

## 6. After changing the schema or queries

```bash
npm run typegen      # schema extract + TypeGen → src/sanity/sanity.types.ts
npm run typecheck
```

Schemas live in `src/sanity/schemaTypes/`, GROQ queries in `src/sanity/queries.ts`, and the mapping to the site's own types in `src/lib/content/source-sanity.ts`. Components never see raw Sanity data, so a schema change only touches the mapping.

## How content gets to the page

- `src/lib/content/index.ts` is the only door. Each read is `'use cache'` + `cacheTag(...)` + `cacheLife('hours')`.
- The source is chosen automatically. When `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, content comes from Sanity; otherwise from `src/content/local/`.
- Published content uses the `published` perspective, so drafts never reach pages, the sitemap, RSS or search.
- Posts with a future **Published** date stay hidden until that time, checked when the hourly cache refreshes. Draft Mode shows them early.

## Troubleshooting

- **The Studio says "unconfigured" or the setup screen shows.** `NEXT_PUBLIC_SANITY_PROJECT_ID` isn't set for that environment. Set it, then redeploy, because `NEXT_PUBLIC_` values are inlined at build time.
- **The Studio shows a CORS error when logging in.** Add that exact origin with `--credentials` (step 2).
- **The site is empty after connecting Sanity.** The dataset has no posts yet. Run the seed (step 3), or publish a story.
- **Documents exist in the Studio but not on the site.** Check their IDs. Sanity treats any ID containing a `.` (such as `post.my-story`) as private, readable only with a token, so the site's anonymous client can't see it even in a public dataset. Use `-` instead.
- **The browser console reports CSP blocks inside the Studio.** The Studio has its own policy in `security-headers.ts` (`studioSecurityHeaders`). Allow the reported Sanity origin there. Without a live project, only the unconfigured Studio could be tested, so this may need a tweak once connected.
