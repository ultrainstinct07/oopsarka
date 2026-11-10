import type { ArkaImage, ArkaVideo } from '@/lib/content/types'

/** Gallery item prepared on the server for the client lightbox. */
export type Exhibit =
  | { id: string; letter: string; title: string; caption?: string; date?: string; kind: 'photo'; image: ArkaImage }
  | {
      id: string
      letter: string
      title: string
      caption?: string
      date?: string
      kind: 'video'
      video: ArkaVideo
      posterSrc: string
    }
