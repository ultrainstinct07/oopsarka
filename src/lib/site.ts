/**
 * Site-wide constants. Canonical URLs always use the production origin so preview
 * deployments never leak into canonicals, sitemaps or feeds.
 */
const PRODUCTION_URL = 'https://oopsarka.space'

function resolveSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!fromEnv) return PRODUCTION_URL
  try {
    return new URL(fromEnv).origin
  } catch {
    return PRODUCTION_URL
  }
}

export const site = {
  name: 'OopsArka',
  url: resolveSiteUrl(),
  productionUrl: PRODUCTION_URL,
  locale: 'en_US',
  tagline: 'A tiny Persian cat. A giant personality. An endless supply of oops moments.',
  description:
    'The wonderfully chaotic life of Arka, a fluffy Persian cat: diary entries, oops moments, honest Persian cat care notes and an evidence locker of mischief.',
  shortDescription: 'Tiny paws. Fluffy cheeks. Questionable decisions.',
  /** Default social image (generated at /opengraph-image). */
  ogImagePath: '/opengraph-image',
  postsPerPage: 9,
} as const

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/diary', label: "Arka's Diary" },
  { href: '/category/adventures', label: 'Adventures' },
  { href: '/category/persian-life', label: 'Persian Life' },
  { href: '/about', label: 'About Arka' },
] as const

export const footerNav = [
  { href: '/', label: 'Home' },
  { href: '/diary', label: 'Diary' },
  { href: '/categories', label: 'Categories' },
  { href: '/gallery', label: 'The Arka Files' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/rss.xml', label: 'RSS' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const

export function absoluteUrl(path = '/') {
  return new URL(path, site.url).toString()
}

/** True only on the real production deployment (or local production builds). */
export function isProductionDeployment() {
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv) return vercelEnv === 'production'
  return process.env.NODE_ENV === 'production'
}
