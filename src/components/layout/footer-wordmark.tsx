'use client'

import { lazy, Suspense, useRef } from 'react'
import { CatEars } from '@/components/media/doodles'
import { useFinePointer, useReducedMotionPreference } from '@/hooks/use-preferences'

const VariableProximity = lazy(() => import('@/components/fx/VariableProximity'))

const ITALIC_FROM = "'wght' 500"
const ITALIC_TO = "'wght' 700"
const ROMAN_FROM = "'wght' 520, 'opsz' 144"
const ROMAN_TO = "'wght' 700, 'opsz' 40"

/**
 * The giant footer wordmark. Letters swell toward the cursor (React Bits
 * VariableProximity) on fine pointers when motion is allowed; otherwise it's
 * the same lettering, standing still.
 */
export function FooterWordmark() {
  const containerRef = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotionPreference()
  const live = fine && !reduced

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="relative font-display text-[clamp(4.5rem,19vw,17rem)] leading-[0.8] tracking-[-0.045em] select-none"
    >
      <span className="text-lavender-ink italic">
        {live ? (
          <Suspense fallback={<span style={{ fontVariationSettings: ITALIC_FROM }}>Oops</span>}>
            <VariableProximity
              label="Oops"
              containerRef={containerRef}
              radius={220}
              falloff="gaussian"
              fromFontVariationSettings={ITALIC_FROM}
              toFontVariationSettings={ITALIC_TO}
            />
          </Suspense>
        ) : (
          <span style={{ fontVariationSettings: ITALIC_FROM }}>Oops</span>
        )}
      </span>
      <span className="relative inline-block">
        <CatEars className="absolute -top-[0.3em] left-[-0.05em] w-[0.75em] text-lavender" />
        {live ? (
          <Suspense fallback={<span style={{ fontVariationSettings: ROMAN_FROM }}>Arka</span>}>
            <VariableProximity
              label="Arka"
              containerRef={containerRef}
              radius={220}
              falloff="gaussian"
              fromFontVariationSettings={ROMAN_FROM}
              toFontVariationSettings={ROMAN_TO}
            />
          </Suspense>
        ) : (
          <span style={{ fontVariationSettings: ROMAN_FROM }}>Arka</span>
        )}
      </span>
    </div>
  )
}
