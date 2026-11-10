import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const inputClass =
  'block w-full rounded-xl border-2 border-line-strong bg-surface px-4 py-3 text-base text-ink transition-colors placeholder:text-ink-muted/70 hover:border-ink-muted focus-visible:border-ink focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--lavender)_60%,transparent)] focus-visible:outline-none aria-invalid:border-danger'

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string
  label: string
  hint?: ReactNode
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function describedBy(id: string, error?: string, hint?: boolean) {
  return [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined
}

/** Off-screen field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  )
}

export function StatusMessage({ tone, children, id }: { tone: 'success' | 'error' | 'info'; children: ReactNode; id?: string }) {
  return (
    <div
      id={id}
      className={cn(
        'rounded-xl border-2 px-4 py-3 text-[0.95rem] font-semibold',
        tone === 'success' && 'border-success/40 bg-sage-soft text-ink',
        tone === 'error' && 'border-danger/40 bg-rose-soft text-ink',
        tone === 'info' && 'border-line-strong bg-butter-soft text-ink',
      )}
    >
      {children}
    </div>
  )
}

export type InputProps = ComponentProps<'input'>
