const express = require('express')
const router = express.Router()
const testimonialController = require('../controllers/testimonialController')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

router.get('/', testimonialController.getAllTestimonials)
router.post('/', requireAuth, requireRole('admin', 'staff'), testimonialController.createTestimonial)

module.exports = router
