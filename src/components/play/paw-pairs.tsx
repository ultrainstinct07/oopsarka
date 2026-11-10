'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkle } from '@/components/media/doodles'
import { useMediaQuery } from '@/hooks/use-preferences'
import { buildDeck, type Card, type Face, formatTime, isMatch, moveInGrid, pairsStars, pairsVerdict } from '@/lib/play/pairs'
import { recordScore } from '@/lib/play/scores'
import { playSound } from '@/lib/play/sound'
import { cn } from '@/lib/utils'
import { CardBack, Confetti, Stars } from './art'
import { GameOverlay, gameButtonPrimary, gameButtonQuiet, GameShell, SaveScoreButton, useBest, useReady } from './game-shell'

const PAIRS = 6
/** How long a wrong pair stays face up before turning back. */
const PEEK_MS = 900

/** Cards are laid down by hand: each sits at a slightly different angle. */
const tilt = (index: number) => `${(((index * 37) % 5) - 2) * 0.7}deg`

/** Memory match with Arka's photos and the story illustrations. Untimed; fewer moves is better. */
export default function PawPairs({
  faces,
  seed,
  onResult,
}: {
  faces: Face[]
  seed?: number
  /** Told the number of moves when the last pair is found, and null on a new deal. */
  onResult?: (score: number | null) => void
}) {
  const [deck, setDeck] = useState<Card[]>([])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [focus, setFocus] = useState(0)
  const [message, setMessage] = useState('')
  const [newBest, setNewBest] = useState(false)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const columns = useMediaQuery('(min-width: 640px)') ? 4 : 3
  const best = useBest('pairs')
  const ready = useReady()
  const byId = new Map(faces.map((face) => [face.id, face]))
  const pairs = Math.min(PAIRS, faces.length)
  const done = deck.length > 0 && matched.length === pairs
  const ticking = started && !done

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  useEffect(() => {
    if (!ticking) return
    const clock = setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => clearInterval(clock)
  }, [ticking])

  const deal = () => {
    onResult?.(null)
    if (timer.current) clearTimeout(timer.current)
    setDeck(buildDeck(faces, pairs, seed ?? Date.now()))
    setOpen([])
    setMatched([])
    setMoves(0)
    setSeconds(0)
    setStarted(false)
    setFocus(0)
    setNewBest(false)
    setMessage('Cards dealt. Find the six pairs.')
    playSound('flip')
  }

  const flip = (index: number) => {
    const card = deck[index]
    if (!card || open.length === 2 || open.includes(index) || matched.includes(card.faceId)) return
    setStarted(true)
    if (open.length === 0) {
      setOpen([index])
      setMessage(`Card ${index + 1}: ${byId.get(card.faceId)?.label}.`)
      playSound('flip')
      return
    }
    const first = deck[open[0]]
    const total = moves + 1
    setMoves(total)
    setOpen([open[0], index])
    if (isMatch(first, card)) {
      const found = [...matched, card.faceId]
      setMatched(found)
      setOpen([])
      if (found.length === pairs) {
        const isBest = recordScore('pairs', total)
        onResult?.(total)
        setNewBest(isBest)
        setMessage(`All pairs found in ${total} moves.${isBest ? ' New personal best.' : ''} ${pairsVerdict(total, pairs)}`)
        playSound('win')
      } else {
        setMessage(`A match: ${byId.get(card.faceId)?.label}. ${pairs - found.length} to go.`)
        playSound('match')
      }
    } else {
      setMessage(`Card ${index + 1}: ${byId.get(card.faceId)?.label}. Not a match.`)
      playSound('miss')
      timer.current = setTimeout(() => setOpen([]), PEEK_MS)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const next = moveInGrid(index, event.key, deck.length, columns)
    if (next === index) return
    event.preventDefault()
    setFocus(next)
    buttons.current[next]?.focus()
  }

  const grid = 'mx-auto grid max-w-[36rem] grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4'
  const stars = pairsStars(moves, pairs)

  return (
    <GameShell
      stats={[
        { label: 'Moves', value: moves },
        { label: 'Pairs found', value: `${matched.length}/${pairs}` },
        { label: 'Time', value: formatTime(seconds) },
        { label: 'Best', value: best === null ? '—' : `${best} moves` },
      ]}
      hint="Turn over two cards at a time to find the pairs. Arrow keys move between cards; Enter turns one over."
      announcement={message}
      controls={
        deck.length ? (
          <button type="button" onClick={deal} className={gameButtonQuiet}>
            Shuffle and deal again
          </button>
        ) : null
      }
    >
      <div className="relative rounded-2xl bg-sage-soft px-3 py-5 sm:px-6 sm:py-7">
        {deck.length === 0 ? (
          <>
            {/* The untouched deck, behind the invitation */}
            <div aria-hidden className={grid}>
              {Array.from({ length: pairs * 2 }, (_, index) => (
                <span
                  key={index}
                  className="block aspect-square overflow-hidden rounded-xl border-2 border-ink shadow-[var(--shadow-sticker)]"
                  style={{ rotate: tilt(index) }}
                >
                  <CardBack className="size-full" />
                </span>
              ))}
            </div>
            <GameOverlay
              title="Six pairs. Twelve cards."
              action={
                <button type="button" onClick={deal} disabled={!ready} className={gameButtonPrimary}>
                  Deal the cards
                </button>
              }
            >
              <p className="mt-2 text-sm text-ink-muted">
                Every picture in the case file appears twice. Match them all in as few moves as you can.
              </p>
            </GameOverlay>
          </>
        ) : null}

        {done ? <Confetti /> : null}

        <ul role="list" aria-label="Cards" className={cn(grid, deck.length === 0 && 'hidden')}>
          {deck.map((card, index) => {
            const face = byId.get(card.faceId)
            const isMatched = matched.includes(card.faceId)
            const up = isMatched || open.includes(index)
            const wrong = open.length === 2 && open.includes(index)
            return (
              <li
                key={card.key}
                className={cn(
                  'aspect-square transition-[translate] duration-200 [perspective:800px]',
                  !up && 'hover:-translate-y-1',
                  wrong && 'shake',
                )}
                style={{ rotate: tilt(index) }}
              >
                <button
                  ref={(node) => {
                    buttons.current[index] = node
                  }}
                  type="button"
                  tabIndex={index === focus ? 0 : -1}
                  aria-label={
                    up ? `Card ${index + 1}: ${face?.label}${isMatched ? ', matched' : ''}` : `Card ${index + 1}, face down`
                  }
                  aria-disabled={isMatched || undefined}
                  onFocus={() => setFocus(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  onClick={() => flip(index)}
                  className={cn(
                    'relative block size-full rounded-xl transition-transform duration-500 ease-[var(--ease-out-soft)] transform-3d',
                    up && 'rotate-y-180',
                  )}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-xl border-2 border-ink shadow-[var(--shadow-sticker)] backface-hidden">
                    <CardBack className="size-full" />
                  </span>
                  <span
                    className={cn(
                      'absolute inset-0 rotate-y-180 rounded-xl border-2 bg-frame p-1.5 pb-4 shadow-[var(--shadow-sticker)] backface-hidden sm:p-2 sm:pb-5',
                      isMatched ? 'border-success' : 'border-ink',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- already an optimised, sized URL */}
                    <img
                      src={face?.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-full rounded-[0.3rem] object-cover"
                    />
                    {isMatched ? (
                      <>
                        <span className="stamp-in absolute bottom-2 left-1/2 -translate-x-1/2 -rotate-6 rounded-[0.3rem] border-2 border-success bg-frame px-1.5 label text-[0.58rem] leading-relaxed text-success sm:text-[0.66rem]">
                          Matched
                        </span>
                        <Sparkle className="pop-in absolute -top-2 -right-2 size-5 text-marmalade" />
                      </>
                    ) : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {done ? (
          <div className="card-in relative mx-auto mt-6 max-w-[36rem] rounded-2xl border-2 border-ink bg-surface p-5 text-center shadow-print">
            {newBest ? (
              <span className="absolute -top-3 right-3 rotate-6 rounded-md border-2 border-ink bg-butter px-2 py-0.5 label text-[0.62rem] text-on-fill">
                New personal best
              </span>
            ) : null}
            <p>
              <Stars count={stars} />
              <span className="sr-only">{stars} out of 3 stars.</span>
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">Case closed in {moves} moves.</p>
            <p className="mt-1 text-sm text-ink-muted">Time: {formatTime(seconds)}</p>
            <p className="hand mt-2 text-xl text-lavender-ink">{pairsVerdict(moves, pairs)}</p>
            <div className="mt-4 flex justify-center">
              <SaveScoreButton />
            </div>
          </div>
        ) : null}
      </div>
    </GameShell>
  )
}
