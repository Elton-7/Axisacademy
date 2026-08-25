const { COORDINATOR_BIOS } = require('../content/coordinatorBios')
const { galleryRows } = require('../content/galleryItems')
const { resourceRows } = require('../content/resourceLibrary')
const { EVENTS } = require('../content/events')
const seedDemoPortal = require('./demoPortal')
const { Service, Testimonial, User, Enrollment, PortalSchedule, PortalMessage, Educator, Event, FAQ, Location, Gallery, Resource, Partner } = require('../models')

/**
 * Seeding runs on every server start, and most of these models have no unique
 * constraint — so `ignoreDuplicates` had nothing to detect a conflict against
 * and every restart inserted another full copy of the seed data.
 *
 * Seeding a table only when it is empty is idempotent regardless of constraints,
 * and leaves real content alone once Axis starts adding its own.
 */
const seedIfEmpty = async (Model, rows) => {
  const existing = await Model.count()
  if (existing > 0) return 0

  await Model.bulkCreate(rows)
  return rows.length
}

const seedData = async () => {
  try {
    await seedIfEmpty(Service, [
      // The nine core services of brief §6-§13, in the brief's own order and
      // wording. The previous seed listed six differently-named services and
      // advertised Coding, Robotics, Entrepreneurship and Financial Literacy,
      // none of which appear anywhere in the brief.
      { title: 'Academic Learning & Homeschooling', slug: 'academic-learning', icon: 'BookOpen', description: 'Academic learning and homeschooling across the curricula families in Kenya actually use.', items: ['CBC', 'Montessori', 'Cambridge', 'IGCSE', 'O Levels', 'IB', 'British Curriculum', 'American Curriculum'], order: 1 },
      { title: 'Academic Support & Tuition', slug: 'tuition', icon: 'GraduationCap', description: 'Focused subject support for learners who need to catch up, keep up, or get ahead.', items: ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'Reading and writing', 'Examination technique'], order: 2 },
      { title: 'Special Needs Education & Individualised Learning Support', slug: 'special-needs', icon: 'HeartHandshake', description: 'Individualised educational support, adapted to the learner rather than one-size-fits-all.', items: ['Autism', 'ADHD', 'Dyslexia', 'Dysgraphia', 'Dyscalculia', 'Dyspraxia', 'Speech and language delays', 'Other additional learning needs'], order: 3 },
      { title: 'African & Foreign Language Learning', slug: 'languages', icon: 'Languages', description: 'Global languages and African languages, given equal weight.', items: ['French', 'Spanish', 'German', 'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Kiswahili', 'Dholuo', 'Kikuyu', 'Luhya', 'Kamba'], order: 4 },
      { title: 'Games & Sports', slug: 'games-and-sports', icon: 'Trophy', description: 'Physical activity treated as part of a learner’s education rather than a break from it.', items: ['Football', 'Basketball', 'Swimming', 'Skating', 'Athletics', 'Volleyball', 'Tennis'], order: 5 },
      { title: 'Board Games, Talent & Creative Development', slug: 'talent-development', icon: 'Star', description: 'Confidence, creativity, communication and leadership alongside academic work.', items: ['Chess', 'Scrabble', 'Draughts', 'Music', 'Drama', 'Theatre', 'Dance', 'Creative writing', 'Public speaking', 'Debate'], order: 6 },
      { title: 'Holiday Tuition', slug: 'holiday-tuition', icon: 'CalendarDays', description: 'Structured programmes for each school holiday.', items: ['Revision', 'Catch-up', 'Concept reinforcement', 'Preparation for the next term', 'Enrichment'], order: 7 },
      { title: 'Examination Preparation', slug: 'examination-preparation', icon: 'ClipboardCheck', description: 'Preparation for the examinations that count.', items: ['KCSE', 'IGCSE', 'O Levels', 'Cambridge assessments', 'Past papers', 'Mock examinations'], order: 8 },
      { title: 'Educational Consultancy & Learner Discovery', slug: 'learner-discovery', icon: 'Compass', description: 'For families who do not yet know what they need. We understand the learner first.', items: ['Learner discovery', 'Curriculum guidance', 'Pathway recommendation', 'Ongoing review'], order: 9 },
    ])

    /**
     * The coordinators Axis supplied on 22 August 2025, exactly as given.
     *
     * Name, role and photograph are what arrived, so name, role and photograph
     * are what is here. Qualifications, experience, subjects, languages and
     * biographies are left empty rather than filled in plausibly — the card
     * omits an empty field, and an invented credential on a named real person
     * is worse than a shorter profile. They are added through the admin as
     * each person confirms their own details.
     *
     * `category` is the filter on the team page, so it names the subject area
     * each person coordinates. Their actual job title lives in `position`.
     */
    /**
     * The remit sentence is attached here, at insert time.
     *
     * A migration also backfills it, but migrations run before seeding, so on a
     * database created from scratch that migration finds an empty table, updates
     * nothing, and is then marked applied for good. Every fresh deploy would
     * have shipped twenty-one coordinators with no description of what they do.
     * The migration now only repairs databases seeded before the text existed.
     */
    const withBio = (rows) =>
      rows.map((row) => ({ ...row, biography: row.biography ?? COORDINATOR_BIOS[row.name] }))

    await seedIfEmpty(Educator, withBio([
      {
        name: 'Amelie Mussard',
        position: 'Foreign Languages Coordinator',
        category: 'Language Educator',
        photo: '/team/amelie-mussard.jpg',
        sortOrder: 1,
      },
      {
        name: 'Humber Masese',
        position: 'Sports & Physical Development Coordinator',
        category: 'Coach',
        photo: '/team/humber-masese.jpg',
        sortOrder: 2,
      },
      {
        name: 'Victor Muyekwe',
        position: 'Performing Arts Coordinator',
        category: 'Artist',
        photo: '/team/victor-muyekwe.jpg',
        sortOrder: 3,
      },
      {
        name: 'Ajok Deng',
        position: 'Creative Arts Coordinator',
        category: 'Artist',
        photo: '/team/ajok-deng.jpg',
        sortOrder: 4,
      },
      {
        name: 'Sunkuli Lerionka',
        position: 'Communication & Leadership Coordinator',
        category: 'Specialist Educator',
        photo: '/team/sunkuli-lerionka.jpg',
        sortOrder: 5,
      },
      {
        name: 'Ashley Ndanu',
        position: 'Technology & Innovation Coordinator',
        category: 'Specialist Educator',
        photo: '/team/ashley-ndanu.jpg',
        sortOrder: 6,
      },
      {
        name: 'Yoshira Audrey',
        position: 'Inclusive Learning Coordinator — Sensory & Physical Disabilities',
        category: 'Specialist Educator',
        photo: '/team/yoshira-audrey.jpg',
        sortOrder: 7,
      },
      {
        name: 'Naomie Kalachi',
        position: 'Integrated Learning Coordinator — Severe & Intellectual Disabilities',
        category: 'Specialist Educator',
        photo: '/team/naomie-kalachi.jpg',
        sortOrder: 8,
      },
      // The Montessori coordinators, one per stage of the curriculum.
      {
        name: 'Wendy Claudia',
        position: 'Montessori Infant & Toddler Coordinator',
        category: 'Teacher',
        photo: '/team/wendy-claudia.jpg',
        sortOrder: 9,
      },
      {
        name: 'Tabitha Wachira',
        position: 'Montessori Early Childhood Coordinator',
        category: 'Teacher',
        photo: '/team/tabitha-wachira.jpg',
        sortOrder: 10,
      },
      {
        name: 'Fikirini Juma',
        position: 'Montessori Elementary Coordinator',
        category: 'Teacher',
        photo: '/team/fikirini-juma.jpg',
        sortOrder: 11,
      },
      {
        name: 'Collins Isa',
        position: 'Montessori Secondary Coordinator',
        category: 'Teacher',
        photo: '/team/collins-isa.jpg',
        sortOrder: 12,
      },
      // The CBC coordinators, one per stage of the national curriculum. Two
      // names arrived with a trailing full stop on the supplied graphic; that
      // is a typo in the artwork rather than part of the name.
      {
        name: 'Gloria Lakeiisha',
        position: 'CBC Pre-Primary Coordinator',
        category: 'Teacher',
        photo: '/team/gloria-lakeiisha.jpg',
        sortOrder: 13,
      },
      {
        name: 'Mulati Mike',
        position: 'CBC Lower Primary Coordinator',
        category: 'Teacher',
        photo: '/team/mulati-mike.jpg',
        sortOrder: 14,
      },
      {
        name: 'Adura Moses',
        position: 'CBC Upper Primary Coordinator',
        category: 'Teacher',
        photo: '/team/adura-moses.jpg',
        sortOrder: 15,
      },
      {
        name: 'Martha Wesonga',
        position: 'CBC Junior Secondary Coordinator',
        category: 'Teacher',
        photo: '/team/martha-wesonga.jpg',
        sortOrder: 16,
      },
      {
        name: 'Felistus Chepkemoi',
        position: 'CBC Senior Secondary Coordinator',
        category: 'Teacher',
        photo: '/team/felistus-chepkemoi.jpg',
        sortOrder: 17,
      },
      // The Cambridge coordinators, one per stage of that curriculum.
      {
        name: 'Laban Kagiri',
        position: 'Cambridge Early Years Coordinator',
        category: 'Teacher',
        photo: '/team/laban-kagiri.jpg',
        sortOrder: 18,
      },
      {
        name: 'Daisy Luvanda',
        position: 'Cambridge Primary Coordinator',
        category: 'Teacher',
        photo: '/team/daisy-luvanda.jpg',
        sortOrder: 19,
      },
      {
        name: 'Warren Ndaro',
        position: 'Cambridge Lower Secondary Coordinator',
        category: 'Teacher',
        photo: '/team/warren-ndaro.jpg',
        sortOrder: 20,
      },
      {
        name: 'Victory Adikinyi',
        position: 'Cambridge Upper Secondary Coordinator — IGCSE & O Level',
        category: 'Teacher',
        photo: '/team/victory-adikinyi.jpg',
        sortOrder: 21,
      },
    ]))

    // Axis's real events, read off the posters Axis supplied. The eight that
    // stood here were invented placeholders with specific dates and venues.
    await seedIfEmpty(Event, EVENTS)

    await seedIfEmpty(Location, [
      // Brief §15 names exactly two facilities: the head office at the Chandaria
      // Innovation Centre and the Garden City learning centre. The previous seed
      // added twenty more "<Area> Learning Centre" entries typed as Learning
      // Centre, which is precisely what §15 warns against — it "should not give
      // the impression that these are all necessarily Axis-owned facilities".
      //
      // Axis's national reach is told honestly by the Axis Across Kenya section
      // and the county list, which describe coverage rather than claim premises.
      // Real centres are added through the admin dashboard.
      //
      // Phone and email below are placeholders pending confirmation from Axis.
      {
        name: 'Chandaria Innovation Centre',
        type: 'Head Office',
        address: 'Kenyatta University, Main Campus',
        city: 'Nairobi',
        county: 'Nairobi',
        description: 'Axis Learning headquarters, supporting consultations, coordination and learner discovery.',
        programmes: ['Learner Discovery', 'Curriculum Advisory', 'Academic Support'],
        latitude: -1.1849,
        longitude: 36.9304,
        sortOrder: 1,
      },
      {
        name: 'Garden City Learning Centre',
        type: 'Learning Centre',
        address: 'Garden City Mall, Thika Road',
        city: 'Nairobi',
        county: 'Nairobi',
        description: 'Centre-based academic support, enrichment and examination preparation.',
        programmes: ['Academic Support', 'Examination Preparation', 'Languages'],
        latitude: -1.2142,
        longitude: 36.8927,
        sortOrder: 2,
      },
    ])

    await seedIfEmpty(Testimonial, [
      // Brief §21: "We should avoid generic fake-sounding testimonials. The
      // objective is credibility." The previous seed contained exactly that —
      // unattributed quotes from "Parent" and "Learner". Real testimonials are
      // added through the admin dashboard once permission has been given.
    ])

    await seedIfEmpty(FAQ, [
      {
        question: 'What is Axis Learning?',
        answer: 'Axis Learning is a comprehensive educational network providing personalized learning pathways for all learners through academic support, homeschooling, tuition, special needs education, languages, sports, enrichment programmes, and more. We believe every learner is different and education should be designed around the individual learner.',
        category: 'General',
        order: 1,
      },
      {
        question: 'What ages do you serve?',
        answer: 'Axis Learning serves learners of all ages, from early childhood through tertiary education and adult learners. Our programmes are tailored to different age groups and developmental stages.',
        category: 'General',
        order: 2,
      },
      {
        question: 'Which curricula do you support?',
        answer: 'We support multiple curricula including:\n- CBC (Competency-Based Curriculum)\n- Montessori\n- Cambridge International\n- IGCSE\n- O Levels\n- IB (International Baccalaureate)\n- British Curriculum\n- American Curriculum\n- And other recognized educational pathways\n\nOur education consultants can help you determine which curriculum is best suited for your learner.',
        category: 'Programmes & Curricula',
        order: 1,
      },
      {
        question: 'What is CBC?',
        answer: 'CBC (Competency-Based Curriculum) is a Kenyan educational approach that emphasizes skills, competencies, practical learning, creativity, and holistic development rather than examinations alone. It focuses on developing learners who can think critically and solve real-world problems.',
        category: 'Programmes & Curricula',
        order: 2,
      },
      {
        question: 'What is Montessori?',
        answer: 'Montessori is a learner-centered educational approach that encourages independence, practical learning, self-directed exploration, and development at an appropriate pace. It respects individual learning styles and focuses on developing the whole child.',
        category: 'Programmes & Curricula',
        order: 3,
      },
      {
        question: 'What is Cambridge?',
        answer: 'Cambridge is an internationally recognized curriculum with structured academic progression and strong subject-based learning. It includes pathways leading to IGCSE (International General Certificate of Secondary Education) and O Level examinations, preparing learners for the next stage of their education.',
        category: 'Programmes & Curricula',
        order: 4,
      },
      {
        question: 'What is IGCSE?',
        answer: 'IGCSE (International General Certificate of Secondary Education) is an internationally recognized secondary qualification offering broad subject choice and strong preparation for further education. It is widely accepted by universities worldwide.',
        category: 'Programmes & Curricula',
        order: 5,
      },
      {
        question: 'What are O Levels?',
        answer: 'Cambridge O Level is an internationally recognised secondary qualification, usually taken around age sixteen. It covers the same stage as IGCSE and leads to the same next steps, with more weight on written examinations and less on coursework — which suits some learners and some centres better.',
        category: 'Programmes & Curricula',
        order: 6,
      },
      {
        question: 'What is IB?',
        answer: 'The International Baccalaureate is an internationally oriented educational framework that emphasises inquiry, critical thinking, independent learning and holistic development. Rather than working through a syllabus subject by subject, learners are asked to investigate questions, connect subjects to each other and reflect on how they learn.',
        category: 'Programmes & Curricula',
        order: 7,
      },
      {
        question: 'What if I don\'t know which curriculum my child needs?',
        answer: 'Not sure which curriculum is right for your learner? That\'s perfectly fine. Axis can help! We offer Learner Discovery and Educational Consultancy services where we assess the learner\'s needs, strengths, and aspirations to recommend an appropriate curriculum and learning pathway suited to them.',
        category: 'Programmes & Curricula',
        order: 8,
      },
      {
        question: 'Do you provide homeschooling?',
        answer: 'Yes! Axis provides comprehensive homeschooling support across multiple curricula including CBC, Cambridge, IGCSE, O Levels, and International programmes. We support families with flexible scheduling, personalized learning plans, and regular progress monitoring.',
        category: 'Programmes & Curricula',
        order: 9,
      },
      {
        question: 'Do you provide tuition?',
        answer: 'Yes, Axis provides subject tutoring and examination preparation across all subjects and curricula. Our tutors work with learners in one-on-one and small group settings to support academic excellence.',
        category: 'Programmes & Curricula',
        order: 10,
      },
      {
        question: 'Can the educator come to my home?',
        answer: 'Yes! Axis offers home-based learning where an Axis educator travels to the learner\'s home to conduct the programme there. This is one of our flexible delivery models.',
        category: 'Programmes & Curricula',
        order: 11,
      },
      {
        question: 'Can my child attend an Axis centre?',
        answer: 'Yes! Learners can attend one of our Axis learning centers or approved learning facilities for their sessions. We have centers across Nairobi and metropolitan areas, and we continue to expand our network.',
        category: 'Programmes & Curricula',
        order: 12,
      },
      {
        question: 'Do you offer online learning?',
        answer: 'Yes, Axis offers online learning through appropriate digital platforms including Google Classroom, Zoom, Google Meet, Skype, and our Axis Learner Portal. Online learning remains structured, monitored, and supported.',
        category: 'Programmes & Curricula',
        order: 13,
      },
      {
        question: 'Do you offer blended learning?',
        answer: 'Yes! Learners can combine online learning, home-based learning, center-based learning, independent learning, and digital resources depending on the programme and learner\'s needs. Blended learning offers maximum flexibility.',
        category: 'Programmes & Curricula',
        order: 14,
      },
      {
        question: 'Do you support learners with special needs?',
        answer: 'Yes, Axis provides specialized support for learners with diverse educational and developmental needs including autism, ADHD, dyslexia, dysgraphia, speech delays, and many other learning support needs. Our special needs education is individualized rather than one-size-fits-all.',
        category: 'Special Needs',
        order: 1,
      },
      {
        question: 'Which special needs can you support?',
        answer: 'Axis supports learners with:\n- Autism Spectrum Disorder\n- ADHD\n- Cerebral Palsy\n- Down Syndrome\n- Dyslexia, Dysgraphia, Dyscalculia, Dyspraxia\n- Speech and language delays\n- Communication difficulties\n- Developmental delays\n- Intellectual disabilities\n- Hearing and visual impairment\n- Learning difficulties\n- Behavioural and emotional support needs\n- Other additional learning needs\n\nOur specialist educators focus on understanding, supporting, and adapting learning for each individual.',
        category: 'Special Needs',
        order: 2,
      },
      {
        question: 'Which languages do you teach?',
        answer: 'Axis teaches multiple foreign languages including French, Spanish, German, Mandarin/Chinese, Japanese, Korean, Arabic, and English. We also promote African language learning including Kiswahili, Dholuo, Kikuyu, and other African languages. Languages can be offered through one-on-one lessons, group lessons, online learning, or center-based learning.',
        category: 'Languages',
        order: 1,
      },
      {
        question: 'Where are your centres?',
        answer: 'Axis has a growing network of learning centers across Nairobi and metropolitan areas including Thika Road, Garden City, Kikuyu, Northern Bypass, Membley, Umoja, Kayole, Ngong Road, and many other locations. We also serve learners through home-based educators and online programmes.',
        category: 'Locations',
        order: 1,
      },
      {
        question: 'Can you serve families outside Nairobi?',
        answer: 'Yes! Axis is a national education network, not just Nairobi-based. We serve learners across Kenya through physical learning centers, partner facilities, home-based educators, online educators, and our growing educator network. If we don\'t have a physical presence in your location yet, contact us to learn how we can support your learner.',
        category: 'Locations',
        order: 2,
      },
      {
        question: 'How does the educator network work?',
        answer: 'Axis maintains an expanding network of qualified teachers, tutors, language educators, coaches, artists, musicians, theater practitioners, special needs educators, and academic specialists. This network enables us to connect the right learner to the right educator, regardless of location, ensuring personalized education at scale.',
        category: 'Educators',
        order: 1,
      },
      {
        question: 'How are educators selected?',
        answer: 'Axis educators are carefully selected based on qualifications, teaching experience, subject expertise, and demonstrated ability to work effectively with learners. We maintain rigorous standards to ensure our learners receive quality education from qualified professionals.',
        category: 'Educators',
        order: 2,
      },
      {
        question: 'How much do programmes cost?',
        answer: 'Programme costs vary depending on the type of service (tutoring, homeschooling, special needs support), curriculum, learning model (online, home-based, center-based), and other factors. Contact us for a fee structure for your specific learning needs. We strive to offer quality education at affordable rates.',
        category: 'Fees & Payments',
        order: 1,
      },
      {
        question: 'How does enrolment work?',
        answer: 'Enrollment typically involves: 1) Initial Inquiry - Contact us with your learning needs, 2) Learner Discovery - We understand the learner\'s profile and requirements, 3) Pathway Recommendation - We recommend an appropriate programme and curriculum, 4) Fee Discussion - We provide pricing details, 5) Enrollment - The learner joins the programme and begins their learning journey.',
        category: 'Enrollment',
        order: 1,
      },
      {
        question: 'Can my child join an existing programme?',
        answer: 'Yes, learners can join existing programmes depending on availability and the programme\'s design. Axis also offers personalized one-on-one programmes that can be customized for individual learners at any time.',
        category: 'Enrollment',
        order: 2,
      },
      {
        question: 'Do you offer holiday tuition?',
        answer: 'Yes! Axis offers holiday tuition programmes during school holidays. These programmes include revision, catch-up sessions, concept reinforcement, and preparation for the next term across supported curricula.',
        category: 'Programmes & Curricula',
        order: 15,
      },
      {
        question: 'Do you offer examination preparation?',
        answer: 'Yes, Axis provides comprehensive examination preparation services for KCSE, IGCSE, O Levels, Cambridge assessments, school examinations, and internal assessments. Services include revision, past papers, concept review, examination technique, and subject-specific tutoring.',
        category: 'Programmes & Curricula',
        order: 16,
      },
      {
        question: 'How do you monitor progress?',
        answer: 'Axis monitors learner progress through regular assessments, assignments, progress reports, parent-educator communication, attendance tracking, and the learner portal. Parents can see their learner\'s progress, attendance, and academic development in real-time through our parent portal.',
        category: 'Portals & Learning',
        order: 1,
      },
      {
        question: 'What is the parent portal?',
        answer: 'The parent portal is a secure online platform where parents can monitor their learner\'s progress, view timetables, attendance, assignments, assessments, results, teacher comments, and learning resources. Parents can also communicate with educators and view fee information.',
        category: 'Portals & Learning',
        order: 2,
      },
      {
        question: 'How do I contact Axis Learning?',
        answer: 'You can contact Axis Learning through:\n- Phone: 0737 003 007\n- Email: Visit our website for contact details\n- WhatsApp: Contact us via WhatsApp\n- Website: axis-learning.com\n- Visit an Axis Center in person\n\nOur team is ready to answer questions and help you find the right learning pathway for your learner.',
        category: 'General',
        order: 3,
      },
    ])

    const configuredUsers = [
      { email: process.env.ADMIN_EMAIL || 'admin@axis.com', passwordHash: process.env.ADMIN_PASSWORD_HASH, name: process.env.ADMIN_NAME || 'Admin User', role: 'admin' },
      { email: process.env.TUTOR_EMAIL, passwordHash: process.env.TUTOR_PASSWORD_HASH, name: process.env.TUTOR_NAME || 'Axis Tutor', role: 'tutor' },
      { email: process.env.STUDENT_EMAIL, passwordHash: process.env.STUDENT_PASSWORD_HASH, name: process.env.STUDENT_NAME || 'Axis Student', role: 'student' },
    ]

    for (const configuredUser of configuredUsers) {
      /**
       * A missing email or hash means the account is simply not created, which
       * is correct — but silently. Someone starting the stack without
       * ADMIN_PASSWORD_HASH gets a working site with no way into the admin
       * panel and nothing explaining the absence. Say so.
       */
      if (!configuredUser.email || !configuredUser.passwordHash) {
        console.log(
          `No ${configuredUser.role} account created: set ` +
          `${configuredUser.role.toUpperCase()}_EMAIL and ${configuredUser.role.toUpperCase()}_PASSWORD_HASH ` +
          `(admin uses ADMIN_EMAIL / ADMIN_PASSWORD_HASH). ` +
          `Hash one with: node -e "require('bcrypt').hash('your-password',12).then(console.log)"`
        )
        continue
      }

      if (configuredUser.email && configuredUser.passwordHash) {
        const [user, created] = await User.findOrCreate({
          where: { email: configuredUser.email.toLowerCase().trim() },
          defaults: configuredUser,
        })

        if (!created && user.passwordHash !== configuredUser.passwordHash) {
          await user.update({
            passwordHash: configuredUser.passwordHash,
            name: configuredUser.name,
            role: configuredUser.role,
          })
        }
      }
    }

    const studentEmail = process.env.STUDENT_EMAIL?.toLowerCase().trim()
    if (studentEmail) {
      await Enrollment.findOrCreate({
        where: {
          email: studentEmail,
          programme: 'Academic Support',
        },
        defaults: {
          studentName: process.env.STUDENT_NAME || 'Axis Student',
          email: studentEmail,
          programme: 'Academic Support',
          ageGroup: 'teenager',
          status: 'approved',
          notes: 'Seeded demonstration assignment. Replace with the learner’s real programme assignment.',
        },
      })
    }

    /**
     * /api/portal/overview queries schedules and messages by (role, userId).
     * These records were previously seeded with userId left null, so they never
     * matched a signed-in account and the demonstration data was invisible.
     * They are attached to the seeded accounts here, and skipped entirely when
     * those accounts are not configured.
     */
    const tutorEmail = process.env.TUTOR_EMAIL?.toLowerCase().trim()
    const portalOwners = {}

    for (const [role, email] of [['student', studentEmail], ['tutor', tutorEmail]]) {
      if (!email) continue
      const owner = await User.findOne({ where: { email } })
      if (owner) portalOwners[role] = owner.id
    }

    const portalRecords = [
      { role: 'student', title: 'Academic Support orientation', date: '2026-08-17T10:00:00.000Z' },
      { role: 'tutor', title: 'Academic Support learner review', date: '2026-08-17T09:00:00.000Z' },
    ]
    for (const record of portalRecords) {
      const userId = portalOwners[record.role]
      if (!userId) continue
      await PortalSchedule.findOrCreate({
        where: { userId, role: record.role, title: record.title },
        defaults: { ...record, userId },
      })
    }

    const portalMessages = [
      { role: 'student', subject: 'Welcome to Academic Support', preview: 'Your programme orientation details are available. Contact the academy team if you need help.' },
      { role: 'tutor', subject: 'Learner review reminder', preview: 'Please review the Academic Support learner assignment before the next session.' },
    ]
    for (const message of portalMessages) {
      const userId = portalOwners[message.role]
      if (!userId) continue
      await PortalMessage.findOrCreate({
        where: { userId, role: message.role, subject: message.subject },
        defaults: { ...message, userId },
      })
    }

    await seedIfEmpty(Partner, [
      // Brief §22: "Only authorised logos and partnership claims should be
      // displayed." Seeded partners previously named ten real organisations —
      // among them Google, Microsoft, the British Council, Safaricom, the Kenya
      // Red Cross, KICD and KNEC — none of which had given authorisation.
      // Partners are added through the admin dashboard once Axis holds written
      // permission from each.
    ])

    // Brief §24 — the resources section doubles as the SEO surface, so these are
    // written as genuinely useful parent guidance rather than filler.
    // The collection Axis supplied. Titles and attributions are theirs; the
    // links are deliberately empty until each work's licensing is settled.
    await seedIfEmpty(Resource, resourceRows())

    // Real photographs and video of Axis learners, in the order a parent should
    // meet them. Consent is recorded on every row; the public endpoint returns
    // nothing without it.
    await seedIfEmpty(Gallery, galleryRows())

    await seedDemoPortal()

    console.log('Seed data inserted successfully')
  } catch (error) {
    console.error('Seed error:', error)
  }
}

module.exports = seedData

if (require.main === module) {
  const { syncDatabase } = require('../models')
  syncDatabase().then(() => seedData().then(() => process.exit(0)))
}
