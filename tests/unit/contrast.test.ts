import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/** WCAG 2.x relative luminance and contrast ratio. */
function luminance(hex: string) {
  const [r, g, b] = hex
    .replace('#', '')
    .match(/../g)!
    .map((c) => parseInt(c, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** Read the actual token values from globals.css, so the test can't drift from the design. */
function tokens(selector: ':root' | '[data-theme="night"]') {
  const css = readFileSync(new URL('../../src/app/globals.css', import.meta.url), 'utf8')
  const start = css.indexOf(`${selector} {`)
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, name, value]) => [name, value]))
}

const light = tokens(':root')
const night = { ...light, ...tokens('[data-theme="night"]') }

const TEXT_PAIRS: [string, string][] = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['ink', 'bg-deep'],
  ['ink-muted', 'bg'],
  ['ink-muted', 'surface'],
  ['ink-muted', 'bg-deep'],
  ['lavender-ink', 'bg'],
  ['lavender-ink', 'surface'],
  ['lavender-ink', 'lavender-soft'],
  ['sage-ink', 'sage-soft'],
  ['sage-ink', 'bg'],
  ['rose-ink', 'rose-soft'],
  ['danger', 'bg'],
  ['ink', 'butter-soft'],
  ['ink', 'lavender-soft'],
  ['ink-muted', 'lavender-soft'],
  ['ink-muted', 'butter-soft'],
]

/** Text set on brand fills always uses the fixed on-fill ink. */
const FILL_PAIRS: [string, string][] = [
  ['on-fill', 'lavender'],
  ['on-fill', 'butter'],
  ['on-fill', 'sage'],
  ['on-fill', 'rose'],
  ['on-fill', 'marmalade'],
]

describe('colour contrast (WCAG AA, 4.5:1 for body text)', () => {
  for (const [theme, palette] of [
    ['light', light],
    ['3 AM mode', night],
  ] as const) {
    for (const [fg, bg] of [...TEXT_PAIRS, ...FILL_PAIRS]) {
      it(`${theme}: ${fg} on ${bg}`, () => {
        expect(palette[fg], `missing --${fg}`).toBeDefined()
        expect(palette[bg], `missing --${bg}`).toBeDefined()
        expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  it('never uses the signature lavender fill as text on ivory', () => {
    expect(contrast(light.lavender, light.bg)).toBeLessThan(3)
  })
})
