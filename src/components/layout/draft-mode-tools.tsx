import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { isSanityConfigured } from '@/sanity/env'

/**
 * Only editors in Draft Mode get Sanity's click-to-edit overlays and live refresh.
 * Public visitors never load this code.
 */
export async function DraftModeTools() {
  const { isEnabled } = await draftMode()
  if (!isEnabled || !isSanityConfigured) return null
  return (
    <>
      <VisualEditing />
      <a
        href="/api/draft-mode/disable"
        className="fixed right-4 bottom-4 z-[70] rounded-pill bg-ink px-4 py-2.5 label text-bg shadow-print"
      >
        Draft preview · Exit
      </a>
    </>
  )
}
