'use client'

import { Loader2, Send } from 'lucide-react'
import Script from 'next/script'
import { useActionState, useEffect, useRef, useState } from 'react'
import { contactAction } from '@/app/actions'
import { buttonStyles } from '@/components/ui/button-link'
import { contactSchema, type FieldErrors, fieldErrorsFrom, initialFormState } from '@/lib/forms/schemas'
import { cn } from '@/lib/utils'
import { describedBy, Field, Honeypot, inputClass, StatusMessage } from './field'

const FIELDS = ['name', 'email', 'subject', 'message'] as const

export function ContactForm({
  configured,
  showDevNotice,
  turnstileSiteKey,
}: {
  configured: boolean
  showDevNotice: boolean
  turnstileSiteKey?: string
}) {
  const [state, formAction, pending] = useActionState(contactAction, initialFormState)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const startedAtRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const errors: FieldErrors = { ...state.fieldErrors, ...clientErrors }
  const errorCount = FIELDS.filter((field) => errors[field]).length

  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now())
  }, [])

  useEffect(() => {
    if (state.status === 'invalid') formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    else if (state.status !== 'idle') statusRef.current?.focus()
  }, [state])

  const clear = (field: (typeof FIELDS)[number]) => () =>
    errors[field] && setClientErrors((current) => ({ ...current, [field]: undefined }))

  if (state.status === 'success') {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="outline-none">
        <StatusMessage tone="success">{state.message}</StatusMessage>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="relative flex flex-col gap-6"
      onSubmit={(event) => {
        const data = Object.fromEntries(
          FIELDS.map((field) => [field, String(new FormData(event.currentTarget).get(field) ?? '')]),
        )
        const parsed = contactSchema.safeParse(data)
        if (!parsed.success) {
          event.preventDefault()
          const next = fieldErrorsFrom(parsed.error)
          setClientErrors(next)
          const first = FIELDS.find((field) => next[field])
          if (first) document.getElementById(`contact-${first}`)?.focus()
        } else {
          setClientErrors({})
        }
      }}
    >
      {showDevNotice && !configured ? (
        <StatusMessage tone="info">
          <span className="mr-1 label">Dev only</span> Email delivery isn&apos;t connected: set <code>RESEND_API_KEY</code>,{' '}
          <code>CONTACT_TO_EMAIL</code> and <code>CONTACT_FROM_EMAIL</code> (see docs/INTEGRATIONS.md). Messages are not sent
          until then.
        </StatusMessage>
      ) : null}

      {errorCount > 1 ? <StatusMessage tone="error">Please fix the {errorCount} highlighted fields below.</StatusMessage> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label="Your name" error={errors.name}>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            defaultValue={state.values?.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('contact-name', errors.name)}
            onChange={clear('name')}
            className={inputClass}
          />
        </Field>
        <Field id="contact-email" label="Email address" hint="Only used to reply to you." error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('contact-email', errors.email, true)}
            onChange={clear('email')}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="contact-subject" label="Subject" error={errors.subject}>
        <input
          id="contact-subject"
          name="subject"
          required
          maxLength={120}
          defaultValue={state.values?.subject}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={describedBy('contact-subject', errors.subject)}
          onChange={clear('subject')}
          className={inputClass}
        />
      </Field>

      <Field
        id="contact-message"
        label="Message"
        hint="20–5,000 characters. Arka appreciates brevity; his human appreciates detail."
        error={errors.message}
      >
        <textarea
          id="contact-message"
          name="message"
          required
          rows={7}
          maxLength={5000}
          defaultValue={state.values?.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy('contact-message', errors.message, true)}
          onChange={clear('message')}
          className={cn(inputClass, 'min-h-40 resize-y')}
        />
      </Field>

      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="auto" />
        </>
      ) : null}

      <Honeypot />
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={buttonStyles({ variant: 'primary', size: 'lg' })}>
          {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
          {pending ? 'Sending…' : 'Send to Arka'}
        </button>
        <p className="text-sm text-ink-muted">No mailing lists. Your message goes straight to Arka’s human.</p>
      </div>

      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
        {state.status === 'error' || state.status === 'rate_limited' || state.status === 'not_configured' ? (
          <StatusMessage tone={state.status === 'not_configured' ? 'info' : 'error'}>{state.message}</StatusMessage>
        ) : null}
      </div>
    </form>
  )
}
