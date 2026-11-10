import { slugify } from '@/lib/utils'
import type { BodyBlock, PTTextBlock, TocItem } from './types'

const WORDS_PER_MINUTE = 220

export function isTextBlock(block: BodyBlock): block is PTTextBlock {
  return block._type === 'block'
}

export function blockText(block: PTTextBlock) {
  return block.children.map((child) => child.text).join('')
}

/** Plain text of every readable block — used for search and reading time. */
export function toPlainText(blocks: BodyBlock[]) {
  const parts: string[] = []
  for (const block of blocks) {
    switch (block._type) {
      case 'block':
        parts.push(blockText(block))
        break
      case 'pullQuote':
      case 'arkaNote':
      case 'careNote':
        parts.push(block.text)
        break
      case 'humanNote':
        if (block.text) parts.push(block.text)
        break
      case 'figure':
        if (block.image.caption) parts.push(block.image.caption)
        break
      case 'clip':
        if (block.caption) parts.push(block.caption)
        break
      default:
        break
    }
  }
  return parts.join('\n\n').replace(/\s+\n/g, '\n').trim()
}

export function countWords(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return words.length
}

export function readingMinutes(text: string) {
  return Math.max(1, Math.ceil(countWords(text) / WORDS_PER_MINUTE))
}

/** Heading outline with stable, de-duplicated anchor ids. */
export function buildToc(blocks: BodyBlock[]): TocItem[] {
  const seen = new Map<string, number>()
  const toc: TocItem[] = []
  for (const block of blocks) {
    if (!isTextBlock(block) || (block.style !== 'h2' && block.style !== 'h3')) continue
    const text = blockText(block).trim()
    if (!text) continue
    const base = slugify(text) || 'section'
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    toc.push({
      key: block._key,
      id: count === 0 ? base : `${base}-${count + 1}`,
      text,
      level: block.style === 'h2' ? 2 : 3,
    })
  }
  return toc
}
