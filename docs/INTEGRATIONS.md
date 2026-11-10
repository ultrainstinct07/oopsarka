# Integrations

Each integration switches on when its environment variables are set, and stays honestly off when they aren't:

- **Nothing pretends.** The site never says "subscribed" or "message sent" unless the provider confirmed it.
- **Secrets stay on the server.** They are read only in `src/lib/integrations/config.ts`, which is `server-only`. None of them use a `NEXT_PUBLIC_` name, except the Turnstile _site_ key, which is public by design.
- **The privacy policy follows the config.** `/privacy` is generated from what is actually enabled (`activeServices()`), so it never mentions a service you don't use, or leaves out one you do.

After changing environment variables in Vercel, **redeploy**. `NEXT_PUBLIC_` values and the static pages, the privacy policy included, are built with them.

| Feature                          | Variables                                                  | When missing                                                                                                                           |
| -------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Newsletter (Buttondown)          | `BUTTONDOWN_API_KEY`                                       | Production shows "the newsletter opens soon, follow along via RSS" and collects nothing. Development shows the form with a setup note. |
| Contact form (Resend)            | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | The form explains it isn't connected yet and says nothing was sent.                                                                    |
| Shared rate limits (Upstash)     | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`       | Falls back to an in-memory limiter, which only applies per server instance.                                                            |
| Bot check (Cloudflare Turnstile) | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`   | Honeypot, time-trap and rate limits still apply.                                                                                       |
| Analytics (Vercel)               | `NEXT_PUBLIC_VERCEL_ANALYTICS=1`                           | No analytics script at all.                                                                                                            |
| Shared Playroom leaderboard      | `LEADERBOARD_ENABLED=1`, plus the two Upstash variables    | Players get a leaderboard kept in their own browser only.                                                                              |
| Rate-limit key salt              | `RATE_LIMIT_SALT`                                          | A built-in default salt. Set your own random value in production.                                                                      |

Both forms are Server Actions that also work without JavaScript. Every submission goes through the same checks, in this order:

1. A hidden honeypot field.
2. A minimum fill time of 2.5 s.
3. Server-side validation, using the same zod rules the browser uses for instant feedback.
4. The rate limit.
5. Turnstile, if it's configured.

## Newsletter: Buttondown

1. Create the newsletter at [buttondown.com](https://buttondown.com). Then, under **Settings**:
   - Keep **double opt-in** on (it's the default).
   - Set the sender name and the confirmation email text.
2. Copy the API key from **Settings → API**. Set it as `BUTTONDOWN_API_KEY` in `.env.local` and Vercel, then redeploy.

What the site does:

- It calls `POST https://api.buttondown.com/v1/subscribers` with `Authorization: Token …` and a pinned `X-API-Version: 2026-04-01`.
- It sends only `{ email_address, tags: ["website"] }`. It never sends `type: "regular"`, so Buttondown always emails a confirmation link first. The visitor's IP is not sent.
- **Success means "check your inbox to confirm".** The subscription isn't active until they click.
- An address already on the list gets a friendly "you're already on the list". An invalid address gets a field error. Any other response is shown as a retryable failure, never as success.
- The consent checkbox is required. Its wording, and the privacy note under the form, are in `src/components/forms/newsletter-form.tsx`.

## Contact form: Resend

1. Create an account at [resend.com](https://resend.com) and add your domain under **Domains** (`oopsarka.space`, or a sending subdomain such as `mail.oopsarka.space`).
2. Add the DNS records Resend shows you (SPF, DKIM and the bounce MX) at your DNS provider, then wait until the domain says **Verified**.
3. Create an API key with **Sending access** only, restricted to that domain. Then set:

```bash
RESEND_API_KEY=re_…
CONTACT_TO_EMAIL=you@example.com                   # your inbox, where messages arrive
CONTACT_FROM_EMAIL="OopsArka <hello@oopsarka.space>" # must be on the verified domain
```

What the site does:

- It sends a plain-text email to `CONTACT_TO_EMAIL` with the subject `[OopsArka] <their subject>`.
- `Reply-To` is set to the visitor's address, so you can answer straight from your inbox.
- An idempotency key derived from the message means a double-submit can't send twice.
- **Success is shown only when Resend returns a message ID.** Errors, timeouts and missing configuration all say plainly that nothing was sent.
- Limits: name 2–80 characters, subject 3–120, message 20–5,000. Five messages per hour per visitor.

## Rate limiting: Upstash (optional, recommended in production)

Serverless functions don't share memory, so the built-in limiter only limits per instance. For a real shared limit:

1. Create a Redis database. Either use Vercel's **Storage** tab (Upstash integration), which sets the variables for you, or [console.upstash.com](https://console.upstash.com).
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

The limits are 5 newsletter sign-ups per 10 minutes and 5 contact messages per hour, per visitor. The key is a salted SHA-256 of the IP address (`RATE_LIMIT_SALT`). Raw IPs are never stored by the app.

## Playroom leaderboard (optional)

Every game in the Playroom has a leaderboard. After a round the player can put a name to their score.

- **"This device" always works.** Scores and the last name used are kept in the player's own browser and never sent anywhere. No setup.
- **The shared board ("Everyone") is opt-in.** It shows names typed by visitors to everyone, so it stays off until you choose it:
  1. Set up Upstash Redis as described above.
  2. Set `LEADERBOARD_ENABLED=1`, then redeploy. The privacy policy then describes it.

What the site does with a shared score:

- It stores only the name, the score and the time, in one Redis sorted set per game (`oopsarka:leaderboard:knock`, `…:pairs`, `…:zoomies`), trimmed to the best 50. No IP address or other identifier is stored with it.
- The server checks everything again: the game must exist, the score must be possible for that game, and the name is limited to 16 letters, numbers, spaces and `. _ ' ! -`. Names are shown as plain text.
- Saves are limited to 15 per 10 minutes per visitor.
- The page only says "saved to the leaderboard" after Redis confirms it. If the save fails, the player is told, and the score stays on their device.

Two things to know before switching it on:

- **Scores are reported by the player's browser.** The server rejects impossible values, but someone determined can submit a made-up score within the allowed range. Treat it as a for-fun board, not a competition.
- **Names are public and not moderated.** The character rules stop links and markup, not rude words. To remove an entry, open the database in the Upstash console, find the key for that game and delete the member; to clear a board, delete the key. Setting `LEADERBOARD_ENABLED` to anything other than `1` and redeploying hides the shared board without deleting it.

## Bot check: Cloudflare Turnstile (optional)

1. In the Cloudflare dashboard, go to **Turnstile** and **Add widget**. Add the hostname `oopsarka.space`; add `localhost` too if you want to test locally. Mode: Managed.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Set both, or neither.

The widget script loads only on `/contact`, and the Content Security Policy allows `challenges.cloudflare.com` only when the site key is set. The server verifies every token with Cloudflare and checks that the token's hostname is the production domain or `localhost`.

Because of that hostname check, **set these keys for the Production environment only**. Otherwise the contact form on Vercel preview URLs would reject every message.

## Analytics: Vercel Web Analytics (optional)

1. In Vercel, open your project, go to **Analytics**, and **Enable**.
2. Set `NEXT_PUBLIC_VERCEL_ANALYTICS=1`, then redeploy.

This renders Vercel's cookieless page-view script on the public site only, never in the Studio. `/privacy` then names it. There are no other analytics or advertising scripts on the site.

## Where the code lives

- `src/app/actions.ts`: the two Server Actions.
- `src/lib/integrations/providers.ts`: Buttondown, Resend and Turnstile calls.
- `src/lib/integrations/rate-limit.ts` and `config.ts`.
- `src/app/play-actions.ts`, `src/lib/integrations/leaderboard.ts` and `src/lib/play/leaderboard.ts`: the leaderboard's server actions, Redis storage and shared name and score rules.
- `src/lib/forms/schemas.ts`: the shared validation rules and messages.
- `tests/unit/integrations.test.ts`: tests that no path reports success without a confirmed provider response.
