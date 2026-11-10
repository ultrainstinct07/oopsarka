import { TiltCard } from '@/components/fx/tilt-card'
import { ArkaImage } from '@/components/media/arka-image'
import { PawIcon } from '@/components/media/doodles'
import type { Profile } from '@/lib/content/types'
import { cn } from '@/lib/utils'

function Field({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={cn('border-t border-dashed border-line-strong pt-2.5', wide && 'sm:col-span-2')}>
      <dt className="label text-[0.64rem] text-ink-muted">{label}</dt>
      <dd className={cn('mt-1 font-semibold', !value && 'hand text-[1.15rem] font-normal text-lavender-ink')}>
        {value ?? 'to be filled in by Arka’s human'}
      </dd>
    </div>
  )
}

/** Arka's ID card, rendered from the single profile data source. */
export function PersonnelFile({ profile, className }: { profile: Profile; className?: string }) {
  return (
    <TiltCard className={className}>
      <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-print">
        <div className="flex items-center justify-between gap-3 bg-ink px-5 py-2.5 text-bg">
          <p className="label text-[0.66rem]">Personnel file · OopsArka HQ</p>
          <PawIcon className="size-4 text-lavender" />
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[6.5rem_1fr] sm:p-6">
          <div className="flex items-center gap-4 sm:block">
            <div className="w-20 shrink-0 rotate-[-3deg] rounded-[0.3rem] bg-frame p-1 shadow-[var(--shadow-sticker)] sm:w-full">
              <ArkaImage image={profile.portrait} aspect={1} sizes="7rem" alt="" className="rounded-[0.2rem]" />
            </div>
            <div className="sm:mt-4">
              <p className="font-display text-3xl leading-none font-semibold">{profile.name}</p>
              <p className="mt-1 text-sm text-ink-muted">{profile.jobTitle}</p>
            </div>
          </div>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Field label="Species" value={profile.species} />
            <Field label="Breed" value={profile.breed} />
            <Field label="Coat" value={profile.coat} />
            <Field label="Eyes" value={profile.eyes} />
            <Field label="Special skill" value={profile.specialSkill} wide />
            <Field label="Favourite activity" value={profile.favoriteActivity} wide />
            <Field label="Favourite snack" value={profile.favoriteSnack} />
            <Field label="Current obsession" value={profile.currentObsession} />
          </dl>
        </div>
        <span aria-hidden className="stamp absolute right-5 bottom-4 rotate-[-8deg] text-[0.62rem] text-rose-ink opacity-80">
          Clearance: all rooms
        </span>
      </div>
    </TiltCard>
  )
}
