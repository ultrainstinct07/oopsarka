import { CogIcon } from '@sanity/icons/Cog'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { ImagesIcon } from '@sanity/icons/Images'
import { StarIcon } from '@sanity/icons/Star'
import type { StructureResolver } from 'sanity/structure'

const singleton = (S: Parameters<StructureResolver>[0], type: string, title: string, icon: typeof CogIcon) =>
  S.listItem().title(title).id(type).icon(icon).child(S.document().schemaType(type).documentId(type).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('OopsArka')
    .items([
      S.listItem()
        .title('Stories')
        .icon(DocumentTextIcon)
        .child(
          S.documentTypeList('post')
            .title('Stories')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }]),
        ),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('tag').title('Tags'),
      S.documentTypeListItem('author').title('Authors'),
      S.divider(),
      singleton(S, 'profile', "Arka's profile", StarIcon),
      singleton(S, 'gallery', 'The Arka Files', ImagesIcon),
      singleton(S, 'siteSettings', 'Site settings', CogIcon),
    ])
