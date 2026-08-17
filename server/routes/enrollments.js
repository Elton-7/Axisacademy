const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const Enrollment = require('../models/Enrollment')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')
const { notifyNewEnquiry } = require('../services/notifications')

// Get all enrollments
router.get('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100)
    const offset = (page - 1) * limit
    const { count, rows: enrollments } = await Enrollment.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })
    res.json({
      success: true,
      data: enrollments,
      total: count,
      page,
      limit,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments' })
  }
})

// Create enrollment
router.post(
  '/',
  [
    body('studentName').trim().notEmpty().withMessage('Student name is required').isLength({ max: 100 }).withMessage('Student name is too long'),
    body('parentName').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Parent name is too long'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Phone is too long'),
    body('programme').trim().notEmpty().withMessage('Programme is required').isLength({ max: 100 }).withMessage('Programme is too long'),
    body('ageGroup').isIn(['child', 'teenager', 'adult']).withMessage('Age group is required'),
    body('learnerAge').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1, max: 100 }).withMessage('Learner age must be between 1 and 100').toInt(),
    body('location').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Location is too long'),
    body('currentSchool').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 160 }).withMessage('Current school is too long'),
    body('curriculum').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 80 }).withMessage('Curriculum is too long'),
    body('gradeClass').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 80 }).withMessage('Grade or class is too long'),
    body('subjects').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Subjects are too long'),
    body('learningNeeds').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Learning needs are too long'),
    body('preferredLearningModel').optional({ nullable: true, checkFalsy: true }).isIn(['online', 'home-based', 'centre-based', 'blended', 'not-sure']).withMessage('Invalid learning model'),
    body('preferredDays').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Preferred days are too long'),
    body('preferredTimes').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Preferred times are too long'),
    body('contactConsent').isBoolean().toBoolean().equals('true').withMessage('Please confirm that Axis may contact you about this enquiry'),
    body('notes').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Notes are too long'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const enrollment = await Enrollment.create(req.body)

      // Answer the parent immediately; alerting Axis must not be able to slow
      // that down or fail it. The enquiry is already saved either way.
      notifyNewEnquiry(enrollment).catch((error) =>
        console.error('Failed to notify of new enquiry:', error)
      )

      res.status(201).json({ success: true, data: enrollment })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create enrollment' })
    }
  }
)

// Get enrollment by ID
router.get('/:id', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id)
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' })
    }
    res.json({ success: true, data: enrollment })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch enrollment' })
  }
})

// Update enrollment status
router.patch('/:id/status', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { status } = req.body
    if (!['pending', 'approved', 'rejected', 'waitlist'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' })
    }

    const enrollment = await Enrollment.findByPk(req.params.id)
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' })
    }

    await enrollment.update({ status })
    await recordAudit(req, 'status_updated', 'enrollment', enrollment.id, { status })
    res.json({ success: true, data: enrollment })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update enrollment' })
  }
})

/** Brief §31 — the client journey, in the order the brief sets out. */
const PIPELINE_STAGES = [
  'New Enquiry',
  'Contacted',
  'Consultation Booked',
  'Consultation Completed',
  'Proposal Sent',
  'Awaiting Decision',
  'Enrolled',
  'Active Learner',
  'Lost',
]

router.patch('/:id/stage', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { pipelineStage, stageNote } = req.body

    if (!PIPELINE_STAGES.includes(pipelineStage)) {
      return res.status(400).json({ success: false, error: 'Invalid pipeline stage' })
    }

    const enrollment = await Enrollment.findByPk(req.params.id)
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Enrollment not found' })
    }

    const previousStage = enrollment.pipelineStage

    // Losing an enquiry is the one transition worth explaining, because the
    // reason is the whole point of tracking the pipeline.
    if (pipelineStage === 'Lost' && !String(stageNote || '').trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please record why this enquiry was lost',
      })
    }

    await enrollment.update({
      pipelineStage,
      stageChangedAt: new Date(),
      ...(stageNote !== undefined && { stageNote: stageNote ? String(stageNote).trim() : null }),
    })

    await recordAudit(req, 'stage_updated', 'enrollment', enrollment.id, {
      from: previousStage,
      to: pipelineStage,
    })

    res.json({ success: true, data: enrollment })
  } catch (error) {
    console.error('Failed to update pipeline stage:', error)
    res.status(500).json({ success: false, error: 'Failed to update pipeline stage' })
  }
})

/**
 * The funnel summary the brief asks for: how many enquiries sit at each stage,
 * so Axis can see where families stop progressing.
 */
router.get('/pipeline/summary', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const counts = await Enrollment.findAll({
      attributes: ['pipelineStage', [Enrollment.sequelize.fn('COUNT', '*'), 'count']],
      group: ['pipelineStage'],
      raw: true,
    })

    const byStage = Object.fromEntries(counts.map((row) => [row.pipelineStage, Number(row.count)]))
    const stages = PIPELINE_STAGES.map((stage) => ({ stage, count: byStage[stage] || 0 }))

    const active = stages
      .filter((entry) => entry.stage !== 'Lost')
      .reduce((total, entry) => total + entry.count, 0)
    const enrolled = (byStage['Enrolled'] || 0) + (byStage['Active Learner'] || 0)
    const lost = byStage['Lost'] || 0
    const decided = enrolled + lost

    res.json({
      success: true,
      data: {
        stages,
        totals: {
          active,
          enrolled,
          lost,
          // Of the enquiries that reached an outcome, how many enrolled.
          conversionRate: decided > 0 ? Math.round((enrolled / decided) * 100) : null,
        },
      },
    })
  } catch (error) {
    console.error('Failed to build pipeline summary:', error)
    res.status(500).json({ success: false, error: 'Failed to build pipeline summary' })
  }
})

module.exports = router
