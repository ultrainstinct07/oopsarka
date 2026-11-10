import 'server-only'

/**
 * Integration configuration, read on the server only. Nothing here is ever sent
 * to the browser. See docs/INTEGRATIONS.md for how to obtain each value.
 */
const read = (name: string) => process.env[name]?.trim() || undefined

export const integrations = {
  newsletter: {
    get apiKey() {
      return read('BUTTONDOWN_API_KEY')
    },
  },
  contact: {
    get apiKey() {
      return read('RESEND_API_KEY')
    },
    get to() {
      return read('CONTACT_TO_EMAIL')
    },
    get from() {
      return read('CONTACT_FROM_EMAIL')
    },
  },
  rateLimit: {
    get url() {
      return read('UPSTASH_REDIS_REST_URL')
    },
    get token() {
      return read('UPSTASH_REDIS_REST_TOKEN')
    },
  },
  turnstile: {
    get siteKey() {
      return read('NEXT_PUBLIC_TURNSTILE_SITE_KEY')
    },
    get secret() {
      return read('TURNSTILE_SECRET_KEY')
    },
  },
}

export function isNewsletterConfigured() {
  return Boolean(integrations.newsletter.apiKey)
}

export function isContactConfigured() {
  return Boolean(integrations.contact.apiKey && integrations.contact.to && integrations.contact.from)
}

export function isTurnstileConfigured() {
  return Boolean(integrations.turnstile.siteKey && integrations.turnstile.secret)
}

export function isRateLimitConfigured() {
  return Boolean(integrations.rateLimit.url && integrations.rateLimit.token)
}

/** Which third parties are actually in use — drives the privacy policy. */
export function activeServices() {
  return {
    newsletter: isNewsletterConfigured(),
    contact: isContactConfigured(),
    turnstile: isTurnstileConfigured(),
    rateLimit: isRateLimitConfigured(),
    analytics: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === '1',
  }
}
