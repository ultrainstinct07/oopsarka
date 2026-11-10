import 'server-only'
import { Redis } from '@upstash/redis'
import { BOARD_SIZE, type BoardEntry, cleanName, isPlausibleScore, lowerIsBetter, sortEntries } from '@/lib/play/leaderboard'
import type { GameId } from '@/lib/play/scores'
import { integrations, isLeaderboardConfigured } from './config'

/**
 * The shared Playroom leaderboard, kept in Upstash Redis as one sorted set per
 * game. Only a display name, a score and a timestamp are stored: no IP address,
 * no identifier. Each set is trimmed to its best 50 entries.
 */

const KEEP = 50
const key = (game: GameId) => `oopsarka:leaderboard:${game}`

/** The few Redis commands used, so tests can pass a stand-in. */
export interface BoardStore {
  zadd(key: string, entry: { score: number; member: string }): Promise<unknown>
  zrange(key: string, start: number, stop: number, options: { rev?: boolean; withScores: true }): Promise<unknown[]>
  zremrangebyrank(key: string, start: number, stop: number): Promise<unknown>
}

let client: BoardStore | null = null

function store(): BoardStore | null {
  if (!isLeaderboardConfigured()) return null
  // Members are stored as plain strings, so the client must not try to parse them.
  client ??= new Redis({
    url: integrations.rateLimit.url!,
    token: integrations.rateLimit.token!,
    automaticDeserialization: false,
  }) as unknown as BoardStore
  return client
}

interface Member {
  n: string
  t: number
  /** Makes two identical results distinct members. */
  r: string
}

function toEntry(game: GameId, member: unknown, score: unknown): BoardEntry | null {
  try {
    const parsed = (typeof member === 'string' ? JSON.parse(member) : member) as Partial<Member> | null
    const name = cleanName(parsed?.n)
    const points = Number(score)
    if (!name || !isPlausibleScore(game, points) || typeof parsed?.t !== 'number') return null
    return { name, score: points, at: new Date(parsed.t).toISOString() }
  } catch {
    return null
  }
}

/** The top of the shared board, best first. Throws if the store cannot be reached. */
export async function fetchSharedBoard(game: GameId, redis: BoardStore | null = store()): Promise<BoardEntry[]> {
  if (!redis) throw new Error('leaderboard not configured')
  const lower = lowerIsBetter(game)
  const flat = await redis.zrange(key(game), 0, BOARD_SIZE - 1, { rev: !lower, withScores: true })
  const entries: BoardEntry[] = []
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const entry = toEntry(game, flat[i], flat[i + 1])
    if (entry) entries.push(entry)
  }
  return sortEntries(entries, lower)
}

/** Adds a result and returns the updated top of the board. The caller validates the input first. */
export async function addSharedEntry(
  game: GameId,
  name: string,
  score: number,
  redis: BoardStore | null = store(),
  now = Date.now(),
): Promise<BoardEntry[]> {
  if (!redis) throw new Error('leaderboard not configured')
  const member: Member = { n: name, t: now, r: Math.random().toString(36).slice(2, 8) }
  await redis.zadd(key(game), { score, member: JSON.stringify(member) })
  // Keep the best 50: for "fewer is better" drop the highest ranks, otherwise the lowest.
  if (lowerIsBetter(game)) await redis.zremrangebyrank(key(game), KEEP, -1)
  else await redis.zremrangebyrank(key(game), 0, -(KEEP + 1))
  return fetchSharedBoard(game, redis)
}
