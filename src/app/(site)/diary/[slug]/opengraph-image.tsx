import { getPost } from '@/lib/content'
import { OG_SIZE, ogImageData, renderOgCard } from '@/lib/seo/og'

export const alt = 'A story from Arka’s Diary on OopsArka'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function StoryOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) {
    return renderOgCard({ eyebrow: 'Arka’s Diary', title: 'A story from OopsArka', footer: 'oopsarka.space', image: null })
  }
  return renderOgCard({
    eyebrow: post.category.title,
    title: post.title,
    footer: `Arka’s Diary · ${post.readingMinutes} min read · oopsarka.space`,
    image: await ogImageData(post.cover),
    imageFocal: post.cover.focal,
  })
}
