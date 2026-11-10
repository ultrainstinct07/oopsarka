'use client'

import { Pause, Play } from 'lucide-react'
import { Fragment, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { PawIcon } from '@/components/media/doodles'
import { useMediaQuery, useReducedMotionPreference } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

function Labels({ traits }: { traits: string[] }) {
  return (
    <>
      {traits.map((trait, index) => (
        <Fragment key={trait}>
          {index > 0 ? <PawIcon className="mx-5 inline size-4 shrink-0 align-[-0.1em] opacity-70" /> : null}
          <span>{trait}</span>
        </Fragment>
      ))}
      <PawIcon className="mx-5 inline size-4 shrink-0 align-[-0.1em] opacity-70" />
    </>
  )
}

// The marquee (and its animation library) only loads where it will actually move.
const ScrollVelocity = lazy(() => import('@/components/fx/ScrollVelocity'))

const tapeType = 'label flex items-center py-3.5 text-[0.82rem] tracking-[0.16em] text-on-fill sm:text-[0.92rem]'

function StaticTape({ traits }: { traits: string[] }) {
  return (
    <div
      className={cn(
        tapeType,
        'flex-wrap justify-center gap-y-1 px-6 text-center md:flex-nowrap md:justify-start md:overflow-hidden md:whitespace-nowrap',
      )}
    >
      <Labels traits={traits} />
    </div>
  )
}

function SecondTape() {
  return (
    <div className={cn(tapeType, 'justify-center overflow-hidden px-6 whitespace-nowrap')}>
      <span>Caution: fluff zone</span>
      <PawIcon className="mx-5 inline size-4 opacity-70" />
      <span>Do not leave snacks unattended</span>
    </div>
  )
}

/**
 * Arka's personality on two strips of lavender and butter "caution tape".
 * Moves gently (and reacts to scroll speed) only on larger screens with motion
 * allowed; pauses on hover, focus, offscreen, or with the pause button. The
 * accessible version is the plain list.
 */
export function CautionTape({ traits }: { traits: string[] }) {
  const reduced = useReducedMotionPreference()
  const wide = useMediaQuery('(min-width: 768px)')
  const [userPaused, setUserPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const animated = wide && !reduced

  useEffect(() => {
    const node = ref.current
    if (!node || !animated) return
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [animated])

  const paused = userPaused || offscreen

  return (
    <section
      ref={ref}
      aria-label="Arka’s personality, in brief"
      className="relative isolate overflow-hidden pt-10 pb-4 sm:pt-12 sm:pb-2"
    >
      <ul className="sr-only">
        {traits.map((trait) => (
          <li key={trait}>{trait}</li>
        ))}
      </ul>

      <div aria-hidden className="relative">
        <div className="relative z-10 -mx-4 -rotate-[2.2deg] border-y-2 border-ink/80 bg-lavender shadow-[0_6px_0_-2px_rgb(36_33_31/0.12)]">
          {animated ? (
            <Suspense fallback={<StaticTape traits={traits} />}>
              <ScrollVelocity
                texts={[<Labels key="a" traits={traits} />]}
                velocity={38}
                numCopies={4}
                damping={60}
                stiffness={380}
                velocityMapping={{ input: [0, 1000], output: [0, 2.2] }}
                scrollerClassName={tapeType}
                pauseOnHover
                paused={paused}
              />
            </Suspense>
          ) : (
            <StaticTape traits={traits} />
          )}
        </div>
        <div className="absolute inset-x-0 top-1/2 -mx-4 -translate-y-1/2 rotate-[1.6deg] border-y-2 border-ink/70 bg-butter opacity-95">
          {animated ? (
            <Suspense fallback={<SecondTape />}>
              <ScrollVelocity
                texts={[<Labels key="b" traits={[...traits].reverse()} />]}
                velocity={-30}
                numCopies={4}
                damping={60}
                stiffness={380}
                velocityMapping={{ input: [0, 1000], output: [0, 1.8] }}
                scrollerClassName={tapeType}
                paused={paused}
              />
            </Suspense>
          ) : (
            <SecondTape />
          )}
        </div>
      </div>

      {animated ? (
        <div className="shell relative z-20 mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => setUserPaused((value) => !value)}
            aria-pressed={userPaused}
            className="press inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold"
          >
            {userPaused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            {userPaused ? 'Play the tape' : 'Pause the tape'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
