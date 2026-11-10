import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

/** Tells the Presentation tool which page shows which document. */
export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/diary/:slug', filter: `_type == "post" && slug.current == $slug` },
    { route: '/category/:slug', filter: `_type == "category" && slug.current == $slug` },
    { route: '/tags/:slug', filter: `_type == "tag" && slug.current == $slug` },
    { route: '/about', filter: `_type == "profile" && _id == "profile"` },
    { route: '/gallery', filter: `_type == "gallery" && _id == "gallery"` },
  ]),
  locations: {
    post: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || 'Untitled', href: `/diary/${doc?.slug}` },
          { title: 'Diary', href: '/diary' },
          { title: 'Home', href: '/' },
        ],
      }),
    }),
    category: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({ locations: [{ title: doc?.title || 'Category', href: `/category/${doc?.slug}` }] }),
    }),
    tag: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({ locations: [{ title: doc?.title || 'Tag', href: `/tags/${doc?.slug}` }] }),
    }),
    profile: defineLocations({
      locations: [
        { title: 'About Arka', href: '/about' },
        { title: 'Home', href: '/' },
      ],
    }),
    gallery: defineLocations({ locations: [{ title: 'The Arka Files', href: '/gallery' }] }),
    siteSettings: defineLocations({ message: 'Used across the whole site', tone: 'positive' }),
  },
}
