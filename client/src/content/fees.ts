/**
 * The published Axis Learning fees, 2026/2027.
 *
 * Transcribed from the official fee structures authorised by Guraxis Limited:
 * the Master Fee Structure and the individual CBE, Cambridge, Montessori, SNE,
 * Foreign Languages and Enrichment documents. Every figure here appears in one
 * of those documents; nothing is interpolated, rounded or inferred.
 *
 * Kept as data rather than markup for one reason: a fee that is wrong on a
 * website is worse than a fee that is absent, and a family will hold Axis to
 * what is published here. One place to check, one place to correct, and a
 * structure that makes a missing cell obvious rather than invisible.
 *
 * Where a document gives both a monthly figure and a three-month term figure,
 * both are carried. The term is the real unit — the monthly presentation exists
 * for affordability — and the page says so rather than letting a parent assume
 * they can leave after one month.
 */

export type FeeCell = {
  /** The headline figure, as published. */
  monthly: string
  /** The three-month term figure, where the document publishes one. */
  term?: string
}

export type FeeRow = {
  label: string
  /** A short qualifier shown under the label, where the document carries one. */
  detail?: string
  cells: (FeeCell | string)[]
}

export type FeeTable = {
  heading: string
  intro?: string
  columns: string[]
  rows: FeeRow[]
  footnote?: string
}

export type FeeProgramme = {
  id: string
  title: string
  summary: string
  /** True where the KSh 1,000 admission fee applies to this programme. */
  admission: boolean
  tables: FeeTable[]
  notes?: { heading: string; body: string }[]
}

const DELIVERY = ['Online', 'Centre based', 'Home based']

export const feeProgrammes: FeeProgramme[] = [
  {
    id: 'cbe',
    title: 'CBE / CBC',
    summary:
      'Kenya’s competency-based pathway, from Pre Primary to Senior School — as a full programme, a defined part of the week, or support in a single learning area.',
    admission: true,
    tables: [
      {
        heading: 'Full CBE programme',
        intro:
          'The relevant curriculum learning areas, a structured timetable, educator-led instruction, guided activities and assignments, progress monitoring, scheduled parent feedback and term progress reporting.',
        columns: DELIVERY,
        rows: [
          { label: 'Pre Primary', cells: [
            { monthly: '6,500', term: '19,500' }, { monthly: '9,000', term: '27,000' }, { monthly: '15,000', term: '45,000' }] },
          { label: 'Lower Primary', detail: 'Grades 1–3', cells: [
            { monthly: '7,500', term: '22,500' }, { monthly: '10,000', term: '30,000' }, { monthly: '17,000', term: '51,000' }] },
          { label: 'Upper Primary', detail: 'Grades 4–6', cells: [
            { monthly: '10,000', term: '30,000' }, { monthly: '12,500', term: '37,500' }, { monthly: '20,000', term: '60,000' }] },
          { label: 'Junior School', detail: 'Grades 7–9', cells: [
            { monthly: '12,000', term: '36,000' }, { monthly: '15,000', term: '45,000' }, { monthly: '25,000', term: '75,000' }] },
          { label: 'Senior School', detail: 'Grades 10–12', cells: [
            { monthly: '14,000', term: '42,000' }, { monthly: '17,500', term: '52,500' }, { monthly: '30,000', term: '90,000' }] },
        ],
      },
      {
        heading: 'Part programme',
        intro:
          'Where Axis handles up to three selected core learning areas, or a defined portion of the learner’s weekly academic programme.',
        columns: DELIVERY,
        rows: [
          { label: 'Pre Primary', cells: [{ monthly: '5,000' }, { monthly: '6,500' }, { monthly: '10,000' }] },
          { label: 'Lower Primary', cells: [{ monthly: '5,500' }, { monthly: '7,500' }, { monthly: '11,500' }] },
          { label: 'Upper Primary', cells: [{ monthly: '6,500' }, { monthly: '8,500' }, { monthly: '13,500' }] },
          { label: 'Junior School', cells: [{ monthly: '7,500' }, { monthly: '10,000' }, { monthly: '16,000' }] },
          { label: 'Senior School', cells: [{ monthly: '8,500' }, { monthly: '11,500' }, { monthly: '18,000' }] },
        ],
      },
      {
        heading: 'Specific subject support',
        intro: 'One learning area, ordinarily two sessions per week. This is academic support, not a full homeschooling programme.',
        columns: DELIVERY,
        rows: [
          { label: 'Pre Primary / Lower Primary', cells: [{ monthly: '4,000' }, { monthly: '5,000' }, { monthly: '7,000' }] },
          { label: 'Upper Primary', cells: [{ monthly: '4,500' }, { monthly: '5,500' }, { monthly: '8,000' }] },
          { label: 'Junior School', cells: [{ monthly: '5,000' }, { monthly: '6,500' }, { monthly: '9,000' }] },
          { label: 'Senior School', cells: [{ monthly: '5,500' }, { monthly: '7,000' }, { monthly: '10,000' }] },
        ],
        footnote:
          'Two subjects are ordinarily about 1.75× the one-subject fee. At three subjects the Part Programme is normally better value, and the learner moves to it.',
      },
    ],
  },

  {
    id: 'cambridge',
    title: 'Cambridge',
    summary:
      'Early Years through AS & A Level, with the relevant subjects, timetable, educator-led instruction, progress monitoring and term reporting.',
    admission: true,
    tables: [
      {
        heading: 'Full Cambridge programme',
        columns: DELIVERY,
        rows: [
          { label: 'Early Years', cells: [
            { monthly: '8,500', term: '25,500' }, { monthly: '11,000', term: '33,000' }, { monthly: '17,500', term: '52,500' }] },
          { label: 'Primary', detail: 'Years 1–3', cells: [
            { monthly: '10,000', term: '30,000' }, { monthly: '13,000', term: '39,000' }, { monthly: '20,000', term: '60,000' }] },
          { label: 'Primary', detail: 'Years 4–6', cells: [
            { monthly: '12,500', term: '37,500' }, { monthly: '15,500', term: '46,500' }, { monthly: '25,000', term: '75,000' }] },
          { label: 'Lower Secondary', detail: 'Years 7–9', cells: [
            { monthly: '15,000', term: '45,000' }, { monthly: '18,500', term: '55,500' }, { monthly: '30,000', term: '90,000' }] },
          { label: 'IGCSE', detail: 'Years 10–11', cells: [
            { monthly: '18,500', term: '55,500' }, { monthly: '23,000', term: '69,000' }, { monthly: '37,500', term: '112,500' }] },
          { label: 'AS & A Level', detail: 'Years 12–13', cells: [
            { monthly: '25,000', term: '75,000' }, { monthly: '30,000', term: '90,000' }, { monthly: '45,000', term: '135,000' }] },
        ],
      },
      {
        heading: 'Part Cambridge programme',
        intro: 'Up to three selected Cambridge subjects, or a defined portion of the learner’s academic programme.',
        columns: DELIVERY,
        rows: [
          { label: 'Early Years', cells: [{ monthly: '6,000' }, { monthly: '8,000' }, { monthly: '12,000' }] },
          { label: 'Years 1–3', cells: [{ monthly: '7,000' }, { monthly: '9,000' }, { monthly: '14,000' }] },
          { label: 'Years 4–6', cells: [{ monthly: '8,500' }, { monthly: '11,000' }, { monthly: '17,000' }] },
          { label: 'Years 7–9', cells: [{ monthly: '10,000' }, { monthly: '13,000' }, { monthly: '20,000' }] },
          { label: 'IGCSE', cells: [{ monthly: '12,000' }, { monthly: '15,500' }, { monthly: '24,000' }] },
          { label: 'A Level', cells: [{ monthly: '15,000' }, { monthly: '19,000' }, { monthly: '28,000' }] },
        ],
      },
      {
        heading: 'Specific Cambridge subject support',
        intro: 'One subject, ordinarily two sessions per week.',
        columns: DELIVERY,
        rows: [
          { label: 'Early Years / Years 1–3', cells: [{ monthly: '4,500' }, { monthly: '5,500' }, { monthly: '7,500' }] },
          { label: 'Years 4–6', cells: [{ monthly: '5,000' }, { monthly: '6,500' }, { monthly: '8,500' }] },
          { label: 'Years 7–9', cells: [{ monthly: '6,000' }, { monthly: '7,500' }, { monthly: '10,000' }] },
          { label: 'IGCSE', cells: [{ monthly: '7,000' }, { monthly: '9,000' }, { monthly: '12,000' }] },
          { label: 'A Level', cells: [{ monthly: '8,500' }, { monthly: '11,000' }, { monthly: '15,000' }] },
        ],
        footnote:
          'Two subjects are about 1.75× the one-subject package. At three subjects the Part Cambridge Programme is normally the better-value pathway.',
      },
    ],
    notes: [
      {
        heading: 'Examinations and practicals',
        body:
          'Cambridge examination registration, candidate fees, examination-centre charges, laboratory or practical facility charges, textbooks, personal learning materials and specialised equipment are not automatically included. Where a practical session needs an external facility or provider, the charge is communicated separately.',
      },
      {
        heading: 'Examination preparation',
        body:
          'Preparation for Primary Checkpoint, Lower Secondary Checkpoint, IGCSE, AS and A Level may be offered as separate 4, 8 or 12-week intensive packages, quoted apart from these programme fees.',
      },
    ],
  },

  {
    id: 'montessori',
    title: 'Montessori',
    summary:
      'Infant and Toddler through Secondary, treated holistically rather than as isolated subject tuition — with parent-led and educator-supported routes.',
    admission: true,
    tables: [
      {
        heading: 'Full Montessori programme',
        columns: ['Online / parent supported', 'Centre based', 'Home based'],
        rows: [
          { label: 'Infant & Toddler', cells: [
            { monthly: '6,000', term: '18,000' }, { monthly: '8,500', term: '25,500' }, { monthly: '14,000', term: '42,000' }] },
          { label: 'Early Childhood / Casa', cells: [
            { monthly: '7,500', term: '22,500' }, { monthly: '10,000', term: '30,000' }, { monthly: '16,500', term: '49,500' }] },
          { label: 'Lower Elementary', cells: [
            { monthly: '9,000', term: '27,000' }, { monthly: '12,000', term: '36,000' }, { monthly: '20,000', term: '60,000' }] },
          { label: 'Upper Elementary', cells: [
            { monthly: '10,500', term: '31,500' }, { monthly: '14,000', term: '42,000' }, { monthly: '23,000', term: '69,000' }] },
          { label: 'Secondary / Adolescent', cells: [
            { monthly: '12,500', term: '37,500' }, { monthly: '16,000', term: '48,000' }, { monthly: '27,500', term: '82,500' }] },
        ],
      },
      {
        heading: 'Guided home programme',
        intro:
          'The parent or caregiver leads much of the daily implementation; Axis provides structure, planning, activity and material guidance, periodic educator contact, observation and progress support.',
        columns: ['Per month', 'Per 3-month term'],
        rows: [
          { label: 'Infant & Toddler', cells: ['KSh 4,000', 'KSh 12,000'] },
          { label: 'Early Childhood / Casa', cells: ['KSh 5,000', 'KSh 15,000'] },
          { label: 'Elementary', cells: ['KSh 6,500', 'KSh 19,500'] },
          { label: 'Secondary / Adolescent', cells: ['KSh 8,000', 'KSh 24,000'] },
        ],
      },
      {
        heading: 'Montessori educator support',
        columns: ['1 day / week', '2 days / week'],
        rows: [
          { label: 'Early Childhood / Casa', cells: ['KSh 6,500 / month', 'KSh 10,000 / month'] },
          { label: 'Elementary', cells: ['KSh 8,000 / month', 'KSh 13,000 / month'] },
          { label: 'Secondary / Adolescent', cells: ['KSh 10,000 / month', 'KSh 16,000 / month'] },
        ],
      },
      {
        heading: 'Home environment setup',
        columns: ['Fee'],
        rows: [
          { label: 'Virtual home environment consultation', cells: ['KSh 3,000'] },
          { label: 'Physical home assessment & setup plan', cells: ['KSh 5,000'] },
          { label: 'Complete Montessori home setup support', cells: ['From KSh 10,000'] },
          { label: 'Montessori starter consultation', detail: '60–90 minutes', cells: ['KSh 1,500'] },
        ],
        footnote:
          'The KSh 1,500 starter consultation may be credited toward programme commencement where the family enrols in Full Montessori within 7 days.',
      },
    ],
    notes: [
      {
        heading: 'What is separate',
        body:
          'Materials, furniture, shelves, manipulatives, books, specialised resources, external facilities, transport and third-party services are separate unless expressly included. Admission applies to the Full Montessori and Guided Home programmes, not to one-off consultation or setup services.',
      },
    ],
  },

  {
    id: 'sne',
    title: 'Special Needs Education',
    summary:
      'We begin with the learner, not the label. Placement follows consultation and the learner’s individual educational profile, goals and required level of support — not diagnosis alone.',
    admission: true,
    tables: [
      {
        heading: 'SNE programme pathways',
        intro:
          'Priced by the intensity of educational support required rather than by diagnosis. A learner may move between pathways as goals, independence and family circumstances change.',
        columns: ['Online / parent supported', 'Centre based', 'Home based'],
        rows: [
          {
            label: 'Foundational Support',
            detail: 'Home-based ordinarily about 2 educator-led sessions a week',
            cells: [{ monthly: '6,000', term: '18,000' }, { monthly: '8,500', term: '25,500' }, { monthly: '11,000', term: '33,000' }],
          },
          {
            label: 'Personalised Support',
            detail: 'Home-based ordinarily about 3 educator-led learning days a week',
            cells: [{ monthly: '10,000', term: '30,000' }, { monthly: '13,500', term: '40,500' }, { monthly: '17,500', term: '52,500' }],
          },
          {
            label: 'Intensive Personalised Support',
            detail: 'Home-based ordinarily about 4 educator-led learning days a week',
            cells: [{ monthly: '14,000', term: '42,000' }, { monthly: '18,000', term: '54,000' }, { monthly: '22,500', term: '67,500' }],
          },
        ],
      },
      {
        heading: 'Consultation and learner profile',
        columns: ['Fee'],
        rows: [
          {
            label: 'Initial SNE educational consultation',
            detail: 'Parent consultation, review of available information, current learning situation, priority concerns, recommended pathway',
            cells: ['KSh 1,500'],
          },
          {
            label: 'SNE learner observation & educational profile',
            detail: 'Direct observation, educator notes, priority educational areas and an initial learning recommendation',
            cells: ['KSh 3,500'],
          },
        ],
        footnote:
          'Where a learner enrols within 7 days of the initial consultation, the KSh 1,500 consultation fee may be credited toward commencement. Admission applies once, after programme placement.',
      },
    ],
    notes: [
      {
        heading: 'This is educational support, not therapy',
        body:
          'Standard tuition does not include speech and language therapy, occupational therapy, physiotherapy, behavioural therapy, psychological services, medical services, clinical assessment or diagnostic services. Where those are recommended, Axis may work alongside appropriately qualified external professionals, arranged and charged separately.',
      },
      {
        heading: 'Observation is not diagnosis',
        body:
          'Axis may review an existing IEP, EARC recommendation or educational assessment and use it in planning. Axis does not represent its own learner profile or observation as an EARC placement determination, a medical diagnosis or a clinical assessment.',
      },
      {
        heading: 'Siblings',
        body:
          'A general sibling discount does not automatically apply, because each learner may need different educator time, planning and support. Any approved family benefit is assessed separately and confirmed in writing.',
      },
    ],
  },

  {
    id: 'languages',
    title: 'Foreign Languages',
    summary:
      'French, German, Arabic, Spanish, Mandarin Chinese, Japanese, Korean, Portuguese and Russian — for children, teens and adults, sold as session packages rather than terms.',
    admission: false,
    tables: [
      {
        heading: 'Individual programmes',
        intro:
          'Sessions are about 60 minutes for adults and teens. Younger learners may have 45–60 minutes depending on age and programme design.',
        columns: DELIVERY,
        rows: [
          { label: 'Single session', cells: ['KSh 1,000', 'KSh 1,250', 'KSh 1,750'] },
          { label: 'Starter', detail: '4 sessions', cells: ['KSh 3,500', 'KSh 4,500', 'KSh 6,500'] },
          { label: 'Standard', detail: '8 sessions', cells: ['KSh 6,500', 'KSh 8,500', 'KSh 12,000'] },
          { label: 'Progress', detail: '12 sessions', cells: ['KSh 9,000', 'KSh 12,000', 'KSh 17,000'] },
          { label: 'Term programme', detail: '24 sessions', cells: ['KSh 17,000', 'KSh 22,000', 'KSh 31,000'] },
        ],
      },
      {
        heading: 'Group programmes',
        intro: 'About 3–10 learners. Priced per learner.',
        columns: ['Online / learner', 'Centre / learner'],
        rows: [
          { label: '4 sessions', cells: ['KSh 2,000', 'KSh 2,500'] },
          { label: '8 sessions', cells: ['KSh 3,500', 'KSh 4,500'] },
          { label: '12 sessions', cells: ['KSh 5,000', 'KSh 6,500'] },
          { label: '24 sessions', cells: ['KSh 9,000', 'KSh 12,000'] },
        ],
      },
      {
        heading: 'Examination preparation',
        intro:
          'Examination strategy, practice tasks, mock work, correction and feedback. External registration and candidate fees are not included.',
        columns: DELIVERY,
        rows: [
          { label: '4 sessions', cells: ['KSh 5,000', 'KSh 6,500', 'KSh 9,000'] },
          { label: '8 sessions', cells: ['KSh 9,000', 'KSh 11,500', 'KSh 16,000'] },
          { label: '12 sessions', cells: ['KSh 12,500', 'KSh 16,000', 'KSh 22,000'] },
        ],
        footnote:
          'Add-on rate of KSh 2,500 per 8-session package for a learner already enrolled in an applicable Axis language programme.',
      },
      {
        heading: 'Conversation Lab and assessment',
        columns: ['Fee'],
        rows: [
          { label: 'Conversation Lab', detail: '8-session individual, online', cells: ['KSh 5,000'] },
          { label: 'Conversation Lab', detail: '8-session individual, centre based', cells: ['KSh 6,500'] },
          { label: 'Conversation Lab', detail: '8-session individual, home based', cells: ['KSh 9,500'] },
          { label: 'Conversation Lab', detail: '8-session online group, per learner', cells: ['KSh 3,000'] },
          { label: 'Axis Young Linguists', detail: '8-session online group for children, per learner', cells: ['From KSh 3,500'] },
          { label: 'Formal language level assessment', cells: ['KSh 1,000'] },
        ],
        footnote:
          'The assessment fee may be credited where the learner buys an 8-session or larger individual package within 7 days. A basic beginner placement discussion is free.',
      },
    ],
    notes: [
      {
        heading: 'How long a package lasts',
        body:
          '4 sessions are valid for 6 weeks, 8 for 10 weeks, 12 for 14 weeks and 24 for 5 months. Packages of 4, 8 and 12 sessions are paid in full before commencement; the 24-session term programme may be paid in full or on an approved 60/40 arrangement.',
      },
      {
        heading: 'Cancelling or moving a session',
        body:
          'At least 6 hours’ notice is needed to cancel or reschedule. With that notice a session can be moved within the package validity. Late cancellations and no-shows are ordinarily treated as used. Where Axis or the educator cancels, the session is rescheduled without loss to the learner.',
      },
    ],
  },

  {
    id: 'enrichment',
    title: 'Enrichment & Talent Development',
    summary:
      'Learn it, develop it, practise it, perform it, compete with it — chess, coding, robotics, public speaking, drama, music, visual arts, sport, leadership and enterprise.',
    admission: false,
    tables: [
      {
        heading: 'Standard enrichment programmes',
        intro:
          'Ordinarily about one structured session a week per activity. Delivery depends on the activity; not everything is available online or at home.',
        columns: DELIVERY,
        rows: [
          { label: 'One activity', cells: [
            { monthly: '2,000', term: '6,000' }, { monthly: '2,500', term: '7,500' }, { monthly: '3,500', term: '10,500' }] },
          { label: 'Two-activity bundle', cells: [
            { monthly: '3,500', term: '10,500' }, { monthly: '4,500', term: '13,500' }, { monthly: '6,000', term: '18,000' }] },
          { label: 'Three-activity bundle', cells: [
            { monthly: '5,000', term: '15,000' }, { monthly: '6,000', term: '18,000' }, { monthly: '8,000', term: '24,000' }] },
        ],
      },
      {
        heading: 'Axis Enrichment Pass',
        intro: 'Up to four selected activities per term.',
        columns: ['Per month', 'Per 3-month term'],
        rows: [
          { label: 'Online / hybrid', cells: ['KSh 6,000', 'KSh 18,000'] },
          { label: 'Centre based', cells: ['KSh 7,500', 'KSh 22,500'] },
        ],
        footnote:
          'Activity selection is subject to timetable, the learner’s age and ability, availability, group formation and facility requirements. The Pass is not an unlimited-activity package.',
      },
      {
        heading: 'Talent development',
        intro:
          'For learners showing particular ability or serious commitment: individual coaching, targeted progression, periodic evaluation, and performance or competition preparation.',
        columns: ['Per month', 'Per 3-month term'],
        rows: [
          { label: 'Online', detail: 'where applicable', cells: ['KSh 5,000', 'KSh 15,000'] },
          { label: 'Centre based', cells: ['KSh 6,500', 'KSh 19,500'] },
          { label: 'Home based', cells: ['KSh 9,000', 'KSh 27,000'] },
        ],
      },
      {
        heading: 'Competition intensive and enrolled-learner rate',
        columns: ['Fee'],
        rows: [
          { label: 'Competition intensive', detail: '4 targeted sessions, online', cells: ['KSh 3,500'] },
          { label: 'Competition intensive', detail: '4 targeted sessions, centre based', cells: ['KSh 4,500'] },
          { label: 'Competition intensive', detail: '4 targeted sessions, home based', cells: ['KSh 6,500'] },
          {
            label: 'Academic learner enrichment rate',
            detail: 'One standard activity per 3-month term, for learners already on a full Axis academic programme',
            cells: ['KSh 5,000'],
          },
        ],
        footnote: 'Competition intensives are payable in full before commencement, and ordinary programme tuition continues separately.',
      },
    ],
    notes: [
      {
        heading: 'Competitions and the national stage',
        body:
          'Axis periodically prepares eligible learners for internal and external tournaments, competitions, festivals, showcases and exhibitions, including selected regional and national opportunities. Participation depends on readiness, age category, event availability, qualification and the organiser’s rules — it is not guaranteed.',
      },
      {
        heading: 'Event and facility costs',
        body:
          'External registration and federation fees, entry fees, uniforms or costumes, equipment, transport, accommodation and meals are separate. Where an activity needs a paid facility, a specialist instructor, equipment hire, pool, court or field, that charge is billed separately unless expressly included.',
      },
    ],
  },

  {
    id: 'homeschool',
    title: 'Homeschool Support Membership',
    summary:
      'You homeschool. Axis helps you do it with structure, direction and professional support — without taking over the teaching.',
    admission: false,
    tables: [
      {
        heading: 'Membership options',
        columns: ['Per month', 'Per 3-month term', 'Best for'],
        rows: [
          { label: 'Essential', cells: ['KSh 2,000', 'KSh 6,000', 'Structure, planning and professional guidance.'] },
          { label: 'Plus', cells: ['KSh 3,500', 'KSh 10,500', 'Regular academic oversight and learner check-ins.'] },
          { label: 'Premium', cells: ['KSh 5,500', 'KSh 16,500', 'Closer coordination and progress review, without daily teaching.'] },
        ],
      },
      {
        heading: 'One-off setup services',
        columns: ['Fee'],
        rows: [
          { label: 'Curriculum setup only', cells: ['KSh 3,500'] },
          { label: 'Homeschool transition & setup', cells: ['KSh 5,000'] },
        ],
      },
    ],
    notes: [
      {
        heading: 'What each membership includes',
        body:
          'Essential: an initial planning consultation, curriculum and pathway guidance, a personalised term learning plan, a suggested weekly timetable, resource guidance, one parent consultation a month and an end-of-term progress review. Plus adds a second monthly consultation, a monthly learner check-in, plan adjustments, assessment guidance and progress tracking. Premium adds direct learner progress reviews, assignment and project review support, periodic academic assessment, a term progress report and priority support.',
      },
      {
        heading: 'Where membership ends and tuition begins',
        body:
          'Membership is not full programme tuition — the parent remains responsible for substantial day-to-day implementation. Recurring subject teaching, or responsibility for a substantial portion of the academic programme, moves the learner into Specific Subject Support, the Part Programme or the Full Programme.',
      },
    ],
  },
]

/** Applies across Axis unless a programme says otherwise. */
export const paymentPlans = [
  { name: 'Monthly plan', detail: 'The published monthly fee for each of the three months of the term.' },
  { name: '60 / 40 term plan', detail: '60% of the three-month fee at commencement, 40% at midterm.' },
  { name: 'Full term', detail: 'The whole three-month fee settled at commencement.' },
]

export const admissionFee = {
  amount: 'KSh 1,000',
  detail:
    'One-time per learner, for Full and Part academic programmes. It does not apply to specific subject support, foreign languages, enrichment or homeschool membership. For SNE it applies once, after programme placement.',
}

export const generalTerms = [
  'Fees are quoted per learner unless an institutional or group quotation says otherwise.',
  'Published fees apply to standard programme configurations. A material change in frequency, location, staffing, specialist resources or delivery may require a written quotation.',
  'External examinations, registration and candidate fees, specialist materials and equipment, paid facilities, transport, accommodation, third-party providers and specialist professional services are separate unless expressly included.',
  'Home-based delivery is subject to location, educator availability and agreed scheduling.',
  'Programme availability is subject to staffing, timetable, age and ability suitability, and minimum group formation where it applies.',
  'Axis may review programme placement where a learner’s needs, progress or intensity requirements materially change.',
  'Any family-specific concession must be confirmed in writing, and does not alter this published fee structure.',
]

/**
 * Payment details as published in the official fee structures.
 *
 * The warning is not decoration. A public fee page is exactly what someone
 * impersonating a school copies, changing one line, so the instruction to pay
 * only Guraxis Limited on these details travels with them wherever they appear.
 */
export const paymentDetails = {
  rows: [
    { label: 'Bank', value: 'Co-operative Bank of Kenya' },
    { label: 'Account name', value: 'Guraxis Limited' },
    { label: 'Account number', value: '01103281408001' },
    { label: 'M-PESA Paybill', value: '400200' },
    { label: 'M-PESA account', value: '01103281408001' },
  ],
  reference: 'Please use the learner’s name as the payment reference.',
  warning:
    'Payments should only ever be made to Guraxis Limited, using these details. If you are asked to pay anything to a different name or account, stop and telephone Axis on 0737 003 007 before sending money.',
}
