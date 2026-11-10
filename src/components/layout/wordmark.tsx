import Link from 'next/link'
import { CatEars } from '@/components/media/doodles'
import { cn } from '@/lib/utils'

/** "Oops" in wonky italic, "Arka" upright — with two small ears on the A. */
export function WordmarkText({ className, earsClassName }: { className?: string; earsClassName?: string }) {
  return (
    <span className={cn('inline-flex items-baseline font-display leading-none font-semibold tracking-[-0.02em]', className)}>
      <span className="wordmark-oops inline-block origin-[20%_90%] text-lavender-ink italic">Oops</span>
      <span className="relative inline-block">
        <CatEars
          className={cn(
            'wordmark-ears absolute -top-[0.34em] left-[-0.06em] w-[0.78em] text-lavender transition-transform duration-300',
            earsClassName,
          )}
        />
        A
      </span>
      <span>rka</span>
    </span>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center rounded-md py-1 text-[1.65rem] text-ink', className)}
      aria-label="OopsArka — home"
    >
      <WordmarkText className="group-hover:[&_.wordmark-ears]:-translate-y-0.5 [&_.wordmark-oops]:transition-transform [&_.wordmark-oops]:duration-300 group-hover:[&_.wordmark-oops]:-rotate-6 group-focus-visible:[&_.wordmark-oops]:-rotate-6" />
    </Link>
  )
}
