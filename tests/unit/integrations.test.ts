import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7' }),
}))

const ENV_KEYS = [
  'BUTTONDOWN_API_KEY',
  'RESEND_API_KEY',
  'CONTACT_TO_EMAIL',
  'CONTACT_FROM_EMAIL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'TURNSTILE_SECRET_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
]

function form(fields: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

const old = () => String(Date.now() - 10_000)

beforeEach(() => {
  for (const key of ENV_KEYS) delete process.env[key]
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('newsletter action', () => {
  it('never reports success when no provider is configured', async () => {
    const { subscribeAction } = await import('@/app/actions')
    const result = await subscribeAction({ status: 'idle' }, form({ email: 'cat@example.com', consent: 'on', startedAt: old() }))
    expect(result.status).toBe('not_configured')
  })

  it('validates email and consent on the server', async () => {
    process.env.BUTTONDOWN_API_KEY = 'test-key'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { subscribeAction } = await import('@/app/actions')
    const result = await subscribeAction({ status: 'idle' }, form({ email: 'not-an-email', startedAt: old() }))
    expect(result.status).toBe('invalid')
    expect(result.fieldErrors?.email).toBeTruthy()
    expect(result.fieldErrors?.consent).toBeTruthy()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('treats a filled honeypot as a failure, without calling the provider', async () => {
    process.env.BUTTONDOWN_API_KEY = 'test-key'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { subscribeAction } = await import('@/app/actions')
    const result = await subscribeAction(
      { status: 'idle' },
      form({ email: 'cat@example.com', consent: 'on', website: 'spam', startedAt: old() }),
    )
    expect(result.status).toBe('error')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates an unactivated (double opt-in) Buttondown subscriber and says "check your inbox"', async () => {
    process.env.BUTTONDOWN_API_KEY = 'test-key'
    const fetchMock = vi.fn(async () => new Response('{}', { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const { subscribeAction } = await import('@/app/actions')
    const result = await subscribeAction({ status: 'idle' }, form({ email: 'Cat@Example.com ', consent: 'on', startedAt: old() }))
    expect(result.status).toBe('success')
    expect(result.message).toMatch(/inbox/i)
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.buttondown.com/v1/subscribers')
    expect((init.headers as Record<string, string>).Authorization).toBe('Token test-key')
    const payload = JSON.parse(String(init.body))
    expect(payload).toEqual({ email_address: 'Cat@Example.com', tags: ['website'] })
    expect(payload.type).toBeUndefined()
  })

  it('maps "already subscribed" to a friendly message', async () => {
    process.env.BUTTONDOWN_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"code":"subscriber_already_exists"}', { status: 400 })),
    )
    const { subscribeAction } = await import('@/app/actions')
    const result = await subscribeAction({ status: 'idle' }, form({ email: 'cat@example.com', consent: 'on', startedAt: old() }))
    expect(result.status).toBe('already')
  })

  it('reports provider outages as errors, not success', async () => {
    process.env.BUTTONDOWN_API_KEY = 'test-key'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('oops', { status: 503 })),
    )
    const { subscribeAction } = await import('@/app/actions')
    const result = await subscribeAction({ status: 'idle' }, form({ email: 'cat@example.com', consent: 'on', startedAt: old() }))
    expect(result.status).toBe('error')
  })
})

describe('contact action', () => {
  const valid = {
    name: 'Mira',
    email: 'mira@example.com',
    subject: 'Hello Arka',
    message: 'I would like to say hello to the cat, please.',
  }

  it('never reports success when email delivery is not configured', async () => {
    const { contactAction } = await import('@/app/actions')
    const result = await contactAction({ status: 'idle' }, form({ ...valid, startedAt: old() }))
    expect(result.status).toBe('not_configured')
    expect(result.values?.message).toBe(valid.message)
  })

  it('rejects messages submitted inhumanly fast', async () => {
    Object.assign(process.env, {
      RESEND_API_KEY: 're_test',
      CONTACT_TO_EMAIL: 'owner@example.com',
      CONTACT_FROM_EMAIL: 'OopsArka <hello@oopsarka.space>',
    })
    const { contactAction } = await import('@/app/actions')
    const result = await contactAction({ status: 'idle' }, form({ ...valid, startedAt: String(Date.now()) }))
    expect(result.status).toBe('error')
  })

  it('returns field errors for invalid input', async () => {
    Object.assign(process.env, {
      RESEND_API_KEY: 're_test',
      CONTACT_TO_EMAIL: 'owner@example.com',
      CONTACT_FROM_EMAIL: 'OopsArka <hello@oopsarka.space>',
    })
    const { contactAction } = await import('@/app/actions')
    const result = await contactAction(
      { status: 'idle' },
      form({ name: 'M', email: 'x', subject: '', message: 'short', startedAt: old() }),
    )
    expect(result.status).toBe('invalid')
    expect(Object.keys(result.fieldErrors ?? {}).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })

  it('only confirms delivery when the email service returns an id', async () => {
    const { sendContactMessage } = await import('@/lib/integrations/providers')
    Object.assign(process.env, {
      RESEND_API_KEY: 're_test',
      CONTACT_TO_EMAIL: 'owner@example.com',
      CONTACT_FROM_EMAIL: 'OopsArka <hello@oopsarka.space>',
    })
    const ok = { emails: { send: vi.fn(async () => ({ data: { id: 'email_123' }, error: null })) } }
    const failing = { emails: { send: vi.fn(async () => ({ data: null, error: { message: 'nope' } })) } }
    await expect(sendContactMessage(valid, ok as never)).resolves.toEqual({ ok: true, id: 'email_123' })
    await expect(sendContactMessage(valid, failing as never)).resolves.toEqual({ ok: false })
    const [payload, options] = ok.emails.send.mock.calls[0] as unknown as [Record<string, unknown>, { idempotencyKey: string }]
    expect(payload).toMatchObject({ to: ['owner@example.com'], replyTo: 'mira@example.com', subject: '[OopsArka] Hello Arka' })
    expect(options.idempotencyKey).toMatch(/^contact-/)
  })
})

describe('form schemas', () => {
  it('trims input and reports the most useful message first', async () => {
    const { contactSchema, fieldErrorsFrom, newsletterSchema } = await import('@/lib/forms/schemas')
    const ok = newsletterSchema.safeParse({ email: '  arka@example.com ', consent: 'on' })
    expect(ok.success && ok.data.email).toBe('arka@example.com')

    const blank = newsletterSchema.safeParse({ email: '   ' })
    expect(blank.success).toBe(false)
    if (!blank.success) {
      expect(fieldErrorsFrom(blank.error)).toEqual({
        email: 'Please enter your email address.',
        consent: 'Please tick the box so we know you’d like the emails.',
      })
    }

    const typo = newsletterSchema.safeParse({ email: 'arka@example', consent: 'on' })
    expect(!typo.success && fieldErrorsFrom(typo.error).email).toMatch(/doesn’t look like an email/)

    const missing = contactSchema.safeParse({})
    expect(!missing.success && Object.keys(fieldErrorsFrom(missing.error)).sort()).toEqual([
      'email',
      'message',
      'name',
      'subject',
    ])
    expect(!missing.success && fieldErrorsFrom(missing.error).name).toBe('Please tell us your name.')
  })
})

describe('rate limiting', () => {
  it('allows a burst, then blocks within the window', async () => {
    const { memoryLimiter } = await import('@/lib/integrations/rate-limit')
    const limiter = memoryLimiter(2, 60_000)
    expect((await limiter.limit('a')).success).toBe(true)
    expect((await limiter.limit('a')).success).toBe(true)
    expect((await limiter.limit('a')).success).toBe(false)
    expect((await limiter.limit('b')).success).toBe(true)
  })

  it('never uses a raw IP as the key', async () => {
    const { clientFingerprint } = await import('@/lib/integrations/rate-limit')
    const key = clientFingerprint('203.0.113.7')
    expect(key).not.toContain('203.0.113.7')
    expect(key).toHaveLength(32)
    expect(clientFingerprint('203.0.113.7')).toBe(key)
  })
})

describe('turnstile', () => {
  it('is skipped when not configured and rejects missing tokens when it is', async () => {
    const { verifyTurnstile } = await import('@/lib/integrations/providers')
    await expect(verifyTurnstile(null, null)).resolves.toBe(true)
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    await expect(verifyTurnstile(null, null)).resolves.toBe(false)
    const fetchMock = vi.fn(async () => Response.json({ success: true, hostname: 'oopsarka.space' }))
    await expect(verifyTurnstile('token', '1.2.3.4', fetchMock as never)).resolves.toBe(true)
  })
})
