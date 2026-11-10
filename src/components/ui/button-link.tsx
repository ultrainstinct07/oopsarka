import { cva, type VariantProps } from 'class-variance-authority'
import Link, { type LinkProps } from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const buttonStyles = cva(
  'press group inline-flex min-h-12 items-center justify-center gap-2 rounded-pill px-6 text-[0.95rem] font-bold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        primary:
          'bg-ink text-bg shadow-[0_10px_24px_-14px_rgb(36_33_31/0.7)] hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--ink)_88%,var(--lavender))] hover:shadow-[0_16px_28px_-14px_rgb(36_33_31/0.75)]',
        secondary: 'btn-fill border-2 border-ink bg-transparent text-ink hover:text-bg focus-visible:text-bg',
        butter: 'bg-butter text-on-fill shadow-[inset_0_-3px_0_rgb(36_33_31/0.14)] hover:-rotate-1',
        ghost: 'px-2 text-ink underline-offset-4 hover:underline',
      },
      size: {
        md: '',
        sm: 'min-h-10 px-4 text-sm',
        lg: 'min-h-14 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

/**
 * A label whose letters roll up on hover/focus — a CSS-only take on Motion
 * Primitives' "Text Roll" (as listed on 21st.dev). No JavaScript; reduced motion
 * simply swaps instantly. Screen readers get the plain label.
 */
export function RollLabel({ children }: { children: string }) {
  return (
    <span className="roll-label">
      <span aria-hidden className="roll-track">
        {Array.from(children).map((letter, index) => (
          <span key={index} className="roll-letter" data-l={letter === ' ' ? ' ' : letter} style={{ ['--i' as string]: index }}>
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </span>
      <span className="sr-only">{children}</span>
    </span>
  )
}

type ButtonLinkProps = LinkProps<string> &
  Omit<ComponentProps<'a'>, 'href'> &
  VariantProps<typeof buttonStyles> & { children?: ReactNode; roll?: string; icon?: ReactNode }

export function ButtonLink({ variant, size, className, children, roll, icon, ...props }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonStyles({ variant, size }), className)} {...props}>
      {roll ? <RollLabel>{roll}</RollLabel> : children}
      {icon}
    </Link>
  )
}
