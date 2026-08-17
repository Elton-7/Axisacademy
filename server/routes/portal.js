const express = require('express')
const router = express.Router()
const Enrollment = require('../models/Enrollment')
const PortalSchedule = require('../models/PortalSchedule')
const PortalMessage = require('../models/PortalMessage')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

router.get('/overview', requireAuth, requireRole('student', 'tutor'), async (req, res) => {
  try {
    // Student records are limited to the authenticated account's email. Tutor-to-learner
    // assignment has not yet been modelled, so tutors must never receive all enrolments.
    const enrollments = req.user.role === 'student'
      ? await Enrollment.findAll({ where: { email: req.user.email }, order: [['createdAt', 'DESC']] })
      : []
    const [schedule, messages] = await Promise.all([
      PortalSchedule.findAll({ where: { role: req.user.role, userId: req.user.userId }, order: [['date', 'ASC']], limit: 10 }),
      PortalMessage.findAll({ where: { role: req.user.role, userId: req.user.userId }, order: [['createdAt', 'DESC']], limit: 10 }),
    ])

    res.json({
      success: true,
      data: {
        role: req.user.role,
        programmes: enrollments.map((enrollment) => ({
          id: enrollment.id,
          name: enrollment.programme || 'Learning programme',
          status: enrollment.status,
          ageGroup: enrollment.ageGroup,
          createdAt: enrollment.createdAt,
        })),
        learners: [],
        schedule: schedule.map((item) => ({ id: item.id, title: item.title, date: item.date })),
        messages: messages.map((item) => ({ id: item.id, subject: item.subject, preview: item.preview, createdAt: item.createdAt })),
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load portal data' })
  }
})

module.exports = router
