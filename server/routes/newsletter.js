const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { newsletterLimiter } = require('../middleware/rateLimiter')
const Newsletter = require('../models/Newsletter')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

router.get('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const subscriptions = await Newsletter.findAll({ order: [['subscribedAt', 'DESC']] })
    res.json({
      success: true,
      data: subscriptions,
      total: subscriptions.length,
      page: 1,
      limit: subscriptions.length,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch subscribers' })
  }
})

// Newsletter subscription
router.post(
  '/subscribe',
  newsletterLimiter,
  [body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const email = req.body.email
      const [subscription] = await Newsletter.findOrCreate({
        where: { email },
        defaults: { email, isActive: true, subscribedAt: new Date() },
      })

      if (!subscription.isActive) {
        await subscription.update({ isActive: true, subscribedAt: new Date() })
      }

      res.json({
        success: true,
        data: subscription,
      })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Subscription failed' })
    }
  }
)

// Newsletter unsubscribe
router.post(
  '/unsubscribe',
  newsletterLimiter,
  [body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

  try {
    const subscription = await Newsletter.findOne({ where: { email: req.body.email } })
    if (subscription) {
      await subscription.update({ isActive: false })
    }
    res.json({ success: true, message: 'Unsubscribed successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unsubscribe failed' })
  }
  }
)

module.exports = router
