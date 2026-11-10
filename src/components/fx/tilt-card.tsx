'use client'

import { type ReactNode, useRef } from 'react'
import { prefersReducedMotion } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

/** A very small perspective tilt toward the pointer. Mouse/pen only; off with reduced motion. */
export function TiltCard({ children, className, max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const reset = () => {
    const node = ref.current
    if (node) node.style.transform = ''
  }

  return (
    <div
      ref={ref}
      className={cn('transition-transform duration-300 ease-[var(--ease-out-soft)] will-change-transform', className)}
      onPointerMove={(event) => {
        if (event.pointerType === 'touch' || prefersReducedMotion()) return
        const node = ref.current
        if (!node || frame.current) return
        const { clientX, clientY } = event
        frame.current = requestAnimationFrame(() => {
          frame.current = 0
          const rect = node.getBoundingClientRect()
          const x = (clientX - rect.left) / rect.width - 0.5
          const y = (clientY - rect.top) / rect.height - 0.5
          node.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`
        })
      }}
      onPointerLeave={reset}
    >
      {children}
    </div>
  )
}
