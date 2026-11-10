'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { nav } from '@/lib/site'
import { cn } from '@/lib/utils'

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

const linkClass = 'link-draw rounded-sm px-0.5 py-1 text-[0.95rem] font-semibold text-ink'

export function NavLinks() {
  const pathname = usePathname()
  return (
    <ul className="flex items-center gap-6 xl:gap-8">
      {nav.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={linkClass} aria-current={isActive(pathname, item.href) ? 'page' : undefined}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Same links without route awareness — the prerendered fallback. */
export function NavLinksStatic() {
  return (
    <ul className="flex items-center gap-6 xl:gap-8">
      {nav.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={cn(linkClass)}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
