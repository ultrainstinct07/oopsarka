'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Sparkle } from '@/components/media/doodles'
import { useReducedMotionPreference } from '@/hooks/use-preferences'
import { recordScore } from '@/lib/play/scores'
import { playSound } from '@/lib/play/sound'
import {
  CAT,
  collides,
  initialState,
  jump,
  type ObstacleKind,
  score,
  speedAt,
  step,
  TREAT,
  type ZoomiesState,
  zoomiesStars,
  zoomiesVerdict,
} from '@/lib/play/zoomies'
import { cn } from '@/lib/utils'
import { HALLWAY_FLOOR, HALLWAY_FURNITURE, HALLWAY_WALL, ObstacleArt, Runner, type RunnerPose, TreatArt } from './art'
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

type Status = 'idle' | 'playing' | 'paused' | 'over'

const OBSTACLE_NAME: Record<ObstacleKind, string> = {
  slipper: 'a slipper',
  box: 'a box',
  feet: 'the human’s feet',
  yarn: 'a ball of yarn',
  plant: 'a pot plant',
}

/** How far above the bottom of the scene the floor line sits. */
const FLOOR = 20
const SPRITE = { width: 80, height: 58, offsetX: -17 }

/** Short-lived decorations: dust at the feet, points popping up. */
interface Effect {
  id: number
  kind: 'dust' | 'points'
  x: number
  y: number
  text?: string
  born: number
}

/** One button: jump. Arka runs the hallway at 3 AM until something trips him. */
export default function Zoomies({
  onResult,
}: {
  /** Told the final score when the run ends, and null when a new one starts. */
  onResult?: (score: number | null) => void
}) {
  const reduced = useReducedMotionPreference()
  const [status, setStatus] = useState<Status>('idle')
  const [view, setView] = useState<ZoomiesState>(initialState)
  const [effects, setEffects] = useState<Effect[]>([])
  const [width, setWidth] = useState(600)
  const [message, setMessage] = useState('')
  const [newBest, setNewBest] = useState(false)
  const [trippedOn, setTrippedOn] = useState<ObstacleKind | null>(null)
  const sim = useRef<ZoomiesState>(initialState())
  const live = useRef<{ effects: Effect[]; nextId: number }>({ effects: [], nextId: 1 })
  const hallway = useRef<HTMLDivElement>(null)
  const best = useBest('zoomies')
  const ready = useReady()

  const pause = useCallback(() => setStatus((current) => (current === 'playing' ? 'paused' : current)), [])
  useAutoPause(hallway, status === 'playing', pause)

  useEffect(() => {
    const node = hallway.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const addEffect = useCallback((kind: Effect['kind'], x: number, y: number, text?: string) => {
    const store = live.current
    store.effects = [...store.effects, { id: store.nextId++, kind, x, y, text, born: sim.current.elapsedMs }]
    setEffects(store.effects)
  }, [])

  useEffect(() => {
    if (status !== 'playing') return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const hall = hallway.current
      const before = sim.current
      const next = step(before, now - last, hall?.clientWidth ?? 600, Math.random)
      last = now
      sim.current = next
      setView(next)

      if (next.collected > before.collected) {
        playSound('treat')
        addEffect('points', CAT.x + 26, next.y + CAT.height + 14, `+${(next.collected - before.collected) * TREAT.points}`)
      }
      if (before.y > 0 && next.y === 0) addEffect('dust', CAT.x + 8, 0)
      const store = live.current
      const alive = store.effects.filter((effect) => next.elapsedMs - effect.born < 650)
      if (alive.length !== store.effects.length) {
        store.effects = alive
        setEffects(alive)
      }

      if (next.over) {
        const points = score(next)
        const isBest = recordScore('zoomies', points)
        onResult?.(points)
        const culprit = next.obstacles.find((obstacle) => collides(next.y, obstacle))?.kind ?? null
        setTrippedOn(culprit)
        setNewBest(isBest)
        setStatus('over')
        setMessage(
          `Tripped on ${culprit ? OBSTACLE_NAME[culprit] : 'something'}. Score ${points}.${isBest ? ' New personal best.' : ''} ${zoomiesVerdict(points)}`,
        )
        playSound('crash')
        if (!reduced) {
          hall?.animate(
            [
              { translate: '0 0' },
              { translate: '-8px 2px' },
              { translate: '7px -2px' },
              { translate: '-4px 1px' },
              { translate: '0 0' },
            ],
            { duration: 320 },
          )
        }
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [status, reduced, addEffect, onResult])

  const start = () => {
    onResult?.(null)
    sim.current = initialState()
    live.current = { effects: [], nextId: 1 }
    setView(sim.current)
    setEffects([])
    setNewBest(false)
    setTrippedOn(null)
    setMessage('Zoomies started. Jump over what is in the hallway, and grab the biscuits.')
    setStatus('playing')
  }

  const leap = () => {
    if (status !== 'playing') return
    const before = sim.current
    sim.current = jump(before)
    if (sim.current !== before) {
      playSound('jump')
      addEffect('dust', CAT.x + 4, 0)
    }
  }

  const points = score(view)
  const airborne = view.y > 0
  const pose: RunnerPose =
    status === 'over' ? 'crash' : airborne ? 'jump' : Math.floor(view.distance / 24) % 2 === 0 ? 'run-a' : 'run-b'
  const lean = status === 'over' ? 24 : airborne ? Math.max(-14, Math.min(14, -view.velocity / 55)) : 0
  const fast = status === 'playing' && speedAt(view.elapsedMs, width) > 400

  return (
    <GameShell
      stats={[
        { label: 'Score', value: points },
        { label: 'Biscuits', value: view.collected },
        { label: 'Best', value: best ?? '—' },
      ]}
      hint="Tap the hallway, or press Space or the up arrow, to jump. Biscuits are worth ten. Esc pauses."
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
        ref={hallway}
        className="relative mx-auto h-64 max-w-[52rem] overflow-hidden rounded-2xl border-2 border-[#3d4672] bg-[#161d36] select-none sm:h-80"
        onKeyDown={(event) => {
          if (event.key === 'Escape') pause()
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            leap()
          }
        }}
      >
        {/* The hallway, in three layers that slide at different speeds */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-7 bg-[length:auto_100%] bg-repeat-x"
          style={{ backgroundImage: HALLWAY_WALL, backgroundPositionX: -view.distance * 0.3 }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-7 bg-[length:auto_100%] bg-repeat-x"
          style={{ backgroundImage: HALLWAY_FURNITURE, backgroundPositionX: -view.distance * 0.6 }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-7 bg-[length:96px_100%] bg-repeat-x"
          style={{ backgroundImage: HALLWAY_FLOOR, backgroundPositionX: -view.distance }}
        />

        <button
          type="button"
          onPointerDown={leap}
          onClick={(event) => {
            // Pointer taps are handled on pointer down; this covers Space and Enter.
            if (event.detail === 0) leap()
          }}
          disabled={status !== 'playing'}
          aria-label="Jump"
          className="absolute inset-0 z-[5] cursor-pointer touch-manipulation rounded-2xl disabled:cursor-default"
        />

        {/* Everything below is positioned from the floor line, in the same pixels the rules use. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0" style={{ bottom: FLOOR, height: 0 }}>
          {view.obstacles.map((obstacle) => (
            <ObstacleArt
              key={obstacle.id}
              kind={obstacle.kind}
              className="absolute bottom-0 left-0"
              style={{ width: obstacle.width, height: obstacle.height, transform: `translate3d(${obstacle.x}px, 0, 0)` }}
            />
          ))}
          {view.treats.map((treat) => (
            <div
              key={treat.id}
              className="absolute bottom-0 left-0"
              style={{ transform: `translate3d(${treat.x}px, ${-treat.y}px, 0)` }}
            >
              <TreatArt className="bob block" style={{ width: TREAT.width, height: TREAT.height }} />
            </div>
          ))}

          {/* Shadow, speed lines, then the cat himself */}
          <div
            className="absolute bottom-[-5px] left-0 h-2.5 rounded-[50%] bg-[#0c1126]/70"
            style={{
              width: CAT.width,
              transform: `translate3d(${CAT.x}px, 0, 0) scale(${1 - Math.min(view.y / 180, 0.55)})`,
            }}
          />
          {fast ? (
            <div className="absolute bottom-3 left-0" style={{ transform: `translate3d(${CAT.x - 46}px, ${-view.y}px, 0)` }}>
              <span className="streak h-0.5 w-8 rounded-full bg-[#cdbff2]/70" />
              <span className="streak mt-2 ml-3 h-0.5 w-6 rounded-full bg-[#cdbff2]/50 [animation-delay:120ms]" />
              <span className="streak mt-2 h-0.5 w-7 rounded-full bg-[#cdbff2]/60 [animation-delay:60ms]" />
            </div>
          ) : null}
          <div
            className="absolute bottom-0 left-0"
            style={{ transform: `translate3d(${CAT.x + SPRITE.offsetX}px, ${-view.y}px, 0)` }}
          >
            <Runner
              pose={pose}
              className="block origin-[55%_75%]"
              style={{ width: SPRITE.width, height: SPRITE.height, transform: `rotate(${lean}deg)` }}
            />
            {status === 'over' ? (
              <span className="absolute -top-5 left-9 block size-10 animate-[spin_1.6s_linear_infinite]">
                <Sparkle className="absolute top-0 left-1/2 size-4 -translate-x-1/2 text-[#f3d875]" />
                <Sparkle className="absolute bottom-0 left-0 size-3.5 text-[#f3efe7]" />
                <Sparkle className="absolute right-0 bottom-0 size-3.5 text-[#cdbff2]" />
              </span>
            ) : null}
          </div>

          {effects.map((effect) =>
            effect.kind === 'dust' ? (
              <span
                key={effect.id}
                className="dust absolute bottom-0"
                style={{ left: effect.x, transform: `translateY(${-effect.y}px)` }}
              >
                <span className="absolute bottom-0 left-0 block size-3 rounded-full bg-[#cdbff2]/55" />
                <span className="absolute bottom-1 left-3 block size-2 rounded-full bg-[#cdbff2]/40" />
                <span className="absolute bottom-0 left-[-0.6rem] block size-2 rounded-full bg-[#cdbff2]/40" />
              </span>
            ) : (
              <span
                key={effect.id}
                className="float-up absolute bottom-0 block rounded-pill border-2 border-[#24211f] bg-butter px-1.5 font-display text-sm leading-snug font-semibold whitespace-nowrap text-[#24211f]"
                style={{ left: effect.x, marginBottom: effect.y }}
              >
                {effect.text}
              </span>
            ),
          )}
        </div>

        {/* The time, as the human would see it */}
        <span aria-hidden className={cn('hand absolute top-2 left-3 text-lg text-[#f3efe7]/80', status === 'idle' && 'hidden')}>
          3:04 AM
        </span>

        {status === 'idle' ? (
          <GameOverlay
            compact
            title="It is 3:04 AM."
            action={
              <button type="button" onClick={start} disabled={!ready} className={gameButtonPrimary}>
                {reduced ? 'Play anyway' : 'Start the zoomies'}
              </button>
            }
          >
            <p className="mt-1.5 text-sm text-ink-muted">
              {reduced
                ? 'This game is constant movement, and you have reduced motion or Calm mode on. It only starts if you choose to play.'
                : 'The hallway is dark, the human is asleep, and the urge has arrived.'}
            </p>
          </GameOverlay>
        ) : null}
        {status === 'paused' ? (
          <GameOverlay
            compact
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
            compact
            title={`Tripped! Score ${points}.`}
            stars={zoomiesStars(points)}
            newBest={newBest}
            action={
              <>
                <button type="button" onClick={start} className={gameButtonPrimary}>
                  Run again
                </button>
                {points > 0 ? <SaveScoreButton /> : null}
              </>
            }
          >
            <p className="mt-1 text-sm text-ink-muted">
              Tripped on {trippedOn ? OBSTACLE_NAME[trippedOn] : 'something'} · {view.collected}{' '}
              {view.collected === 1 ? 'biscuit' : 'biscuits'}
            </p>
            <p className="hand mt-1.5 hidden text-xl text-lavender-ink sm:block">{zoomiesVerdict(points)}</p>
          </GameOverlay>
        ) : null}
      </div>
    </GameShell>
  )
}
