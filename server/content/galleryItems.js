/**
 * The gallery, in the order a parent should meet it.
 *
 * Brief §19 asks the gallery to show "this is what Axis actually does" rather
 * than stock photography, and §40 asks the site to show rather than tell. So
 * the order is not chronological or alphabetical — it opens with the images
 * that answer a parent's first question (what does learning here look like?),
 * then widens into trips, community and the people behind it.
 *
 * Captions describe what is visible and nothing more. No claim is made about a
 * child's progress, no learner is named, and no outcome is implied, because
 * none of that was supplied and a gallery is not the place to invent it.
 *
 * Every item is created with consent recorded — Axis confirmed permission for
 * all of these. The public endpoint returns nothing without it, so an item
 * added later with consent unconfirmed simply will not appear.
 */
const GALLERY_ITEMS = [
  // Opens with a room a parent can picture their child in.
  {
    slug: 'books-smiles-and-good-vibes',
    title: 'Books, Smiles & Good Vibes',
    category: 'Programme',
    description: 'The reading corner, with shelves built to be climbed. Learners choose their own books here.',
  },
  {
    slug: 'learning-together-smiling-together',
    title: 'Learning Together, Smiling Together',
    category: 'Programme',
    description: 'One table, several learners, work spread across it. Group learning at its most ordinary and most useful.',
  },
  {
    slug: 'good-reader-good-leader',
    title: 'Good Reader, Good Leader',
    category: 'Activity',
    description: 'Reading aloud. Fluency comes from being heard as much as from being corrected.',
  },
  {
    slug: 'incoming-teacher',
    title: 'Incoming Teacher',
    category: 'Activity',
    description: 'Sight words on the board — written up by a learner for the rest of the group.',
  },
  {
    slug: 'a-smile-a-day',
    title: 'A Smile A Day',
    category: 'Activity',
    description: 'Early literacy at the table: tracing, reading, one page at a time.',
  },
  {
    slug: 'learning-at-their-own-pace',
    title: 'Learning At Their Own Pace',
    category: 'Activity',
    description: 'Letter puzzles on the floor. Montessori materials let a learner set their own speed.',
  },
  {
    slug: 'group-learning-it-is',
    title: 'Group Learning It Is',
    category: 'Programme',
    description: 'Small-group tuition — few enough that nobody is overlooked.',
  },
  {
    slug: 'in-love-with-this',
    title: 'In Love With This',
    category: 'Programme',
    description: 'Work finished and held up. The moment a lesson is built around.',
  },
  // How learning reaches the learner: online, at home, at a centre.
  {
    slug: 'beyond-academics-beyond-limits',
    title: 'Beyond Academics, Beyond Limits',
    category: 'Activity',
    description: 'Headsets on for an online session — and the delight that comes with it.',
  },
  {
    slug: 'her-dream',
    title: 'Her Dream',
    category: 'Activity',
    description: 'Following a story on screen. Online learning here is structured and supported, not left to run itself.',
  },
  {
    slug: 'infront-of-the-tv',
    title: 'Learning At Home',
    category: 'Activity',
    description: 'Home-based learning, where the educator comes to the learner.',
  },
  {
    slug: 'learning-cooking-and-creating-together',
    title: 'Learning, Cooking & Creating Together',
    category: 'Programme',
    description: 'A session at a learning centre, running indoors and out.',
  },
  {
    slug: 'learning-together-growing-together',
    title: 'Learning Together, Growing Together',
    category: 'Activity',
    description: 'Older learners reading with younger ones — teaching something is how you find out you know it.',
  },
  // Creative and enrichment work.
  {
    slug: 'art-from-our-hearts',
    title: 'Art From Our Hearts',
    category: 'Activity',
    description: 'Painting a bird from observation. Creative work sits alongside academic subjects, not after them.',
  },
  // Beyond the classroom.
  {
    slug: 'business-studies-beyond-the-classroom',
    title: 'Business Studies, Beyond The Classroom',
    category: 'Event',
    description: 'Business studies at the craft market — pricing, bargaining and value, learned where they actually happen.',
  },
  {
    slug: 'business-studies-beyond-the-classroom-2',
    title: 'Business Studies, Beyond The Classroom',
    category: 'Event',
    description: 'The same trip: trying an instrument on the workshop floor.',
  },
  {
    slug: 'exploring-beyond-the-classroom',
    title: 'Exploring Beyond The Classroom',
    category: 'Activity',
    description: 'Outdoors, and a tortoise worth stopping for. Some lessons do not happen at a desk.',
  },
  {
    slug: 'growing-in-independence-every-day',
    title: 'Growing In Independence, Every Day',
    category: 'General',
    description: 'Between sessions. Learning is not only what happens at a table.',
  },
  {
    slug: 'community-connection-and-fun',
    title: 'Community, Connection & Fun',
    category: 'Event',
    description: 'Learners together at the end of a day out.',
  },
  {
    slug: 'smiles-around-the-table',
    title: 'Smiles Around The Table',
    category: 'General',
    description: 'Two learners at the start of a session.',
  },
  // The adults, last — a parent has already seen the learning by this point.
  {
    slug: 'parents-in-conversation',
    title: 'Parents In Conversation',
    category: 'General',
    description: 'Parents and educators talking things through. Every Axis pathway starts with understanding the learner.',
  },
]

const GALLERY_VIDEOS = [
  {
    slug: 'learning-that-makes-a-difference',
    title: 'Learning That Makes A Difference',
    category: 'General',
    description: 'A minute inside an Axis session.',
  },
  {
    slug: 'learning-through-role-play',
    title: 'Learning Through Role Play',
    category: 'Activity',
    description: 'Role play as a teaching method — learners working an idea out by acting it.',
  },
]

/** Shapes the two lists into rows, numbering them in the order written above. */
const galleryRows = () => [
  ...GALLERY_ITEMS.map((item, index) => ({
    title: item.title,
    type: 'Photo',
    category: item.category,
    description: item.description,
    url: `/gallery/${item.slug}.jpg`,
    thumbnail: `/gallery/${item.slug}-thumb.jpg`,
    tags: [item.category],
    consentConfirmed: true,
    consentConfirmedAt: new Date(),
    consentReference: 'Confirmed by Axis Learning for all gallery media, August 2026',
    isActive: true,
    sortOrder: index + 1,
  })),
  ...GALLERY_VIDEOS.map((item, index) => ({
    title: item.title,
    type: 'Video',
    category: item.category,
    description: item.description,
    url: `/gallery/${item.slug}.mp4`,
    thumbnail: `/gallery/${item.slug}-thumb.jpg`,
    tags: [item.category, 'Video'],
    consentConfirmed: true,
    consentConfirmedAt: new Date(),
    consentReference: 'Confirmed by Axis Learning for all gallery media, August 2026',
    isActive: true,
    sortOrder: GALLERY_ITEMS.length + index + 1,
  })),
]

module.exports = { GALLERY_ITEMS, GALLERY_VIDEOS, galleryRows }
