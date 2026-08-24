const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { body } = require('express-validator')
const { handleValidation } = require('../middleware/validate')
const { User, LearnerEducator, Learner } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')

/**
 * Matches the cost used for the seeded accounts and the deployment hashes.
 * These were 10 while everything else was 12, so a password changed through
 * the app was hashed more weakly than the one it replaced.
 */
const BCRYPT_COST = 12

/**
 * Account administration (brief §28, §29, §30).
 *
 * Without this the portals cannot be used at all: a parent account has to exist
 * before a learner can be linked to it, and an educator account before anyone
 * can be vetted or assigned. Previously the only accounts were the three seeded
 * from environment variables.
 *
 * Creating and changing accounts is admin-only. Staff can read the list,
 * because they need to pick a parent or an educator, but cannot grant anyone a
 * role — that is the difference between managing learners and managing access.
 */

const SAFE_FIELDS = ['id', 'name', 'email', 'role', 'isActive', 'mustChangePassword', 'lastLoginAt', 'createdAt']

/**
 * A temporary password that can be read aloud over the phone without ambiguity:
 * no O/0, no l/1. It is shown to the administrator once and never stored in
 * plain form.
 */
function temporaryPassword() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.randomBytes(14)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

router.get('/', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const { role } = req.query
    const users = await User.findAll({
      ...(role ? { where: { role } } : {}),
      attributes: SAFE_FIELDS,
      order: [['name', 'ASC']],
      limit: 500,
    })
    res.json({ success: true, data: users })
  } catch (error) {
    console.error('Failed to list accounts:', error)
    res.status(500).json({ success: false, error: 'Failed to list accounts' })
  }
})

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('A name is required').isLength({ max: 100 }),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('role').isIn(['admin', 'staff', 'tutor', 'student']).withMessage('Choose a valid role'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, email, role } = req.body
      const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } })
      if (existing) {
        return res.status(409).json({ success: false, error: 'An account with that email already exists' })
      }

      const password = temporaryPassword()
      const user = await User.create({
        name: name.trim(),
        email,
        role,
        passwordHash: await bcrypt.hash(password, BCRYPT_COST),
        mustChangePassword: true,
      })

      await recordAudit(req, 'account_created', 'user', user.id, { role })

      res.status(201).json({
        success: true,
        data: {
          id: user.id, name: user.name, email: user.email, role: user.role,
          // Returned once, so it can be passed to the person. It is not stored
          // anywhere in readable form and cannot be retrieved again.
          temporaryPassword: password,
        },
      })
    } catch (error) {
      console.error('Failed to create account:', error)
      res.status(500).json({ success: false, error: 'Failed to create account' })
    }
  }
)

router.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'Account not found' })

    const { name, role, isActive } = req.body

    // An administrator cannot remove their own access and lock everyone out.
    if (user.id === req.user.userId && (isActive === false || (role && role !== 'admin'))) {
      return res.status(400).json({
        success: false,
        error: 'You cannot disable or demote your own administrator account',
      })
    }
    if (role !== undefined && !['admin', 'staff', 'tutor', 'student'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Choose a valid role' })
    }

    const wasActive = user.isActive
    await user.update({
      ...(name !== undefined && { name: String(name).trim() }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    })

    /**
     * Disabling an educator ends their assignments, exactly as withdrawing
     * vetting does. Otherwise a disabled account would keep its foothold on a
     * learner's record the moment it were re-enabled.
     */
    let assignmentsEnded = 0
    if (wasActive && isActive === false && user.role === 'tutor') {
      const [count] = await LearnerEducator.update(
        { isActive: false },
        { where: { educatorUserId: user.id, isActive: true } }
      )
      assignmentsEnded = count
    }

    await recordAudit(req, 'account_updated', 'user', user.id, { role, isActive, assignmentsEnded })
    res.json({ success: true, data: { id: user.id, name: user.name, role: user.role, isActive: user.isActive, assignmentsEnded } })
  } catch (error) {
    console.error('Failed to update account:', error)
    res.status(500).json({ success: false, error: 'Failed to update account' })
  }
})

router.post('/:id/reset-password', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ success: false, error: 'Account not found' })

    const password = temporaryPassword()
    await user.update({ passwordHash: await bcrypt.hash(password, BCRYPT_COST), mustChangePassword: true })
    await recordAudit(req, 'password_reset', 'user', user.id, {})

    res.json({ success: true, data: { temporaryPassword: password } })
  } catch (error) {
    console.error('Failed to reset password:', error)
    res.status(500).json({ success: false, error: 'Failed to reset password' })
  }
})

/** A parent's learners, so an administrator can see who an account belongs to. */
router.get('/:id/learners', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  try {
    const learners = await Learner.findAll({
      where: { parentUserId: req.params.id },
      attributes: ['id', 'name', 'programme', 'isActive'],
    })
    res.json({ success: true, data: learners })
  } catch (error) {
    console.error('Failed to list learners for account:', error)
    res.status(500).json({ success: false, error: 'Failed to list learners' })
  }
})

module.exports = router
