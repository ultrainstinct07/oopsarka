/** Paw Pairs: deck building and matching. Pure functions, no DOM. */

export interface Face {
  id: string
  /** A ready-to-use, already sized image URL. */
  src: string
  /** What the picture shows, for screen readers. */
  label: string
}

export interface Card {
  key: string
  faceId: string
}

/** Small seeded random number generator (mulberry32), so a deal can be repeated. */
export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Two cards for each of the first `pairs` faces, shuffled with the seed. */
export function buildDeck(faces: readonly Face[], pairs: number, seed: number): Card[] {
  const chosen = faces.slice(0, pairs)
  const cards = chosen.flatMap((face) => [
    { key: `${face.id}-a`, faceId: face.id },
    { key: `${face.id}-b`, faceId: face.id },
  ])
  return shuffle(cards, seededRandom(seed))
}

export function isMatch(a: Card, b: Card) {
  return a.key !== b.key && a.faceId === b.faceId
}

/** Where an arrow key moves focus in a grid of `count` cards with `columns` columns. */
export function moveInGrid(index: number, key: string, count: number, columns: number) {
  const next =
    key === 'ArrowRight'
      ? index + 1
      : key === 'ArrowLeft'
        ? index - 1
        : key === 'ArrowDown'
          ? index + columns
          : key === 'ArrowUp'
            ? index - columns
            : key === 'Home'
              ? 0
              : key === 'End'
                ? count - 1
                : index
  return next < 0 || next >= count ? index : next
}

/** Three stars for a near-perfect memory, one for getting there in the end. */
export function pairsStars(moves: number, pairs: number) {
  return moves <= Math.ceil(pairs * 1.5) ? 3 : moves <= Math.ceil(pairs * 2.4) ? 2 : 1
}

export function pairsVerdict(moves: number, pairs: number) {
  const stars = pairsStars(moves, pairs)
  if (moves <= pairs + 1) return 'Suspiciously good. Have you been through these files before?'
  if (stars === 3) return 'Sharp. Nothing gets past you.'
  if (stars === 2) return 'Case closed, eventually.'
  return 'Thorough. Every card was inspected at least twice.'
}

/** 75 -> "1:15" */
export function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}
