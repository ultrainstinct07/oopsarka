'use client'

/**
 * Adapted from SmoothUI "Hover Image List" (MIT) — https://smoothui.dev,
 * as listed on 21st.dev. Modified for OopsArka: rows render arbitrary server
 * content, the preview is a framed "print" that eases after the cursor with a
 * tiny requestAnimationFrame lerp (no animation library), Calm mode is
 * respected, and the preview is purely decorative — all information lives in
 * the row itself.
 */
import type { Route } from 'next'
import Link from 'next/link'
import { type FocusEvent, type PointerEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, useFinePointer } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

export interface HoverImageListItem {
  id: string
  href: Route
  /** Pre-sized image URL for the preview. */
  image: string
  content: ReactNode
}

const PREVIEW_WIDTH = 210
const PREVIEW_HEIGHT = 262
const EASE = 0.18
const MAX_SKEW = 7

export function HoverImageList({ items, className }: { items: HoverImageListItem[]; className?: string }) {
  const fine = useFinePointer()
  const [active, setActive] = useState<number | null>(null)
  const [pinned, setPinned] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0, skew: 0 })
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const paint = () => {
    frame.current = 0
    const node = previewRef.current
    if (!node) return
    const c = current.current
    const reduced = prefersReducedMotion()
    const dx = target.current.x - c.x
    c.x += reduced ? dx : dx * EASE
    c.y += reduced ? target.current.y - c.y : (target.current.y - c.y) * EASE
    c.skew = reduced ? 0 : Math.max(-MAX_SKEW, Math.min(MAX_SKEW, dx * 0.06))
    node.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0) skewX(${c.skew.toFixed(2)}deg)`
    if (Math.abs(dx) > 0.5 || Math.abs(target.current.y - c.y) > 0.5) frame.current = requestAnimationFrame(paint)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!fine || pinned) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    target.current = { x: event.clientX - rect.left + 28, y: event.clientY - rect.top - PREVIEW_HEIGHT / 2 }
    if (!frame.current) frame.current = requestAnimationFrame(paint)
  }

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (pinned && !event.currentTarget.contains(event.relatedTarget)) {
      setActive(null)
      setPinned(false)
    }
  }

  const activeItem = active === null ? null : items[active]

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        if (!pinned) setActive(null)
      }}
      onBlur={onBlur}
    >
      <ul className="border-t border-line">
        {items.map((item, index) => (
          <li key={item.id} className="border-b border-line">
            <Link
              href={item.href}
              onFocus={() => {
                setActive(index)
                setPinned(true)
              }}
              onMouseEnter={() => {
                if (!fine) return
                setActive(index)
                setPinned(false)
              }}
              className="group block rounded-md py-5 outline-offset-4 transition-colors sm:py-6"
            >
              {item.content}
            </Link>
          </li>
        ))}
      </ul>

      {fine ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          <div
            ref={previewRef}
            className={cn(
              'absolute rounded-print bg-frame p-1.5 shadow-print transition-opacity duration-200',
              pinned ? 'top-1/2 right-0' : 'top-0 left-0',
              activeItem ? 'opacity-100' : 'opacity-0',
            )}
            style={{
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              transform: pinned ? 'translateY(-50%) rotate(2deg)' : undefined,
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[0.25rem] bg-bg-deep">
              {items.map((item, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={item.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
                    index === active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
