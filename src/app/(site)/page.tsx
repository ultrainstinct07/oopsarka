import type { Metadata, Route } from 'next'
import { CautionTape } from '@/components/home/caution-tape'
import { CategoryMosaic } from '@/components/home/category-mosaic'
import { EvidencePreview } from '@/components/home/evidence-preview'
import { Hero } from '@/components/home/hero'
import { LatestStories } from '@/components/home/latest-stories'
import { MeetArka } from '@/components/home/meet-arka'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PlayroomTeaser } from '@/components/home/playroom-teaser'
import { PersianLife } from '@/components/home/persian-life'
import { JsonLd } from '@/components/seo/json-ld'
import {
  getAllPosts,
  getCategoriesWithCounts,
  getGallery,
  getGuides,
  getLatestStories,
  getProfile,
  getSettings,
} from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'
import { websiteJsonLd } from '@/lib/seo/structured-data'
import { site } from '@/lib/site'

export const metadata: Metadata = pageMetadata({
  title: 'OopsArka — Oops. Arka did it again.',
  absoluteTitle: true,
  description: site.description,
  path: '/',
})

export default async function HomePage() {
  const [latest, guides, tiles, gallery, profile, settings, posts] = await Promise.all([
    getLatestStories(6),
    getGuides(),
    getCategoriesWithCounts(),
    getGallery(),
    getProfile(),
    getSettings(),
    getAllPosts(),
  ])

  const newestHref = (posts[0] ? `/diary/${posts[0].slug}` : '/diary') as Route

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <Hero portrait={settings.heroImage} latestHref={newestHref} />
      <CautionTape traits={profile.traits} />
      <LatestStories featured={latest.featured} rest={latest.rest} />
      <MeetArka profile={profile} />
      <CategoryMosaic tiles={tiles} />
      <EvidencePreview items={gallery} />
      <PlayroomTeaser />
      <PersianLife guides={guides} />
      <NewsletterSection photo={settings.newsletterImage} pitch={settings.newsletterPitch} />
    </>
  )
}
