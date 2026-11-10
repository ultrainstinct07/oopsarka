'use server'

import { headers } from 'next/headers'
import { contactSchema, fieldErrorsFrom, type FormState, newsletterSchema } from '@/lib/forms/schemas'
import { isContactConfigured, isNewsletterConfigured } from '@/lib/integrations/config'
import { sendContactMessage, subscribeToNewsletter, verifyTurnstile } from '@/lib/integrations/providers'
import { clientFingerprint, getLimiter } from '@/lib/integrations/rate-limit'

const MIN_FILL_MS = 2500

async function clientIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null
}

/** Honeypot filled or form submitted inhumanly fast. */
function looksAutomated(form: FormData) {
  if (String(form.get('website') ?? '').length > 0) return true
  const startedAt = Number(form.get('startedAt'))
  return Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS
}

const GENERIC_ERROR = 'Something went wrong on our side. Please try again in a moment.'

export async function subscribeAction(_previous: FormState, form: FormData): Promise<FormState> {
  const values = { email: String(form.get('email') ?? '') }
  if (!isNewsletterConfigured()) {
    return { status: 'not_configured', message: 'The newsletter isn’t connected yet, so nothing was saved.', values }
  }
  if (looksAutomated(form)) return { status: 'error', message: GENERIC_ERROR, values }

  const parsed = newsletterSchema.safeParse({ email: form.get('email'), consent: form.get('consent') ?? undefined })
  if (!parsed.success) return { status: 'invalid', fieldErrors: fieldErrorsFrom(parsed.error), values }

  const { success } = await getLimiter('newsletter').limit(clientFingerprint(await clientIp()))
  if (!success)
    return {
      status: 'rate_limited',
      message: 'That’s a lot of sign-ups from one place. Please try again in a few minutes.',
      values,
    }

  const result = await subscribeToNewsletter(parsed.data.email)
  switch (result) {
    case 'pending_confirmation':
      return {
        status: 'success',
        message: 'Almost there! Check your inbox and confirm your email to start getting the occasional oops.',
      }
    case 'already_subscribed':
      return { status: 'already', message: 'You’re already on the list — the next oops is on its way, eventually.' }
    case 'invalid_email':
      return { status: 'invalid', fieldErrors: { email: 'That email address was rejected. Please check it.' }, values }
    default:
      return { status: 'error', message: GENERIC_ERROR, values }
  }
}

export async function contactAction(_previous: FormState, form: FormData): Promise<FormState> {
  const values = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    subject: String(form.get('subject') ?? ''),
    message: String(form.get('message') ?? ''),
  }
  if (!isContactConfigured()) {
    return { status: 'not_configured', message: 'The contact form isn’t connected yet, so your message was not sent.', values }
  }
  if (looksAutomated(form)) return { status: 'error', message: GENERIC_ERROR, values }

  const parsed = contactSchema.safeParse(values)
  if (!parsed.success) return { status: 'invalid', fieldErrors: fieldErrorsFrom(parsed.error), values }

  const ip = await clientIp()
  const human = await verifyTurnstile(String(form.get('cf-turnstile-response') ?? '') || null, ip)
  if (!human) return { status: 'error', message: 'We couldn’t verify you’re not a robot. Please try again.', values }

  const { success } = await getLimiter('contact').limit(clientFingerprint(ip))
  if (!success)
    return { status: 'rate_limited', message: 'You’ve sent a few messages already — please try again a little later.', values }

  const sent = await sendContactMessage(parsed.data)
  if (!sent.ok)
    return { status: 'error', message: 'Your message couldn’t be sent just now. Please try again in a moment.', values }
  return { status: 'success', message: `Thank you, ${parsed.data.name}! Your message is in Arka’s inbox. His human will reply.` }
}
