/**
 * Axis's real events, taken from the posters Axis supplied.
 *
 * Everything here is read off the poster. Where a poster is silent — an age
 * range, a fee, a closing date — the field is left empty rather than filled
 * with a plausible guess, because a parent plans around these. The eight
 * events that stood here before were invented placeholders with specific dates
 * and venues; a family could have arranged a day around one and found nothing
 * there, so they have been removed.
 *
 * Two things worth knowing about the source material:
 *
 * The sports camp poster is headed "September Camp" but prints 29–31 OCT.
 * Axis confirmed October is correct and the name is just the programme's name.
 *
 * The chess poster prices registration at $25 while the other two are in
 * shillings. The fee is omitted until Axis settles it, rather than converted —
 * a guessed exchange rate on a published price is not a small error.
 */

/** Nairobi is UTC+3 year round, so the offset is safe to state explicitly. */
const eat = (iso) => new Date(`${iso}+03:00`)

const EVENTS = [
  {
    title: 'All Sports September Camp',
    category: 'Sports Event',
    description:
      'Three days of sport for children aged 6 to 12 — football, basketball, volleyball, tennis, frisbee, handball, flag tag and kickball. A chance to get outside, play, and make new friends. Running 9am to 4pm each day.',
    startDate: eat('2026-10-29T09:00:00'),
    endDate: eat('2026-10-31T16:00:00'),
    venue: 'Kiwanja Bright Star Academy',
    ageGroup: '6–12 years',
    priceKES: 2500,
    registrationLink: '/enroll',
    poster: '/events/all-sports-camp.jpg',
    status: 'Upcoming',
    isActive: true,
    sortOrder: 1,
  },
  {
    title: 'Axis Chess Tournament',
    category: 'Competition',
    description:
      'A day of competitive chess with prizes to be won and live music. Doors and play begin at 10am. Contact Axis to enter or to ask about entry for a younger player.',
    startDate: eat('2026-11-14T10:00:00'),
    venue: 'Daystar University',
    // The poster prices this at $25. Left unset until Axis confirms the
    // shilling figure — see the note at the top of this file.
    registrationLink: '/enroll',
    poster: '/events/chess-tournament.jpg',
    status: 'Upcoming',
    isActive: true,
    sortOrder: 2,
  },
  {
    title: 'Axis Homeschoolers Fun Day Camp',
    category: 'Enrichment',
    description:
      'A day of games, crafts, music and dancing for homeschooled children aged 4 to 13 — creative activities and plenty of running about. Starts at 10am.',
    startDate: eat('2026-12-12T10:00:00'),
    venue: 'Two Rivers Mall, Limuru Road',
    location: 'Nairobi',
    ageGroup: '4–13 years',
    priceKES: 2000,
    registrationLink: '/enroll',
    poster: '/events/homeschoolers-fun-day.jpg',
    status: 'Upcoming',
    isActive: true,
    sortOrder: 3,
  },
]

module.exports = { EVENTS }
