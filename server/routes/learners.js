const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')
const { Learner, LearnerEducator, Session, User, EducatorVetting } = require('../models')
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

    /**
     * Vetting gate (brief §38). Assignment is what gives an educator access to a
     * child's record and puts them in front of that child, so it is refused
     * unless clearance is current. Enforced here rather than in the admin screen
     * because the screen is not the only way to reach this endpoint.
     */
    const vetting = await EducatorVetting.findOne({ where: { educatorUserId } })
    if (!vetting || !vetting.isCurrentlyCleared()) {
      const reason = !vetting
        ? 'has no vetting record'
        : vetting.status !== 'Cleared'
          ? `is marked ${vetting.status.toLowerCase()}`
          : 'has a certificate of good conduct that has expired'
      return res.status(422).json({
        success: false,
        error: `${educator.name} ${reason}. Complete vetting before assigning them to a learner.`,
      })
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

/**
 * Vetting administration (brief §38).
 *
 * Kept alongside learner administration because the two are inseparable: this
 * is the record that decides who may be put in front of a child.
 */
router.get('/vetting/all', ...staffOnly, async (req, res) => {
  try {
    const educators = await User.findAll({
      where: { role: 'tutor' },
      attributes: USER_FIELDS,
      include: [{ model: EducatorVetting, as: 'vetting', required: false }],
      order: [['name', 'ASC']],
    })

    const today = new Date().toISOString().slice(0, 10)
    const soon = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10)

    res.json({
      success: true,
      data: educators.map((educator) => {
        const v = educator.vetting
        const expiry = v?.goodConductExpiresOn || null
        return {
          educatorUserId: educator.id,
          name: educator.name,
          email: educator.email,
          status: v?.status || 'Not started',
          goodConductNumber: v?.goodConductNumber || null,
          goodConductExpiresOn: expiry,
          tscNumber: v?.tscNumber || null,
          identityVerifiedOn: v?.identityVerifiedOn || null,
          referencesCheckedOn: v?.referencesCheckedOn || null,
          cleared: v ? v.isCurrentlyCleared() : false,
          // Surfaced so Axis can renew before an educator is blocked mid-term.
          expired: Boolean(expiry && expiry < today),
          expiringSoon: Boolean(expiry && expiry >= today && expiry <= soon),
        }
      }),
    })
  } catch (error) {
    console.error('Failed to list vetting records:', error)
    res.status(500).json({ success: false, error: 'Failed to list vetting records' })
  }
})

router.put('/vetting/:educatorUserId', ...staffOnly, async (req, res) => {
  try {
    const educator = await User.findByPk(req.params.educatorUserId)
    if (!educator || educator.role !== 'tutor') {
      return res.status(404).json({ success: false, error: 'Educator not found' })
    }

    const {
      status, goodConductNumber, goodConductIssuedOn, goodConductExpiresOn,
      tscNumber, identityVerifiedOn, referencesCheckedOn, referencesNote, notes,
    } = req.body

    // Clearing someone is the decision that matters, so it carries its own
    // evidence requirements rather than being a free-text status change.
    if (status === 'Cleared') {
      if (!String(goodConductNumber || '').trim()) {
        return res.status(400).json({ success: false, error: 'A certificate of good conduct number is required to clear an educator' })
      }
      if (!goodConductExpiresOn) {
        return res.status(400).json({ success: false, error: 'An expiry date is required, so clearance cannot silently last forever' })
      }
      if (new Date(goodConductExpiresOn) < new Date(new Date().toISOString().slice(0, 10))) {
        return res.status(400).json({ success: false, error: 'That certificate has already expired' })
      }
      if (!referencesCheckedOn) {
        return res.status(400).json({ success: false, error: 'Record when references were checked before clearing an educator' })
      }
    }

    const [vetting] = await EducatorVetting.findOrCreate({
      where: { educatorUserId: educator.id },
      defaults: { educatorUserId: educator.id },
    })

    const wasCleared = vetting.isCurrentlyCleared()

    await vetting.update({
      ...(status !== undefined && { status }),
      ...(goodConductNumber !== undefined && { goodConductNumber }),
      ...(goodConductIssuedOn !== undefined && { goodConductIssuedOn: goodConductIssuedOn || null }),
      ...(goodConductExpiresOn !== undefined && { goodConductExpiresOn: goodConductExpiresOn || null }),
      ...(tscNumber !== undefined && { tscNumber }),
      ...(identityVerifiedOn !== undefined && { identityVerifiedOn: identityVerifiedOn || null }),
      ...(referencesCheckedOn !== undefined && { referencesCheckedOn: referencesCheckedOn || null }),
      ...(referencesNote !== undefined && { referencesNote }),
      ...(notes !== undefined && { notes }),
      ...(status === 'Cleared' && { clearedByUserId: req.user.userId, clearedAt: new Date() }),
    })

    /**
     * Withdrawing clearance must take effect immediately. An educator who is
     * suspended or rejected loses every active assignment, and with it their
     * access to those learners' records and conversations.
     */
    if (wasCleared && !vetting.isCurrentlyCleared()) {
      const [ended] = await LearnerEducator.update(
        { isActive: false },
        { where: { educatorUserId: educator.id, isActive: true } }
      )
      await recordAudit(req, 'vetting_withdrawn', 'user', educator.id, { status, assignmentsEnded: ended })
    } else {
      await recordAudit(req, 'vetting_updated', 'user', educator.id, { status })
    }

    res.json({ success: true, data: vetting })
  } catch (error) {
    console.error('Failed to update vetting:', error)
    res.status(500).json({ success: false, error: 'Failed to update vetting' })
  }
})

module.exports = router
