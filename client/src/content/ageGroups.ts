/**
 * Axis's learner age bands.
 *
 * The enquiry form offered three options — child, teenager, adult — which put
 * a two-year-old and an eleven-year-old in the same box, and told Axis almost
 * nothing about who the enquiry is for. These are the bands Axis works to.
 *
 * Stored as free text rather than a database enum: bands are Axis's own
 * classification and will change as the organisation does, and an enum makes
 * every future change a migration.
 */
export const AGE_GROUPS = [
  { value: '0-2', label: '0–2 years — Infants' },
  { value: '3-5', label: '3–5 years — Young Learners' },
  { value: '6-8', label: '6–8 years — Growing Learners' },
  { value: '9-11', label: '9–11 years — Developing Learners' },
  { value: '12-14', label: '12–14 years — Young Adolescents' },
  { value: '15-17', label: '15–17 years — Adolescents' },
  { value: '18-24', label: '18–24 years — Young Adults' },
  { value: '25+', label: '25+ years — Adults' },
] as const
