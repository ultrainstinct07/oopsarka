import { isSanityConfigured } from '@/sanity/env'

/** Development-only reminder that content is coming from the local sample fixtures. */
export function LocalContentNotice() {
  if (process.env.NODE_ENV === 'production' || isSanityConfigured) return null
  return (
    <div className="bg-ink px-4 py-1.5 text-center text-xs font-semibold text-bg">
      Dev: showing local sample content — connect Sanity to edit in the Studio (see docs/SANITY.md).
    </div>
  )
}
