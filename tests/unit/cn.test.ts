import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (project-compiled merge tables)', () => {
  it('knows the custom type scale is font size, not colour', () => {
    expect(cn('mt-2 text-ink-muted', 'text-lede')).toBe('mt-2 text-ink-muted text-lede')
    expect(cn('text-hero text-ink', 'text-lavender-ink')).toBe('text-hero text-lavender-ink')
    expect(cn('text-title', 'text-display')).toBe('text-display')
    expect(cn('text-headline', 'text-[2rem]')).toBe('text-[2rem]')
  })

  it('merges the other custom theme scales', () => {
    expect(cn('rounded-pill', 'rounded-lg')).toBe('rounded-lg')
    expect(cn('shadow-sticker', 'shadow-none')).toBe('shadow-none')
    expect(cn('font-display font-semibold', 'font-sans')).toBe('font-semibold font-sans')
    expect(cn('bg-lavender', 'bg-butter')).toBe('bg-butter')
  })

  it('keeps clsx-style conditionals', () => {
    expect(cn('a', false && 'b', null, undefined, { c: true, d: false }, ['e'])).toBe('a c e')
  })
})
