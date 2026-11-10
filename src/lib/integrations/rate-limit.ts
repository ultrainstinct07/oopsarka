import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'
import { integrations, isRateLimitConfigured } from './config'

export interface LimitResult {
  success: boolean
  /** Unix ms when the window resets. */
  reset: number
}

interface Limiter {
  limit(id: string): Promise<LimitResult>
}

/** Best-effort fallback: per server instance only. Fine for local dev; use Upstash in production. */
export function memoryLimiter(max: number, windowMs: number): Limiter {
  const hits = new Map<string, number[]>()
  return {
    async limit(id) {
      const now = Date.now()
      const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs)
      const success = recent.length < max
      if (success) recent.push(now)
      hits.set(id, recent)
      if (hits.size > 5000) hits.clear()
      return { success, reset: (recent[0] ?? now) + windowMs }
    },
  }
}

const limiters = new Map<string, Limiter>()

export function getLimiter(name: 'newsletter' | 'contact' | 'leaderboard'): Limiter {
  const existing = limiters.get(name)
  if (existing) return existing
  const config =
    name === 'contact'
      ? { max: 5, window: '1 h' as const, ms: 3_600_000 }
      : name === 'leaderboard'
        ? { max: 15, window: '10 m' as const, ms: 600_000 }
        : { max: 5, window: '10 m' as const, ms: 600_000 }
  let limiter: Limiter
  if (isRateLimitConfigured()) {
    const upstash = new Ratelimit({
      redis: new Redis({ url: integrations.rateLimit.url!, token: integrations.rateLimit.token! }),
      limiter: Ratelimit.slidingWindow(config.max, config.window),
      prefix: `oopsarka:${name}`,
    })
    limiter = { limit: async (id) => upstash.limit(id).then(({ success, reset }) => ({ success, reset })) }
  } else {
    limiter = memoryLimiter(config.max, config.ms)
  }
  limiters.set(name, limiter)
  return limiter
}

/** Never store raw IPs: identify a client by a salted hash. */
export function clientFingerprint(ip: string | null | undefined) {
  const salt = process.env.RATE_LIMIT_SALT || 'oopsarka'
  return createHash('sha256')
    .update(`${salt}:${ip ?? 'unknown'}`)
    .digest('hex')
    .slice(0, 32)
}
