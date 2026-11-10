import type { GalleryItem, Profile, Settings } from '@/lib/content/types'
import { photo, video } from './media'
import { body, note, p } from './pt-builder'

/** Arka's single profile data source — edit here (or in Sanity Studio once connected). */
export const profile: Profile = {
  name: 'Arka',
  species: 'Cat',
  breed: 'Persian',
  jobTitle: 'Chief Mischief Officer',
  specialSkill: 'Looking innocent immediately after causing chaos',
  coat: 'Marmalade, long, maximum fluff',
  eyes: 'Copper, usually plotting',
  favoriteActivity: undefined,
  favoriteSnack: undefined,
  currentObsession: undefined,
  traits: [
    'Professional troublemaker',
    'Part-time nap enthusiast',
    'Full-time fluff machine',
    'Destroyer of personal space',
    'Inspector of every cardboard box',
  ],
  intro:
    "I'm Arka, a Persian cat with an impressive coat, a curious little face, and absolutely no intention of following the rules. I supervise the household, inspect everything that arrives in a box, and believe every closed door is a personal challenge.",
  portrait: photo('blanket-stare'),
  aboutBody: body(
    'about',
    p(
      "Let's get the formalities out of the way. I am Arka. I am a Persian cat, which means I come with a great deal of fur and an even greater sense of occasion. I did not ask for a website. I was simply informed, one afternoon, that I would be getting one, and I have decided to allow it.",
    ),
    p(
      'My days are busy. There are patrols to complete, sunbeams to occupy and a human to supervise. There is a chair I consider mine (it was not purchased for me; this is irrelevant), a rooftop I visit in a harness under strict supervision, and a long list of objects that are, frankly, too close to the edge of the table.',
    ),
    note('The table thing is a design flaw. Not my fault.'),
    p(
      "This is my diary. My human types it up, takes the photographs and, when the evidence is overwhelming, cleans up. I provide the material. I think that's fair.",
    ),
  ),
}

export const settings: Settings = {
  heroImage: photo('night-patrol'),
  newsletterImage: photo('blanket-lookup'),
  socials: [],
  human: {
    name: undefined,
    intro:
      "Arka's human handles the typing, the photography and the cleanup. A proper introduction is on its way — as soon as Arka approves the wording.",
    whyThisBlog:
      'Because the small, ridiculous, lovely moments of living with a cat deserve to be written down. OopsArka is a diary of those moments — plus a few honest notes on Persian cat care, picked up one tangle at a time.',
  },
  contactIntro:
    'Fan mail, collaboration ideas, cat-care questions, or a story about your own small troublemaker — Arka’s human reads everything. Arka reads nothing, but he may sit on the keyboard while the reply is written.',
  newsletterPitch:
    'New adventures, questionable decisions, and an unreasonable amount of fluff. Delivered occasionally, never spammed.',
}

/** "The Arka Files" — ordered; the order here is the order on the page. */
export const gallery: GalleryItem[] = [
  {
    id: 'night-patrol',
    kind: 'photo',
    title: 'Night patrol',
    caption: 'Evening rounds. Every lit window accounted for.',
    image: photo('night-patrol'),
  },
  {
    id: 'office-chair',
    kind: 'video',
    title: 'The office chair has been acquired',
    caption: 'Curled up on the work chair. By morning there will be loud, specific requests for breakfast. Meanwhile…',
    video: video('office-chair'),
  },
  {
    id: 'blanket-stare',
    kind: 'photo',
    title: 'The unimpressed review',
    caption: 'Tucked in, paws out, judging everything.',
    image: photo('blanket-stare'),
  },
  {
    id: 'rooftop-complaint',
    kind: 'video',
    title: 'A formal complaint, filed in person',
    caption: 'Rooftop afternoon, harness on, opinions loud. The sound has been removed — please imagine it.',
    video: video('rooftop-complaint'),
  },
  {
    id: 'blanket-lookup',
    kind: 'photo',
    title: 'Plotting, probably',
    caption: 'Something up there needs investigating.',
    image: photo('blanket-lookup'),
  },
  {
    id: 'rooftop-harness',
    kind: 'photo',
    title: 'Harnessed and ready',
    caption: 'Rooftop time is strictly supervised: harness on, human on duty.',
    image: photo('rooftop-harness'),
  },
  {
    id: 'rooftop-full-complaint',
    kind: 'photo',
    title: 'The full complaint',
    caption: 'Mid-meow. The precise contents of the complaint remain classified.',
    image: photo('rooftop-full-complaint'),
  },
]
