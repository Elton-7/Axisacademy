const { User, Learner, LearnerEducator, Session, Assessment, Message } = require('../models')

/**
 * A worked example for the two portals.
 *
 * The demonstration accounts sign in correctly but arrive at empty screens: no
 * learner is attached to the parent account and no learner is assigned to the
 * educator, so neither portal shows what it is for. Anyone being shown the
 * system — a family deciding whether to enrol, an educator being trained —
 * sees an empty state and has to be told what would normally be there.
 *
 * This attaches one learner with a term's worth of history behind her and two
 * sessions ahead, which is enough for every panel on both portals to render
 * with something in it.
 *
 * It is demonstration data about a child who does not exist, so it must never
 * reach Axis's real database. It is skipped in production unless someone
 * deliberately sets SEED_DEMO_PORTAL=true for a staging environment, and it
 * only ever runs when no learner exists at all — the moment Axis adds a real
 * family, this stops touching anything.
 */
const DEMO_LEARNER = 'Amani Wafula'

/** Days from today, at a given hour, in the server's timezone. */
const at = (days, hour, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

const dateOnly = (days) => at(days, 12).toISOString().slice(0, 10)

const seedDemoPortal = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.SEED_DEMO_PORTAL !== 'true') return

  // Only ever populate an empty system. Once there is a real learner, leave
  // the database alone.
  if ((await Learner.count()) > 0) return

  const parent = await User.findOne({ where: { email: process.env.STUDENT_EMAIL || 'student@axis.com' } })
  const educator = await User.findOne({ where: { email: process.env.TUTOR_EMAIL || 'tutor@axis.com' } })
  if (!parent || !educator) {
    console.log('Demo portal data skipped: the demonstration parent or educator account is not present')
    return
  }

  const learner = await Learner.create({
    name: DEMO_LEARNER,
    parentUserId: parent.id,
    programme: 'Academic Support',
    curriculum: 'CBC',
    gradeClass: 'Grade 6',
    learningModel: 'blended',
    supportNotes:
      'Confident in number work, loses ground on written explanation. Prefers to talk an answer through before writing it. Sessions alternate between the Garden City centre and home.',
    isActive: true,
  })

  await LearnerEducator.create({
    learnerId: learner.id,
    educatorUserId: educator.id,
    subject: 'Mathematics',
    isActive: true,
  })

  // A term behind and a fortnight ahead. One missed session and one flagged
  // concern, because a portal that only ever shows good news teaches a parent
  // nothing about whether to trust it.
  await Session.bulkCreate([
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      scheduledFor: at(-21, 16),
      durationMinutes: 60,
      deliveryMode: 'centre-based',
      status: 'Attended',
      topicsCovered: 'Fractions: equivalence and comparison',
      lessonNotes:
        'Worked comfortably with halves and quarters. Comparing unlike denominators still needs the diagram before the arithmetic.',
      concernFlagged: false,
      markedAt: at(-21, 17),
      markedByUserId: educator.id,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      scheduledFor: at(-14, 16),
      durationMinutes: 60,
      deliveryMode: 'home-based',
      status: 'Attended',
      topicsCovered: 'Fractions: addition with unlike denominators',
      lessonNotes: 'Found a common denominator unprompted twice. Good session.',
      concernFlagged: false,
      checkInAt: at(-14, 15, 55),
      checkOutAt: at(-14, 17, 2),
      adultPresent: true,
      markedAt: at(-14, 17, 5),
      markedByUserId: educator.id,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      scheduledFor: at(-10, 16),
      durationMinutes: 60,
      deliveryMode: 'centre-based',
      status: 'Missed',
      concernFlagged: false,
      lessonNotes: 'Family away. Rearranged rather than lost.',
      markedAt: at(-10, 17),
      markedByUserId: educator.id,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'English',
      scheduledFor: at(-7, 16),
      durationMinutes: 60,
      deliveryMode: 'centre-based',
      status: 'Attended',
      topicsCovered: 'Explaining a method in writing',
      lessonNotes:
        'Can say the reasoning aloud in full. Writing it down drops most of the steps — this is the gap to work on, not the mathematics.',
      concernFlagged: true,
      concernNote:
        'Written explanation is well behind spoken. Worth raising at the next review so it is not mistaken for a comprehension problem.',
      markedAt: at(-7, 17),
      markedByUserId: educator.id,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      scheduledFor: at(-3, 16),
      durationMinutes: 60,
      deliveryMode: 'home-based',
      status: 'Attended',
      topicsCovered: 'Fractions to decimals',
      lessonNotes: 'Made the connection to place value on her own. Wrote three of five methods out in full.',
      concernFlagged: false,
      checkInAt: at(-3, 15, 58),
      checkOutAt: at(-3, 17, 0),
      adultPresent: true,
      markedAt: at(-3, 17, 3),
      markedByUserId: educator.id,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      scheduledFor: at(4, 16),
      durationMinutes: 60,
      deliveryMode: 'centre-based',
      status: 'Scheduled',
      concernFlagged: false,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'English',
      scheduledFor: at(11, 16),
      durationMinutes: 60,
      deliveryMode: 'home-based',
      status: 'Scheduled',
      concernFlagged: false,
    },
  ])

  await Assessment.bulkCreate([
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      title: 'Fractions — baseline',
      type: 'Test',
      score: 14,
      maxScore: 25,
      comment:
        'Taken before support began, to have something to measure against. Number work sound; word problems lost marks for missing working rather than wrong answers.',
      learningObjectives: 'Compare and order fractions; add and subtract with unlike denominators.',
      assessedOn: dateOnly(-21),
      isReleased: true,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'Mathematics',
      title: 'Fractions — after four sessions',
      type: 'Test',
      score: 20,
      maxScore: 25,
      comment:
        'Same paper as the baseline. Six marks gained, all of them on questions requiring working to be shown.',
      learningObjectives: 'Compare and order fractions; add and subtract with unlike denominators.',
      assessedOn: dateOnly(-4),
      isReleased: true,
    },
    {
      learnerId: learner.id,
      educatorUserId: educator.id,
      subject: 'English',
      title: 'Written explanation',
      type: 'Observation',
      comment:
        'Not scored. Amani can explain a method aloud accurately and then writes down roughly a third of it. The next half-term is aimed at closing that gap.',
      learningObjectives: 'Set out reasoning in writing so that a reader who did not hear the explanation can follow it.',
      assessedOn: dateOnly(-7),
      isReleased: true,
    },
  ])

  await Message.bulkCreate([
    {
      learnerId: learner.id,
      senderUserId: educator.id,
      senderRole: 'tutor',
      senderName: educator.name || 'Axis Educator',
      body:
        'Amani re-sat the fractions paper this week and went from 14 to 20. The gain is entirely on the questions where she has to show her working, which is what we have been practising.',
      createdAt: at(-4, 18),
    },
    {
      learnerId: learner.id,
      senderUserId: parent.id,
      senderRole: 'student',
      senderName: parent.name || 'Parent',
      body: 'That is good to hear, thank you. Is there anything we should be doing with her at home between sessions?',
      createdAt: at(-4, 20),
    },
    {
      learnerId: learner.id,
      senderUserId: educator.id,
      senderRole: 'tutor',
      senderName: educator.name || 'Axis Educator',
      body:
        'Nothing extra. If she explains a homework answer to you out loud and then writes down what she just said, that is the whole exercise — ten minutes is plenty.',
      createdAt: at(-3, 9),
    },
  ])

  console.log(
    `Demo portal data created for ${DEMO_LEARNER} — a learner who does not exist. ` +
      'Remove SEED_DEMO_PORTAL and clear this record before enrolling a real family.'
  )
}

module.exports = seedDemoPortal
