import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyScore,
  emptyTally,
  knockOutcome,
  knockStars,
  pickItem,
  pickSlot,
  ROUND_MS,
  spawnGapMs,
  stayMs,
  STREAK_EVERY,
} from '@/lib/play/knock'
import { buildDeck, type Face, formatTime, isMatch, moveInGrid, pairsStars } from '@/lib/play/pairs'
import { isBetter, readBest, recordScore } from '@/lib/play/scores'
import { isSoundOn, playSound, setSoundOn } from '@/lib/play/sound'
import { CAT, collides, initialState, jump, reaches, score, speedAt, step, TREAT, zoomiesStars } from '@/lib/play/zoomies'

const faces: Face[] = Array.from({ length: 8 }, (_, i) => ({ id: `f${i}`, src: `/f${i}.jpg`, label: `face ${i}` }))

describe('paw pairs', () => {
  it('deals exactly two of each face, the same way for the same seed', () => {
    const deck = buildDeck(faces, 6, 42)
    expect(deck).toHaveLength(12)
    const counts = new Map<string, number>()
    for (const card of deck) counts.set(card.faceId, (counts.get(card.faceId) ?? 0) + 1)
    expect([...counts.values()]).toEqual([2, 2, 2, 2, 2, 2])
    expect(buildDeck(faces, 6, 42)).toEqual(deck)
    expect(buildDeck(faces, 6, 43).map((c) => c.key)).not.toEqual(deck.map((c) => c.key))
  })

  it('matches two different cards with the same face only', () => {
    const [a, b] = [
      { key: 'x-a', faceId: 'x' },
      { key: 'x-b', faceId: 'x' },
    ]
    expect(isMatch(a, b)).toBe(true)
    expect(isMatch(a, a)).toBe(false)
    expect(isMatch(a, { key: 'y-a', faceId: 'y' })).toBe(false)
  })

  it('moves focus around the grid without leaving it', () => {
    expect(moveInGrid(0, 'ArrowRight', 12, 4)).toBe(1)
    expect(moveInGrid(0, 'ArrowLeft', 12, 4)).toBe(0)
    expect(moveInGrid(1, 'ArrowDown', 12, 4)).toBe(5)
    expect(moveInGrid(9, 'ArrowDown', 12, 4)).toBe(9)
    expect(moveInGrid(5, 'End', 12, 4)).toBe(11)
  })
})

describe('knock it off', () => {
  it('scores items, penalises the laptop and never goes below zero', () => {
    expect(applyScore(3, 'mug')).toBe(4)
    expect(applyScore(3, 'laptop')).toBe(1)
    expect(applyScore(1, 'laptop')).toBe(0)
  })

  it('speeds up over the round but stays playable by keyboard', () => {
    expect(stayMs(0)).toBe(1600)
    expect(stayMs(ROUND_MS)).toBe(1100)
    expect(stayMs(ROUND_MS * 5)).toBe(1100)
    expect(spawnGapMs(0)).toBeGreaterThan(spawnGapMs(ROUND_MS))
  })

  it('only uses free slots and picks the laptop about one time in five', () => {
    expect(pickSlot(() => 0, [true, false, true])).toBe(1)
    expect(pickSlot(() => 0.99, [true, true])).toBeNull()
    expect(pickItem(() => 0.1)).toBe('laptop')
    expect(pickItem(() => 0.5)).not.toBe('laptop')
  })
})

describe('3 am zoomies', () => {
  const box = { id: 1, kind: 'box' as const, x: CAT.x, width: 40, height: 42 }

  it('hits an obstacle on the ground and clears it in the air', () => {
    expect(collides(0, box)).toBe(true)
    expect(collides(60, box)).toBe(false)
    expect(collides(0, { ...box, x: CAT.x + 200 })).toBe(false)
  })

  it('jumps only from the floor, and lands again', () => {
    let state = jump(initialState())
    expect(state.velocity).toBeGreaterThan(0)
    state = step(state, 16, 600, () => 0.5)
    expect(state.y).toBeGreaterThan(0)
    expect(jump(state)).toBe(state)
    for (let i = 0; i < 80; i++) state = step({ ...state, obstacles: [], untilSpawn: 9999 }, 16, 600, () => 0.5)
    expect(state.y).toBe(0)
  })

  it('gets faster, scores distance and ends on a collision', () => {
    expect(speedAt(60_000)).toBeGreaterThan(speedAt(0))
    expect(speedAt(10_000_000)).toBe(540)
    const moved = step({ ...initialState(), untilSpawn: 9999 }, 40, 600, () => 0.5)
    expect(moved.distance).toBeGreaterThan(0)
    expect(score({ ...moved, distance: 400 })).toBe(20)
    const crashed = step({ ...initialState(), untilSpawn: 9999, obstacles: [box] }, 16, 600, () => 0.5)
    expect(crashed.over).toBe(true)
    expect(step(crashed, 16, 600, () => 0.5)).toBe(crashed)
  })
})

describe('personal bests', () => {
  afterEach(() => vi.unstubAllGlobals())

  const fakeWindow = (storage: Partial<Storage>) =>
    vi.stubGlobal('window', { localStorage: storage, dispatchEvent: () => true, addEventListener: () => {} })

  it('knows which direction is better for each game', () => {
    expect(isBetter(5, null, false)).toBe(true)
    expect(isBetter(5, 9, false)).toBe(false)
    expect(isBetter(5, 9, true)).toBe(true)
  })

  it('stores a better score and ignores a worse one', () => {
    const data = new Map<string, string>()
    fakeWindow({ getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) })
    expect(recordScore('knock', 0)).toBe(false)
    expect(recordScore('knock', 10)).toBe(true)
    expect(recordScore('knock', 4)).toBe(false)
    expect(readBest('knock')).toBe(10)
    expect(recordScore('pairs', 14)).toBe(true)
    expect(recordScore('pairs', 9)).toBe(true)
    expect(readBest('pairs')).toBe(9)
  })

  it('keeps working when storage throws', () => {
    const boom = () => {
      throw new Error('blocked')
    }
    fakeWindow({ getItem: boom, setItem: boom })
    expect(readBest('zoomies')).toBeNull()
    expect(recordScore('zoomies', 12)).toBe(true)
  })
})

describe('game extras', () => {
  it('pays a bonus on every fifth clean knock, and the laptop resets the streak', () => {
    let tally = emptyTally()
    const gains: number[] = []
    for (let i = 0; i < STREAK_EVERY; i++) {
      const outcome = knockOutcome(tally, 'mug')
      gains.push(outcome.gained)
      tally = outcome
    }
    expect(gains).toEqual([1, 1, 1, 1, 2])
    expect(tally.score).toBe(6)
    expect(tally.streak).toBe(5)

    const oops = knockOutcome(tally, 'laptop')
    expect(oops).toMatchObject({ score: 4, streak: 0, bestStreak: 5, laptops: 1, gained: -2, bonus: false })
    expect(knockOutcome(emptyTally(), 'laptop').score).toBe(0)
    expect([0, 6, 14, 22].map(knockStars)).toEqual([0, 1, 2, 3])
  })

  it('rates a memory game and formats its time', () => {
    expect(pairsStars(6, 6)).toBe(3)
    expect(pairsStars(9, 6)).toBe(3)
    expect(pairsStars(13, 6)).toBe(2)
    expect(pairsStars(30, 6)).toBe(1)
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75)).toBe('1:15')
  })

  it('collects a biscuit the cat touches, and only that one', () => {
    const near = { id: 1, x: CAT.x + 10, y: 0 }
    const far = { id: 2, x: CAT.x + 400, y: 0 }
    const high = { id: 3, x: CAT.x + 10, y: 120 }
    expect(reaches(0, near)).toBe(true)
    expect(reaches(0, far)).toBe(false)
    expect(reaches(0, high)).toBe(false)
    expect(reaches(90, high)).toBe(true)

    const after = step({ ...initialState(), untilSpawn: 9999, treats: [near, far] }, 16, 600, () => 0.9)
    expect(after.collected).toBe(1)
    expect(after.treats.map((treat) => treat.id)).toEqual([2])
    expect(score({ ...after, distance: 0 })).toBe(TREAT.points)
    expect([0, 25, 70, 150].map(zoomiesStars)).toEqual([0, 1, 2, 3])
  })

  it('keeps the top speed lower in a narrow hallway, so phones get time to react', () => {
    expect(speedAt(10_000_000, 340)).toBeCloseTo(374)
    expect(speedAt(10_000_000, 200)).toBe(330)
    expect(speedAt(0, 340)).toBe(speedAt(0, 900))
  })

  it('spawns a biscuit with some obstacles', () => {
    const rolls = [0, 0.5, 0.1] // obstacle kind, gap, then "biscuit over the obstacle"
    let i = 0
    const spawned = step({ ...initialState(), untilSpawn: 0 }, 16, 600, () => rolls[i++] ?? 0.9)
    expect(spawned.obstacles).toHaveLength(1)
    expect(spawned.treats).toHaveLength(1)
    expect(spawned.treats[0].y).toBeGreaterThan(spawned.obstacles[0].height)
  })
})

describe('sound effects', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('is off by default, remembers the choice, and never throws without audio support', () => {
    const data = new Map<string, string>()
    vi.stubGlobal('window', {
      localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) },
      dispatchEvent: () => true,
      addEventListener: () => {},
    })
    expect(isSoundOn()).toBe(false)
    expect(() => playSound('jump')).not.toThrow()
    setSoundOn(true)
    expect(isSoundOn()).toBe(true)
    expect(() => playSound('win')).not.toThrow()
    setSoundOn(false)
    expect(isSoundOn()).toBe(false)
  })
})
