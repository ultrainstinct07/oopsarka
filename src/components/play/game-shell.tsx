'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { type ReactNode, type RefObject, useEffect, useSyncExternalStore } from 'react'
import { prefersReducedMotion } from '@/hooks/use-preferences'
import { type GameId, readBest, subscribeToScores } from '@/lib/play/scores'
import { setSoundOn, soundSnapshot, subscribeToSound } from '@/lib/play/sound'
import { cn } from '@/lib/utils'
import { Stars } from './art'

/** The stored personal best for a game (null until there is one, and on the server). */
export function useBest(game: GameId) {
  return useSyncExternalStore(
    subscribeToScores,
    () => readBest(game),
    () => null,
  )
}

const noop = () => () => {}

/**
 * False in the pre-rendered HTML and until the game's code is running. Start buttons
 * stay disabled until then, so an early click is never silently swallowed.
 */
export function useReady() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}

/** Pauses a running game when its tab is hidden or it scrolls out of view. */
export function useAutoPause(ref: RefObject<HTMLElement | null>, active: boolean, pause: () => void) {
  useEffect(() => {
    const node = ref.current
    if (!active || !node) return
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pause()
    })
    observer.observe(node)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [ref, active, pause])
}

/** Sound effects are off until the player turns them on; the choice stays in this browser. */
export function SoundToggle({ className }: { className?: string }) {
  const on = useSyncExternalStore(subscribeToSound, soundSnapshot, () => false)
  const Icon = on ? Volume2 : VolumeX
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setSoundOn(!on)}
      className={cn(
        'press inline-flex min-h-11 items-center gap-2 rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold',
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      Sound effects: {on ? 'on' : 'off'}
    </button>
  )
}

export interface Stat {
  label: string
  value: ReactNode
}

/** The shared frame around every game: scoreboard, play area, controls, announcements. */
export function GameShell({
  stats,
  controls,
  hint,
  announcement,
  children,
  className,
}: {
  stats: Stat[]
  controls?: ReactNode
  /** How to play, in one line. */
  hint: ReactNode
  /** Read out by screen readers when it changes (results, matches). */
  announcement: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-[1.75rem] border-2 border-ink bg-surface p-4 shadow-print sm:p-6', className)}>
      <dl className="flex flex-wrap gap-x-8 gap-y-2 border-b border-dashed border-line-strong pb-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="label text-[0.66rem] text-ink-muted">{stat.label}</dt>
            <dd className="font-display text-2xl leading-tight font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5">{children}</div>
      <div className="mt-5 flex min-h-11 flex-wrap items-center justify-between gap-4">
        <p className="max-w-[46ch] text-sm text-ink-muted">{hint}</p>
        {controls ? <div className="flex flex-wrap gap-2">{controls}</div> : null}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}

/** A card laid over the play area: the invitation before a round, "Paused", or the result. */
export function GameOverlay({
  title,
  children,
  action,
  stars,
  newBest,
  chips,
  compact,
}: {
  title: string
  children?: ReactNode
  /** The main button (start, resume, play again). */
  action?: ReactNode
  /** 0–3, shown on results. */
  stars?: number
  newBest?: boolean
  /** Small facts about the round, e.g. "Best streak 7". */
  chips?: string[]
  /** Tighter spacing, for a short play area. */
  compact?: boolean
}) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[color-mix(in_oklab,var(--bg)_72%,transparent)] p-3">
      <div
        className={cn(
          'card-in relative w-full rounded-2xl border-2 border-ink bg-surface text-center text-ink shadow-print',
          compact ? 'max-w-[26rem] px-4 py-3.5' : 'max-w-[22rem] px-5 py-5',
        )}
      >
        {newBest ? (
          <span className="absolute -top-3 right-3 rotate-6 rounded-md border-2 border-ink bg-butter px-2 py-0.5 label text-[0.62rem] text-on-fill">
            New personal best
          </span>
        ) : null}
        {stars !== undefined ? (
          <p className="mb-1">
            <Stars count={stars} small={compact} />
            <span className="sr-only">{stars} out of 3 stars.</span>
          </p>
        ) : null}
        <p className="font-display text-[1.45rem] leading-tight font-semibold text-balance">{title}</p>
        {children}
        {chips?.length ? (
          <ul role="list" className="mt-3 flex flex-wrap justify-center gap-1.5">
            {chips.map((chip) => (
              <li key={chip} className="rounded-pill bg-bg-deep px-2.5 py-1 text-xs font-semibold text-ink-muted">
                {chip}
              </li>
            ))}
          </ul>
        ) : null}
        {action ? <div className={cn('flex flex-wrap justify-center gap-2', compact ? 'mt-3' : 'mt-4')}>{action}</div> : null}
      </div>
    </div>
  )
}

/** The leaderboard's name field. The result cards' "Save score" buttons jump to it. */
export const BOARD_NAME_ID = 'board-name'

export const gameButton =
  'press inline-flex min-h-11 items-center gap-2 rounded-pill border-2 border-ink px-5 text-sm font-bold disabled:opacity-50'
export const gameButtonPrimary = cn(gameButton, 'bg-butter text-on-fill')
export const gameButtonQuiet = cn(gameButton, 'bg-surface text-ink')

/** On a result card: takes the player down to the leaderboard's name field. */
export function SaveScoreButton() {
  return (
    <button
      type="button"
      className={gameButtonQuiet}
      onClick={() => {
        const field = document.getElementById(BOARD_NAME_ID)
        field?.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
        field?.focus({ preventScroll: true })
      }}
    >
      Save score
    </button>
  )
}
