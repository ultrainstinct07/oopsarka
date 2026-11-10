'use client'

import { Loader2, Send } from 'lucide-react'
import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { subscribeAction } from '@/app/actions'
import { buttonStyles } from '@/components/ui/button-link'
import { type FieldErrors, fieldErrorsFrom, initialFormState, newsletterSchema } from '@/lib/forms/schemas'
import { cn } from '@/lib/utils'
import { describedBy, Field, Honeypot, inputClass, StatusMessage } from './field'

export function NewsletterForm({
  configured,
  showDevNotice,
  idPrefix = 'nl',
}: {
  configured: boolean
  showDevNotice: boolean
  idPrefix?: string
}) {
  const [state, formAction, pending] = useActionState(subscribeAction, initialFormState)
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})
  const startedAtRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const errors = { ...state.fieldErrors, ...clientErrors }
  const emailId = `${idPrefix}-email`
  const consentId = `${idPrefix}-consent`

  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now())
  }, [])

  useEffect(() => {
    if (state.status === 'invalid') {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
      first?.focus()
    } else if (state.status !== 'idle') {
      statusRef.current?.focus()
    }
  }, [state])

  if (state.status === 'success' || state.status === 'already') {
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
      className="relative flex flex-col gap-5"
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget)
        const parsed = newsletterSchema.safeParse({ email: data.get('email'), consent: data.get('consent') ?? undefined })
        if (!parsed.success) {
          event.preventDefault()
          const next = fieldErrorsFrom(parsed.error)
          setClientErrors(next)
          const firstKey = Object.keys(next)[0]
          document.getElementById(firstKey === 'consent' ? consentId : emailId)?.focus()
        } else {
          setClientErrors({})
        }
      }}
    >
      {showDevNotice && !configured ? (
        <StatusMessage tone="info">
          <span className="mr-1 label">Dev only</span> The newsletter isn&apos;t connected: set <code>BUTTONDOWN_API_KEY</code>{' '}
          (see docs/INTEGRATIONS.md). Submissions are rejected until then — nothing is stored.
        </StatusMessage>
      ) : null}

      <Field id={emailId} label="Your email address" error={errors.email}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            defaultValue={state.values?.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy(emailId, errors.email)}
            onChange={() => errors.email && setClientErrors((current) => ({ ...current, email: undefined }))}
            className={cn(inputClass, 'sm:flex-1')}
          />
          <button type="submit" disabled={pending} className={cn(buttonStyles({ variant: 'primary' }), 'sm:min-w-40')}>
            {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Send aria-hidden className="size-4" />}
            {pending ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>
      </Field>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={consentId} className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${consentId}-error` : undefined}
            className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--lavender-ink)]"
          />
          <span>
            Yes, send me the occasional oops. I&apos;ll get a confirmation email first, and I can unsubscribe any time. See the{' '}
            <Link href="/privacy" className="underline">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.consent ? (
          <p id={`${consentId}-error`} className="pl-8 text-sm font-semibold text-danger">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Honeypot />
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />

      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
        {state.status === 'error' || state.status === 'rate_limited' || state.status === 'not_configured' ? (
          <StatusMessage tone={state.status === 'not_configured' ? 'info' : 'error'}>{state.message}</StatusMessage>
        ) : null}
      </div>
    </form>
  )
}
