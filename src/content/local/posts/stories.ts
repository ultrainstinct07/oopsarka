import { illustration, photo, video } from '../media'
import { body, care, clip, divider, h2, note, ol, p, pull, ul } from '../pt-builder'
import type { LocalPost } from './types'

/**
 * Starter stories, told in Arka's voice. These are sample editorial ideas —
 * not claims about things that actually happened — and are labelled as such
 * on the site until they're edited or replaced.
 */
export const stories: LocalPost[] = [
  {
    slug: 'the-3-am-zoomies-incident',
    title: 'The 3 AM Zoomies Incident',
    excerpt:
      'At 3:04 AM the house was silent, dark and, frankly, wasted. A minute-by-minute account of what happened next — and why the hallway runner now lives in the kitchen.',
    category: 'oops-moments',
    tags: ['zoomies', 'night-shift'],
    author: 'arka',
    publishedAt: '2026-10-23T08:30:00.000Z',
    cover: illustration('zoomies'),
    sample: true,
    body: body(
      'zm',
      p(
        'At 3:04 AM the house was silent, the human was asleep, and nothing whatsoever was happening. I want to be clear that I did not choose what came next. *The zoomies chose me.*',
      ),
      h2('3:04 AM — The calm'),
      p(
        'There is a particular kind of quiet that settles over a home in the middle of the night. The fridge hums. A car passes somewhere far away. The human makes a small whistling noise that I have generously chosen not to mention to them. It is peaceful. It is lovely. It lasts approximately ninety seconds.',
      ),
      h2('3:06 AM — The signal'),
      p(
        'Nobody knows what starts the zoomies. Scientists (me) have studied the question for years. Some say it is a sound only cats can hear. Others blame the moon. I believe it is the hallway itself, which is long and straight and has clearly been designed for one purpose only.',
      ),
      pull('Zoomies are not a decision. They are a calling.'),
      h2('3:07 AM — The circuit'),
      p(
        'The standard route is as follows: bedroom door, hallway, the corner where the runner has a slight curl to it, kitchen, a sharp left past the water bowl, back down the hallway at roughly twice the original speed, a vertical leap onto the bed, a vertical leap off the bed, and repeat.',
      ),
      ul(
        '**Laps completed:** more than four, fewer than eleven.',
        '**Rugs relocated:** one (the hallway runner, now in the kitchen).',
        '**Humans woken:** one — briefly, then permanently.',
      ),
      note("The runner looks better in the kitchen. You're welcome."),
      h2('3:12 AM — The investigation'),
      p(
        'The human sat up and said my name in the voice usually reserved for the vacuum cleaner. I stopped mid-hallway, sat down and washed one paw with great care, the way any innocent cat would. Eye contact was made. Eye contact was held. Nobody could prove anything.',
      ),
      h2('3:15 AM — The aftermath'),
      p(
        "By 3:15 I was asleep on the warm patch the human had just vacated to go and fix the runner. Experts call this *efficiency*. When the alarm went off at seven I was well rested and ready for breakfast. The human was not, and I'm told this is somehow my fault.",
      ),
      care(
        "Short, sudden bursts of night-time energy are very common in cats (vets sometimes call them frenetic random activity periods). A good play session in the evening can help. If your cat's night-time behaviour changes suddenly, or comes with other changes, it's worth mentioning to your vet.",
        'A note from the human',
      ),
      divider(),
      p('*Filed under Oops Moments. No furniture was harmed. One rug was mildly inconvenienced.*'),
    ),
  },
  {
    slug: 'why-my-human-cant-use-the-bathroom-alone',
    title: "Why My Human Can't Use the Bathroom Alone",
    excerpt:
      'A closed door is not a boundary. It is a question. Some thoughts on privacy, supervision, and why I will always, always be on the other side of that door.',
    category: 'human-observations',
    tags: ['humans', 'routines'],
    author: 'arka',
    publishedAt: '2026-10-19T09:00:00.000Z',
    cover: photo('rooftop-midmeow'),
    featured: true,
    sample: true,
    body: body(
      'bt',
      p(
        'Every household has rules. In ours, the rules are simple: every door should be open, every lap should be available, and the human should never, under any circumstances, be left unsupervised in a small room.',
      ),
      h2('The door problem'),
      p(
        'Most rooms in the house are fine. The bathroom is not fine. The human walks in, the door closes, and they vanish completely. I have no idea what happens in there. There could be treats. There could be a second cat. They could be gone for ever.',
      ),
      pull('A closed door is not a boundary. It is a question.'),
      h2('My response, in four stages'),
      ol(
        '**The paw.** One paw, slid gently under the door. A polite enquiry.',
        '**The voice.** A short meow. Then a longer one. Then a meow with real feeling in it.',
        '**The lean.** Full body weight against the door, in case it was simply stuck.',
        "**The vigil.** I sit outside the door, facing it, so the first thing the human sees when they come out is how worried I've been.",
      ),
      note('Stage two is my favourite. The acoustics in the hallway are excellent.'),
      clip(
        video('rooftop-complaint'),
        'Stage two, demonstrated on the rooftop for documentary purposes. Sound removed, for everyone’s sake.',
      ),
      h2("The human's side of the story"),
      p(
        'My human says they need "a moment of peace". I have taken this under advisement. However, I\'ve noticed that when I am let in, I\'m greeted with a sigh that is at least forty per cent affection, and that the human often says "fine, you win" — which is the correct conclusion.',
      ),
      h2("What I'm actually doing in there"),
      p(
        "Supervising. Inspecting the bath mat. Batting the end of the toilet roll exactly once. Sitting on the closed laundry basket like a small, fluffy judge. When I'm satisfied that everything is in order, I leave immediately — and ask to be let back into the bedroom instead.",
      ),
      p('In conclusion: the door is a question, and my answer is always *yes*.'),
    ),
  },
  {
    slug: 'an-extremely-serious-review-of-cardboard-boxes',
    title: 'An Extremely Serious Review of Cardboard Boxes',
    excerpt:
      'Shoeboxes, delivery boxes and the legendary Big Box: a rigorous, completely unbiased ranking of every cardboard box to enter the house this month.',
    category: 'adventures',
    tags: ['boxes', 'reviews'],
    author: 'arka',
    publishedAt: '2026-10-11T10:15:00.000Z',
    cover: illustration('boxes'),
    sample: true,
    body: body(
      'bx',
      p(
        'Boxes arrive in this house almost every week. The human thinks the important part is whatever is inside. The human is wrong. The box is the gift; the contents are packaging.',
      ),
      p(
        'Each box below has been assessed on five criteria: **fit**, **sound** (a good box crackles when you land in it), **sightlines**, **structural integrity**, and **sit-in-ability**, which is hard to explain but you know it when you feel it.',
      ),
      h2('The shoebox — ★★★★☆'),
      p(
        "Too small, and that's the point. Getting into a box that is clearly smaller than you is a test of character. I passed. The lid was removed and placed on the floor, where it has been sat on several times since. One star deducted for a lingering smell of trainers.",
      ),
      h2('The grocery delivery box — ★★★☆☆'),
      p(
        'Good size, good walls, slightly soft in one corner for reasons I have chosen not to investigate. Excellent for ambushes. Retired early after it was "needed for recycling", a phrase I do not accept.',
      ),
      h2('The flat-pack box — ★★☆☆☆'),
      p(
        'Long, thin and mostly corners. Fun to run through exactly once. Disqualified when the human folded it into a smaller shape while I was still nearby, which I consider a breach of trust.',
      ),
      h2('The Big Box — ★★★★★'),
      p(
        'Once in a lifetime, a box arrives that changes everything. The Big Box was large enough to turn around in, sturdy enough to stand on, and came with crinkly paper inside, which I consider a sign of respect. I have occupied it for nine days. I intend to continue.',
      ),
      pull('The box is the gift. The contents are packaging.'),
      note("Do not recycle the Big Box. I'm watching."),
      h2('Methodology'),
      p(
        "All boxes were tested personally. No boxes were provided by sponsors, although I'd like to make it clear that I am open to offers.",
      ),
      care(
        'Cardboard boxes make cheap, excellent enrichment. Remove tape, staples, plastic and any loose packaging before handing one over, and keep an eye out for chewed cardboard being swallowed.',
        'Box safety, from the human',
      ),
    ),
  },
  {
    slug: 'a-day-in-the-life-of-a-cat-who-pays-no-rent',
    title: 'A Day in the Life of a Cat Who Pays No Rent',
    excerpt:
      'Breakfast at dawn, patrols at noon and a strict afternoon nap schedule. A timetable for a long day of doing absolutely whatever I like.',
    category: 'daily-diary',
    tags: ['routines', 'naps', 'office-chair', 'rooftop'],
    author: 'arka',
    publishedAt: '2026-10-06T07:45:00.000Z',
    cover: photo('rooftop-harness'),
    sample: true,
    body: body(
      'dl',
      p(
        'People sometimes ask what I do all day. (Nobody asks this. But they should.) The answer is: everything that matters, on a schedule that is not up for negotiation.',
      ),
      h2('Early morning — Breakfast negotiations'),
      p(
        "The day begins before the alarm, because the alarm is unreliable. I sit on the human's chest and look at their face from a distance of about three centimetres. If that doesn't work, I meow — softly at first, then louder, like a very small, very determined orchestra.",
      ),
      h2('Mid-morning — The patrol'),
      p(
        "Every room must be checked. Windows, for birds. Bags, for contents. The bathroom, for reasons covered elsewhere. I end the patrol by walking across the human's keyboard while they're working, which I consider a performance review.",
      ),
      h2('Noon — The chair'),
      p(
        'There is a black office chair in this house. It was bought for the human. This is a technicality. It is warm, it spins a little and its armrests make an excellent den. By noon the chair is mine, and the human is working from the sofa.',
      ),
      clip(video('office-chair'), 'Chair: acquired. Breakfast requests scheduled for dawn. Meanwhile…'),
      note('If you get up from the chair, you lose the chair. Those are the rules.'),
      h2('Afternoon — Professional rest'),
      p(
        'I nap in three locations, in rotation: the chair, the sunny patch on the bed, and the exact spot where the human was about to put a basket of clean laundry. Each nap lasts at least an hour. Sleep is serious work and should be treated as such.',
      ),
      h2('Evening — The rooftop'),
      p(
        'On some evenings I put on my harness (under brief, dignified protest) and go up to the roof with my human for a supervised look at the world. I sniff the air, I inspect the pot plants, and I explain my opinions loudly to anyone nearby.',
      ),
      h2('Night — Lights out (mostly)'),
      p(
        "At bedtime I settle at the foot of the bed, which slowly becomes the middle of the bed, which by morning becomes the human's pillow. Then the alarm doesn't need to go off at all, because breakfast negotiations have already begun.",
      ),
      pull('Rent is a human concept. I contribute vibes.'),
    ),
  },
  {
    slug: 'the-great-houseplant-investigation',
    title: 'The Great Houseplant Investigation',
    excerpt:
      'A new plant arrived. It was green, it rustled and it was deeply suspicious. Notes from a thorough investigation — and the human’s very sensible follow-up.',
    category: 'oops-moments',
    tags: ['houseplants', 'investigations'],
    author: 'arka',
    publishedAt: '2026-09-26T11:20:00.000Z',
    cover: illustration('houseplant'),
    sample: true,
    body: body(
      'hp',
      p(
        'It arrived on a Tuesday, in a pot, carried by the human as if it were something precious. It was put on the windowsill. It was given water. It was given *a name*. I have lived here for some time and nobody has ever brought me water in a decorative jug.',
      ),
      h2('Initial observations'),
      ul(
        'The suspect is green and roughly the height of a sitting cat.',
        'It moves when nobody is touching it. (A fan was later found to be involved.)',
        "It has a smell I can only describe as 'outside, but indoors'.",
      ),
      h2('The interview'),
      p(
        "I approached slowly, low to the ground, the way professionals do. I sniffed the pot. I sniffed the soil. I tapped one leaf with one paw. The leaf moved. I moved faster. Nobody saw that part, so it didn't happen.",
      ),
      pull('Every leaf is a lead.'),
      h2('Evidence gathered'),
      p(
        'Over the following days I gathered evidence by sitting next to the suspect and staring at it for long periods. I also attempted a small taste test, purely for scientific purposes. This is where the human became involved.',
      ),
      note("Apparently 'scientific purposes' is not a defence."),
      h2('Case closed (by the human)'),
      p(
        "The human looked the plant up, moved it to a room I'm not allowed in, and put a pot of cat grass on the windowsill instead — which is mine, and which I'm allowed to chew. I'm told this is called a compromise. The cat grass is fine. I still think about the other plant.",
      ),
      care(
        "Some common houseplants are toxic to cats, and lilies are extremely dangerous — even a little pollen or the water from the vase can cause serious harm. Check plants before bringing them home, and if you think your cat has eaten something they shouldn't have, contact your vet straight away.",
        "The human's note on houseplants",
      ),
      p(
        'A useful starting point: the ASPCA’s [list of toxic and non-toxic plants](https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants).',
      ),
    ),
  },
  {
    slug: 'things-i-have-knocked-off-tables-this-week',
    title: 'Things I Have Knocked Off Tables This Week',
    excerpt:
      'A pen, a bottle cap, one (1) earring and the remote control. A full and frank inventory of this week’s gravity experiments, with results.',
    category: 'oops-moments',
    tags: ['gravity', 'investigations'],
    author: 'arka',
    publishedAt: '2026-09-14T16:40:00.000Z',
    cover: illustration('tables'),
    sample: true,
    body: body(
      'tb',
      p(
        'Gravity is a theory, and theories must be tested. This week I tested it rigorously, on several tables, in front of several witnesses. Here are the results, in the interests of science and transparency.',
      ),
      h2('The inventory'),
      ol(
        '**A pen.** Monday, desk. Fell immediately. Rolled under the sofa, where it now lives.',
        '**A bottle cap.** Tuesday, kitchen counter. Fell, bounced twice, made an excellent noise. Repeated four times to confirm.',
        "**One (1) earring.** Wednesday, bedside table. The human found it on Friday. I don't wish to discuss it.",
        '**The remote control.** Thursday, coffee table. Fell slowly, because I pushed slowly, while maintaining eye contact. Advanced technique.',
        '**A small paper bag.** Saturday. Did not fall. Was entered instead. Different experiment.',
      ),
      pull("If it's near the edge, it's already falling. I'm just helping."),
      h2('Methodology'),
      p(
        'The method is simple. Approach the object. Look at the object. Look at the human. Look back at the object. Extend one paw and apply gentle, steady pressure. Do not break eye contact. The human must understand that this is happening, and that it is happening *because I have chosen it*.',
      ),
      note('Glasses of water are excluded from my research. I have standards (and I once got splashed).'),
      h2('Conclusions'),
      p(
        'Gravity continues to work. Things fall down, never up. The human continues to say "Arka, no" at roughly the speed of a falling pen, which is not fast enough. Further research is planned for next week. The human has started keeping things away from the edges, which I respect as the move of a worthy opponent.',
      ),
    ),
  },
]
