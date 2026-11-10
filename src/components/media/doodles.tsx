import type { SVGProps } from 'react'
import type { DoodleName } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type IconProps = SVGProps<SVGSVGElement> & { title?: string }

function Svg({ title, children, className, viewBox = '0 0 64 64', ...props }: IconProps) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={cn('shrink-0', className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

const DOODLES: Record<DoodleName, React.ReactNode> = {
  notebook: (
    <>
      <path d="M17 9h29a4 4 0 0 1 4 4v38a4 4 0 0 1-4 4H17z" />
      <path d="M17 9v46M12 17h9M12 27h9M12 37h9M12 47h9" />
      <path d="M27 21h15M27 29h12M27 37h14" opacity=".7" />
    </>
  ),
  oops: (
    <>
      <path d="M10 31c0-11 9.8-19 22-19s22 8 22 19-9.8 19-22 19c-2.6 0-5.1-.4-7.4-1L14 54l3-10c-4.3-3.4-7-8-7-13Z" />
      <path d="M32 22v11M32 40v.5" strokeWidth={3.4} />
    </>
  ),
  comb: (
    <>
      <path d="M8 22h48v9H8z" />
      <path d="M13 31v18M19 31v18M25 31v18M31 31v18M37 31v18M43 31v18M49 31v18" />
    </>
  ),
  compass: (
    <>
      <circle cx="32" cy="32" r="22" />
      <path d="m40 24-5 12-11 4 5-12z" />
      <path d="M32 6v4M32 54v4M6 32h4M54 32h4" />
    </>
  ),
  eye: (
    <>
      <path d="M6 33s9-15 26-15 26 15 26 15-9 15-26 15S6 33 6 33Z" />
      <circle cx="32" cy="33" r="7" />
      <path d="M32 9v5M18 12l3 4M46 12l-3 4" />
    </>
  ),
  box: (
    <>
      <path d="m10 24 22-9 22 9-22 9z" />
      <path d="M10 24v20l22 9 22-9V24M32 33v20" />
      <path d="m10 24-4 8 22 9 4-8M54 24l4 8-22 9" opacity=".75" />
    </>
  ),
  plant: (
    <>
      <path d="M20 40h24l-3 16H23z" />
      <path d="M32 40V22" />
      <path d="M32 30c-9 0-14-6-14-13 8 0 14 5 14 13ZM32 25c0-8 5-14 14-14 0 8-6 14-14 14Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="32" cy="34" r="20" />
      <path d="M32 22v12l-8 5" />
      <path d="M14 14l-5 5M50 14l5 5" />
    </>
  ),
  mug: (
    <>
      <path d="M14 22h28v22a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z" />
      <path d="M42 28h4a6 6 0 0 1 0 12h-4" />
      <path d="M22 10c0 4 4 4 4 8M32 10c0 4 4 4 4 8" opacity=".7" />
    </>
  ),
  door: (
    <>
      <path d="M18 8h28v48H18z" />
      <circle cx="40" cy="33" r="1.8" fill="currentColor" />
      <path d="M10 56h44" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="32" cy="40" rx="11" ry="9" />
      <ellipse cx="18" cy="27" rx="4.5" ry="6" />
      <ellipse cx="27" cy="18" rx="4.5" ry="6" />
      <ellipse cx="37" cy="18" rx="4.5" ry="6" />
      <ellipse cx="46" cy="27" rx="4.5" ry="6" />
    </>
  ),
  yarn: (
    <>
      <circle cx="30" cy="32" r="18" />
      <path d="M14 26c8 2 22 1 32-8M13 36c10 1 24-3 34-14M19 46c8-3 18-12 25-24M33 14c-6 8-8 22-4 36" opacity=".8" />
      <path d="M46 42c5 3 6 8 12 8" />
    </>
  ),
}

export function Doodle({ name, ...props }: IconProps & { name: DoodleName }) {
  return <Svg {...props}>{DOODLES[name]}</Svg>
}

const TRAIL = [
  { x: 2, y: 62, r: 62 },
  { x: 16, y: 30, r: 74 },
  { x: 33, y: 64, r: 70 },
  { x: 49, y: 26, r: 82 },
  { x: 66, y: 52, r: 78 },
  { x: 83, y: 10, r: 90 },
]

/** A line of paw prints that stamp in one after another on load. Decorative. */
export function PawTrail({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none h-16 ${className ?? ''}`}>
      {TRAIL.map((paw, index) => (
        <span
          key={index}
          className="stamp-in absolute"
          style={{ left: `${paw.x}%`, top: `${paw.y}%`, ['--d' as string]: `${1300 + index * 170}ms` }}
        >
          <PawIcon className="size-7" style={{ transform: `rotate(${paw.r}deg)` }} />
        </span>
      ))}
    </div>
  )
}

export function PawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden={props.title ? undefined : true} {...props}>
      {props.title ? <title>{props.title}</title> : null}
      <g fill="currentColor">
        <ellipse cx="32" cy="41" rx="12" ry="10" />
        <ellipse cx="16.5" cy="27" rx="5.2" ry="7" />
        <ellipse cx="26.5" cy="16.5" rx="5.2" ry="7" />
        <ellipse cx="37.5" cy="16.5" rx="5.2" ry="7" />
        <ellipse cx="47.5" cy="27" rx="5.2" ry="7" />
      </g>
    </svg>
  )
}

export function Sparkle(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden {...props}>
      <path
        d="M16 2c1.2 7.6 3.4 9.8 12 11.2-8.6 1.6-10.8 3.8-12 12.8-1.2-9-3.4-11.2-12-12.8C12.6 11.8 14.8 9.6 16 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Squiggle({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 120 16" fill="none" aria-hidden className={className} {...props}>
      <path
        d="M2 10c8-8 14 4 22-2s12-6 20 0 13 6 21 0 12-6 20 0 13 5 20-1 9-4 13-1"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  )
}

/** A hand-drawn arrow. Point it anywhere with `direction`. */
export function HandArrow({
  direction = 'down-right',
  className,
  ...props
}: IconProps & { direction?: 'down-right' | 'down-left' | 'up-right' | 'up-left' | 'right' | 'left' }) {
  const transform = {
    'down-right': '',
    'down-left': 'scale(-1,1)',
    'up-right': 'scale(1,-1)',
    'up-left': 'scale(-1,-1)',
    right: 'rotate(-35)',
    left: 'scale(-1,1) rotate(-35)',
  }[direction]
  return (
    <svg viewBox="0 0 80 64" fill="none" aria-hidden className={className} {...props}>
      <g transform={transform} style={{ transformOrigin: '40px 32px', transformBox: 'view-box' }}>
        {/* a soft paper-coloured halo keeps the arrow legible over photos */}
        <path d="M8 10c14-4 33 0 42 13 5 7 7 15 7 26" stroke="var(--bg)" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
        <path
          d="M47 41l10 10 9-12"
          stroke="var(--bg)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
        <path
          d="M8 10c14-4 33 0 42 13 5 7 7 15 7 26"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          style={{ ['--len' as string]: 80 }}
        />
        <path d="M47 41l10 10 9-12" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}

/** Two little ears — the OopsArka signature. */
export function CatEars({ className, inner = 'var(--rose)', ...props }: IconProps & { inner?: string }) {
  return (
    <svg viewBox="0 0 120 40" aria-hidden className={className} {...props}>
      <path d="M6 40C8 26 12 12 18 5c2-3 6-3 8-1 8 7 17 16 24 27 1 2 0 5-3 5H9c-2 0-3-2-3-4Z" fill="currentColor" />
      <path d="M114 40c-2-14-6-28-12-35-2-3-6-3-8-1-8 7-17 16-24 27-1 2 0 5 3 5h38c2 0 3-2 3-4Z" fill="currentColor" />
      <path d="M17 32c1-6 3-12 6-16 5 4 9 9 13 16Z" fill={inner} opacity=".9" />
      <path d="M103 32c-1-6-3-12-6-16-5 4-9 9-13 16Z" fill={inner} opacity=".9" />
    </svg>
  )
}
