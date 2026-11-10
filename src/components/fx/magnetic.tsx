'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { useMediaQuery, useReducedMotionPreference } from '@/hooks/use-preferences'
import Magnet from './Magnet'

// The badge's animation library only loads on screens where the badge is shown.
const CircularText = dynamic(() => import('./CircularText'), { ssr: false })

/** Stickers that lean gently toward the cursor (fine pointers only; off in Calm mode). */
export function MagneticSticker({
  children,
  className,
  strength = 3,
  maxOffset = 14,
}: {
  children: ReactNode
  className?: string
  strength?: number
  maxOffset?: number
}) {
  const reduced = useReducedMotionPreference()
  return (
    <div className={className}>
      <Magnet padding={70} magnetStrength={strength} maxOffset={maxOffset} disabled={reduced}>
        {children}
      </Magnet>
    </div>
  )
}

/** The rotating "OOPS • ARKA • DID • IT • AGAIN" badge. Stands still in Calm mode. */
export function OopsBadge({ className, children }: { className?: string; children?: ReactNode }) {
  const shown = useMediaQuery('(min-width: 640px)')
  return (
    <div className={className} aria-hidden>
      <div className="relative size-32">
        {shown ? (
          <CircularText
            text="OOPS • ARKA • DID • IT • AGAIN • "
            spinDuration={26}
            onHover="speedUp"
            size={128}
            fontSize={11.5}
            fontWeight={800}
            letterSpacing={1.2}
            color="var(--on-fill)"
          />
        ) : null}
        {children}
      </div>
    </div>
  )
}
