import { illustration, photo } from '../media'
import { body, care, figure, h2, human, note, ol, p, pull, ul } from '../pt-builder'
import type { LocalPost } from './types'

/**
 * Persian Life guides, written in the human's voice. They stick to general,
 * widely accepted care guidance, defer to vets for anything health-related,
 * and keep personal anecdotes in clearly separated "human note" blocks that
 * only appear once they're filled in.
 */
const disclaimer = () =>
  care(
    "This is general information from one cat household, not veterinary advice. Every cat is different — if something seems off with your cat's eyes, skin, coat, breathing, appetite or litter habits, please talk to your vet.",
    'Before we start',
  )

export const guides: LocalPost[] = [
  {
    slug: 'a-gentle-grooming-routine-for-a-long-coated-cat',
    title: 'A Gentle Grooming Routine for a Long-Coated Cat',
    excerpt:
      'Short, calm, regular sessions beat heroic weekend detangles. A gentle way to build a grooming routine your Persian might actually tolerate.',
    category: 'persian-life',
    tags: ['grooming', 'coat-care', 'routines'],
    author: 'human',
    publishedAt: '2026-10-15T08:00:00.000Z',
    cover: illustration('grooming'),
    featured: true,
    sample: true,
    body: body(
      'gr',
      disclaimer(),
      p(
        "A Persian's coat is beautiful, and it is also a commitment. Long, fine fur tangles easily, especially in the places that move most: behind the ears, under the front legs, the belly and the 'trousers' at the back of the legs. The good news is that a little, often, goes a long way.",
      ),
      h2('Little and often'),
      p(
        "Many people who live with long-haired cats find that a short daily session — even five minutes — is far easier than a long one once a week. Tangles are small and easy to tease out when they're new. Left for a week, they can tighten into mats that are uncomfortable and much harder to deal with.",
      ),
      h2('Tools worth having'),
      ul(
        '**A wide-toothed metal comb** for the first pass, to find and gently loosen tangles.',
        "**A finer-toothed comb** to finish, and to check you've reached all the way to the skin.",
        '**A soft slicker brush**, used lightly — pressing hard can scratch delicate skin.',
        '**Treats**, for the parts of the routine everyone agrees are less fun.',
      ),
      h2('How a session can go'),
      ol(
        'Pick a calm moment, ideally when your cat is relaxed rather than playful.',
        'Start somewhere they enjoy being touched, such as the cheeks or along the back.',
        'Work in small sections, combing in the direction the fur grows.',
        "When you meet a tangle, hold the fur close to the skin so you aren't pulling on the skin itself.",
        "Stop while it's still going well. Ending on a good note makes the next session easier.",
      ),
      note('I allow the cheek part. The trouser part is negotiable.'),
      h2('Signs to slow down'),
      p(
        'Tail flicking, skin twitching, ears turning back or a sudden interest in leaving are all ways of saying "that\'s enough for today". Respecting them builds trust. Grooming should never turn into a wrestling match.',
      ),
      human("What Arka's grooming routine actually looks like — when, which tools, and his opinion of each."),
      h2('When to get help'),
      p(
        'Large or tight mats, skin that looks red or irritated, or a cat who seems uncomfortable when touched are good reasons to book in with your vet or a groomer experienced with long-haired cats. Some cats do best with a regular professional tidy-up, and that is completely fine.',
      ),
    ),
  },
  {
    slug: 'keeping-a-long-coat-comfortable',
    title: 'Keeping a Long Coat Comfortable: Mats, Tangles and Patience',
    excerpt:
      'Why mats form, where they hide, and the one thing you should never do with a pair of scissors. Coat comfort for long-haired cats, minus the drama.',
    category: 'persian-life',
    tags: ['coat-care', 'grooming'],
    author: 'human',
    publishedAt: '2026-09-08T08:00:00.000Z',
    cover: illustration('tangles'),
    sample: true,
    body: body(
      'mt',
      disclaimer(),
      p(
        'A mat is what happens when loose undercoat gets caught in the surrounding fur and slowly twists into a dense knot. Small mats can pull on the skin; larger ones can be genuinely uncomfortable, and the skin underneath can become sore. As with most things, prevention is far kinder than cure.',
      ),
      h2('Where mats like to hide'),
      ul(
        'Behind the ears, and along the collar or harness line.',
        'Under the front legs.',
        'The belly and the inner thighs.',
        "The 'trousers' at the back of the legs and around the base of the tail.",
      ),
      note("The trousers are private. I don't know why this keeps coming up."),
      h2('Gently dealing with small tangles'),
      p(
        "For a small tangle, hold the fur close to the skin and tease the knot apart with your fingers or the end tooth of a comb, working from the outside in. Little by little is the rule. If a tangle isn't budging, or your cat is getting cross, it's fine to stop and try again another day.",
      ),
      h2("Please don't reach for the scissors"),
      p(
        "It's tempting to snip a mat out, but a cat's skin is thin and is easily pulled up into a tight mat, which makes accidental cuts far more likely than you'd expect. Vets and professional groomers usually use clippers, and know how to do it safely. If a mat is too big or too close to the skin to tease out, that's the moment to ask for help.",
      ),
      pull('Little by little is the rule. Scissors are not.'),
      h2('Things that help the coat overall'),
      ul(
        'Regular, short grooming sessions — see the [gentle grooming routine](/diary/a-gentle-grooming-routine-for-a-long-coated-cat).',
        'A good-quality diet and fresh water; ask your vet what suits your cat.',
        "Keeping an eye on weight and mobility: a cat who can't comfortably reach parts of their body can't groom them either.",
        'Checking the coat after outdoor time or a harness walk, when tangles are more likely.',
      ),
      human('Our own experience with mats — what helped, what didn’t, and anything our groomer or vet suggested.'),
    ),
  },
  {
    slug: 'building-a-calm-indoor-world',
    title: 'Building a Calm Indoor World',
    excerpt:
      'High perches, hidey holes, predictable routines and very secure windows. Ideas for a calm, interesting home for a curious indoor cat.',
    category: 'persian-life',
    tags: ['indoor-life', 'routines'],
    author: 'human',
    publishedAt: '2026-10-01T08:00:00.000Z',
    cover: photo('blanket-lookup'),
    sample: true,
    body: body(
      'in',
      disclaimer(),
      p(
        "Indoor cats can live full, interesting lives — as long as the indoors is interesting enough. A calm home isn't a boring one. It's a home where a cat has choices: places to climb, places to hide, things to do, and a routine they can predict.",
      ),
      h2('Up high, down low'),
      p(
        'Many cats feel safest when they can watch the world from above. A cat tree, a cleared shelf or a sturdy window perch makes a good lookout. Hiding places matter just as much: a covered bed, a box on its side, or a quiet spot under a chair where nobody will bother them.',
      ),
      figure(photo('blanket-stare', { caption: 'A warm blanket counts as a hiding place. Apparently.' })),
      h2('Routines are reassuring'),
      p(
        'Cats tend to like predictability: meals at roughly the same times, play sessions they can count on, and a quiet place to retreat to when the household gets busy. When change is unavoidable — visitors, a move, new furniture — keeping the rest of the routine steady can help.',
      ),
      h2('Litter, food and water'),
      ul(
        'Keep litter trays in quiet, easy-to-reach spots, away from food and water.',
        'A common rule of thumb is one tray per cat, plus one.',
        'Make sure fresh water is always available; some cats prefer a wide bowl or a fountain.',
        'Long-haired cats can pick up litter in their coat, so a quick check of the back legs now and then is worth it.',
      ),
      h2('Windows, balconies and heights'),
      p(
        'This one really matters, especially in apartments. Cats can and do fall from windows and balconies — including confident, sure-footed ones who get distracted by a bird. Secure screens or netting on windows and balconies, and supervised time on any rooftop or terrace, are simple ways to keep a curious cat safe.',
      ),
      note("I'm only allowed on the roof in my harness, with my human. I lodged an objection. It was overruled."),
      h2('Heat and comfort'),
      p(
        'Persians have thick coats and, especially in flatter-faced lines, can find hot weather hard work. A cool, shaded spot, good airflow and plenty of fresh water help on warm days. Open-mouthed breathing or panting is not normal for a cat at rest and is a reason to call your vet.',
      ),
      human("Arka's actual indoor setup — his favourite perches, hiding spots and the routine he insists on."),
    ),
  },
  {
    slug: 'toys-boxes-and-enrichment-for-a-curious-persian',
    title: 'Toys, Boxes and Enrichment for a Curious Persian',
    excerpt:
      'Wand toys, puzzle feeders, cardboard castles and the rotation trick — plus why the yarn ball on this website is strictly for illustrations.',
    category: 'persian-life',
    tags: ['enrichment', 'boxes', 'indoor-life'],
    author: 'human',
    publishedAt: '2026-09-20T08:00:00.000Z',
    cover: illustration('toys'),
    sample: true,
    body: body(
      'ty',
      disclaimer(),
      p(
        "Play isn't a luxury for cats — it's how they exercise their bodies and their brains. Persians have a reputation for being laid-back, and many are, but a relaxed cat still enjoys a good chase, a puzzle, or a new box to investigate.",
      ),
      h2('Play like a hunter'),
      p(
        "A lot of cats enjoy play that mimics a hunt: the 'prey' hides, moves, pauses and is finally caught. A wand toy moved along the floor and around corners is often more exciting than one waved in the air. Letting your cat catch the toy at the end, then following up with a small treat or a meal, gives the game a satisfying finish.",
      ),
      h2('A word about string and yarn'),
      p(
        "You'll see a yarn ball all over this website, because it's charming in an illustration. In real life, string, yarn, ribbon, hair ties and wand-toy cords can be dangerous if a cat swallows them — so wand toys are best played with a human on the other end, and put away afterwards.",
      ),
      pull('The yarn ball is for illustrations only.'),
      h2('Puzzles and foraging'),
      p(
        'Puzzle feeders and treat balls ask cats to work a little for their food, which many seem to enjoy. Start with an easy puzzle so it feels rewarding, then make it harder over time. A few treats scattered in a box of crumpled paper makes a cheap, cheerful foraging game.',
      ),
      h2('The rotation trick'),
      p(
        'Toys that are always out tend to become furniture. Keeping a few toys out of sight and rotating them every week or so can make old favourites feel new again.',
      ),
      h2('Cardboard: the undefeated champion'),
      p(
        "A box with the tape and staples removed is still one of the best toys money can't buy. For the full (and deeply biased) assessment, see Arka's [extremely serious review of cardboard boxes](/diary/an-extremely-serious-review-of-cardboard-boxes).",
      ),
      note('The Big Box remains undefeated.'),
      human("Arka's current favourite toys — and the expensive ones he ignored completely."),
    ),
  },
  {
    slug: 'everyday-persian-care-eyes-face-and-the-little-things',
    title: 'Everyday Persian Care: Eyes, Face and the Little Things',
    excerpt:
      'Gentle face cleaning, nails, teeth, and the small weekly check that helps you notice when something changes — plus when it’s time to call the vet.',
    category: 'persian-life',
    tags: ['routines', 'grooming'],
    author: 'human',
    publishedAt: '2026-09-02T08:00:00.000Z',
    cover: photo('night-patrol'),
    sample: true,
    body: body(
      'ec',
      disclaimer(),
      p(
        'Beyond the coat, much of everyday Persian care is about small, gentle habits — and about knowing your cat well enough to notice when something changes. None of this replaces regular check-ups with a vet; it just helps you spot things early.',
      ),
      h2('Eyes and face'),
      p(
        "Many Persians, particularly flatter-faced ones, are prone to watery eyes and tear staining. A soft cloth or cotton pad dampened with clean, lukewarm water can be used to wipe gently away from the eye, using a fresh piece for each eye. Don't use products near the eyes unless your vet has recommended them.",
      ),
      p(
        'Discharge that changes colour or thickness, redness, swelling, squinting or pawing at the eyes are reasons to see your vet promptly rather than wait and see.',
      ),
      h2('Nails, ears and teeth'),
      ul(
        "**Nails:** indoor cats may need a trim every few weeks. If you're unsure where to cut, ask your vet or a groomer to show you.",
        '**Ears:** a quick look is enough for most cats. Dark debris, a strong smell, head shaking or scratching are worth getting checked.',
        '**Teeth:** dental disease is common in cats. Ask your vet about dental care, and mention bad breath, drooling or difficulty eating.',
      ),
      h2('A small weekly check'),
      p(
        "Once a week, during a calm cuddle, run your hands over your cat from nose to tail. You're feeling for lumps, sore spots, tangles and changes in weight. You'll learn what normal feels like for your cat — which is exactly what makes changes easier to notice.",
      ),
      note('I tolerate the weekly check because it is basically a long massage.'),
      h2('When to call the vet'),
      p(
        "Trust your instincts — you know your cat. Contact your vet if you notice changes in appetite or drinking, changes in litter habits (straining with little or nothing coming out is an emergency, especially in male cats), noisy or laboured breathing, lethargy, vomiting or diarrhoea that doesn't settle, or anything else that just doesn't seem right.",
      ),
      human("Notes from Arka's own check-ups — what our vet recommended for his eyes, nails and teeth."),
    ),
  },
]
