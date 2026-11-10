import { getSettings } from '@/lib/content'
import { OG_SIZE, ogImageData, renderOgCard } from '@/lib/seo/og'

export const alt = 'Arka, a fluffy ginger Persian cat, beside the words “Oops. Arka did it again.”'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const { heroImage } = await getSettings()
  return renderOgCard({
    eyebrow: 'The internet is now 1 cat more chaotic',
    italic: 'Oops.',
    title: 'Arka did it again.',
    footer: 'oopsarka.space · the wonderfully chaotic life of a Persian cat',
    image: await ogImageData(heroImage),
    imageFocal: heroImage.focal,
  })
}
