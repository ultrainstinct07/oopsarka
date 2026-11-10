import type { Metadata } from 'next'
import { DiaryArchive } from '@/components/story/diary-archive'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = pageMetadata({
  title: "Arka's Diary",
  description: 'Every oops, in order: diary entries, mischief, adventures and Persian life notes from Arka the Persian cat.',
  path: '/diary',
})

export default function DiaryPage() {
  return <DiaryArchive page={1} />
}
