/**
 * Optional sound effects for the Playroom, synthesised with the Web Audio API
 * (no audio files). Sound is OFF until the player switches it on, so nothing
 * ever plays by itself; the choice is remembered in this browser only.
 */

export type SoundName = 'knock' | 'oops' | 'bonus' | 'flip' | 'match' | 'miss' | 'win' | 'jump' | 'treat' | 'crash' | 'timeup'

const KEY = 'oopsarka:play:sound'
const CHANGE_EVENT = 'oopsarka:sound'

type Note = { type: OscillatorType; from: number; to?: number; at?: number; length: number; volume?: number }

const SOUNDS: Record<SoundName, Note[]> = {
  knock: [{ type: 'triangle', from: 210, to: 90, length: 0.09, volume: 0.5 }],
  oops: [
    { type: 'square', from: 300, to: 240, length: 0.12, volume: 0.22 },
    { type: 'square', from: 220, to: 150, at: 0.13, length: 0.2, volume: 0.22 },
  ],
  bonus: [
    { type: 'sine', from: 660, length: 0.07 },
    { type: 'sine', from: 990, at: 0.07, length: 0.12 },
  ],
  flip: [{ type: 'sine', from: 520, to: 700, length: 0.05, volume: 0.25 }],
  match: [
    { type: 'sine', from: 660, length: 0.09 },
    { type: 'sine', from: 880, at: 0.09, length: 0.16 },
  ],
  miss: [{ type: 'triangle', from: 220, to: 170, length: 0.16, volume: 0.3 }],
  win: [
    { type: 'sine', from: 523, length: 0.1 },
    { type: 'sine', from: 659, at: 0.1, length: 0.1 },
    { type: 'sine', from: 784, at: 0.2, length: 0.1 },
    { type: 'sine', from: 1047, at: 0.3, length: 0.28 },
  ],
  jump: [{ type: 'sine', from: 320, to: 620, length: 0.13, volume: 0.3 }],
  treat: [{ type: 'sine', from: 880, to: 1320, length: 0.1, volume: 0.3 }],
  crash: [
    { type: 'sawtooth', from: 200, to: 55, length: 0.32, volume: 0.25 },
    { type: 'triangle', from: 90, to: 50, at: 0.05, length: 0.3, volume: 0.4 },
  ],
  timeup: [
    { type: 'sine', from: 784, length: 0.12 },
    { type: 'sine', from: 523, at: 0.14, length: 0.3 },
  ],
}

export function isSoundOn(): boolean {
  try {
    return window.localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

export function subscribeToSound(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

let context: AudioContext | null = null
// Remembers the choice for this visit even when storage is unavailable.
let memory: boolean | null = null

const soundOn = () => memory ?? isSoundOn()

function audio(): AudioContext | null {
  if (context) return context
  const Ctor =
    typeof window === 'undefined'
      ? undefined
      : (window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
  if (!Ctor) return null
  try {
    context = new Ctor()
  } catch {
    context = null
  }
  return context
}

/** Called from the sound button, so the browser allows audio to start. */
export function setSoundOn(on: boolean) {
  memory = on
  try {
    window.localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // The choice still holds for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
  if (on) {
    void audio()?.resume()
    playSound('flip')
  }
}

export function soundSnapshot() {
  return soundOn()
}

export function playSound(name: SoundName) {
  if (!soundOn()) return
  const ctx = audio()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') void ctx.resume()
    const start = ctx.currentTime
    for (const note of SOUNDS[name]) {
      const begin = start + (note.at ?? 0)
      const end = begin + note.length
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.type = note.type
      oscillator.frequency.setValueAtTime(note.from, begin)
      if (note.to) oscillator.frequency.exponentialRampToValueAtTime(note.to, end)
      const peak = (note.volume ?? 0.35) * 0.5
      gain.gain.setValueAtTime(0.0001, begin)
      gain.gain.exponentialRampToValueAtTime(peak, begin + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, end)
      oscillator.connect(gain).connect(ctx.destination)
      oscillator.start(begin)
      oscillator.stop(end + 0.02)
    }
  } catch {
    // Sound is a nicety; a failure here must never interrupt a game.
  }
}
