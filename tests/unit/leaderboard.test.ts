import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BoardStore } from '@/lib/integrations/leaderboard'
import {
  addEntry,
  type BoardEntry,
  cleanName,
  formatScore,
  isPlausibleScore,
  localBoardSnapshot,
  parseBoard,
  rankOf,
  readName,
  saveLocalEntry,
  saveName,
} from '@/lib/play/leaderboard'

vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9' }),
}))

const entry = (name: string, score: number, minute = 0): BoardEntry => ({
  name,
  score,
  at: new Date(Date.UTC(2026, 10, 10, 12, minute)).toISOString(),
})

describe('leaderboard names and scores', () => {
  it('keeps a name to letters, numbers and a little punctuation', () => {
    expect(cleanName('  Mira  ')).toBe('Mira')
    expect(cleanName('Arka the   Great')).toBe('Arka the Great')
    expect(cleanName('अर्का 😺')).toBe('अर्का')
    expect(cleanName('<b>Bob</b>')).toBe('bBobb')
    expect(cleanName('http://spam.example/x')).toBe('httpspam.example')
    expect(cleanName('a'.repeat(40))).toHaveLength(16)
    // Stacked marks are capped at three per letter (the first one merges into the letter itself).
    expect(cleanName('a' + '́'.repeat(8) + 'b').match(/\p{M}/gu)).toHaveLength(3)
    expect(Array.from(cleanName('𝒜'.repeat(40)))).toHaveLength(16)
    expect(cleanName('​‮  ')).toBe('')
    expect(cleanName(42)).toBe('')
    expect(cleanName(null)).toBe('')
  })

  it('only accepts scores a real game could produce', () => {
    expect(isPlausibleScore('knock', 12)).toBe(true)
    expect(isPlausibleScore('knock', 0)).toBe(false)
    expect(isPlausibleScore('knock', 999)).toBe(false)
    expect(isPlausibleScore('knock', 3.5)).toBe(false)
    expect(isPlausibleScore('knock', '12')).toBe(false)
    expect(isPlausibleScore('pairs', 5)).toBe(false)
    expect(isPlausibleScore('pairs', 6)).toBe(true)
    expect(isPlausibleScore('zoomies', 205)).toBe(true)
    expect(formatScore('pairs', 9)).toBe('9 moves')
    expect(formatScore('zoomies', 205)).toBe('205')
  })

  it('ranks highest first, or fewest moves first, with ties going to the earlier score', () => {
    const board = addEntry([entry('A', 5), entry('B', 9, 1)], entry('C', 9, 2), false)
    expect(board.map((item) => item.name)).toEqual(['B', 'C', 'A'])
    expect(rankOf(board, entry('C', 9, 2))).toBe(2)

    const moves = addEntry([entry('A', 12), entry('B', 8)], entry('C', 10), true)
    expect(moves.map((item) => item.name)).toEqual(['B', 'C', 'A'])

    const full = Array.from({ length: 10 }, (_, i) => entry(`P${i}`, 50 - i))
    const after = addEntry(full, entry('Late', 1), false)
    expect(after).toHaveLength(10)
    expect(rankOf(after, entry('Late', 1))).toBeNull()
  })

  it('drops anything malformed from stored data', () => {
    const raw = JSON.stringify([
      { name: 'Mira', score: 12, at: '2026-11-10T12:00:00.000Z' },
      { name: '<script>', score: 4, at: '2026-11-10T12:01:00.000Z' },
      { name: 'Cheat', score: 99999, at: '2026-11-10T12:02:00.000Z' },
      { name: 'NoDate', score: 3, at: 'yesterday' },
      'nonsense',
    ])
    expect(parseBoard('knock', raw).map((item) => item.name)).toEqual(['Mira', 'script'])
    expect(parseBoard('knock', '{not json')).toEqual([])
    expect(parseBoard('knock', null)).toEqual([])
  })
})

describe('this-device leaderboard', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('saves scores and the last name in local storage', () => {
    const data = new Map<string, string>()
    vi.stubGlobal('window', {
      localStorage: { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) },
      dispatchEvent: () => true,
    })
    expect(localBoardSnapshot('zoomies')).toEqual([])
    saveLocalEntry('zoomies', entry('Mira', 120))
    const board = saveLocalEntry('zoomies', entry('Arka', 300, 1))
    expect(board.map((item) => item.name)).toEqual(['Arka', 'Mira'])
    // The snapshot is stable until the stored text changes.
    expect(localBoardSnapshot('zoomies')).toBe(localBoardSnapshot('zoomies'))
    expect(localBoardSnapshot('knock')).toEqual([])

    saveName('Mira')
    expect(readName()).toBe('Mira')
  })

  it('keeps working when storage is blocked', () => {
    const boom = () => {
      throw new Error('blocked')
    }
    vi.stubGlobal('window', { localStorage: { getItem: boom, setItem: boom }, dispatchEvent: () => true })
    expect(localBoardSnapshot('pairs')).toEqual([])
    expect(saveLocalEntry('pairs', entry('Mira', 9)).map((item) => item.name)).toEqual(['Mira'])
    expect(readName()).toBe('')
    expect(() => saveName('Mira')).not.toThrow()
  })
})

/** A tiny stand-in for the Redis sorted-set commands the leaderboard uses. */
function fakeStore() {
  const sets = new Map<string, { member: string; score: number }[]>()
  const sorted = (key: string) => [...(sets.get(key) ?? [])].sort((a, b) => a.score - b.score || a.member.localeCompare(b.member))
  const calls: string[] = []
  const store: BoardStore = {
    async zadd(key, item) {
      sets.set(key, [...(sets.get(key) ?? []), item])
    },
    async zrange(key, start, stop, options) {
      const all = options.rev ? sorted(key).reverse() : sorted(key)
      return all.slice(start, stop + 1).flatMap((item) => [item.member, String(item.score)])
    },
    async zremrangebyrank(key, start, stop) {
      calls.push(`${start}:${stop}`)
      const all = sorted(key)
      const from = start < 0 ? all.length + start : start
      const to = stop < 0 ? all.length + stop : stop
      sets.set(
        key,
        all.filter((_, index) => index < from || index > to),
      )
    },
  }
  return { store, calls, sets }
}

describe('shared leaderboard storage', () => {
  it('returns the best scores first and keeps only the best fifty', async () => {
    const { addSharedEntry, fetchSharedBoard } = await import('@/lib/integrations/leaderboard')
    const { store, sets } = fakeStore()
    for (let i = 1; i <= 55; i++) await addSharedEntry('zoomies', `P${i}`, i, store, 1_000 + i)
    const board = await fetchSharedBoard('zoomies', store)
    expect(board).toHaveLength(10)
    expect(board[0]).toMatchObject({ name: 'P55', score: 55 })
    expect(sets.get('oopsarka:leaderboard:zoomies')).toHaveLength(50)
    // The five lowest were the ones dropped.
    expect(sets.get('oopsarka:leaderboard:zoomies')!.every((item) => item.score > 5)).toBe(true)
  })

  it('treats fewer moves as better for Paw Pairs', async () => {
    const { addSharedEntry } = await import('@/lib/integrations/leaderboard')
    const { store, sets } = fakeStore()
    for (let i = 0; i < 52; i++) await addSharedEntry('pairs', `P${i}`, 6 + i, store, 2_000 + i)
    const board = await addSharedEntry('pairs', 'Sharp', 7, store, 9_000)
    expect(board[0]).toMatchObject({ name: 'P0', score: 6 })
    expect(board.map((item) => item.name)).toContain('Sharp')
    expect(sets.get('oopsarka:leaderboard:pairs')).toHaveLength(50)
    expect(sets.get('oopsarka:leaderboard:pairs')!.every((item) => item.score <= 55)).toBe(true)
  })

  it('ignores stored members it cannot trust', async () => {
    const { fetchSharedBoard } = await import('@/lib/integrations/leaderboard')
    const { store, sets } = fakeStore()
    sets.set('oopsarka:leaderboard:knock', [
      { member: JSON.stringify({ n: 'Mira', t: 5_000, r: 'a' }), score: 12 },
      { member: 'not json', score: 9 },
      { member: JSON.stringify({ n: '', t: 5_000, r: 'b' }), score: 8 },
      { member: JSON.stringify({ n: 'Cheat', t: 5_000, r: 'c' }), score: 100_000 },
    ])
    expect((await fetchSharedBoard('knock', store)).map((item) => item.name)).toEqual(['Mira'])
  })

  it('refuses to run without a configured store', async () => {
    const { addSharedEntry, fetchSharedBoard } = await import('@/lib/integrations/leaderboard')
    await expect(fetchSharedBoard('knock')).rejects.toThrow()
    await expect(addSharedEntry('knock', 'Mira', 5)).rejects.toThrow()
  })
})

describe('leaderboard server actions', () => {
  beforeEach(() => {
    vi.resetModules()
    for (const key of ['LEADERBOARD_ENABLED', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']) delete process.env[key]
  })
  afterEach(() => vi.doUnmock('@/lib/integrations/leaderboard'))

  /** Switch the shared board "on" with a stand-in store, keeping the in-memory rate limiter. */
  async function withSharedBoard() {
    const saved: [string, string, number][] = []
    vi.doMock('@/lib/integrations/config', async (original) => ({
      ...(await original<typeof import('@/lib/integrations/config')>()),
      isLeaderboardConfigured: () => true,
    }))
    vi.doMock('@/lib/integrations/leaderboard', () => ({
      fetchSharedBoard: async () => [entry('Mira', 12)],
      addSharedEntry: async (game: string, name: string, score: number) => {
        saved.push([game, name, score])
        return [entry(name, score)]
      },
    }))
    return { saved, actions: await import('@/app/play-actions') }
  }

  it('never claims to have saved or loaded anything when the shared board is off', async () => {
    const { loadSharedBoard, submitScore } = await import('@/app/play-actions')
    expect(await submitScore('knock', 'Mira', 12)).toEqual({ status: 'not_configured' })
    expect(await loadSharedBoard('knock')).toEqual({ status: 'not_configured' })
  })

  it('needs the opt-in flag as well as the store', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token'
    const config = await import('@/lib/integrations/config')
    expect(config.isLeaderboardConfigured()).toBe(false)
    process.env.LEADERBOARD_ENABLED = '1'
    expect(config.isLeaderboardConfigured()).toBe(true)
    expect(config.activeServices().leaderboard).toBe(true)
  })

  it('saves a valid score and returns the board', async () => {
    const { saved, actions } = await withSharedBoard()
    expect(await actions.submitScore('knock', 'Mira', 12)).toEqual({ status: 'saved', board: [entry('Mira', 12)] })
    expect(saved).toEqual([['knock', 'Mira', 12]])
    expect(await actions.loadSharedBoard('knock')).toEqual({ status: 'ok', board: [entry('Mira', 12)] })
  })

  it('rejects unknown games, impossible scores and names that need cleaning, without touching the store', async () => {
    const { saved, actions } = await withSharedBoard()
    expect(await actions.submitScore('chess', 'Mira', 12)).toEqual({ status: 'invalid' })
    expect(await actions.submitScore('knock', 'Mira', 99_999)).toEqual({ status: 'invalid' })
    expect(await actions.submitScore('knock', 'Mira', '12')).toEqual({ status: 'invalid' })
    expect(await actions.submitScore('knock', '<b>Mira</b>', 12)).toEqual({ status: 'invalid' })
    expect(await actions.submitScore('knock', '   ', 12)).toEqual({ status: 'invalid' })
    expect(await actions.loadSharedBoard('chess')).toEqual({ status: 'invalid' })
    expect(saved).toEqual([])
  })

  it('limits how many scores one visitor can send', async () => {
    const { saved, actions } = await withSharedBoard()
    const results = []
    for (let i = 0; i < 17; i++) results.push((await actions.submitScore('zoomies', 'Mira', 10 + i)).status)
    expect(results.slice(0, 15).every((status) => status === 'saved')).toBe(true)
    expect(results.slice(15)).toEqual(['rate_limited', 'rate_limited'])
    expect(saved).toHaveLength(15)
  })

  it('reports a store failure as an error, not a save', async () => {
    vi.doMock('@/lib/integrations/config', async (original) => ({
      ...(await original<typeof import('@/lib/integrations/config')>()),
      isLeaderboardConfigured: () => true,
    }))
    vi.doMock('@/lib/integrations/leaderboard', () => ({
      fetchSharedBoard: async () => {
        throw new Error('down')
      },
      addSharedEntry: async () => {
        throw new Error('down')
      },
    }))
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    const actions = await import('@/app/play-actions')
    expect(await actions.submitScore('knock', 'Mira', 12)).toEqual({ status: 'error' })
    expect(await actions.loadSharedBoard('knock')).toEqual({ status: 'error' })
    quiet.mockRestore()
  })
})
