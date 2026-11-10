import { defineArrayMember, defineField, defineType } from 'sanity'

/** Rich text for stories, guides and the About page. Portable Text keeps it free of raw HTML. */
export const body = defineType({
  name: 'body',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Heading', value: 'h2' },
        { title: 'Subheading', value: 'h3' },
        { title: 'Small heading', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullets', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          defineField({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                description: 'Full URL (https://…), mailto: link, or a path on this site such as /diary/…',
                validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: 'figure' }),
    defineArrayMember({ type: 'pullQuote' }),
    defineArrayMember({ type: 'arkaNote' }),
    defineArrayMember({ type: 'careNote' }),
    defineArrayMember({ type: 'humanNote' }),
    defineArrayMember({ type: 'clip' }),
    defineArrayMember({ type: 'embed' }),
    defineArrayMember({ type: 'pawDivider' }),
  ],
})
