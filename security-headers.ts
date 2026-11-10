/**
 * Security headers. The public site is statically generated, so scripts are allowed
 * from 'self' plus inline (Next's bootstrap and our pre-paint preferences script):
 * nonce-based CSP would force every page to render dynamically. Everything else is
 * locked down. The embedded Sanity Studio gets its own, looser policy.
 */
const isDev = process.env.NODE_ENV !== 'production'
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? ' https://challenges.cloudflare.com' : ''
const vercelLive = process.env.VERCEL_ENV === 'preview' ? ' https://vercel.live' : ''

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${turnstile}${vercelLive}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "media-src 'self' https://cdn.sanity.io",
  "font-src 'self' data:",
  `connect-src 'self' https://*.api.sanity.io wss://*.api.sanity.io${isDev ? ' ws: http://localhost:*' : ''}${vercelLive}`,
  `frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com${turnstile}${vercelLive}`,
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  isDev ? '' : 'upgrade-insecure-requests',
]
  .filter(Boolean)
  .join('; ')

const common = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

export const securityHeaders = [
  ...common,
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()',
  },
]

/** Sanity Studio needs the Sanity APIs, websockets, auth popups and image previews. */
export const studioSecurityHeaders = [
  ...common,
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https://cdn.sanity.io",
      "font-src 'self' data:",
      "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.api.sanity.io wss://*.api.sanity.io",
      "frame-src 'self'",
      "frame-ancestors 'self'",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
]
