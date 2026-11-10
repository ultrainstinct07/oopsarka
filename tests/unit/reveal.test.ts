import { describe, expect, it } from 'vitest'
import { revealScript } from '@/components/fx/reveal-script'

describe('reveal script', () => {
  it('parses as JavaScript', () => {
    expect(() => new Function(revealScript)).not.toThrow()
  })

  // A lone keyframe defaults to offset 1 (the end state), which turns a reveal
  // into a fade-out that snaps back. Every single-keyframe animate() call must
  // pin its keyframe to offset 0 so it is the "from" state.
  it('pins every single-keyframe animation to offset 0', () => {
    const calls = [...revealScript.matchAll(/\.animate\(\[([^\]]*)\]/g)].map((m) => m[1])
    expect(calls.length).toBeGreaterThan(0)
    for (const keyframes of calls) {
      const literal = keyframes.trim().startsWith('{')
      // Either an inline literal with offset:0, or the prepared `f` object that sets it.
      if (literal) expect(keyframes).toMatch(/^\{\s*offset:\s*0\b/)
      else expect(revealScript).toMatch(new RegExp(`var ${keyframes.trim()}=\\{offset:0\\b`))
    }
  })
})
