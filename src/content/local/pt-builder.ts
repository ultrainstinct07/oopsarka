/**
 * A tiny, typed Portable Text builder for the local sample content.
 *
 *   body('zoomies',
 *     p('At **3:04 AM** the house was *quiet*. [Unacceptable](https://…).'),
 *     h2('Exhibit A'),
 *     note('I regret nothing.'),
 *   )
 *
 * Inline syntax: **strong**, *em*, [label](href). Keys are deterministic, so the
 * same content always produces the same document (important for the Sanity seed).
 */
import type { ArkaImage, ArkaVideo, BodyBlock, PTLinkDef, PTSpan, PTTextBlock } from '@/lib/content/types'

type Keyless<T> = T extends unknown ? Omit<T, '_key'> : never
type DraftText = {
  _type: 'draft-text'
  style: NonNullable<PTTextBlock['style']>
  listItem?: PTTextBlock['listItem']
  text: string
}
type Draft = DraftText | Keyless<Exclude<BodyBlock, PTTextBlock>>

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g

export function parseInline(source: string, blockKey: string): Pick<PTTextBlock, 'children' | 'markDefs'> {
  const children: PTSpan[] = []
  const markDefs: PTLinkDef[] = []
  let cursor = 0
  let spanIndex = 0
  const push = (text: string, marks: string[] = []) => {
    if (!text) return
    children.push({ _type: 'span', _key: `${blockKey}s${spanIndex++}`, text, marks })
  }
  for (const match of source.matchAll(INLINE)) {
    const token = match[0]
    const index = match.index ?? 0
    push(source.slice(cursor, index))
    if (token.startsWith('**')) {
      push(token.slice(2, -2), ['strong'])
    } else if (token.startsWith('[')) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? []
      const key = `${blockKey}l${markDefs.length}`
      markDefs.push({ _type: 'link', _key: key, href })
      push(label, [key])
    } else {
      push(token.slice(1, -1), ['em'])
    }
    cursor = index + token.length
  }
  push(source.slice(cursor))
  if (children.length === 0) push(' ')
  return { children, markDefs }
}

const text =
  (style: DraftText['style']) =>
  (value: string): DraftText => ({ _type: 'draft-text', style, text: value.replace(/\s+/g, ' ').trim() })

export const p = text('normal')
export const h2 = text('h2')
export const h3 = text('h3')
export const quote = text('blockquote')

export const ul = (...items: string[]): DraftText[] =>
  items.map((item) => ({ _type: 'draft-text', style: 'normal', listItem: 'bullet', text: item.trim() }))
export const ol = (...items: string[]): DraftText[] =>
  items.map((item) => ({ _type: 'draft-text', style: 'normal', listItem: 'number', text: item.trim() }))

export const pull = (value: string, attribution?: string): Draft => ({ _type: 'pullQuote', text: value, attribution })
export const note = (value: string): Draft => ({ _type: 'arkaNote', text: value })
export const care = (value: string, title?: string): Draft => ({ _type: 'careNote', text: value, title })
export const human = (prompt: string): Draft => ({ _type: 'humanNote', prompt })
export const figure = (image: ArkaImage, layout: 'inline' | 'wide' = 'inline'): Draft => ({ _type: 'figure', image, layout })
export const clip = (video: ArkaVideo, caption?: string): Draft => ({ _type: 'clip', video, caption })
export const divider = (): Draft => ({ _type: 'pawDivider' })

export function body(prefix: string, ...items: (Draft | Draft[])[]): BodyBlock[] {
  return items.flat().map((item, index): BodyBlock => {
    const _key = `${prefix}${index.toString(36)}`
    if (item._type === 'draft-text') {
      const block: PTTextBlock = {
        _type: 'block',
        _key,
        style: item.style,
        ...parseInline(item.text, _key),
      }
      if (item.listItem) {
        block.listItem = item.listItem
        block.level = 1
      }
      return block
    }
    return { ...item, _key } as BodyBlock
  })
}
