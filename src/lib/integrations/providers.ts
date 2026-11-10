import 'server-only'
import { createHash } from 'node:crypto'
import { Resend } from 'resend'
import { integrations } from './config'

export type SubscribeResult = 'pending_confirmation' | 'already_subscribed' | 'invalid_email' | 'error'

/**
 * Buttondown: creates the subscriber in its default *unactivated* state, which
 * triggers Buttondown's double opt-in confirmation email. We deliberately never
 * send `type: "regular"`, so nobody is subscribed without confirming.
 */
export async function subscribeToNewsletter(email: string, fetcher: typeof fetch = fetch): Promise<SubscribeResult> {
  const apiKey = integrations.newsletter.apiKey
  if (!apiKey) throw new Error('Newsletter provider is not configured')
  let response: Response
  try {
    response = await fetcher('https://api.buttondown.com/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Version': '2026-04-01',
      },
      body: JSON.stringify({ email_address: email, tags: ['website'] }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
  } catch {
    return 'error'
  }
  if (response.status === 201 || response.status === 200) return 'pending_confirmation'
  const detail = await response.text().catch(() => '')
  if (response.status === 400 && /already|exists|subscriber_already/i.test(detail)) return 'already_subscribed'
  if (response.status === 422 || (response.status === 400 && /email_invalid|invalid/i.test(detail))) return 'invalid_email'
  return 'error'
}

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
}

/** Resend: delivers the message to the owner's inbox. Success only when Resend returns an id. */
export async function sendContactMessage(
  input: ContactMessage,
  client?: Pick<Resend, 'emails'>,
): Promise<{ ok: true; id: string } | { ok: false }> {
  const { apiKey, to, from } = integrations.contact
  if (!apiKey || !to || !from) throw new Error('Contact provider is not configured')
  const resend = client ?? new Resend(apiKey)
  const idempotencyKey = createHash('sha256')
    .update([input.email, input.subject, input.message].join('\u0000'))
    .digest('hex')
    .slice(0, 48)
  try {
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [to],
        replyTo: input.email,
        subject: `[OopsArka] ${input.subject}`,
        text: [
          `From: ${input.name} <${input.email}>`,
          `Subject: ${input.subject}`,
          '',
          input.message,
          '',
          '— Sent from the contact form on oopsarka.space',
        ].join('\n'),
      },
      { idempotencyKey: `contact-${idempotencyKey}` },
    )
    if (error || !data?.id) return { ok: false }
    return { ok: true, id: data.id }
  } catch {
    return { ok: false }
  }
}

/** Cloudflare Turnstile server-side check (only when keys are configured). */
export async function verifyTurnstile(token: string | null, ip: string | null, fetcher: typeof fetch = fetch) {
  const secret = integrations.turnstile.secret
  if (!secret) return true
  if (!token) return false
  try {
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    const result = (await response.json()) as { success?: boolean; hostname?: string }
    const expectedHost = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://oopsarka.space').hostname
    return Boolean(result.success) && (!result.hostname || result.hostname === expectedHost || result.hostname === 'localhost')
  } catch {
    return false
  }
}
