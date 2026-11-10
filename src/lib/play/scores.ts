/**
 * Personal bests, kept in this browser's local storage only. Nothing is sent
 * anywhere. Storage can be unavailable (private windows, blocked site data),
 * so every access is guarded and the games work without it.
 */

export type GameId = 'knock' | 'pairs' | 'zoomies'

export const GAMES: { id: GameId; lowerIsBetter: boolean }[] = [
  { id: 'knock', lowerIsBetter: false },
  { id: 'pairs', lowerIsBetter: true },
  { id: 'zoomies', lowerIsBetter: false },
]

const key = (game: GameId) => `oopsarka:play:${game}`
const CHANGE_EVENT = 'oopsarka:score'

export function isBetter(score: number, best: number | null, lowerIsBetter: boolean) {
  if (best === null) return true
  return lowerIsBetter ? score < best : score > best
}

export function readBest(game: GameId): number | null {
  try {
    const raw = window.localStorage.getItem(key(game))
    if (raw === null) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

/** Saves the score if it beats the stored best. Returns true when it is a new best. */
export function recordScore(game: GameId, score: number): boolean {
  const lowerIsBetter = GAMES.find((entry) => entry.id === game)?.lowerIsBetter ?? false
  // Scoring nothing is never a personal best.
  if (!lowerIsBetter && score <= 0) return false
  if (!isBetter(score, readBest(game), lowerIsBetter)) return false
  try {
    window.localStorage.setItem(key(game), String(score))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // Still a personal best for this round; it just won't be remembered.
  }
  return true
}

export function subscribeToScores(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}
