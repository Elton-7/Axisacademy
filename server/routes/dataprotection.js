const express = require('express')
const router = express.Router()

const { Op } = require('sequelize')
const {
  sequelize, Learner, Session, Assessment, Message, MessageRead,
  LearnerEducator, Enrollment, Contact, AuditLog, User,
} = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { validateIntegerParam } = require('../middleware/validateUuidParam')

const { recordAudit } = require('../middleware/audit')

// These identifiers are auto-increment integers. Passing anything else to
// findByPk sends the value to Postgres, which refuses to compare an integer
// column with a string and throws — reported as a 500, which says the server
// failed when the request was simply malformed.
router.param('id', validateIntegerParam)

/**
 * Data protection (brief §38, and the Kenyan Data Protection Act 2019).
 *
 * Axis holds personal data about children, which makes it a data controller
 * with obligations that software has to support: telling a family what is held,
 * deleting it on request, and not keeping it indefinitely.
 *
 * What this file does NOT do, and cannot:
 *   - register Guraxis Limited with the Office of the Data Protection
 *     Commissioner. That is a filing Axis must make.
 *   - decide the retention periods. The values below are a starting point for
 *     Axis to confirm, not legal advice.
 *
 * Everything here is staff-only and every action is written to the audit log,
 * because erasing a learner's record is itself something that must be
 * accountable.
 */

const staffOnly = [requireAuth, requireRole('admin', 'staff')]

/**
 * Erasure is administrator-only, and says so plainly.
 *
 * It used to sit behind the same gate as reading a record, which put the most
 * destructive action in the file behind a weaker check than applying the
 * retention schedule — where nothing individual is even chosen. Deleting one
 * family's entire history has no undo, so it takes the stronger gate.
 *
 * The generic role refusal would leave a staff member guessing at a screen
 * that offered them the button, so this names the reason.
 */
const adminOnlyErasure = [
  requireAuth,
  (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only an administrator can erase a learner’s records. Ask an administrator to action this request.',
      })
    }
    next()
  },
]

/**
 * Retention schedule. These are defaults for Axis to confirm with its own
 * advice; the platform enforces whatever is set here rather than leaving
 * "we delete old data" as an unbacked sentence in a privacy policy.
 */
const RETENTION = {
  // An enquiry that never became a learner.
  unconvertedEnquiryDays: Number(process.env.RETENTION_ENQUIRY_DAYS) || 730,
  // A general website message.
  contactMessageDays: Number(process.env.RETENTION_CONTACT_DAYS) || 365,
  // Audit entries are kept longer: they are the record of who did what.
  auditLogDays: Number(process.env.RETENTION_AUDIT_DAYS) || 2555,
}

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000)

/**
 * Everything held about one learner, assembled for a subject access request.
 * Read-only, and it deliberately includes the audit trail so a family can see
 * who has looked at or changed their child's record.
 */
router.get('/learners/:id/export', ...staffOnly, async (req, res) => {
  try {
    const learner = await Learner.findByPk(req.params.id, {
      include: [{ model: User, as: 'parent', attributes: ['id', 'name', 'email'] }],
    })
    if (!learner) return res.status(404).json({ success: false, error: 'Learner not found' })

    const [sessions, assessments, messages, assignments, audit] = await Promise.all([
      Session.findAll({ where: { learnerId: learner.id }, order: [['scheduledFor', 'ASC']] }),
      Assessment.findAll({ where: { learnerId: learner.id }, order: [['assessedOn', 'ASC']] }),
      Message.findAll({ where: { learnerId: learner.id }, order: [['createdAt', 'ASC']] }),
      LearnerEducator.findAll({
        where: { learnerId: learner.id },
        include: [{ model: User, as: 'educator', attributes: ['id', 'name'] }],
      }),
      AuditLog.findAll({
        where: { entity: 'learner', entityId: learner.id },
        order: [['createdAt', 'ASC']],
        limit: 500,
      }),
    ])

    await recordAudit(req, 'data_exported', 'learner', learner.id, { requestedBy: req.user.userId })

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        controller: 'Guraxis Limited / Axis Learning',
        learner,
        sessions,
        assessments,
        messages,
        assignments,
        auditTrail: audit,
      },
    })
  } catch (error) {
    console.error('Failed to export learner data:', error)
    res.status(500).json({ success: false, error: 'Failed to export learner data' })
  }
})

/**
 * Erasure request. Runs in a transaction so a family is never left half
 * deleted, and requires the learner's name to be typed back — this removes a
 * child's entire history and there is no undo.
 *
 * The audit entries are kept: they record that an erasure happened and who
 * performed it, which is itself an accountability obligation. They reference
 * the learner by id only, and the record they pointed to no longer exists.
 */
router.delete('/learners/:id', ...adminOnlyErasure, async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const learner = await Learner.findByPk(req.params.id, { transaction: t })
    if (!learner) {
      await t.rollback()
      return res.status(404).json({ success: false, error: 'Learner not found' })
    }

    if (String(req.body.confirmName || '').trim() !== learner.name) {
      await t.rollback()
      return res.status(400).json({
        success: false,
        error: 'Type the learner’s name exactly to confirm erasure. This cannot be undone.',
      })
    }

    const removed = {
      messages: await Message.destroy({ where: { learnerId: learner.id }, transaction: t }),
      messageReads: await MessageRead.destroy({ where: { learnerId: learner.id }, transaction: t }),
      assessments: await Assessment.destroy({ where: { learnerId: learner.id }, transaction: t }),
      sessions: await Session.destroy({ where: { learnerId: learner.id }, transaction: t }),
      assignments: await LearnerEducator.destroy({ where: { learnerId: learner.id }, transaction: t }),
    }
    const name = learner.name
    await learner.destroy({ transaction: t })
    await t.commit()

    await recordAudit(req, 'data_erased', 'learner', Number(req.params.id), { name, removed })
    res.json({ success: true, message: `All records for ${name} have been erased.`, data: removed })
  } catch (error) {
    await t.rollback()
    console.error('Failed to erase learner data:', error)
    res.status(500).json({ success: false, error: 'Failed to erase learner data' })
  }
})

/**
 * What is currently past its retention period. Reporting is separate from
 * deleting on purpose: staff see what would go before anything goes.
 */
router.get('/retention', ...staffOnly, async (req, res) => {
  try {
    const [enquiries, contacts, audit] = await Promise.all([
      Enrollment.count({
        where: {
          createdAt: { [Op.lt]: daysAgo(RETENTION.unconvertedEnquiryDays) },
          pipelineStage: { [Op.notIn]: ['Enrolled', 'Active Learner'] },
        },
      }),
      Contact.count({ where: { createdAt: { [Op.lt]: daysAgo(RETENTION.contactMessageDays) } } }),
      AuditLog.count({ where: { createdAt: { [Op.lt]: daysAgo(RETENTION.auditLogDays) } } }),
    ])

    res.json({
      success: true,
      data: {
        policy: RETENTION,
        dueForDeletion: { unconvertedEnquiries: enquiries, contactMessages: contacts, auditEntries: audit },
        note: 'Retention periods are defaults for Axis to confirm. Nothing is deleted until it is run.',
      },
    })
  } catch (error) {
    console.error('Failed to build the retention report:', error)
    res.status(500).json({ success: false, error: 'Failed to build the retention report' })
  }
})

/** Applies the retention schedule. Admin only — staff can look, not purge. */
router.post('/retention/apply', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const removed = {
      unconvertedEnquiries: await Enrollment.destroy({
        where: {
          createdAt: { [Op.lt]: daysAgo(RETENTION.unconvertedEnquiryDays) },
          pipelineStage: { [Op.notIn]: ['Enrolled', 'Active Learner'] },
        },
      }),
      contactMessages: await Contact.destroy({
        where: { createdAt: { [Op.lt]: daysAgo(RETENTION.contactMessageDays) } },
      }),
    }
    await recordAudit(req, 'retention_applied', 'system', null, removed)
    res.json({ success: true, data: removed })
  } catch (error) {
    console.error('Failed to apply retention:', error)
    res.status(500).json({ success: false, error: 'Failed to apply retention' })
  }
})

module.exports = router
