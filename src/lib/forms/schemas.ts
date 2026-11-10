import * as z from 'zod/mini'

/**
 * Shared by the browser (instant feedback) and the server (the real check).
 * zod/mini keeps the browser's share of this small; checks run in order and
 * the first failure per field is the one shown.
 */

const email = z
  .string('Please enter your email address.')
  .check(
    z.trim(),
    z.minLength(1, 'Please enter your email address.'),
    z.maxLength(254, 'That email address is too long.'),
    z.regex(z.regexes.email, 'That doesn’t look like an email address — check for typos?'),
  )

export const newsletterSchema = z.object({
  email,
  consent: z.literal('on', 'Please tick the box so we know you’d like the emails.'),
})

export const contactSchema = z.object({
  name: z
    .string('Please tell us your name.')
    .check(
      z.trim(),
      z.minLength(2, 'Please tell us your name.'),
      z.maxLength(80, 'That name is a little long (80 characters max).'),
    ),
  email,
  subject: z
    .string('A short subject, please.')
    .check(
      z.trim(),
      z.minLength(3, 'A short subject, please.'),
      z.maxLength(120, 'Please keep the subject under 120 characters.'),
    ),
  message: z
    .string('A little more detail, please (20 characters or more).')
    .check(
      z.trim(),
      z.minLength(20, 'A little more detail, please (20 characters or more).'),
      z.maxLength(5000, 'Please keep it under 5,000 characters.'),
    ),
})

export type FieldErrors = Partial<Record<string, string>>

export type FormStatus = 'idle' | 'success' | 'invalid' | 'error' | 'not_configured' | 'rate_limited' | 'already'

export interface FormState {
  status: FormStatus
  message?: string
  fieldErrors?: FieldErrors
  /** Echo back what was typed so a no-JS submission doesn't lose it. */
  values?: Record<string, string>
}

export const initialFormState: FormState = { status: 'idle' }

export function fieldErrorsFrom(error: z.core.$ZodError): FieldErrors {
  const out: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    out[key] ??= issue.message
  }
  return out
}
