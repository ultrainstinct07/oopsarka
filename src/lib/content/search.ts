import MiniSearch, { type Options, type SearchResult } from 'minisearch'
import type { SearchDocument } from './source'

/** Shared by the server (/search) and the client (⌘K dialog) so both rank identically. */
export const SEARCH_OPTIONS: Options<SearchDocument> = {
  idField: 'id',
  fields: ['title', 'excerpt', 'tags', 'category', 'text'],
  storeFields: ['slug', 'title', 'excerpt', 'category', 'categorySlug', 'publishedAt', 'readingMinutes'],
  searchOptions: {
    boost: { title: 4, tags: 2.5, excerpt: 2, category: 1.5, text: 1 },
    prefix: true,
    fuzzy: 0.34,
  },
}

export type SearchHit = Pick<
  SearchDocument,
  'slug' | 'title' | 'excerpt' | 'category' | 'categorySlug' | 'publishedAt' | 'readingMinutes'
> & { score: number; terms: string[] }

export function buildSearchIndex(documents: SearchDocument[]) {
  const index = new MiniSearch<SearchDocument>(SEARCH_OPTIONS)
  index.addAll(documents)
  return index
}

export function loadSearchIndex(json: string) {
  return MiniSearch.loadJSON<SearchDocument>(json, SEARCH_OPTIONS)
}

function toHit(result: SearchResult): SearchHit {
  return {
    slug: result.slug,
    title: result.title,
    excerpt: result.excerpt,
    category: result.category,
    categorySlug: result.categorySlug,
    publishedAt: result.publishedAt,
    readingMinutes: result.readingMinutes,
    score: result.score,
    terms: result.terms,
  }
}

/**
 * Precise first (every word must match), then forgiving (any word) so a single
 * typo never produces an empty page.
 */
export function runSearch(index: MiniSearch<SearchDocument>, query: string, filter?: { categorySlug?: string }) {
  const q = query.trim().slice(0, 120)
  if (!q) return []
  const accept = (result: SearchResult) => !filter?.categorySlug || result.categorySlug === filter.categorySlug
  let results = index.search(q, { combineWith: 'AND', filter: accept })
  if (results.length === 0) results = index.search(q, { combineWith: 'OR', filter: accept })
  return results.map(toHit)
}
