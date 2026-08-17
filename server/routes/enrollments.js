const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const Enrollment = require('../models/Enrollment')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')

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

module.exports = router
