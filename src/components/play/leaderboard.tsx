'use client'

import { Trophy } from 'lucide-react'
import { type FormEvent, useEffect, useState, useSyncExternalStore } from 'react'
import { loadSharedBoard, submitScore } from '@/app/play-actions'
import {
  type BoardEntry,
  cleanName,
  emptyBoardSnapshot,
  formatScore,
  localBoardSnapshot,
  NAME_MAX,
  rankOf,
  readName,
  saveLocalEntry,
  saveName,
  subscribeToBoards,
} from '@/lib/play/leaderboard'
import type { GameId } from '@/lib/play/scores'
import { cn, formatDate } from '@/lib/utils'
import { BOARD_NAME_ID, gameButtonPrimary } from './game-shell'

type Scope = 'device' | 'everyone'
type Remote = { game: GameId; status: 'ok'; board: BoardEntry[] } | { game: GameId; status: 'error' }
type Note = { tone: 'ok' | 'warn'; text: string }

const PLACE = ['bg-butter', 'bg-lavender', 'bg-rose']

function Rows({ game, entries, mine }: { game: GameId; entries: BoardEntry[]; mine: BoardEntry | null }) {
  return (
    <ol className="divide-y divide-line">
      {entries.map((entry, index) => {
        // The shared board stamps its own time, so allow a little slack when spotting the player's row.
        const own =
          mine !== null &&
          entry.name === mine.name &&
          entry.score === mine.score &&
          Math.abs(Date.parse(entry.at) - Date.parse(mine.at)) < 90_000
        return (
          <li
            key={`${entry.at}-${entry.name}-${index}`}
            className={cn(
              'grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 py-2.5',
              own && '-mx-2 rounded-xl bg-butter-soft px-2',
            )}
          >
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full font-display text-sm font-semibold tabular-nums',
                index < 3 ? cn('border-2 border-ink text-on-fill', PLACE[index]) : 'text-ink-muted',
              )}
            >
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">
                {entry.name}
                {own ? <span className="ml-2 label text-[0.6rem] text-lavender-ink">You</span> : null}
              </span>
              <time dateTime={entry.at} className="block text-xs text-ink-muted">
                {formatDate(entry.at)}
              </time>
            </span>
            <span className="font-display text-xl font-semibold tabular-nums">{formatScore(game, entry.score)}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** Shown once a game has ended with a score worth keeping. */
function SaveForm({
  game,
  score,
  shared,
  onSave,
}: {
  game: GameId
  score: number
  shared: boolean
  onSave: (name: string) => Promise<void>
}) {
  // Mounted only after a game, so this runs in the browser and can read the remembered name.
  const [name, setName] = useState(readName)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const clean = cleanName(name)
    if (!clean) {
      setError('Please type a name: letters and numbers, up to 16 characters.')
      return
    }
    setError('')
    setSaving(true)
    await onSave(clean)
    setSaving(false)
  }

  return (
    <form onSubmit={submit} noValidate className="mb-5 rounded-2xl border-2 border-dashed border-line-strong bg-butter-soft p-4">
      <p className="font-display text-xl font-semibold">You scored {formatScore(game, score)}. Put a name to it?</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-48">
          <label htmlFor={BOARD_NAME_ID} className="label text-[0.66rem] text-ink-muted">
            Your name
          </label>
          <input
            id={BOARD_NAME_ID}
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={NAME_MAX}
            autoComplete="nickname"
            aria-invalid={error ? true : undefined}
            aria-describedby={`${BOARD_NAME_ID}-help`}
            className="mt-1 block min-h-11 w-full rounded-xl border-2 border-ink bg-surface px-3 font-semibold text-ink"
          />
        </div>
        <button type="submit" disabled={saving} className={gameButtonPrimary}>
          {saving ? 'Saving…' : 'Save my score'}
        </button>
      </div>
      <p id={`${BOARD_NAME_ID}-help`} className={cn('mt-2 text-sm', error ? 'font-semibold text-danger' : 'text-ink-muted')}>
        {error ||
          (shared
            ? 'Your name and score will be shown publicly on the leaderboard, so pick a name you are happy to show.'
            : 'Saved in this browser only.')}
      </p>
    </form>
  )
}

/**
 * The leaderboard under each game. "This device" is always there (local storage).
 * "Everyone" appears only when the shared board is switched on, and a save to it
 * is only reported once the server has confirmed it.
 */
export function Leaderboard({
  game,
  title,
  shared,
  pending,
  onSaved,
}: {
  game: GameId
  /** The game's name, for the heading. */
  title: string
  /** Whether the shared board is configured (decided on the server). */
  shared: boolean
  /** A finished game's score waiting for a name, if any. */
  pending: number | null
  onSaved: () => void
}) {
  const [scope, setScope] = useState<Scope>(shared ? 'everyone' : 'device')
  const [remote, setRemote] = useState<Remote | null>(null)
  const [note, setNote] = useState<(Note & { game: GameId }) | null>(null)
  const [mine, setMine] = useState<(BoardEntry & { game: GameId }) | null>(null)
  const local = useSyncExternalStore(subscribeToBoards, () => localBoardSnapshot(game), emptyBoardSnapshot)

  const showShared = shared && scope === 'everyone'
  const current = remote?.game === game ? remote : null

  useEffect(() => {
    if (!showShared) return
    let live = true
    void loadSharedBoard(game).then((result) => {
      if (!live) return
      setRemote(result.status === 'ok' ? { game, status: 'ok', board: result.board } : { game, status: 'error' })
    })
    return () => {
      live = false
    }
  }, [game, showShared])

  const save = async (name: string) => {
    if (pending === null) return
    saveName(name)
    const entry: BoardEntry = { name, score: pending, at: new Date().toISOString() }
    const place = rankOf(saveLocalEntry(game, entry), entry)
    setMine({ ...entry, game })
    const here = place ? `You are number ${place} on this device.` : 'It did not make this device’s top ten.'

    if (!shared) {
      setNote({ game, tone: 'ok', text: `Saved as ${name}. ${here}` })
      onSaved()
      return
    }
    let result: Awaited<ReturnType<typeof submitScore>>
    try {
      result = await submitScore(game, name, pending)
    } catch {
      result = { status: 'error' }
    }
    if (result.status === 'saved') {
      const theirs = result.board.find((item) => item.name === name && item.score === pending)
      setRemote({ game, status: 'ok', board: result.board })
      setScope('everyone')
      setNote({
        game,
        tone: 'ok',
        text: theirs ? `Saved to the leaderboard as ${name}.` : `Saved as ${name}. It did not reach the shared top ten. ${here}`,
      })
    } else {
      setScope('device')
      setNote({
        game,
        tone: 'warn',
        text:
          result.status === 'rate_limited'
            ? `That is a lot of scores from one place. This one is saved on this device only; try the shared board again in a few minutes. ${here}`
            : result.status === 'invalid'
              ? `The shared leaderboard did not accept that name or score, so it is saved on this device only. ${here}`
              : `The shared leaderboard could not be reached, so this score is saved on this device only. ${here}`,
      })
    }
    onSaved()
  }

  const entries = showShared ? (current?.status === 'ok' ? current.board : []) : local
  const highlight = mine?.game === game ? mine : null
  const message = note?.game === game ? note : null

  return (
    <section
      aria-labelledby="board-title"
      className="mt-8 rounded-[1.75rem] border-2 border-ink bg-surface p-5 shadow-print sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 label text-ink-muted">
            <Trophy aria-hidden className="size-4" /> Most wanted
          </p>
          <h3 id="board-title" className="mt-1 font-display text-title font-semibold">
            {title} leaderboard
          </h3>
        </div>
        {shared ? (
          <div role="group" aria-label="Which scores to show" className="flex gap-2">
            {(
              [
                ['everyone', 'Everyone'],
                ['device', 'This device'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={scope === value}
                onClick={() => setScope(value)}
                className="press inline-flex min-h-11 items-center rounded-pill border border-line-strong bg-surface px-4 text-sm font-semibold aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-bg"
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        {pending !== null ? (
          <SaveForm key={`${game}-${pending}`} game={game} score={pending} shared={shared} onSave={save} />
        ) : null}

        <p
          role="status"
          aria-live="polite"
          className={cn(
            'text-sm font-semibold',
            message ? 'mb-4 rounded-xl px-3 py-2' : 'sr-only',
            message?.tone === 'warn' ? 'bg-rose-soft text-rose-ink' : 'bg-sage-soft text-sage-ink',
          )}
        >
          {message?.text}
        </p>

        <div className="min-h-[9rem]">
          {showShared && !current ? (
            <p className="py-6 text-center text-ink-muted">Fetching the leaderboard…</p>
          ) : showShared && current?.status === 'error' ? (
            <p className="py-6 text-center text-ink-muted">
              The shared leaderboard could not be loaded just now. Scores on this device are still under “This device”.
            </p>
          ) : entries.length ? (
            <Rows game={game} entries={entries} mine={highlight} />
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-line-strong px-4 py-8 text-center text-ink-muted">
              {showShared
                ? 'No scores yet. The top spot is open.'
                : 'No scores saved on this device yet. Finish a game and put your name to it.'}
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          {showShared
            ? 'Shared with everyone who plays. Top ten shown.'
            : 'These scores are kept in this browser only and are not sent anywhere. Top ten shown.'}
        </p>
      </div>
    </section>
  )
}
