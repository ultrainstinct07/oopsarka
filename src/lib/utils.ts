import { createCn } from 'cn/engine'
import tables from './cn-tables'

/**
 * Tailwind-aware class merging, compiled for this project's theme (`cn build`
 * reads the custom `@theme` scales, so `text-lede` is a font size, not a
 * colour) and subset to the classes the source uses. The tables regenerate on
 * `next dev`/`next build` (see next.config.ts) or with `npm run cn`.
 */
export const cn = createCn(tables)

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "20 Oct 2026" — formatted in UTC so server and client always agree. */
export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

export function formatLongDate(iso: string) {
  return longDateFormatter.format(new Date(iso))
}

/** "FILED 20.10.26" style stamp text. */
export function stampDate(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yy = String(d.getUTCFullYear()).slice(-2)
  return `${dd}.${mm}.${yy}`
}

export function slugify(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

export function pluralize(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`
}

/** Exhibit letters: 0 → A, 25 → Z, 26 → AA … */
export function exhibitLetter(index: number): string {
  let n = index
  let out = ''
  do {
    out = String.fromCharCode(65 + (n % 26)) + out
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return out
}
