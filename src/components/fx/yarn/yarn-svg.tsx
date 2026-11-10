import { cn } from '@/lib/utils'

/** The illustrated yarn ball — the always-present fallback for the 3D version. */
export function YarnSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={cn('overflow-visible', className)}>
      <defs>
        <radialGradient id="yarn-shade" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#e4dbf6" />
          <stop offset="55%" stopColor="#c7b9e8" />
          <stop offset="100%" stopColor="#9a86d0" />
        </radialGradient>
        <clipPath id="yarn-clip">
          <circle cx="100" cy="100" r="78" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="78" fill="url(#yarn-shade)" />
      <g clipPath="url(#yarn-clip)" fill="none" stroke="#7b67b8" strokeWidth="3.2" strokeLinecap="round" opacity=".55">
        <path d="M24 88c32 12 92 12 150-30" />
        <path d="M22 106c40 10 100 2 156-44" />
        <path d="M30 128c42 4 96-12 146-58" />
        <path d="M44 150c40-6 86-30 126-72" />
        <path d="M70 26c-14 30-12 96 18 150" />
        <path d="M92 22c-10 36-6 100 22 156" />
        <path d="M118 24c-6 38 0 98 26 146" />
        <path d="M40 60c30 30 80 60 140 66" />
      </g>
      <g clipPath="url(#yarn-clip)" fill="none" stroke="#fff6ea" strokeWidth="2" strokeLinecap="round" opacity=".55">
        <path d="M48 70c22-24 50-34 78-32" />
        <path d="M56 86c24-20 50-28 72-26" />
      </g>
      <path d="M36 138c-14 12-20 26-46 30s-44 8-56 4" fill="none" stroke="#9a86d0" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
