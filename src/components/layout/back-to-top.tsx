'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

/** A small "back to top" button that appears once the reader is well down the page. */
export function BackToTop() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setShown(window.scrollY > window.innerHeight * 1.5)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <button
      type="button"
      aria-label="Back to top"
      // Hidden from keyboard and assistive tech until it's actually on screen.
      inert={!shown}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
        document.getElementById('main')?.focus({ preventScroll: true })
      }}
      className={cn(
        'press group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 inline-grid size-12 place-items-center rounded-full border-2 border-ink bg-butter text-on-fill shadow-print transition-[opacity,translate,scale] duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 sm:right-6 print:hidden',
        shown ? 'opacity-100' : 'pointer-events-none translate-y-4 scale-75 opacity-0',
      )}
    >
      <ArrowUp aria-hidden className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  )
}
