import { CareCallout } from '@/components/home/persian-life'
import { GUIDE_CATEGORY, getCategory, getPostsByCategory, getPostsByTag, getTag } from '@/lib/content'
import { paginate } from '@/lib/content/pagination'
import { site } from '@/lib/site'
import { pluralize } from '@/lib/utils'
import { EmptyState, PageHeader, Pagination, PostGrid } from './archive'

export const categoryHref = (slug: string) => (page: number) =>
  page <= 1 ? `/category/${slug}` : `/category/${slug}/page/${page}`
export const tagHref = (slug: string) => (page: number) => (page <= 1 ? `/tags/${slug}` : `/tags/${slug}/page/${page}`)

export async function categoryPageCount(slug: string) {
  const posts = await getPostsByCategory(slug)
  return Math.max(1, Math.ceil(posts.length / site.postsPerPage))
}

export async function tagPageCount(slug: string) {
  const posts = await getPostsByTag(slug)
  return Math.max(1, Math.ceil(posts.length / site.postsPerPage))
}

export async function CategoryArchive({ slug, page }: { slug: string; page: number }) {
  const category = await getCategory(slug)
  if (!category) return null
  const posts = await getPostsByCategory(slug)
  const current = paginate(posts, page, site.postsPerPage)
  const href = categoryHref(slug)

  return (
    <>
      <PageHeader
        eyebrow={`Category · ${pluralize(posts.length, 'story', 'stories')}${current.page > 1 ? ` · page ${current.page}` : ''}`}
        title={category.title}
        description={category.description}
        accent={category.accent}
        doodle={category.doodle}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Categories', path: '/categories' },
          { name: category.title, path: href(1) },
          ...(current.page > 1 ? [{ name: `Page ${current.page}`, path: href(current.page) }] : []),
        ]}
      >
        {slug === GUIDE_CATEGORY ? <CareCallout className="mt-8 max-w-xl bg-surface/70" /> : null}
      </PageHeader>
      <div className="shell py-14 sm:py-20">
        {current.items.length ? (
          <PostGrid posts={current.items} lead={current.page === 1 && current.items.length > 2} />
        ) : (
          <EmptyState title="No stories here yet.">Arka is working on it. Probably. Try the diary in the meantime.</EmptyState>
        )}
        <Pagination page={current.page} totalPages={current.totalPages} href={href} />
      </div>
    </>
  )
}

export async function TagArchive({ slug, page }: { slug: string; page: number }) {
  const tag = await getTag(slug)
  if (!tag) return null
  const posts = await getPostsByTag(slug)
  const current = paginate(posts, page, site.postsPerPage)
  const href = tagHref(slug)

  return (
    <>
      <PageHeader
        eyebrow={`Tag · ${pluralize(posts.length, 'story', 'stories')}`}
        title={
          <>
            <span className="text-lavender-ink">#</span>
            {tag.title}
          </>
        }
        description={tag.description}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tags', path: '/tags' },
          { name: tag.title, path: href(1) },
          ...(current.page > 1 ? [{ name: `Page ${current.page}`, path: href(current.page) }] : []),
        ]}
      />
      <div className="shell py-14 sm:py-20">
        {current.items.length ? (
          <PostGrid posts={current.items} lead={false} />
        ) : (
          <EmptyState title="Nothing tagged like this yet.">Try another tag, or browse the whole diary.</EmptyState>
        )}
        <Pagination page={current.page} totalPages={current.totalPages} href={href} />
      </div>
    </>
  )
}
