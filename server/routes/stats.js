const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const Contact = require('../models/Contact')
const Enrollment = require('../models/Enrollment')
const Service = require('../models/Service')
const Testimonial = require('../models/Testimonial')

// Get dashboard statistics
router.get('/dashboard', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const totalInquiries = await Contact.count()
    const newInquiries = await Contact.count({ where: { status: 'new' } })
    const respondedInquiries = await Contact.count({
      where: { status: ['read', 'replied'] },
    })
    const enrollments = await Enrollment.count()
    const totalServices = await Service.count()
    const activeTestimonials = await Testimonial.count({ where: { isActive: true } })

    res.json({
      success: true,
      data: {
        totalInquiries,
        newInquiries,
        respondedInquiries,
        enrollments,
        totalServices,
        activeTestimonials,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' })
  }
})

module.exports = router
