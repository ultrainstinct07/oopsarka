'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/hooks/use-preferences'
import {
  emptyTally,
  FALL_MS,
  ITEMS,
  type ItemKind,
  knockOutcome,
  knockStars,
  type KnockTally,
  knockVerdict,
  pickItem,
  pickSlot,
  ROUND_MS,
  SLOT_COUNT,
  spawnGapMs,
  stayMs,
  STREAK_EVERY,
} from '@/lib/play/knock'
import { recordScore } from '@/lib/play/scores'
import { playSound } from '@/lib/play/sound'
import { cn } from '@/lib/utils'
import { type ArkaMood, ArkaPeek, ItemArt, PawArm, ROOM_WALLPAPER } from './art'
import {
  GameOverlay,
  gameButtonPrimary,
  gameButtonQuiet,
  GameShell,
  SaveScoreButton,
  useAutoPause,
  useBest,
  useReady,
} from './game-shell'

interface Slot {
  id: number
  kind: ItemKind
  /** Round time (ms) at which the item leaves. */
  until: number
  falling: boolean
  /** Points it was worth once knocked (negative for the laptop). */
  gained: number
  bonus: boolean
}
type Status = 'idle' | 'playing' | 'paused' | 'over'

const emptyRoom = (): (Slot | null)[] => Array.from({ length: SLOT_COUNT }, () => null)
const newGame = () => ({ elapsed: 0, last: 0, nextSpawn: 300, id: 0, tally: emptyTally(), slots: emptyRoom() })

// The first half of the slots sit on the wall shelf, the rest on the table.
const SHELF = [0, 1, 2]
const TABLE = [3, 4, 5]

/** Tap things off the shelf and the table before they slide away. Leave the laptop alone. */
export default function KnockItOff({
  roundMs = ROUND_MS,
  onResult,
}: {
  roundMs?: number
  /** Told the final score when a round ends, and null when a new one starts. */
  onResult?: (score: number | null) => void
}) {
  const [status, setStatus] = useState<Status>('idle')
  const [slots, setSlots] = useState<(Slot | null)[]>(emptyRoom)
  const [tally, setTally] = useState<KnockTally>(emptyTally)
  const [left, setLeft] = useState(roundMs)
  const [message, setMessage] = useState('')
  const [newBest, setNewBest] = useState(false)
  const [mood, setMood] = useState<ArkaMood>('calm')
  const game = useRef(newGame())
  const room = useRef<HTMLDivElement>(null)
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const best = useBest('knock')
  const ready = useReady()

  const pause = useCallback(() => setStatus((current) => (current === 'playing' ? 'paused' : current)), [])
  useAutoPause(room, status === 'playing', pause)
  useEffect(() => () => void (moodTimer.current && clearTimeout(moodTimer.current)), [])

  useEffect(() => {
    if (status !== 'playing') return
    const state = game.current
    state.last = performance.now()
    const timer = setInterval(() => {
      const now = performance.now()
      state.elapsed += now - state.last
      state.last = now
      if (state.elapsed >= roundMs) {
        const { score } = state.tally
        const isBest = recordScore('knock', score)
        onResult?.(score)
        state.slots = emptyRoom()
        setSlots(state.slots)
        setLeft(0)
        setNewBest(isBest)
        setStatus('over')
        setMessage(`Time! ${score} knocked off.${isBest ? ' New personal best.' : ''} ${knockVerdict(score)}`)
        playSound('timeup')
        return
      }
      let next = state.slots.map((slot) => (slot && slot.until <= state.elapsed ? null : slot))
      if (state.elapsed >= state.nextSpawn) {
        const index = pickSlot(
          Math.random,
          next.map((slot) => slot !== null),
        )
        if (index !== null) {
          next = [...next]
          next[index] = {
            id: ++state.id,
            kind: pickItem(Math.random),
            until: state.elapsed + stayMs(state.elapsed, roundMs),
            falling: false,
            gained: 0,
            bonus: false,
          }
        }
        state.nextSpawn = state.elapsed + spawnGapMs(state.elapsed, roundMs)
      }
      state.slots = next
      setSlots(next)
      setLeft(roundMs - state.elapsed)
    }, 100)
    return () => clearInterval(timer)
  }, [status, roundMs, onResult])

  const start = () => {
    onResult?.(null)
    game.current = newGame()
    setSlots(game.current.slots)
    setTally(game.current.tally)
    setLeft(roundMs)
    setNewBest(false)
    setMood('calm')
    setMessage('Go! Knock things off the shelf and the table. Leave the laptop.')
    setStatus('playing')
  }

  const react = (next: ArkaMood, ms: number) => {
    if (moodTimer.current) clearTimeout(moodTimer.current)
    setMood(next)
    moodTimer.current = setTimeout(() => setMood('calm'), ms)
  }

  const knock = (index: number) => {
    const state = game.current
    const slot = state.slots[index]
    if (status !== 'playing' || !slot || slot.falling) return
    const outcome = knockOutcome(state.tally, slot.kind)
    const { gained, bonus, ...next } = outcome
    state.tally = next
    state.slots = state.slots.map((entry, i) =>
      i === index && entry ? { ...entry, falling: true, until: state.elapsed + FALL_MS, gained, bonus } : entry,
    )
    setSlots(state.slots)
    setTally(next)
    if (ITEMS[slot.kind].fragile) {
      playSound('oops')
      react('oops', 800)
      if (!prefersReducedMotion()) {
        room.current?.animate(
          [{ translate: '0 0' }, { translate: '-7px 0' }, { translate: '6px 0' }, { translate: '-3px 0' }, { translate: '0 0' }],
          { duration: 300 },
        )
      }
    } else {
      playSound(bonus ? 'bonus' : 'knock')
      react('pleased', 450)
    }
  }

  const seconds = Math.ceil(left / 1000)
  const fraction = Math.max(0, Math.min(1, left / roundMs))

  const renderSlot = (index: number) => {
    const slot = slots[index]
    const item = slot ? ITEMS[slot.kind] : null
    return (
      <li key={index} className="relative flex h-[5.2rem] items-end justify-center sm:h-[6.2rem]">
        {slot && item ? (
          <button
            key={slot.id}
            type="button"
            disabled={slot.falling}
            onClick={() => knock(index)}
            aria-label={item.fragile ? `Do not touch: ${item.label}` : `Knock off ${item.label}`}
            className={cn(
              'pop-in relative block size-16 rounded-xl transition-[translate,rotate,opacity] duration-500 ease-in sm:size-[5.6rem]',
              slot.falling && 'translate-y-28 rotate-[75deg] opacity-0',
            )}
          >
            {item.fragile ? <span aria-hidden className="absolute inset-x-0 top-2 bottom-0 rounded-xl bg-rose/55" /> : null}
            <ItemArt kind={slot.kind} className="relative size-full" />
            {item.fragile ? (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-ink bg-butter text-sm font-extrabold text-on-fill"
              >
                !
              </span>
            ) : null}
          </button>
        ) : null}
        {slot?.falling ? (
          <>
            <PawArm key={`paw-${slot.id}`} className="swipe pointer-events-none absolute top-0 right-[4%] z-[4] h-24 w-12" />
            <span
              key={`points-${slot.id}`}
              aria-hidden
              className={cn(
                'float-up pointer-events-none absolute top-0 left-1/2 z-[5] -translate-x-1/2 rounded-pill border-2 border-ink px-2 font-display text-lg leading-snug font-semibold whitespace-nowrap text-on-fill',
                slot.gained < 0 ? 'bg-rose' : slot.bonus ? 'bg-lavender' : 'bg-butter',
              )}
            >
              {slot.gained < 0 ? `−${Math.abs(slot.gained)}` : slot.bonus ? `+${slot.gained} streak!` : `+${slot.gained}`}
            </span>
          </>
        ) : null}
      </li>
    )
  }

  return (
    <GameShell
      stats={[
        { label: 'Knocked off', value: tally.score },
        { label: 'Time left', value: `${seconds}s` },
        { label: 'Streak', value: tally.streak },
        { label: 'Best', value: best ?? '—' },
      ]}
      hint={`Tap an item (or Tab to it and press Enter) before it slides away. Every ${STREAK_EVERY} in a row earns a bonus. The laptop costs two points.`}
      announcement={message}
      controls={
        status === 'playing' ? (
          <button type="button" onClick={pause} className={gameButtonQuiet}>
            Pause
          </button>
        ) : status === 'paused' ? (
          <button type="button" onClick={start} className={gameButtonQuiet}>
            Restart
          </button>
        ) : null
      }
    >
      <div
        ref={room}
        className="relative mx-auto h-[21rem] max-w-[46rem] overflow-hidden rounded-2xl border-2 border-ink bg-[#ebe5f7] text-[#24211f] sm:h-[25rem]"
        style={{ backgroundImage: ROOM_WALLPAPER }}
      >
        {/* Time running out, as a bar */}
        <div aria-hidden className="absolute inset-x-0 top-0 z-[6] h-2 bg-[#24211f]/10">
          <div
            className={cn('h-full transition-[width] duration-150 ease-linear', seconds <= 5 ? 'bg-marmalade' : 'bg-[#5f4b9b]')}
            style={{ width: `${fraction * 100}%` }}
          />
        </div>

        {/* A note on the wall that nobody reads */}
        <div
          aria-hidden
          className="absolute top-[9%] right-[4%] w-[26%] max-w-[9rem] rotate-3 rounded-sm border-2 border-[#24211f] bg-[#fffdf8] px-2 py-1.5 text-center shadow-[var(--shadow-sticker)]"
        >
          <span className="absolute -top-2 left-1/2 h-3 w-9 -translate-x-1/2 -rotate-3 bg-butter/80" />
          <span className="hand block text-[0.82rem] leading-tight sm:text-base">Please do not knock things off.</span>
        </div>

        {/* A pendant lamp, for a little warmth */}
        <div aria-hidden className="absolute top-2 left-[9%] flex flex-col items-center">
          <span className="h-5 w-0.5 bg-[#24211f] sm:h-7" />
          <span className="h-5 w-12 rounded-t-full border-2 border-[#24211f] bg-butter sm:h-6 sm:w-14" />
          <span className="-mt-0.5 h-2 w-4 rounded-b-full border-2 border-t-0 border-[#24211f] bg-[#fffdf8]" />
        </div>

        {/* Floor */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[9%] border-t-2 border-[#24211f] bg-[#e7d9c0]" />
        <div aria-hidden className="absolute inset-x-0 bottom-[9%] h-2.5 border-t-2 border-[#24211f]/70 bg-[#d9cdf0]" />

        {/* Shelf */}
        <div aria-hidden className="absolute top-[40%] right-[31%] left-[3%]">
          <div className="h-3.5 rounded-sm border-2 border-[#24211f] bg-[#d9a066]" />
          <div className="absolute top-full left-[10%] h-3 w-2.5 border-2 border-t-0 border-[#24211f] bg-[#b9773c]" />
          <div className="absolute top-full right-[10%] h-3 w-2.5 border-2 border-t-0 border-[#24211f] bg-[#b9773c]" />
        </div>
        <ul role="list" aria-label="The shelf" className="absolute right-[33%] bottom-[60%] left-[5%] grid grid-cols-3">
          {SHELF.map(renderSlot)}
        </ul>

        {/* Table */}
        <div
          aria-hidden
          className="absolute top-[calc(79%+0.75rem)] bottom-[3%] left-[7%] w-3 border-x-2 border-[#24211f] bg-[#b9773c]"
        />
        <div
          aria-hidden
          className="absolute top-[calc(79%+0.75rem)] right-[7%] bottom-[3%] w-3 border-x-2 border-[#24211f] bg-[#b9773c]"
        />
        <div
          aria-hidden
          className="absolute inset-x-[5%] top-[calc(79%+0.75rem)] h-7 border-2 border-t-0 border-[#24211f] bg-[#c98c4a]"
        />
        <div
          aria-hidden
          className="absolute inset-x-[2%] top-[79%] z-[2] h-4 rounded-md border-2 border-[#24211f] bg-[#e8b878]"
        />
        <ul role="list" aria-label="The table" className="absolute right-[33%] bottom-[21%] left-[5%] z-[3] grid grid-cols-3">
          {TABLE.map(renderSlot)}
        </ul>

        {/* The culprit */}
        <ArkaPeek mood={mood} className="absolute right-[1.5%] bottom-[calc(21%-0.6rem)] z-[3] w-[29%] max-w-[10.5rem]" />

        {tally.streak >= 3 && status === 'playing' ? (
          <span
            aria-hidden
            className="absolute top-4 left-3 z-[6] -rotate-3 rounded-md border-2 border-[#24211f] bg-lavender px-2 py-0.5 label text-[0.65rem]"
          >
            Streak ×{tally.streak}
          </span>
        ) : null}

        {status === 'idle' ? (
          <GameOverlay
            title="Thirty seconds. One shelf. One table."
            action={
              <button type="button" onClick={start} disabled={!ready} className={gameButtonPrimary}>
                Start knocking
              </button>
            }
          >
            <p className="mt-2 text-sm text-ink-muted">Everything is far too close to the edge. Fix that.</p>
          </GameOverlay>
        ) : null}
        {status === 'paused' ? (
          <GameOverlay
            title="Paused"
            action={
              <button type="button" onClick={() => setStatus('playing')} className={gameButtonPrimary}>
                Resume
              </button>
            }
          />
        ) : null}
        {status === 'over' ? (
          <GameOverlay
            title={`Time! ${tally.score} knocked off.`}
            stars={knockStars(tally.score)}
            newBest={newBest}
            chips={[
              `Best streak ${tally.bestStreak}`,
              tally.laptops === 0 ? 'Laptop untouched' : `Laptop touched ${tally.laptops}×`,
            ]}
            action={
              <>
                <button type="button" onClick={start} className={gameButtonPrimary}>
                  Play again
                </button>
                {tally.score > 0 ? <SaveScoreButton /> : null}
              </>
            }
          >
            <p className="hand mt-2 text-xl text-lavender-ink">{knockVerdict(tally.score)}</p>
          </GameOverlay>
        ) : null}
      </div>
    </GameShell>
  )
}
