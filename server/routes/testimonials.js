const express = require('express')
const router = express.Router()
const { Testimonial } = require('../models')
const testimonialController = require('../controllers/testimonialController')
const { requireAuth, requireRole, attachUserIfPresent } = require('../middleware/requireAuth')
const { validateIntegerParam } = require('../middleware/validateUuidParam')
const { text, enumField, intField, boolField, handleValidation } = require('../middleware/validate')

// Testimonials are keyed by an auto-increment integer, not a UUID.
router.param('id', validateIntegerParam)

const rules = (partial) => [
  text(Testimonial, 'text', { required: true, partial }),
  text(Testimonial, 'author', { required: true, partial }),
  text(Testimonial, 'role', { partial }),
  intField('rating'),
  boolField('consentConfirmed'),
  text(Testimonial, 'consentReference', { partial }),
  boolField('isActive'),
]

/**
 * Public. `attachUserIfPresent` rather than `requireAuth`: a visitor gets the
 * published, consented quotes, and staff get everything — including the ones
 * awaiting confirmation, which would otherwise be invisible to the only people
 * who can confirm them.
 */
router.get('/', attachUserIfPresent, testimonialController.getAllTestimonials)

router.post(
  '/',
  requireAuth,
  requireRole('admin', 'staff'),
  rules(false),
  handleValidation,
  testimonialController.createTestimonial
)

router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'staff'),
  rules(true),
  handleValidation,
  testimonialController.updateTestimonial
)

/**
 * Takes a quote off the site. Reachable by staff as well as admins: a parent
 * withdrawing consent should not have to wait for an administrator to be
 * available.
 */
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), testimonialController.deleteTestimonial)

module.exports = router
