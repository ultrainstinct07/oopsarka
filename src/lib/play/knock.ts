/** Knock It Off: items, timing and scoring. Pure functions, no DOM. */

export const ROUND_MS = 30_000
export const SLOT_COUNT = 6
/** How long a knocked item takes to fall before its slot frees up. */
export const FALL_MS = 620

export type ItemKind = 'mug' | 'plant' | 'pen' | 'glasses' | 'laptop'

export const ITEMS: Record<ItemKind, { label: string; points: number; fragile: boolean }> = {
  mug: { label: 'a mug', points: 1, fragile: false },
  plant: { label: 'a small plant', points: 1, fragile: false },
  pen: { label: 'a pot of pencils', points: 1, fragile: false },
  glasses: { label: 'reading glasses', points: 1, fragile: false },
  laptop: { label: 'the human’s laptop', points: -2, fragile: true },
}

const SAFE: ItemKind[] = ['mug', 'plant', 'pen', 'glasses']

/** One item in five is the laptop, which should be left alone. */
export function pickItem(random: () => number): ItemKind {
  if (random() < 0.2) return 'laptop'
  return SAFE[Math.floor(random() * SAFE.length)]
}

/** A free slot at random, or null when the table is full. */
export function pickSlot(random: () => number, occupied: readonly boolean[]): number | null {
  const free = occupied.flatMap((taken, index) => (taken ? [] : [index]))
  if (!free.length) return null
  return free[Math.floor(random() * free.length)]
}

const progress = (elapsedMs: number, roundMs: number) => Math.min(1, Math.max(0, elapsedMs / roundMs))

/** Items linger 1.6 s at first, easing down to 1.1 s. Long enough for keyboard play. */
export function stayMs(elapsedMs: number, roundMs = ROUND_MS) {
  return Math.round(1600 - 500 * progress(elapsedMs, roundMs))
}

/** The gap between new items shrinks from 750 ms to 450 ms over the round. */
export function spawnGapMs(elapsedMs: number, roundMs = ROUND_MS) {
  return Math.round(750 - 300 * progress(elapsedMs, roundMs))
}

/** The score never drops below zero. */
export function applyScore(score: number, kind: ItemKind) {
  return Math.max(0, score + ITEMS[kind].points)
}

/** Every fifth clean knock in a row earns a bonus point. */
export const STREAK_EVERY = 5

export interface KnockTally {
  score: number
  /** Clean knocks in a row; the laptop resets it. */
  streak: number
  bestStreak: number
  laptops: number
}

export const emptyTally = (): KnockTally => ({ score: 0, streak: 0, bestStreak: 0, laptops: 0 })

/** The tally after knocking an item, plus the points it was worth (bonus included). */
export function knockOutcome(tally: KnockTally, kind: ItemKind): KnockTally & { gained: number; bonus: boolean } {
  if (ITEMS[kind].fragile) {
    const score = applyScore(tally.score, kind)
    return { ...tally, score, streak: 0, laptops: tally.laptops + 1, gained: score - tally.score, bonus: false }
  }
  const streak = tally.streak + 1
  const bonus = streak % STREAK_EVERY === 0
  const gained = ITEMS[kind].points + (bonus ? 1 : 0)
  return {
    ...tally,
    score: tally.score + gained,
    streak,
    bestStreak: Math.max(tally.bestStreak, streak),
    gained,
    bonus,
  }
}

export function knockStars(score: number) {
  return score >= 22 ? 3 : score >= 14 ? 2 : score >= 6 ? 1 : 0
}

export function knockVerdict(score: number) {
  if (score >= 22) return 'Nothing is safe. Chief Mischief Officer, confirmed.'
  if (score >= 14) return 'A solid shift. The table is nearly clear.'
  if (score >= 6) return 'Respectable. Several items remain suspiciously upright.'
  return 'A gentle warm-up. The mug will be back.'
}
