'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useFinePointer, useMediaQuery, useReducedMotionPreference } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'
import { YarnSvg } from './yarn-svg'

const YarnScene = dynamic(() => import('./yarn-scene'), { ssr: false })

function webgl2Available() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2'))
  } catch {
    return false
  }
}

type NetworkInformation = { saveData?: boolean }

/**
 * The hero's one 3D moment. The SVG yarn ball always renders first (it's what the
 * page is measured with); the WebGL version only loads on wide screens with a fine
 * pointer, motion allowed, WebGL2, no Save-Data — and only after the visitor moves
 * the pointer while the hero is in view. Click / Enter / Space spins it either way.
 */
export function YarnBall({ className }: { className?: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotionPreference()
  const wide = useMediaQuery('(min-width: 1024px)')
  const fine = useFinePointer()
  const [mount3d, setMount3d] = useState(false)
  const [ready, setReady] = useState(false)
  const [spins, setSpins] = useState(0)

  const eligible = wide && fine && !reduced

  useEffect(() => {
    const node = ref.current
    if (!eligible || !node) return
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
    if (connection?.saveData || !webgl2Available()) return

    // Load only on intent: the hero is in view *and* the visitor has moved a mouse or pen.
    const hasIdle = typeof window.requestIdleCallback === 'function'
    let idleHandle: number | undefined
    let inView = false
    let interacted = false
    const maybeStart = () => {
      if (!inView || !interacted || idleHandle !== undefined) return
      const start = () => setMount3d(true)
      idleHandle = hasIdle ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300)
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      maybeStart()
    })
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      interacted = true
      window.removeEventListener('pointermove', onPointer)
      maybeStart()
    }
    observer.observe(node)
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', onPointer)
      if (idleHandle === undefined) return
      if (hasIdle) window.cancelIdleCallback(idleHandle)
      else window.clearTimeout(idleHandle)
    }
  }, [eligible])

  const show3d = eligible && mount3d

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setSpins((count) => count + 1)}
      aria-label="Give the yarn ball a spin"
      className={cn('group relative block aspect-square w-full rounded-full outline-offset-8', className)}
    >
      <span aria-hidden className="absolute inset-x-[14%] bottom-[2%] h-[10%] rounded-[50%] bg-ink/15 blur-[6px]" />
      <span
        key={show3d ? 'svg-3d' : `svg-${spins}`}
        className={cn(
          'absolute inset-0 block transition-opacity duration-500',
          !show3d && spins > 0 && 'motion-ok:animate-[spin_900ms_var(--ease-out-soft)_1]',
          show3d && ready && 'opacity-0',
        )}
      >
        <YarnSvg className="h-full w-full" />
      </span>
      {show3d ? (
        <YarnScene
          spins={spins}
          onReady={() => setReady(true)}
          className={cn('absolute inset-[-18%] transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}
        />
      ) : null}
      {spins > 0 ? (
        <span
          key={`oops-${spins}`}
          aria-hidden
          className="hand pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 -rotate-6 rounded-md bg-butter px-2 py-0.5 text-lg text-on-fill shadow-[var(--shadow-sticker)] motion-ok:animate-[wobble_600ms_var(--ease-spring)_both]"
        >
          oops!
        </span>
      ) : null}
    </button>
  )
}
