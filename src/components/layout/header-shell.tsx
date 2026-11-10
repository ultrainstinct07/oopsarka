'use client'

import { type ReactNode, useEffect, useRef } from 'react'

/** Sticky header that turns solid once the page has scrolled a little. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const header = ref.current
    if (!header) return
    let frame = 0
    const update = () => {
      frame = 0
      header.dataset.scrolled = window.scrollY > 24 ? 'true' : 'false'
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
    <header
      ref={ref}
      data-scrolled="false"
      className="sticky top-0 z-40 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-300 data-[scrolled=true]:border-line data-[scrolled=true]:bg-bg data-[scrolled=true]:shadow-[0_8px_24px_-18px_rgb(36_33_31/0.35)]"
    >
      {children}
    </header>
  )
}
