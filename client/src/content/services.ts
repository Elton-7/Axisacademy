import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Compass,
  GraduationCap,
  HeartHandshake,
  Languages,
  Star,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for the nine Axis Learning core services.
 *
 * The brief is explicit (§6) that services must stay clearly separated rather
 * than collapsing into one generic "programmes" section, so each service owns a
 * slug and a full detail page built from these sections.
 */

export type ServiceSection = {
  heading: string
  body?: string
  /** Simple bullet list — used for activity/subject/coverage lists. */
  items?: string[]
  /** Term/definition pairs — used for the curriculum explainers (§6.1). */
  glossary?: { term: string; definition: string }[]
  /** Two-column option cards — used for home-based learning options (§14). */
  options?: { title: string; description: string }[]
  /** Highlighted callout rendered as a gold-bordered panel. */
  note?: string
}

export type Service = {
  slug: string
  title: string
  /** Short label used in navigation and card grids. */
  shortTitle: string
  tagline: string
  summary: string
  icon: LucideIcon
  /** Tailwind background class for the card header. */
  accent: string
  /** Four scannable points shown on the service card. */
  highlights: string[]
  sections: ServiceSection[]
  cta: { heading: string; body: string }
  seo: { title: string; description: string }
}

export const services: Service[] = [
  {
    slug: 'academic-learning',
    title: 'Academic Learning & Homeschooling',
    shortTitle: 'Academic Learning',
    tagline: 'Curriculum-aligned learning, designed around your learner',
    summary:
      'Academic learning and homeschooling support across the curricula families in Kenya actually use — delivered at home, at an Axis centre, online, or as a blend of all three.',
    icon: BookOpen,
    accent: 'bg-tint-blue',
    highlights: [
      'CBC, Montessori, Cambridge, IGCSE, A Levels & IB',
      'Educator comes to you, or learner comes to Axis',
      'Individual learning pathways per learner',
      'Progress tracking and regular family updates',
    ],
    sections: [
      {
        heading: 'Curricula we support',
        body: 'Axis Learning supports learners across a wide range of curricula and educational systems. If your learner is already following a curriculum, we work within it. If they are starting fresh, we help you choose.',
        glossary: [
          {
            term: 'CBC',
            definition:
              'A competency-based approach that places emphasis on skills, competencies, practical learning, creativity and holistic development rather than examinations alone.',
          },
          {
            term: 'Montessori',
            definition:
              'A learner-centred approach that encourages independence, practical learning, exploration and development at an appropriate pace.',
          },
          {
            term: 'Cambridge',
            definition:
              'An internationally recognised curriculum with structured academic progression and strong subject-based learning, including pathways leading to IGCSE and A Levels.',
          },
          {
            term: 'IGCSE',
            definition:
              'An internationally recognised secondary qualification offering broad subject choice and strong preparation for further education.',
          },
          {
            term: 'A Levels',
            definition:
              'Advanced subject-focused study designed to prepare learners for university and other higher-level education pathways.',
          },
          {
            term: 'IB',
            definition:
              'An internationally oriented educational framework that emphasises inquiry, critical thinking, independent learning and holistic development.',
          },
        ],
        note: 'Not sure which curriculum is right for your learner? Axis can help assess the learner’s needs, strengths and aspirations and develop an individual learning pathway suited to them.',
      },
      {
        heading: 'Also supported',
        items: [
          'British Curriculum',
          'American Curriculum',
          'Other international curricula',
          'Other recognised educational pathways',
        ],
      },
      {
        heading: 'How homeschooling works with Axis',
        body: 'Homeschooling with Axis is structured, not improvised. We agree the curriculum and goals with you, assign an educator matched to the learner, set a timetable that fits your family, and report on progress as the learner moves through it.',
        items: [
          'An individual learning pathway agreed with the family',
          'A matched educator from the Axis educator network',
          'A timetable built around your household, not against it',
          'Ongoing assessment, feedback and progress reporting',
        ],
      },
    ],
    cta: {
      heading: 'Start with a conversation about your learner',
      body: 'Tell us where your learner is now and what you want for them. We will recommend a curriculum and a pathway that fits.',
    },
    seo: {
      title: 'Homeschooling & Academic Learning in Kenya | Axis Learning',
      description:
        'CBC, Montessori, Cambridge, IGCSE, A Levels and IB support through homeschooling, home-based tuition, centre-based learning and online lessons across Kenya.',
    },
  },

  {
    slug: 'tuition',
    title: 'Academic Support & Tuition',
    shortTitle: 'Tuition',
    tagline: 'Focused subject support that rebuilds confidence',
    summary:
      'Targeted tuition for learners who need to catch up, keep up, or get ahead — one-to-one or in small groups, in the subjects that matter most right now.',
    icon: GraduationCap,
    accent: 'bg-tint-emerald',
    highlights: [
      'Mathematics, sciences, languages and humanities',
      'One-to-one and small-group sessions',
      'Catch-up and concept reinforcement',
      'School and internal assessment support',
    ],
    sections: [
      {
        heading: 'What tuition covers',
        items: [
          'Mathematics',
          'Sciences',
          'Languages',
          'Humanities',
          'Reading and writing',
          'Study skills and organisation',
          'School assignments and coursework',
          'Internal and school assessments',
        ],
      },
      {
        heading: 'How sessions are delivered',
        body: 'Tuition follows whichever learning model suits the family — an educator at your home, sessions at an Axis learning centre or approved facility, live online lessons, or a blend.',
        items: [
          'One-to-one sessions',
          'Small-group sessions',
          'Home-based sessions',
          'Centre-based sessions',
          'Online sessions',
        ],
      },
      {
        heading: 'What we focus on',
        body: 'Tuition at Axis is not simply more of the same lesson repeated louder. We identify where understanding broke down, rebuild the underlying concept, and then work forward.',
        items: [
          'Diagnosing where the learner actually got stuck',
          'Rebuilding foundational concepts before moving on',
          'Reinforcing what is being taught in school',
          'Building independence, not dependence on the tutor',
        ],
      },
    ],
    cta: {
      heading: 'Tell us which subjects are the problem',
      body: 'We will match your learner with an educator who teaches those subjects and start where the difficulty actually is.',
    },
    seo: {
      title: 'Tutors & Academic Tuition in Nairobi | Axis Learning',
      description:
        'One-to-one and small-group tuition in mathematics, sciences, languages and humanities. Home tutors, centre-based sessions and online tutoring across Kenya.',
    },
  },

  {
    slug: 'special-needs',
    title: 'Special Needs Education & Individualised Learning Support',
    shortTitle: 'Special Needs Support',
    tagline: 'Education built around the learner, never one-size-fits-all',
    summary:
      'Individualised educational support for learners with different educational and developmental needs — focused on understanding the learner, adapting learning, and building confidence and independence.',
    icon: HeartHandshake,
    accent: 'bg-tint-teal',
    highlights: [
      'Learner-centred discovery and planning',
      'Adapted learning approaches and materials',
      'Confidence, independence and practical skills',
      'Close collaboration with the family',
    ],
    sections: [
      {
        heading: 'Our approach',
        body: 'Special needs education at Axis is individualised rather than a one-size-fits-all programme. We begin by understanding the learner in front of us, then design learning around what we find.',
        items: [
          'Understanding the learner',
          'Supporting the learner',
          'Adapting learning',
          'Developing independence',
          'Building confidence',
          'Developing academic and practical skills',
          'Creating an appropriate educational pathway',
        ],
        note: 'Axis Learning provides educational support. We do not diagnose or assess medical or developmental conditions, and nothing on this page should be read as a clinical service. Where a formal diagnosis or therapy is needed, we work alongside the qualified professionals already supporting your family.',
      },
      {
        heading: 'Areas we support',
        body: 'Our educators have experience supporting learners across a broad range of additional learning needs, including:',
        items: [
          'Autism',
          'ADHD',
          'Cerebral Palsy',
          'Down Syndrome',
          'Dyslexia',
          'Dysgraphia',
          'Dyscalculia',
          'Dyspraxia',
          'Speech delays',
          'Language delays',
          'Communication difficulties',
          'Developmental delays',
          'Intellectual disabilities',
          'Hearing impairment',
          'Visual impairment',
          'Learning difficulties',
          'Behavioural and learning support needs',
          'Other additional learning needs',
        ],
      },
      {
        heading: 'How support is delivered',
        body: 'Support is matched to the learner and the environment in which they do best — which is often, but not always, at home.',
        items: [
          'One-to-one sessions with a specialist educator',
          'Home-based support in a familiar environment',
          'Centre-based sessions where appropriate',
          'Adapted materials, pacing and assessment',
          'Regular communication with parents and carers',
        ],
      },
    ],
    cta: {
      heading: 'Every learner starts with a conversation',
      body: 'Tell us about your learner — their strengths, what they enjoy, and where they need support. We will take it from there.',
    },
    seo: {
      title: 'Special Needs Education & Learning Support | Axis Learning Kenya',
      description:
        'Individualised educational support in Kenya for learners with autism, ADHD, dyslexia, developmental delays and other additional learning needs.',
    },
  },

  {
    slug: 'languages',
    title: 'African & Foreign Language Learning',
    shortTitle: 'Languages',
    tagline: 'Global languages and African identity, side by side',
    summary:
      'Language learning that opens international doors while keeping learners rooted in African identity, culture and linguistic diversity.',
    icon: Languages,
    accent: 'bg-tint-purple',
    highlights: [
      'French, Spanish, German, Mandarin, Japanese, Korean, Arabic',
      'Kiswahili, Dholuo, Kikuyu, Luhya, Kamba and more',
      'Conversation practice and cultural activities',
      'Online, centre-based and home-based options',
    ],
    sections: [
      {
        heading: 'Foreign languages',
        items: [
          'French',
          'Spanish',
          'German',
          'Mandarin / Chinese',
          'Japanese',
          'Korean',
          'Arabic',
          'English',
          'Other foreign languages as our educator network expands',
        ],
      },
      {
        heading: 'African languages',
        body: 'Axis is not interested only in foreign languages. We actively promote African language learning, because language carries identity, culture and belonging.',
        items: [
          'Kiswahili',
          'Dholuo',
          'Kikuyu',
          'Luhya',
          'Kamba',
          'Kalenjin',
          'Maasai',
          'Kisii',
          'Somali',
          'Hausa',
          'Yoruba',
          'Igbo',
          'Zulu',
          'Xhosa',
          'Other African languages available through our educator network',
        ],
        note: 'We want to promote African identity, culture and linguistic diversity alongside global languages.',
      },
      {
        heading: 'How language learning is offered',
        items: [
          'One-on-one lessons',
          'Group lessons',
          'Online learning',
          'Centre-based learning',
          'Home-based learning',
          'Cultural activities',
          'Language enrichment',
          'Conversation practice',
        ],
      },
    ],
    cta: {
      heading: 'Which language does your learner want to speak?',
      body: 'Tell us the language and the goal — school requirement, travel, heritage, or curiosity — and we will match an educator.',
    },
    seo: {
      title: 'French, German, Japanese & African Language Classes | Axis Learning',
      description:
        'Language classes in Nairobi and across Kenya — French, Spanish, German, Mandarin, Japanese, Arabic, plus Kiswahili, Dholuo, Kikuyu and other African languages.',
    },
  },

  {
    slug: 'games-and-sports',
    title: 'Games & Sports',
    shortTitle: 'Games & Sports',
    tagline: 'Confidence, wellbeing, teamwork and discipline',
    summary:
      'Active opportunities that develop the parts of a learner a classroom cannot reach — physical confidence, teamwork, resilience and discipline.',
    icon: Trophy,
    accent: 'bg-tint-rose',
    highlights: [
      'Football, basketball, athletics and volleyball',
      'Swimming, skating and tennis',
      'Sports clubs and training opportunities',
      'Partner-delivered activities clearly identified',
    ],
    sections: [
      {
        heading: 'Activities',
        items: [
          'Football',
          'Basketball',
          'Swimming',
          'Skating',
          'Athletics',
          'Volleyball',
          'Tennis',
          'Other sports',
          'Physical activities',
          'Sports clubs',
          'Training opportunities',
        ],
        note: 'Some sports activities are delivered by partner organisations and coaches rather than directly by Axis. Where that is the case, we tell you clearly before you enrol — including who is delivering the activity and where.',
      },
      {
        heading: 'Why sport sits inside education at Axis',
        body: 'We treat physical activity as part of a learner’s education rather than a break from it. Sport builds the habits — persistence, teamwork, handling setbacks — that carry directly back into academic work.',
        items: [
          'Physical confidence and wellbeing',
          'Teamwork and communication',
          'Discipline and routine',
          'Healthy competition and resilience',
        ],
      },
    ],
    cta: {
      heading: 'Find an activity for your learner',
      body: 'Tell us what your learner enjoys — or what you would like them to try — and we will tell you what is available near you.',
    },
    seo: {
      title: 'Sports, Swimming & Athletics Programmes | Axis Learning Kenya',
      description:
        'Football, basketball, swimming, skating, athletics, volleyball and tennis programmes for learners through Axis Learning and partner facilities in Kenya.',
    },
  },

  {
    slug: 'talent-development',
    title: 'Board Games, Talent & Creative Development',
    shortTitle: 'Talent & Creative',
    tagline: 'Education is not limited to academic subjects',
    summary:
      'Enrichment that helps a learner discover confidence, creativity, communication, leadership and talent — the things that make a learner more than a set of grades.',
    icon: Star,
    accent: 'bg-tint-amber',
    highlights: [
      'Chess, scrabble, draughts and strategy games',
      'Music, singing, dance, drama and theatre',
      'Public speaking, oratory and debate',
      'Arts, crafts, creative writing and storytelling',
    ],
    sections: [
      {
        heading: 'Board games',
        body: 'Strategy games are one of the most effective ways to build patience, planning and analytical thinking in a learner who resists worksheets.',
        items: ['Chess', 'Scrabble', 'Monopoly', 'Draughts', 'Strategy games', 'Other board games'],
      },
      {
        heading: 'Talent development',
        items: [
          'Music',
          'Singing',
          'Drama',
          'Theatre',
          'Acting',
          'Dance',
          'Creative writing',
          'Storytelling',
          'Arts',
          'Crafts',
          'Public speaking',
          'Oratory',
          'Debate',
          'Leadership',
          'Performance',
        ],
      },
      {
        heading: 'What a learner should discover',
        body: 'Axis believes education is not limited to academic subjects. Alongside their studies, a learner should discover:',
        items: [
          'Confidence',
          'Creativity',
          'Communication',
          'Leadership',
          'Collaboration',
          'Expression',
          'Talent',
          'Independence',
        ],
      },
    ],
    cta: {
      heading: 'Give your learner room to discover something',
      body: 'Talent programmes run alongside academic learning. Tell us what your learner is drawn to and we will find the right educator.',
    },
    seo: {
      title: 'Chess, Music, Drama & Public Speaking for Learners | Axis Learning',
      description:
        'Creative and talent development in Kenya — chess, scrabble, music, dance, drama, theatre, public speaking, debate, arts and creative writing.',
    },
  },

  {
    slug: 'holiday-tuition',
    title: 'Holiday Tuition',
    shortTitle: 'Holiday Tuition',
    tagline: 'Structured programmes for every school holiday',
    summary:
      'When schools close, learning does not have to stop. Structured holiday programmes for revision, catch-up, reinforcement and preparation for the term ahead.',
    icon: CalendarDays,
    accent: 'bg-tint-orange',
    highlights: [
      'Revision and catch-up support',
      'Reading, writing, mathematics and languages',
      'Creative activities and enrichment',
      'Preparation for the next term',
    ],
    sections: [
      {
        heading: 'Curricula covered',
        items: ['CBC', 'Montessori', 'Cambridge', 'IGCSE', 'A Levels', 'IB', 'Other supported curricula'],
      },
      {
        heading: 'What holiday programmes include',
        items: [
          'Revision',
          'Catch-up',
          'Concept reinforcement',
          'Preparation for the next term',
          'Subject tuition',
          'Reading',
          'Writing',
          'Mathematics',
          'Languages',
          'Enrichment',
          'Creative activities',
          'Examination preparation',
        ],
      },
      {
        heading: 'How holiday tuition runs',
        body: 'Holiday programmes are announced ahead of each school break, with dates, venues and registration details published on our events page. Learners can join a scheduled programme or arrange individual holiday sessions.',
        items: [
          'Scheduled group programmes at Axis and partner venues',
          'Individual holiday sessions at home or online',
          'Short intensive blocks or spread across the break',
          'Open to learners who are not otherwise enrolled with Axis',
        ],
      },
    ],
    cta: {
      heading: 'Ask what is running this holiday',
      body: 'Programmes change each break. Get in touch and we will tell you what is scheduled, where, and what it costs.',
    },
    seo: {
      title: 'Holiday Tuition & School Holiday Programmes | Axis Learning Nairobi',
      description:
        'Structured holiday tuition in Nairobi and across Kenya — revision, catch-up, subject tuition, examination preparation and creative enrichment between school terms.',
    },
  },

  {
    slug: 'examination-preparation',
    title: 'Examination Preparation',
    shortTitle: 'Exam Preparation',
    tagline: 'Practical preparation for the examinations that count',
    summary:
      'Focused preparation for learners approaching major assessments — covering content, technique, timing and the confidence to walk into the room prepared.',
    icon: ClipboardCheck,
    accent: 'bg-tint-indigo',
    highlights: [
      'KCSE, IGCSE, Cambridge assessments and A Levels',
      'Past papers and mock examinations',
      'Examination technique and time management',
      'Subject-specific tutoring and individual support',
    ],
    sections: [
      {
        heading: 'Examinations we prepare learners for',
        items: [
          'KCSE',
          'IGCSE',
          'A Levels',
          'Cambridge assessments',
          'School examinations',
          'Internal assessments',
          'Other recognised examinations',
        ],
      },
      {
        heading: 'What preparation includes',
        items: [
          'Revision',
          'Past papers',
          'Concept review',
          'Examination technique',
          'Time management',
          'Subject-specific tutoring',
          'Individual support',
          'Mock examinations',
        ],
      },
      {
        heading: 'How we work',
        body: 'Examination preparation is most effective when it starts early enough to fix understanding rather than only rehearse answers. We begin with a diagnostic, then split time between closing content gaps and drilling technique.',
        items: [
          'Diagnostic review of current standing per subject',
          'A revision schedule mapped to the examination date',
          'Timed past-paper practice with feedback',
          'Mock examinations under realistic conditions',
        ],
      },
    ],
    cta: {
      heading: 'When is the examination?',
      body: 'Tell us the examination and the date. We will tell you honestly what is achievable in the time available and what it will take.',
    },
    seo: {
      title: 'KCSE, IGCSE & A Level Exam Preparation | Axis Learning Kenya',
      description:
        'Examination preparation in Kenya for KCSE, IGCSE, Cambridge assessments and A Levels — revision, past papers, mock examinations and examination technique.',
    },
  },

  {
    slug: 'learner-discovery',
    title: 'Educational Consultancy & Learner Discovery',
    shortTitle: 'Learner Discovery',
    tagline: 'You do not need to know what you need',
    summary:
      'Come to Axis even when you cannot name the problem. We understand the learner, identify the educational challenge, and recommend the appropriate pathway.',
    icon: Compass,
    accent: 'bg-tint-yellow',
    highlights: [
      'Start without knowing which service you need',
      'Understand strengths, challenges and aspirations',
      'Explore curriculum and learning model options',
      'Receive a clear, specific recommendation',
    ],
    sections: [
      {
        heading: 'Parents often arrive saying',
        body: 'Any of these is a perfectly good place to begin. You do not need a diagnosis, a plan, or the right vocabulary before you contact us.',
        items: [
          '“My child is struggling.”',
          '“I don’t know which curriculum is right.”',
          '“My child is bright but isn’t thriving in school.”',
          '“We want to homeschool but don’t know how.”',
        ],
      },
      {
        heading: 'What we seek to understand',
        body: 'Our fundamental belief is that every learner is different, and education should be designed around the learner. So we do not only ask which class a learner is in — we ask who this learner is.',
        items: [
          'Who the learner is',
          'What the learner enjoys',
          'What the learner finds difficult',
          'How the learner learns best',
          'What the learner wants to become',
          'What support the learner requires',
          'What environment allows the learner to thrive',
        ],
      },
      {
        heading: 'How the process runs',
        options: [
          {
            title: '1. Consultation',
            description: 'We speak with you about the learner, the history, and what you are hoping to change.',
          },
          {
            title: '2. Learner discovery',
            description: 'We spend time understanding the learner directly — strengths, interests, difficulties and preferred ways of working.',
          },
          {
            title: '3. Recommendation',
            description: 'We recommend a curriculum, programme and learning model suited to that specific learner.',
          },
          {
            title: '4. Pathway',
            description: 'We agree the pathway with you, match an educator, and begin — adjusting as the learner grows.',
          },
        ],
      },
    ],
    cta: {
      heading: 'Start here if you are not sure',
      body: 'Book a consultation and describe the situation in your own words. Working out what your learner needs is our job, not yours.',
    },
    seo: {
      title: 'Educational Consultancy & Learner Discovery | Axis Learning Kenya',
      description:
        'Not sure which curriculum, programme or support your child needs? Axis Learning assesses the learner’s needs, strengths and aspirations and recommends a pathway.',
    },
  },
]

export const getService = (slug?: string) => services.find((service) => service.slug === slug)
