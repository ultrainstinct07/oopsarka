import { describe, expect, it } from 'vitest'
import { body, h2, h3, p, parseInline, ul } from '@/content/local/pt-builder'
import { localData } from '@/lib/content/source-local'
import { pageWindow, paginate, parsePageParam } from '@/lib/content/pagination'
import { buildToc, readingMinutes, toPlainText } from '@/lib/content/pt'
import { buildSearchIndex, loadSearchIndex, runSearch } from '@/lib/content/search'
import { localSource } from '@/lib/content/source-local'
import { exhibitLetter, slugify, stampDate } from '@/lib/utils'

describe('Portable Text builder', () => {
  it('parses bold, italics and links into spans and mark definitions', () => {
    const { children, markDefs } = parseInline('A **bold** and *quiet* [link](https://example.com).', 'k')
    expect(children.map((c) => [c.text, c.marks])).toEqual([
      ['A ', []],
      ['bold', ['strong']],
      [' and ', []],
      ['quiet', ['em']],
      [' ', []],
      ['link', ['kl0']],
      ['.', []],
    ])
    expect(markDefs).toEqual([{ _type: 'link', _key: 'kl0', href: 'https://example.com' }])
  })

  it('produces deterministic keys so the Sanity seed is idempotent', () => {
    const a = body('x', p('one'), h2('Two'))
    const b = body('x', p('one'), h2('Two'))
    expect(a).toEqual(b)
    expect(a.map((block) => block._key)).toEqual(['x0', 'x1'])
  })

  it('expands lists into list-item blocks', () => {
    const blocks = body('l', ul('a', 'b'))
    expect(blocks).toHaveLength(2)
    expect(blocks.every((block) => block._type === 'block' && block.listItem === 'bullet')).toBe(true)
  })
})

describe('reading time, plain text and TOC', () => {
  const sample = body('t', h2('Morning'), p('word '.repeat(450)), h3('Later'), h2('Morning'))

  it('rounds reading time up and never reports zero', () => {
    expect(readingMinutes('')).toBe(1)
    expect(readingMinutes('word '.repeat(221))).toBe(2)
    expect(readingMinutes(toPlainText(sample))).toBe(3)
  })

  it('builds a TOC with unique anchors', () => {
    expect(buildToc(sample).map(({ id, level }) => [id, level])).toEqual([
      ['morning', 2],
      ['later', 3],
      ['morning-2', 2],
    ])
  })
})

describe('pagination', () => {
  it('clamps pages and slices items', () => {
    const items = Array.from({ length: 20 }, (_, i) => i)
    expect(paginate(items, 1, 9)).toMatchObject({ page: 1, totalPages: 3, items: [0, 1, 2, 3, 4, 5, 6, 7, 8] })
    expect(paginate(items, 3, 9).items).toEqual([18, 19])
    expect(paginate(items, 99, 9).page).toBe(3)
    expect(paginate([], 1, 9)).toMatchObject({ page: 1, totalPages: 1, total: 0 })
  })

  it('only accepts clean page params', () => {
    expect(parsePageParam('2')).toBe(2)
    expect(parsePageParam('0')).toBeNull()
    expect(parsePageParam('2.5')).toBeNull()
    expect(parsePageParam('abc')).toBeNull()
    expect(parsePageParam(undefined)).toBeNull()
  })

  it('shows a window of pages with gaps', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(5, 12)).toEqual([1, 'gap', 4, 5, 6, 'gap', 12])
  })
})

describe('local sample content', () => {
  it('has unique slugs and only known categories, tags and authors', () => {
    const slugs = localData.posts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const post of localData.posts) {
      expect(localData.categories.some((c) => c.slug === post.category.slug)).toBe(true)
      expect(post.cover.alt.length).toBeGreaterThan(10)
      expect(post.excerpt.length).toBeLessThanOrEqual(240)
    }
  })

  it('labels every starter story as sample content', () => {
    expect(localData.posts.every((post) => post.sample)).toBe(true)
  })

  it('never presents an illustration as a photo of Arka', () => {
    for (const post of localData.posts) {
      if (post.cover.src.endsWith('.svg')) {
        expect(post.cover.illustration).toBe(true)
        expect(post.cover.alt.startsWith('Illustration')).toBe(true)
      }
    }
  })

  it('keeps Persian Life guides tied to vet advice', () => {
    const guides = localData.posts.filter((post) => post.category.slug === 'persian-life')
    expect(guides.length).toBeGreaterThanOrEqual(5)
    for (const guide of guides) {
      expect(guide.body.some((block) => block._type === 'careNote')).toBe(true)
      expect(guide.plainText.toLowerCase()).toContain('vet')
    }
  })
})

describe('search', () => {
  it('finds stories by title, forgives typos, and filters by category', async () => {
    const documents = await localSource.getSearchDocuments({ preview: false })
    const index = loadSearchIndex(JSON.stringify(buildSearchIndex(documents)))
    expect(runSearch(index, 'zoomies')[0]?.slug).toBe('the-3-am-zoomies-incident')
    expect(runSearch(index, 'zoomys')[0]?.slug).toBe('the-3-am-zoomies-incident')
    expect(runSearch(index, 'cardboard boxes').some((hit) => hit.slug === 'an-extremely-serious-review-of-cardboard-boxes')).toBe(
      true,
    )
    const filtered = runSearch(index, 'box', { categorySlug: 'persian-life' })
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((hit) => hit.categorySlug === 'persian-life')).toBe(true)
    expect(runSearch(index, '   ')).toEqual([])
  })
})

describe('utilities', () => {
  it('slugifies titles', () => {
    expect(slugify("Why My Human Can't Use the Bathroom Alone")).toBe('why-my-human-cant-use-the-bathroom-alone')
    expect(slugify('Café & Crème')).toBe('cafe-and-creme')
  })

  it('formats stamp dates in UTC', () => {
    expect(stampDate('2026-10-23T23:30:00.000Z')).toBe('23.10.26')
  })

  it('letters exhibits like a filing system', () => {
    expect([0, 1, 25, 26, 27].map(exhibitLetter)).toEqual(['A', 'B', 'Z', 'AA', 'AB'])
  })
})
