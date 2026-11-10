'use client'

import { lazy, type ReactNode, startTransition, Suspense, useCallback, useState, useSyncExternalStore } from 'react'
import { isPlausibleScore } from '@/lib/play/leaderboard'
import type { Face } from '@/lib/play/pairs'
import type { GameId } from '@/lib/play/scores'
import { cn } from '@/lib/utils'
import { CardBack, ItemArt, Runner } from './art'
import { SoundToggle } from './game-shell'
import { Leaderboard } from './leaderboard'

// Each game is its own chunk, downloaded only when it is opened.
const KnockItOff = lazy(() => import('./knock-it-off'))
const PawPairs = lazy(() => import('./paw-pairs'))
const Zoomies = lazy(() => import('./zoomies'))

const thumb = 'grid size-16 shrink-0 place-items-center rounded-xl border-2 border-ink'

const GAMES: { id: GameId; title: string; blurb: string; art: ReactNode; tone: string }[] = [
  {
    id: 'knock',
    title: 'Knock It Off',
    blurb: 'Thirty seconds to clear the shelf and the table. Do not touch the laptop.',
    art: (
      <span className={cn(thumb, 'bg-[#fffdf8]')}>
        <ItemArt kind="mug" className="size-12" />
      </span>
    ),
    tone: 'bg-butter-soft',
  },
  {
    id: 'pairs',
    title: 'Paw Pairs',
    blurb: 'Match the case-file photos in as few moves as you can.',
    art: (
      <span className={cn(thumb, 'overflow-hidden')}>
        <CardBack className="size-full" />
      </span>
    ),
    tone: 'bg-lavender-soft',
  },
  {
    id: 'zoomies',
    title: '3 AM Zoomies',
    blurb: 'One button. One hallway. Jump the slippers, grab the biscuits.',
    art: (
      <span className={cn(thumb, 'bg-[#161d36]')}>
        <Runner pose="jump" className="w-14" />
      </span>
    ),
    tone: 'bg-rose-soft',
  },
]

const isGame = (value: string | null): value is GameId => GAMES.some((game) => game.id === value)

const subscribeToUrl = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

/**
 * The query string, read without `useSearchParams`: that hook would stop the page
 * being pre-rendered, and the games would pop in after load and shift the layout.
 * The server renders the default game; a `?game=` link switches once the page is live.
 */
function useQuery() {
  const search = useSyncExternalStore(
    subscribeToUrl,
    () => window.location.search,
    () => '',
  )
  return new URLSearchParams(search)
}

/** The game picker and the chosen game. `?game=` deep-links to one. */
export function Playroom({
  faces,
  sharedBoard = false,
}: {
  faces: Face[]
  /** Whether the shared leaderboard is switched on (decided on the server). */
  sharedBoard?: boolean
}) {
  const params = useQuery()
  const requested = params.get('game')
  const [chosen, setChosen] = useState<GameId | null>(null)
  // A finished game's score, waiting for the player to put a name to it.
  const [pending, setPending] = useState<{ game: GameId; score: number } | null>(null)
  const report = useCallback(
    (game: GameId, score: number | null) => setPending(score !== null && isPlausibleScore(game, score) ? { game, score } : null),
    [setPending],
  )
  const reportKnock = useCallback((score: number | null) => report('knock', score), [report])
  const reportPairs = useCallback((score: number | null) => report('pairs', score), [report])
  const reportZoomies = useCallback((score: number | null) => report('zoomies', score), [report])
  const active = chosen ?? (isGame(requested) ? requested : 'knock')
  // Test hooks: a fixed shuffle and a shorter round.
  const seed = Number(params.get('seed')) || undefined
  const seconds = Math.min(30, Math.max(3, Number(params.get('seconds')) || 30))

  const choose = (id: GameId) => {
    // A transition keeps the current game on screen until the next one has loaded.
    startTransition(() => setChosen(id))
    setPending(null)
    const url = new URL(window.location.href)
    url.searchParams.set('game', id)
    window.history.replaceState(null, '', url)
  }

  const current = GAMES.find((game) => game.id === active) ?? GAMES[0]

  return (
    <div className="mx-auto max-w-[66rem]">
      <div role="group" aria-label="Choose a game" className="grid gap-3 sm:grid-cols-3">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            aria-pressed={game.id === active}
            onClick={() => choose(game.id)}
            className={cn(
              'press group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1',
              game.tone,
              game.id === active ? 'border-ink shadow-print' : 'border-transparent',
            )}
          >
            <span aria-hidden className="transition-[rotate,scale] duration-300 group-hover:scale-105 group-hover:-rotate-3">
              {game.art}
            </span>
            <span>
              <span className="block font-display text-xl leading-tight font-semibold">{game.title}</span>
              <span className="mt-1 block text-sm text-ink-muted">{game.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      <section aria-labelledby="game-title" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="game-title" className="font-display text-headline font-semibold">
            {current.title}
          </h2>
          <SoundToggle />
        </div>
        <div className="mt-5">
          <Suspense
            fallback={
              <p className="grid min-h-[34rem] place-items-center rounded-[1.75rem] border-2 border-dashed border-line-strong p-10 text-center">
                Setting up…
              </p>
            }
          >
            {active === 'knock' ? <KnockItOff roundMs={seconds * 1000} onResult={reportKnock} /> : null}
            {active === 'pairs' ? <PawPairs faces={faces} seed={seed} onResult={reportPairs} /> : null}
            {active === 'zoomies' ? <Zoomies onResult={reportZoomies} /> : null}
          </Suspense>
        </div>
        <Leaderboard
          game={active}
          title={current.title}
          shared={sharedBoard}
          pending={pending?.game === active ? pending.score : null}
          onSaved={() => setPending(null)}
        />
      </section>
    </div>
  )
}
