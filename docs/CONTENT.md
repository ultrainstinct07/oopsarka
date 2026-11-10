# Writing for OopsArka

This guide is for Arka's human. Everything here happens in the Studio at **oopsarka.space/studio** once Sanity is set up (see [SANITY.md](SANITY.md)). Log in with the account that owns the Sanity project.

## The starter content is sample content

The site launches with **11 sample posts**:

- **6 stories in Arka's voice.** For example "The 3 AM Zoomies Incident" and "An Extremely Serious Review of Cardboard Boxes".
- **5 Persian Life guides.** Grooming, long-coat care, a calm indoor world, toys and enrichment, and everyday care.

Each one has **Sample content** switched on, which shows a "Sample story" label on the site. They're written to sound like the blog, but they're placeholders, not things that really happened.

For each one, either:

- **Rewrite it** with what really happened, then switch **Sample content** off, or
- **Delete it** from Stories, or unpublish it to keep it as a draft.

The guides contain **"Your experience" blocks** (Human note) with a prompt such as _"What Arka's grooming routine actually looks like — when, which tools, and his opinion of each."_ They stay hidden on the live site until you fill them in. They exist so your own experience stays clearly separate from the general care guidance. The care guidance itself is deliberately general and points readers to a vet. Please keep it that way: no medication, dosing or diagnosis advice.

## Writing a story

**Stories → Create new.** Fields marked * are required.

| Field                       | Tips                                                                                                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Title***                  | Up to 110 characters. Titles are set big, so shorter usually looks better.                                                                                                                                                                                 |
| **URL slug***               | Click **Generate**. The story lives at `/diary/<slug>`. Avoid changing it after publishing, because old links would break.                                                                                                                                 |
| **Excerpt***                | One or two sentences (max 240). It's used on cards, in search results and in social previews.                                                                                                                                                              |
| **Cover image***            | See [Photos](#photos). Set the hotspot on Arka's face.                                                                                                                                                                                                     |
| **Story**                   | The body. See [Building blocks](#building-blocks).                                                                                                                                                                                                         |
| **Category***               | One of the five. See [Categories and tags](#categories-and-tags).                                                                                                                                                                                          |
| **Tags**                    | Up to 8. You can create a new tag right from the field.                                                                                                                                                                                                    |
| **Author***                 | "Arka" for stories in his voice, or "Arka's human" for guides.                                                                                                                                                                                             |
| **Published***              | A future date schedules the story. It stays hidden until then; the site checks about hourly.                                                                                                                                                               |
| **Updated**                 | Set this only for a meaningful edit to an older story. It's shown on the page.                                                                                                                                                                             |
| **Feature on the homepage** | Puts the story in the big slot in "Fresh out of trouble." (a Persian Life guide goes in the lead slot of "The Persian life, honestly." instead). Feature one at a time; the newest featured one wins. With none featured, the newest story takes the slot. |
| **Sample content**          | Leave off for real stories.                                                                                                                                                                                                                                |
| **SEO tab**                 | Optional overrides for the search-result title (≤70), description (≤170) and social image. By default the title, excerpt and an auto-generated card are used.                                                                                              |

Click **Publish** when you're done. The story, the homepage, the archives, search, RSS and the sitemap update within seconds if the webhook is set up, and within the hour otherwise. **Presentation** (top bar) shows the story as it will look, before you publish.

Reading time and the table of contents are worked out automatically. The contents list appears when a story has three or more section headings.

## Building blocks

Besides normal text (headings, lists, quotes, **bold**, _italic_ and links), the **+** menu in the Story field offers:

- **Figure.** A photo with alt text and an optional caption. Choose _In the text column_ or _Wide_.
- **Pull quote.** One big line (max 240 characters) that breaks out of the column, with an optional attribution.
- **Arka's note.** A short aside in his handwriting. It sits in the margin on wide screens and inline on phones.
- **Care note.** An "ask your vet" callout for health or safety notes in any story.
- **Human note.** Your own experience, kept separate from general guidance. It's hidden until filled in.
- **Clip.** A short video with a poster frame and a description for screen readers. See [Clips](#clips).
- **Embed.** A YouTube or Vimeo link (other sites are refused). It loads only when the reader clicks play.
- **Paw divider.** A scene break.

## Photos

- **Only real photos of Arka are presented as Arka.** Stories without a suitable photo can use one of the illustrated covers, which are obviously drawings. Swap them for photos whenever you have them.
- **Alt text is required.** Describe what's in the picture for someone who can't see it, in about one sentence. For example: _"Arka, a fluffy ginger Persian, glares up from under a pink striped towel."_ Don't start with "image of", and don't repeat the caption.
- **Hotspot.** After uploading, click the crop icon and drag the circle onto Arka's face. Every layout (square cards, tall portraits, social cards) then crops around it.
- **Size.** Upload the original from your phone; the site resizes it and serves AVIF or WebP. Portrait (3:4 or 4:5) suits most layouts.
- **Privacy.** Phone photos usually contain the GPS location where they were taken. The site only serves resized copies, which carry no location data. But the original file you upload stays at a public Sanity URL, location included. Before uploading:
  - turn location off when sharing (on iPhone: Share → **Options** → **Location** off), **or**
  - export a copy without it.

  Photos sent through WhatsApp, like the current ones, have already lost it.

## Clips

- Keep clips short (under 15 seconds) and small (under about 8 MB). The site plays them silently and on a loop while they're on screen. With reduced motion, Calm mode or Save-Data, it shows the poster and a play button instead.
- **Remove the audio and location data before uploading.** The site always plays clips muted, but the sound is still in the file. One way to do both, with [ffmpeg](https://ffmpeg.org):

```bash
ffmpeg -i in.mp4 -an -map_metadata -1 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4
```

- The **poster frame** is a still image upload. A sharp frame from the clip works best; any video player can save one, or use `ffmpeg -ss 1 -i out.mp4 -frames:v 1 poster.jpg`.
- **"What happens in the clip"** is read by screen readers, so describe the action.

The two clips already on the site were processed this way. The office-chair clip was also cropped to remove the caption that had been burned into the video.

## The Arka Files (gallery)

**The Arka Files** holds every exhibit, photos and videos, in one list:

- **Drag to reorder.** The exhibit letters (A, B, C…) and the gallery order follow the list.
- Each exhibit has a title, an optional caption and an optional **Date taken**. Leave the date empty if you're not sure; the site never guesses dates.
- The homepage "Evidence of Mischief" section shows the first five exhibits.

## Arka's profile

**Arka's profile** is the single source for the "personnel file" card, the homepage introduction, the caution-tape personality strip and the About page:

- **Species, breed, job title, special skill, coat and eyes** are filled in already. Change anything that's wrong.
- **Favourite activity, favourite snack and current obsession** show _"to be filled in by Arka's human"_ until you fill them in. Nothing was invented for these.
- **Personality strip** holds the labels on the moving tape.
- **Portrait** is the photo used in "Nice to meet you. I'm the problem."
- **About page story** is the longer text on `/about`.

## Site settings

- **Homepage hero portrait** is the big photo at the top of the homepage. It's also used in the default social card.
- **Newsletter section photo**.
- **Social profiles** appear in the footer. Only the profiles you add here are shown, and each needs a full `https://` URL. Until then, the footer says they're coming soon.
- **Arka's human:**
  - **Name** is optional. Leave it empty to stay "Arka's human".
  - **Introduction** and **why this blog exists** are written in placeholder form until you replace them.
- **Contact page introduction** and **newsletter pitch**.

## Categories and tags

There are five categories. They're used in the navigation and on the homepage, so rename them rather than deleting them:

- **Daily Diary** (lavender)
- **Oops Moments** (butter)
- **Adventures** (marmalade)
- **Persian Life** (sage, the guides)
- **Human Observations** (rose)

Each has a tagline, a description, an accent colour, a doodle, an optional cover photo and an order number.

Tags are free-form. Each tag has its own archive page at `/tags/<slug>`, so prefer a few meaningful tags over many one-offs.

## Before Sanity: the local sample files

Until a Sanity project is connected, the site reads `src/content/local/`:

- `posts/stories.ts` and `posts/guides.ts` hold the posts.
- `singletons.ts` holds the profile, settings and gallery.
- `taxonomy.ts` holds the categories, tags and authors.
- `media.ts` holds the photos, alt text and focal points.

Bodies are written with a small helper (`pt-builder.ts`): `p('Text with **bold** and [a link](/about)')`, `h2(...)`, `note(...)`, `care(...)`, `human(...)` and so on. This is meant for development. Once Sanity is live, `npm run seed` copies this content into the Studio, and from then on the Studio is the source of truth.
