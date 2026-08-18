const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const {
  Enrollment,
  Learner,
  LearnerEducator,
  Session,
  Assessment,
  User,
  PortalSchedule,
  PortalMessage,
} = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')

/**
 * Portal access (brief §28, §29, §38).
 *
 * Every read is scoped at the query, never filtered afterwards in the response
 * or in the UI:
 *
 *   parent   -> learners where parent_user_id is their own account
 *   educator -> learners reachable through an active assignment to them
 *
 * `resolveLearnerIds` is the single place that decides what an account can
 * reach. Any new portal endpoint should go through it rather than querying
 * learners directly, so the rule cannot drift between routes.
 */
async function resolveLearnerIds(user) {
  if (user.role === 'student') {
    const learners = await Learner.findAll({
      where: { parentUserId: user.userId, isActive: true },
      attributes: ['id'],
    })
    return learners.map((learner) => learner.id)
  }

  if (user.role === 'tutor') {
    const assignments = await LearnerEducator.findAll({
      where: { educatorUserId: user.userId, isActive: true },
      attributes: ['learnerId'],
    })
    return [...new Set(assignments.map((assignment) => assignment.learnerId))]
  }

  return []
}

/** Fails closed: an id that is not reachable is treated as not found. */
async function assertCanReachLearner(user, learnerId) {
  const allowed = await resolveLearnerIds(user)
  return allowed.includes(Number(learnerId))
}

function attendanceSummary(sessions) {
  // Only sessions that reached an outcome count, so an upcoming session never
  // drags the figure down.
  const decided = sessions.filter((s) => s.status === 'Attended' || s.status === 'Missed')
  const attended = decided.filter((s) => s.status === 'Attended').length

  return {
    attended,
    missed: decided.length - attended,
    cancelled: sessions.filter((s) => s.status === 'Cancelled').length,
    scheduled: sessions.filter((s) => s.status === 'Scheduled').length,
    percentage: decided.length > 0 ? Math.round((attended / decided.length) * 100) : null,
  }
}

/** Fields a parent may see about their own learner. */
function presentLearner(learner) {
  return {
    id: learner.id,
    name: learner.name,
    programme: learner.programme,
    curriculum: learner.curriculum,
    gradeClass: learner.gradeClass,
    learningModel: learner.learningModel,
    supportNotes: learner.supportNotes,
  }
}

router.get('/overview', requireAuth, requireRole('student', 'tutor'), async (req, res) => {
  try {
    const learnerIds = await resolveLearnerIds(req.user)

    const [learners, sessions, assessments, schedule, messages, enrollments] = await Promise.all([
      learnerIds.length
        ? Learner.findAll({ where: { id: learnerIds }, order: [['name', 'ASC']] })
        : [],
      learnerIds.length
        ? Session.findAll({
            where: { learnerId: learnerIds },
            order: [['scheduledFor', 'ASC']],
          })
        : [],
      learnerIds.length
        ? Assessment.findAll({
            where: {
              learnerId: learnerIds,
              // A parent sees released results only; an educator sees their own
              // drafts so they can finish what they started.
              ...(req.user.role === 'student'
                ? { isReleased: true }
                : { [Op.or]: [{ isReleased: true }, { educatorUserId: req.user.userId }] }),
            },
            order: [['assessedOn', 'DESC']],
            limit: 25,
          })
        : [],
      PortalSchedule.findAll({
        where: { role: req.user.role, userId: req.user.userId },
        order: [['date', 'ASC']],
        limit: 10,
      }),
      PortalMessage.findAll({
        where: { role: req.user.role, userId: req.user.userId },
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      // Retained so a parent whose learner record has not been created yet can
      // still see the enquiry they submitted.
      req.user.role === 'student'
        ? Enrollment.findAll({ where: { email: req.user.email }, order: [['createdAt', 'DESC']] })
        : [],
    ])

    const now = new Date()
    const upcoming = sessions
      .filter((s) => s.status === 'Scheduled' && new Date(s.scheduledFor) >= now)
      .slice(0, 10)

    res.json({
      success: true,
      data: {
        role: req.user.role,
        learners: learners.map((learner) => {
          const learnerSessions = sessions.filter((s) => s.learnerId === learner.id)
          return {
            ...presentLearner(learner),
            attendance: attendanceSummary(learnerSessions),
          }
        }),
        programmes: enrollments.map((enrollment) => ({
          id: enrollment.id,
          name: enrollment.programme || 'Learning programme',
          status: enrollment.status,
          ageGroup: enrollment.ageGroup,
          createdAt: enrollment.createdAt,
        })),
        upcomingSessions: upcoming.map((s) => ({
          id: s.id,
          learnerId: s.learnerId,
          subject: s.subject,
          scheduledFor: s.scheduledFor,
          durationMinutes: s.durationMinutes,
          deliveryMode: s.deliveryMode,
          status: s.status,
        })),
        recentAssessments: assessments.slice(0, 10).map((a) => ({
          id: a.id,
          learnerId: a.learnerId,
          subject: a.subject,
          title: a.title,
          type: a.type,
          score: a.score,
          maxScore: a.maxScore,
          comment: a.comment,
          assessedOn: a.assessedOn,
          isReleased: a.isReleased,
        })),
        schedule: schedule.map((item) => ({ id: item.id, title: item.title, date: item.date })),
        messages: messages.map((item) => ({
          id: item.id,
          subject: item.subject,
          preview: item.preview,
          createdAt: item.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('Failed to load portal overview:', error)
    res.status(500).json({ success: false, error: 'Failed to load portal data' })
  }
})

/** Full record for one learner — timetable, attendance and academic history. */
router.get('/learners/:id', requireAuth, requireRole('student', 'tutor'), async (req, res) => {
  try {
    if (!(await assertCanReachLearner(req.user, req.params.id))) {
      return res.status(404).json({ success: false, error: 'Learner not found' })
    }

    const learner = await Learner.findByPk(req.params.id)
    if (!learner) {
      return res.status(404).json({ success: false, error: 'Learner not found' })
    }

    const [sessions, assessments] = await Promise.all([
      Session.findAll({ where: { learnerId: learner.id }, order: [['scheduledFor', 'DESC']] }),
      Assessment.findAll({
        where: {
          learnerId: learner.id,
          ...(req.user.role === 'student' ? { isReleased: true } : {}),
        },
        order: [['assessedOn', 'DESC']],
      }),
    ])

    res.json({
      success: true,
      data: {
        learner: presentLearner(learner),
        attendance: attendanceSummary(sessions),
        sessions: sessions.map((s) => ({
          id: s.id,
          subject: s.subject,
          scheduledFor: s.scheduledFor,
          durationMinutes: s.durationMinutes,
          deliveryMode: s.deliveryMode,
          status: s.status,
          topicsCovered: s.topicsCovered,
          lessonNotes: s.lessonNotes,
          // A flagged concern is for Axis to act on; it is not surfaced to the
          // parent through this endpoint.
          ...(req.user.role === 'tutor' && {
            concernFlagged: s.concernFlagged,
            concernNote: s.concernNote,
          }),
        })),
        assessments: assessments.map((a) => ({
          id: a.id,
          subject: a.subject,
          title: a.title,
          type: a.type,
          score: a.score,
          maxScore: a.maxScore,
          comment: a.comment,
          learningObjectives: a.learningObjectives,
          assessedOn: a.assessedOn,
          isReleased: a.isReleased,
        })),
      },
    })
  } catch (error) {
    console.error('Failed to load learner record:', error)
    res.status(500).json({ success: false, error: 'Failed to load learner record' })
  }
})

/** Brief §29 — an educator marks attendance and records what was covered. */
router.patch('/sessions/:id', requireAuth, requireRole('tutor'), async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id)
    if (!session || !(await assertCanReachLearner(req.user, session.learnerId))) {
      return res.status(404).json({ success: false, error: 'Session not found' })
    }

    const { status, topicsCovered, lessonNotes, concernFlagged, concernNote } = req.body
    const allowedStatuses = ['Scheduled', 'Attended', 'Missed', 'Cancelled']

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid session status' })
    }
    if (concernFlagged === true && !String(concernNote || '').trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please describe the concern you are flagging',
      })
    }

    await session.update({
      ...(status !== undefined && { status, markedAt: new Date(), markedByUserId: req.user.userId }),
      ...(topicsCovered !== undefined && { topicsCovered }),
      ...(lessonNotes !== undefined && { lessonNotes }),
      ...(concernFlagged !== undefined && { concernFlagged }),
      ...(concernNote !== undefined && { concernNote }),
    })

    if (concernFlagged === true) {
      await recordAudit(req, 'concern_flagged', 'session', session.id, { learnerId: session.learnerId })
    }

    res.json({ success: true, data: session })
  } catch (error) {
    console.error('Failed to update session:', error)
    res.status(500).json({ success: false, error: 'Failed to update session' })
  }
})

/** Brief §29 — an educator records an assessment result. */
router.post('/assessments', requireAuth, requireRole('tutor'), async (req, res) => {
  try {
    const { learnerId, subject, title, type, score, maxScore, comment, learningObjectives, assessedOn } = req.body

    if (!learnerId || !subject || !title) {
      return res.status(400).json({ success: false, error: 'learnerId, subject and title are required' })
    }
    if (!(await assertCanReachLearner(req.user, learnerId))) {
      return res.status(404).json({ success: false, error: 'Learner not found' })
    }
    if (score !== undefined && score !== null && (maxScore === undefined || maxScore === null)) {
      return res.status(400).json({ success: false, error: 'A score needs a maximum to be meaningful' })
    }

    const assessment = await Assessment.create({
      learnerId,
      educatorUserId: req.user.userId,
      subject,
      title,
      type: type || 'Assignment',
      score: score ?? null,
      maxScore: maxScore ?? null,
      comment,
      learningObjectives,
      assessedOn: assessedOn || new Date().toISOString().slice(0, 10),
      // Recorded as a draft: a result reaches the family only once released.
      isReleased: false,
    })

    res.status(201).json({ success: true, data: assessment })
  } catch (error) {
    console.error('Failed to record assessment:', error)
    res.status(500).json({ success: false, error: 'Failed to record assessment' })
  }
})

module.exports = router
