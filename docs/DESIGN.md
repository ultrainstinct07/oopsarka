# Design system

**Playful Editorial.** OopsArka should feel like an independent magazine about a small suspect: playful without being childish, premium without being corporate. It should be recognisable even without the logo.

## The idea: case files

Every story is an _incident_. The gallery is _Evidence of Mischief_, and each item is an _exhibit_ (A, B, C…). The personality strip is _caution tape_, and Arka's profile is a _personnel file_ with a job title of Chief Mischief Officer. The motif stays light and supporting. The confident magazine typography is what carries the premium feel.

## Signature devices

All of these live in `src/components/media/decor.tsx` and `doodles.tsx`:

| Device                                                  | Where                       | Notes                                                                                                                     |
| ------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Cat-ear frame** (`CatEarFrame`)                       | Hero, Meet Arka, About      | Photos sit as white-bordered prints on a coloured cat-head silhouette whose ears peek over the top edge.                  |
| **Washi tape** (`Tape`)                                 | Prints, cards               | Semi-transparent strips holding prints in place.                                                                          |
| **Stickers** (`Sticker`)                                | Category labels, hero notes | White border plus a 1–2 px soft shadow, never a heavy one.                                                                |
| **Stamps** (`Stamp`)                                    | Dates, metadata             | Outlined, slightly rotated: "FILED 23 OCT 2026".                                                                          |
| **Handwritten annotations** (`Annotation`, `HandArrow`) | Hero, profile, articles     | Kalam, with hand-drawn arrows that draw on once. Arrows have a background-coloured halo so they stay legible over photos. |
| **Marker swash** (`.marker`)                            | Highlighted words           | Ink text on a butter or lavender swash, so contrast never drops. In 3 AM mode it becomes a translucent butter.            |
| **Paper grain** (`.grain`)                              | Large surfaces              | A static SVG noise tile, not an animated canvas.                                                                          |
| **The wordmark**                                        | Header, footer              | "Oops" in Fraunces italic plus "Arka" in roman, with small cat ears over the A.                                           |

The cover illustrations in `public/images/illustrations/` are riso-style SVGs (offset ink line over flat fills). They are obviously illustrations, and never presented as photos of Arka.

## Colour

The light palette is primary. Brand hues are **fills**. Text always uses ink or one of the derived **-ink** shades, which keep WCAG AA contrast. `tests/unit/contrast.test.ts` reads these tokens straight from `globals.css` and checks the text/background pairs in both themes.

| Token                     | Light                 | Role                                                                                                                   |
| ------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--bg`                    | `#f8f5ef` ivory       | Page background                                                                                                        |
| `--bg-deep`               | `#f1ebdf`             | Footer, inset panels                                                                                                   |
| `--surface`               | `#ffffff`             | Cards, inputs                                                                                                          |
| `--ink`                   | `#24211f`             | Text                                                                                                                   |
| `--ink-muted`             | `#5b5550`             | Secondary text (6.7:1 on ivory)                                                                                        |
| `--lavender`              | `#c7b9e8`             | **Signature accent**, fills only (it's 1.7:1 as text)                                                                  |
| `--lavender-ink`          | `#5f4b9b`             | Accent text and links                                                                                                  |
| `--butter`                | `#f3d875`             | Sparingly: the main call to action, badges, marker swashes. Always with ink text.                                      |
| `--sage` / `--sage-ink`   | `#becdba` / `#44583f` | Persian Life                                                                                                           |
| `--rose` / `--rose-ink`   | `#e7b8b0` / `#8a3f33` | Human Observations                                                                                                     |
| `--marmalade`             | `#e0914a`             | Decor only. It echoes Arka's coat, which sits nearly opposite lavender on the colour wheel, so photos pop on lavender. |
| `--line`, `--line-strong` | `#e2dacb`, `#cfc4b1`  | Hairlines, input borders                                                                                               |
| `--danger`, `--success`   | `#a3241a`, `#2f6b3a`  | Form states (always with text and an icon, never colour alone)                                                         |

Each category has an accent (`ACCENT_FILL` / `ACCENT_SOFT` in `decor.tsx`): Daily Diary is lavender, Oops Moments butter, Persian Life sage, Adventures marmalade and Human Observations rose. The category name is always written out, so colour is never the only cue.

**There are no gradients, neon, glassmorphism or heavy shadows.** The only shadows are `--shadow-print` and `--shadow-sticker`, both a couple of pixels.

### 3 AM mode (dark theme)

This secondary theme is taken from the night-patrol photo: navy sky and warm window light. It's toggled from the footer or the mobile menu, never forced by the operating system, because the light palette is the brand.

| Token                              | Night                             |
| ---------------------------------- | --------------------------------- |
| `--bg` / `--bg-deep` / `--surface` | `#141a2e` / `#10152a` / `#1d2340` |
| `--ink` / `--ink-muted`            | `#f3efe7` / `#c3bdb3`             |
| `--lavender-ink`                   | `#cdbff2`                         |
| `--window`                         | `#f4b860` (warm glow accents)     |

Fills such as lavender and butter stay the same, and text on them stays ink-dark (`--on-fill`).

## Typography

| Role        | Face                   | Notes                                                                                                                                                                                                                                |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Display     | **Fraunces**           | Self-hosted with trimmed axes: roman at opsz 9–144 and wght 400–700 with SOFT fixed at 50 (~65 KB), and italic at opsz 144, SOFT 100, WONK 1 (~42 KB). The full family would be ~264 KB. Italic is for accent words such as "Oops.". |
| Body and UI | **Manrope** (variable) | Body runs about 17–19 px at line height 1.65–1.75, with a measure of about 66ch.                                                                                                                                                     |
| Labels      | Manrope 600            | Uppercase, tracked 0.08–0.16em (`label` utility).                                                                                                                                                                                    |
| Handwriting | **Kalam**              | Only for annotations and Arka's notes, never paragraphs.                                                                                                                                                                             |

The type scale is defined as `@theme` tokens and used as `text-hero`, `text-display` and so on:

| Token             | Value                                         |
| ----------------- | --------------------------------------------- |
| `--text-hero`     | `clamp(3.4rem, 1.6rem + 7.4vw, 9.75rem)`      |
| `--text-display`  | `clamp(2.6rem, 1.5rem + 4.4vw, 6rem)`         |
| `--text-headline` | `clamp(2rem, 1.35rem + 2.6vw, 3.9rem)`        |
| `--text-title`    | `clamp(1.4rem, 1.15rem + 1vw, 2.1rem)`        |
| `--text-lede`     | `clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)` |
| `--text-label`    | `0.75rem`                                     |

> These are custom names, so class merging has to know about them, or `cn('text-ink-muted', 'text-lede')` would treat `text-lede` as a colour and drop `text-ink-muted`. `cn` uses tables compiled from `globals.css` by `cn build` (`src/lib/cn-tables.ts`), which regenerate on dev and build. `tests/unit/cn.test.ts` guards this.

## Layout

- `.shell` is the page container: max 1440 px, with fluid gutters of `clamp(16px, 4vw, 48px)`.
- The grids are deliberately asymmetric: a 7/5 split for the featured story, a mosaic for categories, staggered prints in the gallery. There are no rows of identical cards.
- Sections are **recomposed** for phones, not just shrunk. On mobile the hero reads eyebrow, then headline, copy, buttons, and finally the photo, which peeks above the fold at 390×844.
- Photos are column-bound prints and never full-bleed. The source photos are about 1086×1448, so nothing is shown larger than it can carry.
- There is no horizontal scrolling at any width from 320 px. An end-to-end test checks this.

## Motion

The rules: 150–500 ms for interface feedback, transform and opacity only, no scroll hijacking, no custom cursor, no autoplaying sound. Content is fully visible without animation. Motion is an enhancement on top.

| What                                                                               | How                                                                                                                                                                                                                                                                 | Off when                                                                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Hero headline words settle into place                                              | CSS only. The text is visible from the first paint, so LCP isn't delayed.                                                                                                                                                                                           | Reduced motion, Calm mode                                               |
| Hero entrance                                                                      | CSS only (`rise-in`, `drop-in`, `pop-in`, `roll-in`, `stamp-in`): the photo drops into place (transform only, so LCP isn't delayed), then the stickers, badge, yarn and paw trail arrive in turn                                                                    | Reduced motion, Calm mode                                               |
| Section reveals                                                                    | `data-reveal` / `data-reveal-stagger` attributes, played by a small inline script (`src/components/fx/reveal-script.ts`) using the Web Animations API and an IntersectionObserver. Marker swashes draw on with their heading. Nothing is hidden without JavaScript. | Reduced motion, Calm mode, printing                                     |
| Reading progress bar                                                               | CSS `animation-timeline: scroll()`, no JavaScript                                                                                                                                                                                                                   | Unsupported browsers (the bar simply isn't shown)                       |
| Caution tape marquee                                                               | React Bits `ScrollVelocity`, lazy-loaded. Speed nudges with scroll. Pauses on hover, on focus, offscreen and with the button.                                                                                                                                       | Below 768 px, reduced motion, Calm mode (static tape)                   |
| Rotating "OOPS" badge                                                              | React Bits `CircularText`, lazy                                                                                                                                                                                                                                     | Below 640 px (not shown); stands still with reduced motion or Calm mode |
| Magnetic hero stickers, tilting ID card, footer letters swelling toward the cursor | React Bits `Magnet` and `VariableProximity`, and a small tilt                                                                                                                                                                                                       | Touch or coarse pointers, reduced motion, Calm mode                     |
| Card → article image morph                                                         | React 19 `<ViewTransition>`                                                                                                                                                                                                                                         | Reduced motion, Calm mode                                               |
| Clips                                                                              | Silent loop while on screen                                                                                                                                                                                                                                         | Reduced motion, Calm mode, Save-Data: poster and play button instead    |
| 3D yarn ball                                                                       | three.js / R3F, see below                                                                                                                                                                                                                                           | Everywhere except wide screens with a fine pointer                      |

**Calm mode** is a footer and menu toggle, remembered in `localStorage` (`oopsarka:calm`) and applied before first paint by a tiny inline script. It sets `html[data-calm="true"]`, which every animation checks, alongside `prefers-reduced-motion`. Hooks: `useReducedMotionPreference()`, `useSaveData()` and `useFinePointer()` in `src/hooks/use-preferences.ts`.

### The yarn ball (the one 3D object)

`src/components/fx/yarn/` holds a lavender ball of yarn built procedurally: about 60 jittered strands merged into one mesh, with a woolly sheen material. There are no model files and no HDR downloads. It tilts toward the pointer and spins when clicked, or with Enter or Space, because it's a real button.

- **An SVG illustration always renders first** in the same box. The SVG is what most visitors see, and it also spins on click.
- three.js (237 KB gzipped) loads only when all of these are true:
  - the screen is ≥ 1024 px wide with a fine pointer
  - motion is allowed and Save-Data is off
  - WebGL2 is available
  - the hero is in view
  - the visitor has moved the pointer
- The render loop stops while it's offscreen or the tab is hidden.

## Accessibility

- A skip link, landmarks, one `h1` per page and an ordered heading hierarchy.
- Visible focus: an ink outline with a lavender halo. Targets are at least 44 px.
- Nothing depends on hover. The "More incidents" hover preview also shows on keyboard focus, and every piece of its information is visible anyway.
- The menu, search, and lightbox are Base UI dialogs: focus trapped, focus returned, Esc to close.
- The lightbox also supports ←/→, swipe and an "Exhibit B · 2 of 7" counter.
- Forms:
  - Labels and inline errors linked with `aria-describedby`.
  - A polite live region for status.
  - Focus moves to the first invalid field.
- Images:
  - Alt text is required in the CMS.
  - Decorative SVGs are `aria-hidden`.
  - The tape's duplicated text is hidden, and a plain list is read instead.
- Checked automatically with axe (WCAG 2.2 AA rules) on every key page in both themes, plus reduced-motion and overflow tests.

## Where things live

```
src/app/globals.css          tokens (@theme, :root, [data-theme="night"]), utilities, prose, motion
src/app/fonts.ts             Fraunces (local subsets), Manrope, Kalam
src/components/media/        ArkaImage, ArkaVideo, decor (frame, tape, sticker, stamp, annotation), doodles
src/components/fx/           React Bits adaptations, HoverImageList, tilt card, magnet wrapper, yarn/
src/components/home/         homepage sections A–J
src/components/layout/       header, footer, wordmark, mobile menu, theme and Calm toggles
```

To add a category colour, add the token to `globals.css` (fill plus `-soft`, plus an `-ink` shade if it will carry text). Then add it to `ACCENT_FILL` / `ACCENT_SOFT`, to the `accent` option list in the category schema, and to the contrast test.

## The Playroom (mini games)

`/play` has three small games, each tied to a sample story:

| Game             | What it is                                                             | Extras                                                                                            |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Knock It Off** | 30 seconds to tap items off a shelf and a table before they slide away | Every fifth clean knock in a row earns a bonus point. The laptop costs two and resets the streak. |
| **Paw Pairs**    | Memory match using the story covers                                    | Timed, with a star rating by number of moves                                                      |
| **3 AM Zoomies** | A one-button runner down a dark hallway                                | Five kinds of obstacle, and biscuits worth ten points each                                        |

**Artwork.** All of it is hand-drawn SVG in `src/components/play/art.tsx`, in the same style as the story illustrations: a thick ink line over flat fills that sit slightly off-register. That file holds the table items, Arka peeking over the table (with calm, pleased and "oops" faces), his swiping paw, the running sprite (two run frames, a jump and a crash), the obstacles, the biscuit, the card back, the star rating and the confetti. The hallway is three SVG layers (wall with a window on the night skyline, furniture silhouettes, floorboards) that slide at different speeds.

**How it is put together.**

- The rules live in `src/lib/play/` as pure functions with unit tests; the components in `src/components/play/` only draw and handle input.
- Each game is its own lazily loaded chunk, so no other page downloads game code. (The homepage teaser uses three small drawings from the art file; they are plain SVG markup, not script.)
- Every control is a real button with a text label. Paw Pairs supports arrow keys; Zoomies is one action (tap, Space or the up arrow); Esc pauses it.
- Start, resume and play-again buttons sit on a card over the play area. Results show up to three stars and are announced to screen readers.
- Games pause when the tab is hidden or they scroll out of view.
- On narrow screens Zoomies caps its top speed, so a phone gets the same time to react as a desktop.

**Motion.** With reduced motion or Calm mode, Zoomies explains itself and waits for "Play anyway"; the paw swipe, score pop-ups, confetti, dust and screen shake do not run.

**Sound.** Effects are synthesised in the browser (`src/lib/play/sound.ts`, no audio files) and are **off until the player switches them on**, so nothing ever plays by itself. The switch is next to the game title.

**Leaderboard.** Under each game is a "Most wanted" board (`src/components/play/leaderboard.tsx`). When a round ends with a score, a form appears there asking for a name (remembered for next time); the result card's "Save score" button jumps to it. "This device" is always available. "Everyone" appears only when the shared board is switched on (see INTEGRATIONS.md), and a shared save is only announced once the server confirms it. For Paw Pairs fewer moves ranks higher.

**Storage.** The "This device" board (`oopsarka:play:board:<game>`), the last name used (`oopsarka:play:name`), best scores (`oopsarka:play:<game>`) and the sound setting (`oopsarka:play:sound`) are kept in the browser's local storage and never sent anywhere. A score of zero is never recorded as a best.
