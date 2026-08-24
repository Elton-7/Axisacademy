/**
 * Article categories, in Axis's own terms.
 *
 * The previous set — Learning Tips, Parent Guide, Programme Spotlight,
 * Assessment, Academic Support, General — described the shape of an article
 * rather than its subject. Nobody searches for "a parent guide"; they search
 * for "CBC homeschooling" or "Special Needs Education in Kenya", which is
 * exactly what Axis wants these articles found for.
 *
 * Current Affairs is included deliberately: Axis wants to publish timely
 * pieces on developments in education, and without a home for them every such
 * article would land in a category that misdescribes it.
 *
 * Shared by the model, the validator and the client so the three cannot drift.
 */
const RESOURCE_CATEGORIES = [
  'Homeschooling',
  'Cambridge',
  'Montessori',
  'CBC',
  'Special Needs Education',
  'Foreign Languages',
  'Games & Sports',
  'Enrichment',
  'Technology & Innovation',
  'Parenting & Learning',
  'Current Affairs',
]

/**
 * Where the six existing articles land. Mapped by subject, not by the old
 * label — "why we teach African languages" was a Programme Spotlight and is
 * plainly a Foreign Languages piece.
 */
const LEGACY_CATEGORY_BY_SLUG = {
  'choosing-a-curriculum-in-kenya': 'Homeschooling',
  'homeschooling-in-kenya-how-it-works': 'Homeschooling',
  'signs-your-learner-needs-academic-support': 'Parenting & Learning',
  'supporting-a-learner-with-additional-needs': 'Special Needs Education',
  'making-school-holidays-count': 'Enrichment',
  'why-we-teach-african-languages': 'Foreign Languages',
}

module.exports = { RESOURCE_CATEGORIES, LEGACY_CATEGORY_BY_SLUG }
