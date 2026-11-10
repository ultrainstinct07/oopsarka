export interface Page<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
  perPage: number
}

export function paginate<T>(items: T[], page: number, perPage: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages)
  const start = (current - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages,
    total: items.length,
    perPage,
  }
}

/** Parse a `[page]` route param. Returns null for anything that isn't a clean integer ≥ 1. */
export function parsePageParam(value: string | undefined): number | null {
  if (!value || !/^\d{1,4}$/.test(value)) return null
  const n = Number(value)
  return n >= 1 ? n : null
}

/** Page numbers for a pager, with gaps: [1, 'gap', 4, 5, 6, 'gap', 12]. */
export function pageWindow(current: number, total: number, radius = 1): (number | 'gap')[] {
  const pages = new Set<number>([1, total])
  for (let i = current - radius; i <= current + radius; i++) if (i >= 1 && i <= total) pages.add(i)
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push('gap')
    out.push(n)
  })
  return out
}
