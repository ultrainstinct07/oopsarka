import type { CSSProperties, ReactNode } from 'react'
import type { Accent } from '@/lib/content/types'
import { cn } from '@/lib/utils'
import { CatEars, HandArrow } from './doodles'

export const ACCENT_FILL: Record<Accent, string> = {
  lavender: 'var(--lavender)',
  butter: 'var(--butter)',
  sage: 'var(--sage)',
  rose: 'var(--rose)',
  marmalade: 'var(--marmalade)',
}

export const ACCENT_SOFT: Record<Accent, string> = {
  lavender: 'var(--lavender-soft)',
  butter: 'var(--butter-soft)',
  sage: 'var(--sage-soft)',
  rose: 'var(--rose-soft)',
  marmalade: 'color-mix(in oklab, var(--marmalade) 22%, var(--bg))',
}

interface CatEarFrameProps {
  children: ReactNode
  tone?: Accent
  /** Rotation of the print, in degrees. */
  rotate?: number
  className?: string
  printClassName?: string
  tape?: boolean
  caption?: ReactNode
}

/**
 * The OopsArka signature: a photo printed with a white border, laid on a coloured
 * cat-head silhouette whose ears peek over the top.
 */
export function CatEarFrame({
  children,
  tone = 'lavender',
  rotate = -2,
  className,
  printClassName,
  tape = true,
  caption,
}: CatEarFrameProps) {
  const fill = ACCENT_FILL[tone]
  return (
    <figure className={cn('relative isolate', className)}>
      <div
        aria-hidden
        className="absolute inset-x-[-5%] top-[4%] bottom-[-4%] -z-10 rounded-[2.2rem]"
        style={{ background: fill, transform: `rotate(${(rotate * -0.8).toFixed(2)}deg)` }}
      >
        <CatEars className="absolute top-[3%] left-1/2 w-[70%] -translate-x-1/2 -translate-y-[88%]" style={{ color: fill }} />
      </div>
      <div
        className={cn('relative rounded-print bg-frame p-2 shadow-print sm:p-2.5', printClassName)}
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {children}
        {tape ? (
          <>
            <Tape className="-top-3 left-[12%]" angle={-7} tone="butter" />
            <Tape className="right-[10%] -bottom-3" angle={5} tone="lavender" />
          </>
        ) : null}
      </div>
      {caption ? <figcaption className="mt-5 text-sm text-ink-muted">{caption}</figcaption> : null}
    </figure>
  )
}

export function Tape({ className, angle = -6, tone = 'butter' }: { className?: string; angle?: number; tone?: Accent }) {
  return (
    <span
      aria-hidden
      className={cn('tape', className)}
      style={{ ['--tape' as string]: ACCENT_FILL[tone], transform: `rotate(${angle}deg)` } as CSSProperties}
    />
  )
}

export function Sticker({
  children,
  className,
  angle = 0,
  tone,
}: {
  children: ReactNode
  className?: string
  angle?: number
  tone?: Accent
}) {
  return (
    <span
      className={cn('sticker label', className)}
      style={{ transform: angle ? `rotate(${angle}deg)` : undefined, background: tone ? ACCENT_FILL[tone] : undefined }}
    >
      {children}
    </span>
  )
}

export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('stamp text-lavender-ink', className)}>{children}</span>
}

/** A handwritten note with an arrow, for annotating photos. Decorative unless `label` is set. */
export function Annotation({
  children,
  arrow = 'down-right',
  arrowClassName,
  className,
  angle = -4,
}: {
  children: ReactNode
  arrow?: 'down-right' | 'down-left' | 'up-right' | 'up-left' | 'right' | 'left' | 'none'
  arrowClassName?: string
  className?: string
  angle?: number
}) {
  return (
    <span className={cn('hand pointer-events-none inline-flex items-end gap-1 text-ink select-none', className)}>
      <span className="inline-block whitespace-nowrap" style={{ transform: `rotate(${angle}deg)` }}>
        {children}
      </span>
      {arrow !== 'none' ? (
        <HandArrow direction={arrow} className={cn('draw-on-load h-11 w-14 text-ink', arrowClassName)} />
      ) : null}
    </span>
  )
}

/**
 * A torn-paper edge along the top or bottom of a coloured band, as if the page
 * above (or below) was ripped across it. Decorative.
 */
export function TornEdge({ side, className }: { side: 'top' | 'bottom'; className?: string }) {
  return <span aria-hidden className={cn('torn', side === 'top' ? 'top-0' : 'bottom-0 -scale-y-100', className)} />
}

/** Small caps eyebrow with a lavender rule. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-center gap-3 label text-ink-muted', className)}>
      <span aria-hidden className="h-px w-8 bg-lavender-ink/60" />
      {children}
    </p>
  )
}
