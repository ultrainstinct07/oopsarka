/**
 * Leaderboards for the Playroom. This file is shared by the browser and the server:
 * the name and score rules here are the ones the server enforces too.
 *
 * There are two boards. "This device" lives in the browser's local storage and is
 * always available. The shared board is optional (see docs/INTEGRATIONS.md).
 */
import { GAMES, type GameId } from './scores'

export interface BoardEntry {
  name: string
  score: number
  /** When it was saved, as an ISO date. */
  at: string
}

export const BOARD_SIZE = 10
export const NAME_MAX = 16

/** Scores outside these ranges cannot come from a real game. */
const LIMITS: Record<GameId, { min: number; max: number }> = {
  knock: { min: 1, max: 80 },
  pairs: { min: 6, max: 300 },
  zoomies: { min: 1, max: 20_000 },
}

export const isGameId = (value: unknown): value is GameId => GAMES.some((game) => game.id === value)

export function lowerIsBetter(game: GameId) {
  return GAMES.find((entry) => entry.id === game)?.lowerIsBetter ?? false
}

/**
 * A display name: letters and numbers from any language (with the combining marks
 * scripts such as Devanagari need), spaces and a little punctuation, at most 16
 * characters. Anything else is dropped, so a name can never carry markup, links
 * or invisible characters. Returns '' if nothing is left.
 */
export function cleanName(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  const kept = raw
    .normalize('NFKC')
    .replace(/[^\p{L}\p{M}\p{N} ._'!-]/gu, '')
    // Marks belong on a letter, and a few are plenty: no stacked "glitch" text.
    .replace(/^\p{M}+/u, '')
    .replace(/(\p{M}{3})\p{M}+/gu, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  // Cut by whole characters, never through the middle of one.
  return Array.from(kept).slice(0, NAME_MAX).join('').trim()
}

export function isPlausibleScore(game: GameId, score: unknown): score is number {
  if (typeof score !== 'number' || !Number.isInteger(score)) return false
  const { min, max } = LIMITS[game]
  return score >= min && score <= max
}

/** Best first. Ties go to whoever got there earlier. */
export function sortEntries(entries: readonly BoardEntry[], lower: boolean): BoardEntry[] {
  return [...entries].sort((a, b) => (lower ? a.score - b.score : b.score - a.score) || a.at.localeCompare(b.at))
}

export function addEntry(entries: readonly BoardEntry[], entry: BoardEntry, lower: boolean, size = BOARD_SIZE) {
  return sortEntries([...entries, entry], lower).slice(0, size)
}

/** 1-based place of an entry on a board, or null if it did not make it. */
export function rankOf(entries: readonly BoardEntry[], entry: BoardEntry): number | null {
  const index = entries.findIndex((item) => item.at === entry.at && item.name === entry.name && item.score === entry.score)
  return index === -1 ? null : index + 1
}

export function formatScore(game: GameId, score: number) {
  return game === 'pairs' ? `${score} moves` : String(score)
}

/* ───────────── "This device": local storage, guarded like the best scores ───────────── */

const boardKey = (game: GameId) => `oopsarka:play:board:${game}`
const NAME_KEY = 'oopsarka:play:name'
const CHANGE_EVENT = 'oopsarka:board'
const EMPTY: BoardEntry[] = []

/** Stored data is treated as untrusted: anything malformed is dropped. */
export function parseBoard(game: GameId, raw: string | null): BoardEntry[] {
  if (!raw) return EMPTY
  try {
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return EMPTY
    const entries = data.flatMap((item): BoardEntry[] => {
      if (typeof item !== 'object' || item === null) return []
      const { name, score, at } = item as Record<string, unknown>
      const clean = cleanName(name)
      if (!clean || !isPlausibleScore(game, score) || typeof at !== 'string' || Number.isNaN(Date.parse(at))) return []
      return [{ name: clean, score, at }]
    })
    return sortEntries(entries, lowerIsBetter(game)).slice(0, BOARD_SIZE)
  } catch {
    return EMPTY
  }
}

const cache = new Map<GameId, { raw: string | null; board: BoardEntry[] }>()

/** A stable snapshot for useSyncExternalStore: the same array until the stored text changes. */
export function localBoardSnapshot(game: GameId): BoardEntry[] {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(boardKey(game))
  } catch {
    return EMPTY
  }
  const cached = cache.get(game)
  if (cached && cached.raw === raw) return cached.board
  const board = parseBoard(game, raw)
  cache.set(game, { raw, board })
  return board
}

export const emptyBoardSnapshot = () => EMPTY

export function saveLocalEntry(game: GameId, entry: BoardEntry): BoardEntry[] {
  const board = addEntry(localBoardSnapshot(game), entry, lowerIsBetter(game))
  try {
    window.localStorage.setItem(boardKey(game), JSON.stringify(board))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // Without storage the score still shows for this visit's result, just not on the board.
  }
  return board
}

export function subscribeToBoards(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** The name used last time, so it only has to be typed once. */
export function readName(): string {
  try {
    return cleanName(window.localStorage.getItem(NAME_KEY))
  } catch {
    return ''
  }
}

export function saveName(name: string) {
  try {
    window.localStorage.setItem(NAME_KEY, name)
  } catch {
    // Not remembered; nothing else depends on it.
  }
}
