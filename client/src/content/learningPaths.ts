import { Building2, Home, Layers, Monitor, type LucideIcon } from 'lucide-react'

/**
 * Brief §14 — parents must be able to understand exactly how learning can happen
 * through Axis. Shared between the homepage summary and the Learning Paths page.
 */

export type LearningPath = {
  slug: string
  title: string
  short: string
  summary: string
  icon: LucideIcon
  /** The two home-based options (§14) are modelled explicitly rather than as prose. */
  options?: { title: string; description: string }[]
  items?: { label: string; caption?: string }[]
  note?: string
}

export const learningPaths: LearningPath[] = [
  {
    slug: 'online',
    title: 'Online Learning',
    short: 'Live lessons from anywhere in Kenya or abroad.',
    summary:
      'Learners participate remotely through appropriate digital tools. Online learning at Axis is still structured, monitored and supported — it is not a set of links left with a learner.',
    icon: Monitor,
    items: [
      { label: 'Google Classroom', caption: 'Coursework, assignments and materials' },
      { label: 'Axis Learner Portal', caption: 'Timetable, progress and resources' },
      { label: 'Zoom', caption: 'Live lessons' },
      { label: 'Google Meet', caption: 'Live lessons' },
      { label: 'Skype', caption: 'Live lessons' },
      { label: 'Other appropriate platforms', caption: 'Matched to the learner and household' },
    ],
    note: 'Online learning should still be structured, monitored and supported. Sessions are timetabled, attendance is recorded, and progress is reported to parents exactly as it would be in person.',
  },
  {
    slug: 'home-based',
    title: 'Home-Based Learning',
    short: 'Two clear options, depending on what suits your family.',
    summary:
      'Home-based learning at Axis means one of two specific arrangements. We make the distinction clear because they carry different costs, logistics and safeguarding arrangements.',
    icon: Home,
    options: [
      {
        title: 'Option 1 — The educator comes to you',
        description:
          'An Axis educator travels to the learner’s home and conducts the programme there. This suits learners who work best in a familiar environment, families with tight schedules, and learners who need a calmer setting than a shared space allows.',
      },
      {
        title: 'Option 2 — The learner comes to Axis',
        description:
          'The learner travels to an Axis learning centre or an approved learning facility for their sessions. This suits learners who benefit from a dedicated learning environment, and families who prefer sessions to happen outside the home.',
      },
    ],
  },
  {
    slug: 'centre-based',
    title: 'Centre-Based Learning',
    short: 'Sessions at an Axis centre or approved facility.',
    summary:
      'Learners attend an Axis learning centre or an approved partner facility. Centre-based learning gives access to group programmes, shared activities and resources that are difficult to replicate at home.',
    icon: Building2,
    items: [
      { label: 'Group and small-group programmes' },
      { label: 'Shared activities and enrichment' },
      { label: 'Access to centre resources' },
      { label: 'Holiday programmes and workshops' },
    ],
    note: 'Not every venue listed on our locations page is owned by Axis. Where a session runs at a partner facility, we tell you before you enrol.',
  },
  {
    slug: 'blended',
    title: 'Blended Learning',
    short: 'Combine any of the above as the learner needs.',
    summary:
      'Most learners do not fit neatly into one model. A blended pathway combines whichever elements serve the learner, and can change as their needs change.',
    icon: Layers,
    items: [
      { label: 'Online learning' },
      { label: 'Home-based learning' },
      { label: 'Centre-based learning' },
      { label: 'Independent learning' },
      { label: 'Digital resources' },
    ],
    note: 'The right combination depends on the programme and the learner’s needs — and we expect it to be revisited as the learner grows.',
  },
]
