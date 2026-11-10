import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  ArticleCover,
  ArticleHeader,
  PrevNext,
  ReadingProgress,
  RelatedStories,
  TagList,
} from '@/components/article/article-parts'
import { PortableBody } from '@/components/article/portable-body'
import { ShareControls } from '@/components/article/share-controls'
import { TableOfContents } from '@/components/article/toc'
import { NewsletterBlock } from '@/components/home/newsletter-section'
import { imageUrl } from '@/components/media/image-url'
import { JsonLd } from '@/components/seo/json-ld'
import { getAdjacentPosts, getAllPosts, getPost, getRelatedPosts } from '@/lib/content'
import { pageMetadata } from '@/lib/seo/metadata'
import { blogPostingJsonLd } from '@/lib/seo/structured-data'
import { absoluteUrl } from '@/lib/site'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  // Cache Components needs at least one param; unknown slugs render on demand (or 404).
  return posts.length ? posts.map((post) => ({ slug: post.slug })) : [{ slug: 'coming-soon' }]
}

export async function generateMetadata({ params }: PageProps<'/diary/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Story not found', robots: { index: false } }
  return pageMetadata({
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    path: `/diary/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt ?? post.publishedAt,
    section: post.category.title,
    tags: post.tags.map((tag) => tag.title),
    image: null,
  })
}

export default async function ArticlePage({ params }: PageProps<'/diary/[slug]'>) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const [{ newer, older }, related] = await Promise.all([getAdjacentPosts(post.slug), getRelatedPosts(post.slug, 3)])
  const url = absoluteUrl(`/diary/${post.slug}`)
  const photoUrl = post.cover.illustration ? undefined : absoluteUrl(imageUrl(post.cover, 1200))
  // Search engines want a raster image: the cover photo, or the site card for drawn covers.
  const socialImage = photoUrl ?? absoluteUrl('/opengraph-image')

  return (
    <article>
      <JsonLd data={blogPostingJsonLd(post, socialImage)} />
      <ReadingProgress />
      <ArticleHeader post={post} />
      <ArticleCover post={post} />

      <div className="shell mt-16 sm:mt-20">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,44rem)_minmax(0,1fr)] xl:gap-12">
          <div className="xl:pt-1">
            <TableOfContents items={post.toc} />
          </div>
          <div>
            <PortableBody value={post.body} toc={post.toc} />
            <footer className="mx-auto mt-16 flex max-w-[66ch] flex-col gap-10 border-t border-line pt-10">
              <TagList tags={post.tags} />
              <ShareControls url={url} title={post.title} image={photoUrl} />
              <PrevNext newer={newer} older={older} />
            </footer>
          </div>
        </div>
      </div>

      <section aria-labelledby="article-newsletter" className="shell my-20">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-butter-soft p-7 sm:p-10">
          <h2 id="article-newsletter" className="font-display text-title font-semibold">
            Enjoyed this incident? Get the next one by email.
          </h2>
          <p className="mt-2 text-ink-muted">The occasional oops, never spammed. Unsubscribe whenever you like.</p>
          <div className="mt-6">
            <NewsletterBlock idPrefix="article-nl" />
          </div>
        </div>
      </section>

      <RelatedStories posts={related} />
    </article>
  )
}
