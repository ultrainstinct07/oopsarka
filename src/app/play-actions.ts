'use server'

import { headers } from 'next/headers'
import { isLeaderboardConfigured } from '@/lib/integrations/config'
import { addSharedEntry, fetchSharedBoard } from '@/lib/integrations/leaderboard'
import { clientFingerprint, getLimiter } from '@/lib/integrations/rate-limit'
import { type BoardEntry, cleanName, isGameId, isPlausibleScore } from '@/lib/play/leaderboard'

/**
 * Server side of the shared Playroom leaderboard. Everything a browser sends is
 * checked again here: the game, the name and whether the score is possible.
 * A save is only ever reported once the store has confirmed it.
 */

export type LoadBoardResult = { status: 'ok'; board: BoardEntry[] } | { status: 'not_configured' | 'invalid' | 'error' }

export type SubmitScoreResult =
  { status: 'saved'; board: BoardEntry[] } | { status: 'not_configured' | 'invalid' | 'rate_limited' | 'error' }

async function clientIp() {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || null
}

export async function loadSharedBoard(game: unknown): Promise<LoadBoardResult> {
  if (!isLeaderboardConfigured()) return { status: 'not_configured' }
  if (!isGameId(game)) return { status: 'invalid' }
  try {
    return { status: 'ok', board: await fetchSharedBoard(game) }
  } catch (error) {
    console.error('[leaderboard] load failed', error)
    return { status: 'error' }
  }
}

export async function submitScore(game: unknown, name: unknown, score: unknown): Promise<SubmitScoreResult> {
  if (!isLeaderboardConfigured()) return { status: 'not_configured' }
  const clean = cleanName(name)
  // The name must survive cleaning unchanged, so what is stored is exactly what the player saw.
  if (!isGameId(game) || !clean || clean !== name || !isPlausibleScore(game, score)) return { status: 'invalid' }

  try {
    // If the limiter cannot be reached, nothing is saved: that counts as an error, not a pass.
    const { success } = await getLimiter('leaderboard').limit(clientFingerprint(await clientIp()))
    if (!success) return { status: 'rate_limited' }
    return { status: 'saved', board: await addSharedEntry(game, clean, score) }
  } catch (error) {
    console.error('[leaderboard] save failed', error)
    return { status: 'error' }
  }
}
