const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Learner, LearnerEducator, Session, User } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')

/**
 * Administration of learners, educator assignments and scheduling (brief §30).
 *
 * Staff-only throughout. The portals read these records; this is where Axis
 * creates them, and it is the only place a learner can be linked to a parent
 * account or an educator given access to a child's record.
 */

const staffOnly = [requireAuth, requireRole('admin', 'staff')]

/** Never return password hashes, whatever else changes about the User model. */
const USER_FIELDS = ['id', 'name', 'email', 'role']

/**
 * Accounts that can be linked to a learner. Restricted to the two roles that
 * can legitimately be linked, so this cannot become a way to enumerate admins.
 */
router.get('/assignable-users', ...staffOnly, async (req, res) => {
  try {
    const role = req.query.role
    if (!['student', 'tutor'].includes(role)) {
      return res.status(400).json({ success: false, error: 'role must be student or tutor' })
    }

    const users = await User.findAll({
      where: { role },
      attributes: USER_FIELDS,
      order: [['name', 'ASC']],
      limit: 200,
    })

    res.json({ success: true, data: users })
  } catch (error) {
    console.error('Failed to list assignable users:', error)
    res.status(500).json({ success: false, error: 'Failed to list users' })
  }
})

router.get('/', ...staffOnly, async (req, res) => {
  try {
    const { search } = req.query
    const where = {}
    if (search && String(search).trim()) {
      where.name = { [Op.iLike]: `%${String(search).trim()}%` }
    }

    const learners = await Learner.findAll({
      where,
      include: [
        { model: User, as: 'parent', attributes: USER_FIELDS },
        {
          model: LearnerEducator,
          as: 'assignments',
          where: { isActive: true },
          required: false,
          include: [{ model: User, as: 'educator', attributes: USER_FIELDS }],
        },
      ],
      order: [['name', 'ASC']],
      limit: 200,
    })

    res.json({ success: true, data: learners })
  } catch (error) {
    console.error('Failed to list learners:', error)
    res.status(500).json({ success: false, error: 'Failed to list learners' })
  }
})

router.post('/', ...staffOnly, async (req, res) => {
  try {
    const { name, parentUserId, programme, curriculum, gradeClass, learningModel, supportNotes, enrollmentId } = req.body

    if (!String(name || '').trim() || !parentUserId) {
      return res.status(400).json({ success: false, error: 'A learner needs a name and a parent account' })
    }

    // The parent link is what scopes the whole parent portal, so it is verified
    // rather than trusted from the request.
    const parent = await User.findByPk(parentUserId)
    if (!parent || parent.role !== 'student') {
      return res.status(400).json({ success: false, error: 'The parent must be an existing parent account' })
    }

    const learner = await Learner.create({
      name: String(name).trim(),
      parentUserId,
      programme,
      curriculum,
      gradeClass,
      learningModel: learningModel || null,
      supportNotes,
      enrollmentId: enrollmentId || null,
    })

    await recordAudit(req, 'learner_created', 'learner', learner.id, { parentUserId })
    res.status(201).json({ success: true, data: learner })
  } catch (error) {
    console.error('Failed to create learner:', error)
    res.status(500).json({ success: false, error: 'Failed to create learner' })
  }
})

router.put('/:id', ...staffOnly, async (req, res) => {
  try {
    const learner = await Learner.findByPk(req.params.id)
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' })

    const { name, programme, curriculum, gradeClass, learningModel, supportNotes, isActive, parentUserId } = req.body

    if (parentUserId !== undefined && parentUserId !== learner.parentUserId) {
      const parent = await User.findByPk(parentUserId)
      if (!parent || parent.role !== 'student') {
        return res.status(400).json({ success: false, error: 'The parent must be an existing parent account' })
      }
      // Moving a learner between families changes who can see their record, so
      // it is recorded separately from an ordinary edit.
      await recordAudit(req, 'learner_reassigned', 'learner', learner.id, {
        from: learner.parentUserId,
        to: parentUserId,
      })
    }

    await learner.update({
      ...(name !== undefined && { name: String(name).trim() }),
      ...(parentUserId !== undefined && { parentUserId }),
      ...(programme !== undefined && { programme }),
      ...(curriculum !== undefined && { curriculum }),
      ...(gradeClass !== undefined && { gradeClass }),
      ...(learningModel !== undefined && { learningModel: learningModel || null }),
      ...(supportNotes !== undefined && { supportNotes }),
      ...(isActive !== undefined && { isActive }),
    })

    res.json({ success: true, data: learner })
  } catch (error) {
    console.error('Failed to update learner:', error)
    res.status(500).json({ success: false, error: 'Failed to update learner' })
  }
})

/** Granting an educator access to a learner's record (brief §29). */
router.post('/:id/educators', ...staffOnly, async (req, res) => {
  try {
    const learner = await Learner.findByPk(req.params.id)
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' })

    const { educatorUserId, subject } = req.body
    const educator = await User.findByPk(educatorUserId)
    if (!educator || educator.role !== 'tutor') {
      return res.status(400).json({ success: false, error: 'The educator must be an existing educator account' })
    }

    // Re-activate rather than duplicate when a previous assignment is restored.
    const [assignment, created] = await LearnerEducator.findOrCreate({
      where: { learnerId: learner.id, educatorUserId, subject: subject || null },
      defaults: { learnerId: learner.id, educatorUserId, subject: subject || null, isActive: true },
    })
    if (!created && !assignment.isActive) await assignment.update({ isActive: true })

    await recordAudit(req, 'educator_assigned', 'learner', learner.id, { educatorUserId, subject })
    res.status(created ? 201 : 200).json({ success: true, data: assignment })
  } catch (error) {
    console.error('Failed to assign educator:', error)
    res.status(500).json({ success: false, error: 'Failed to assign educator' })
  }
})

/**
 * Ending an assignment. Deactivated rather than deleted so the history of who
 * had access to a child's record is preserved — which matters for §38.
 */
router.delete('/:id/educators/:assignmentId', ...staffOnly, async (req, res) => {
  try {
    const assignment = await LearnerEducator.findOne({
      where: { id: req.params.assignmentId, learnerId: req.params.id },
    })
    if (!assignment) return res.status(404).json({ success: false, error: 'Assignment not found' })

    await assignment.update({ isActive: false })
    await recordAudit(req, 'educator_unassigned', 'learner', assignment.learnerId, {
      educatorUserId: assignment.educatorUserId,
    })

    res.json({ success: true, message: 'Assignment ended' })
  } catch (error) {
    console.error('Failed to end assignment:', error)
    res.status(500).json({ success: false, error: 'Failed to end assignment' })
  }
})

/** Scheduling a session, which is what puts it on the parent's timetable. */
router.post('/:id/sessions', ...staffOnly, async (req, res) => {
  try {
    const learner = await Learner.findByPk(req.params.id)
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' })

    const { subject, scheduledFor, durationMinutes, deliveryMode, educatorUserId } = req.body
    if (!String(subject || '').trim() || !scheduledFor) {
      return res.status(400).json({ success: false, error: 'A session needs a subject and a date' })
    }
    if (Number.isNaN(new Date(scheduledFor).getTime())) {
      return res.status(400).json({ success: false, error: 'The session date is not a valid date' })
    }

    // A session may only be given to an educator who actually teaches this
    // learner, otherwise scheduling would quietly become a second way to grant
    // access to a child's record.
    if (educatorUserId) {
      const assigned = await LearnerEducator.findOne({
        where: { learnerId: learner.id, educatorUserId, isActive: true },
      })
      if (!assigned) {
        return res.status(400).json({
          success: false,
          error: 'Assign this educator to the learner before scheduling their sessions',
        })
      }
    }

    const session = await Session.create({
      learnerId: learner.id,
      educatorUserId: educatorUserId || null,
      subject: String(subject).trim(),
      scheduledFor,
      durationMinutes: durationMinutes || 60,
      deliveryMode: deliveryMode || null,
      status: 'Scheduled',
    })

    res.status(201).json({ success: true, data: session })
  } catch (error) {
    console.error('Failed to schedule session:', error)
    res.status(500).json({ success: false, error: 'Failed to schedule session' })
  }
})

module.exports = router
