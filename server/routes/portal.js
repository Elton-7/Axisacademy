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
  Message,
  MessageRead,
  SafeguardingConcern,
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

/**
 * Messaging widens the audience by one: Axis staff are a party to every
 * conversation, because "parent and Axis" is one of the three the brief names.
 * Kept separate from resolveLearnerIds so that widening applies to messaging
 * only, and never silently grants staff a learner's academic record through an
 * endpoint that was written for parents and educators.
 */
async function canJoinConversation(user, learnerId) {
  if (user.role === 'admin' || user.role === 'staff') {
    return Boolean(await Learner.findByPk(learnerId))
  }
  return assertCanReachLearner(user, learnerId)
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

    const { status, topicsCovered, lessonNotes, concernFlagged, concernNote, checkInAt, checkOutAt, adultPresent } = req.body
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

    /**
     * Home-based safeguarding (brief §38).
     *
     * An educator alone with a child in a private home is the highest-risk part
     * of the service. A home-based session cannot be recorded as attended
     * without a check-in, a check-out and confirmation that a responsible adult
     * was present — so the record is made at the time rather than reconstructed
     * later, and the absence of one is itself visible.
     */
    if (status === 'Attended' && session.deliveryMode === 'home-based') {
      const nextIn = checkInAt ?? session.checkInAt
      const nextOut = checkOutAt ?? session.checkOutAt
      const nextAdult = adultPresent ?? session.adultPresent

      if (!nextIn || !nextOut) {
        return res.status(400).json({
          success: false,
          error: 'Record your arrival and departure times before marking a home-based session attended',
        })
      }
      if (new Date(nextOut) < new Date(nextIn)) {
        return res.status(400).json({ success: false, error: 'Departure cannot be before arrival' })
      }
      if (nextAdult !== true) {
        return res.status(400).json({
          success: false,
          error: 'Confirm that a responsible adult was present, or flag a concern instead',
        })
      }
    }

    await session.update({
      ...(status !== undefined && { status, markedAt: new Date(), markedByUserId: req.user.userId }),
      ...(topicsCovered !== undefined && { topicsCovered }),
      ...(lessonNotes !== undefined && { lessonNotes }),
      ...(concernFlagged !== undefined && { concernFlagged }),
      ...(concernNote !== undefined && { concernNote }),
      ...(checkInAt !== undefined && { checkInAt: checkInAt || null }),
      ...(checkOutAt !== undefined && { checkOutAt: checkOutAt || null }),
      ...(adultPresent !== undefined && { adultPresent }),
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

/**
 * The conversation about a learner (brief §28).
 *
 * Open to the parent, any currently assigned educator, and Axis staff. An
 * educator who is unassigned loses access to the thread at the same moment they
 * lose access to everything else about that learner.
 */
router.get('/learners/:id/messages', requireAuth, requireRole('student', 'tutor', 'staff', 'admin'), async (req, res) => {
  try {
    if (!(await canJoinConversation(req.user, req.params.id))) {
      return res.status(404).json({ success: false, error: 'Conversation not found' })
    }

    const messages = await Message.findAll({
      where: { learnerId: req.params.id },
      order: [['createdAt', 'ASC']],
      limit: 200,
    })

    // Opening the thread marks it read up to now.
    await MessageRead.upsert({
      userId: req.user.userId,
      learnerId: Number(req.params.id),
      lastReadAt: new Date(),
    })

    res.json({
      success: true,
      data: messages.map((message) => ({
        id: message.id,
        body: message.body,
        senderRole: message.senderRole,
        senderName: message.senderName,
        // Lets the client align the thread without exposing anyone's user id.
        isMine: message.senderUserId === req.user.userId,
        createdAt: message.createdAt,
      })),
    })
  } catch (error) {
    console.error('Failed to load the conversation:', error)
    res.status(500).json({ success: false, error: 'Failed to load the conversation' })
  }
})

router.post('/learners/:id/messages', requireAuth, requireRole('student', 'tutor', 'staff', 'admin'), async (req, res) => {
  try {
    if (!(await canJoinConversation(req.user, req.params.id))) {
      return res.status(404).json({ success: false, error: 'Conversation not found' })
    }

    const body = String(req.body.body || '').trim()
    if (!body) {
      return res.status(400).json({ success: false, error: 'A message cannot be empty' })
    }
    if (body.length > 4000) {
      return res.status(400).json({ success: false, error: 'Please keep messages under 4,000 characters' })
    }

    const sender = await User.findByPk(req.user.userId, { attributes: ['id', 'name'] })

    const message = await Message.create({
      learnerId: Number(req.params.id),
      senderUserId: req.user.userId,
      senderRole: req.user.role,
      senderName: sender?.name || 'Axis',
      body,
    })

    res.status(201).json({
      success: true,
      data: {
        id: message.id,
        body: message.body,
        senderRole: message.senderRole,
        senderName: message.senderName,
        isMine: true,
        createdAt: message.createdAt,
      },
    })
  } catch (error) {
    console.error('Failed to send the message:', error)
    res.status(500).json({ success: false, error: 'Failed to send the message' })
  }
})

/**
 * Raising a safeguarding concern (brief §38).
 *
 * Deliberately not the message thread. Someone worried about a child's safety
 * should not have to write it where the person they are worried about can read
 * it, so concerns go only to Axis staff. A parent may raise one about their own
 * learner; an educator about a learner they are assigned to.
 */
router.post('/concerns', requireAuth, requireRole('student', 'tutor'), async (req, res) => {
  try {
    const { learnerId, sessionId, category, detail } = req.body

    if (!String(detail || '').trim()) {
      return res.status(400).json({ success: false, error: 'Please describe what you are concerned about' })
    }
    // A concern about a learner is only accepted from someone connected to them.
    if (learnerId && !(await assertCanReachLearner(req.user, learnerId))) {
      return res.status(404).json({ success: false, error: 'Learner not found' })
    }

    const concern = await SafeguardingConcern.create({
      learnerId: learnerId || null,
      sessionId: sessionId || null,
      raisedByUserId: req.user.userId,
      raisedByRole: req.user.role,
      category: category || 'Other',
      detail: String(detail).trim(),
      status: 'Open',
    })

    await recordAudit(req, 'safeguarding_concern_raised', 'learner', learnerId || null, {
      concernId: concern.id,
      category: concern.category,
    })

    res.status(201).json({
      success: true,
      // Deliberately minimal: the person raising it does not need the record
      // back, only the reassurance that it reached Axis.
      data: { id: concern.id, status: concern.status, createdAt: concern.createdAt },
    })
  } catch (error) {
    console.error('Failed to record the concern:', error)
    res.status(500).json({ success: false, error: 'Failed to record the concern' })
  }
})

/** Staff view of concerns. Educators and parents can never read this. */
router.get('/concerns', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const concerns = await SafeguardingConcern.findAll({
      include: [
        { model: Learner, as: 'learner', attributes: ['id', 'name'], required: false },
        { model: User, as: 'raisedBy', attributes: ['id', 'name', 'role'], required: false },
      ],
      order: [['createdAt', 'DESC']],
      limit: 200,
    })
    res.json({ success: true, data: concerns })
  } catch (error) {
    console.error('Failed to load concerns:', error)
    res.status(500).json({ success: false, error: 'Failed to load concerns' })
  }
})

router.patch('/concerns/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const concern = await SafeguardingConcern.findByPk(req.params.id)
    if (!concern) return res.status(404).json({ success: false, error: 'Concern not found' })

    const { status, outcome } = req.body
    const allowed = ['Open', 'Acknowledged', 'Under review', 'Resolved', 'Escalated']
    if (status !== undefined && !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' })
    }
    // A concern cannot be closed without a record of what was done about it.
    if (status === 'Resolved' && !String(outcome ?? concern.outcome ?? '').trim()) {
      return res.status(400).json({
        success: false,
        error: 'Record what was done before resolving a safeguarding concern',
      })
    }

    await concern.update({
      ...(status !== undefined && { status }),
      ...(outcome !== undefined && { outcome }),
      ...(status === 'Acknowledged' && !concern.acknowledgedAt && {
        acknowledgedAt: new Date(),
        acknowledgedByUserId: req.user.userId,
      }),
      ...(status === 'Resolved' && { resolvedAt: new Date() }),
    })

    await recordAudit(req, 'safeguarding_concern_updated', 'learner', concern.learnerId, {
      concernId: concern.id, status,
    })
    res.json({ success: true, data: concern })
  } catch (error) {
    console.error('Failed to update the concern:', error)
    res.status(500).json({ success: false, error: 'Failed to update the concern' })
  }
})

module.exports = router
