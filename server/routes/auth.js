const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { handleValidation } = require('../middleware/validate')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { authLimiter } = require('../middleware/rateLimiter')
const User = require('../models/User')
const { requireAuth } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')
const crypto = require('node:crypto')
const { sendPasswordReset } = require('../services/notifications')

/** Long enough to find the email, short enough that a stale link is useless. */
const RESET_TOKEN_MINUTES = 60

/** Only ever the hash is stored, so this is how a link is recognised again. */
const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex')

/**
 * Matches the cost used for the seeded accounts and the deployment hashes.
 * These were 10 while everything else was 12, so a password changed through
 * the app was hashed more weakly than the one it replaced.
 */
/**
 * Cost 12, verified with the native binding.
 *
 * The library was bcryptjs — pure JavaScript with no native binding. Each
 * verification cost 311ms on one thread, and because that work never leaves
 * the JS thread, concurrency bought nothing: one login a request or twenty at
 * once, throughput sat at roughly three per second on any hardware.
 *
 * Native bcrypt runs in libuv's thread pool, so verifications go genuinely
 * parallel across cores — measured at 13.3/second here against 3.1 before, and
 * it now scales with the size of the instance rather than ignoring it.
 *
 * The hashes are the same $2b$ format, so every existing password kept working
 * without a reset; that was checked in both directions before the swap.
 *
 * The cost stays at 12. It is the reason a stolen hash is expensive to crack,
 * and lowering it to buy speed would trade a security property for throughput
 * that a bigger instance provides anyway.
 */
/*
 * Twelve in production, and only lowered where a suite creates dozens of
 * accounts. Each cost-12 hash is deliberate work — that is the point of it —
 * so a test run that stands up sixty users pays real seconds for security it
 * is not testing, and the suite times out on its own thoroughness rather than
 * on a defect. The default is what ships; nothing but the tests sets this.
 */
const BCRYPT_COST = Number(process.env.BCRYPT_COST) || 12

const MAX_EMAIL_ATTEMPTS = 5
const EMAIL_TRACK_WINDOW_MS = 30 * 60 * 1000 // 30 minutes
const EMAIL_LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const MAX_IP_ATTEMPTS = 20
const IP_TRACK_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const IP_BLOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

const emailAttempts = new Map()
const ipAttempts = new Map()

function now() {
  return Date.now()
}

function cleanExpiredAttempts(attemptsMap) {
  for (const [key, entry] of attemptsMap.entries()) {
    if (entry.blockUntil && entry.blockUntil <= now()) {
      attemptsMap.delete(key)
      continue
    }
    entry.attempts = entry.attempts.filter((timestamp) => timestamp > now() - (entry.windowMs || 0))
    if (entry.attempts.length === 0 && !entry.blockUntil) {
      attemptsMap.delete(key)
    }
  }
}

function getAttemptEntry(map, key, windowMs) {
  cleanExpiredAttempts(map)
  if (!map.has(key)) {
    map.set(key, { attempts: [], windowMs })
  }
  return map.get(key)
}

function recordFailedLogin(email, ip) {
  const emailEntry = getAttemptEntry(emailAttempts, email, EMAIL_TRACK_WINDOW_MS)
  emailEntry.attempts.push(now())

  const ipEntry = getAttemptEntry(ipAttempts, ip, IP_TRACK_WINDOW_MS)
  ipEntry.attempts.push(now())

  if (emailEntry.attempts.length >= MAX_EMAIL_ATTEMPTS) {
    emailEntry.blockUntil = now() + EMAIL_LOCK_DURATION_MS
  }

  if (ipEntry.attempts.length >= MAX_IP_ATTEMPTS) {
    ipEntry.blockUntil = now() + IP_BLOCK_DURATION_MS
  }
}

function clearLoginAttempts(email, ip) {
  emailAttempts.delete(email)
  ipAttempts.delete(ip)
}

function getLockInfo(entry) {
  if (!entry || !entry.blockUntil) return null
  const remaining = Math.max(0, entry.blockUntil - now())
  return { blockUntil: entry.blockUntil, remaining }
}

function isEmailLocked(email) {
  const emailEntry = emailAttempts.get(email)
  return getLockInfo(emailEntry)
}

function isIpBlocked(ip) {
  const ipEntry = ipAttempts.get(ip)
  return getLockInfo(ipEntry)
}

// Login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req, res) => {
    const email = req.body.email.toLowerCase().trim()
    const { password } = req.body
    const user = await User.findOne({ where: { email } })

    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const emailLock = isEmailLocked(email)
    const ipBlock = isIpBlocked(ip)

    if (emailLock) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed login attempts for this email. Try again later.',
        lockout: { emailBlockedForMs: emailLock.remaining },
      })
    }

    if (ipBlock) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed login attempts from this IP. Try again later.',
        lockout: { ipBlockedForMs: ipBlock.remaining },
      })
    }

    const passwordMatches = user?.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : false

    if (!user || !passwordMatches) {
      recordFailedLogin(email, ip)
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    /**
     * A disabled account must not be able to sign in. Checked after the
     * password comparison so the response cannot be used to work out which
     * addresses have accounts.
     */
    if (!user.isActive) {
      recordFailedLogin(email, ip)
      return res.status(403).json({
        success: false,
        error: 'This account has been disabled. Contact Axis if you think that is a mistake.',
      })
    }

    clearLoginAttempts(email, ip)

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, error: 'Authentication is not configured' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    await user.update({ lastLoginAt: new Date() })

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        // Signals that this is a temporary password issued by an administrator.
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      },
    })
  }
)

/**
 * Changing your own password. Anyone signed in may do this, and it is how a
 * temporary password issued by an administrator gets replaced.
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (String(newPassword || '').length < 10) {
      return res.status(400).json({ success: false, error: 'Choose a password of at least 10 characters' })
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, error: 'The new password must be different' })
    }

    const user = await User.findByPk(req.user.userId)
    if (!user) return res.status(404).json({ success: false, error: 'Account not found' })

    const matches = await bcrypt.compare(String(currentPassword || ''), user.passwordHash)
    if (!matches) {
      return res.status(401).json({ success: false, error: 'Your current password is not correct' })
    }

    await user.update({
      passwordHash: await bcrypt.hash(newPassword, BCRYPT_COST),
      mustChangePassword: false,
    })
    await recordAudit(req, 'password_changed', 'user', user.id, {})

    res.json({ success: true, message: 'Your password has been changed.' })
  } catch (error) {
    console.error('Failed to change password:', error)
    res.status(500).json({ success: false, error: 'Failed to change password' })
  }
})

/**
 * Asking for a reset link.
 *
 * Always answers the same way, whether or not the address belongs to an
 * account. Anything else turns this into a way to ask the site which of a
 * list of email addresses belongs to an Axis family — which is worth more to
 * someone than it sounds, given who the families are.
 *
 * Rate limited with the same limiter as sign-in, because it sends mail on a
 * stranger's request and is otherwise a way to have Axis send someone
 * hundreds of emails.
 */
router.post(
  '/forgot-password',
  authLimiter,
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  handleValidation,
  async (req, res) => {
    const sameAnswer = {
      success: true,
      message: 'If that address has an account, a reset link is on its way.',
    }

    try {
      const user = await User.findOne({ where: { email: req.body.email } })

      // A disabled account gets nothing: an educator who has left should not
      // be able to let themselves back in.
      if (!user || !user.isActive) return res.json(sameAnswer)

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000)

      await user.update({
        // The hash, never the token. The emailed link is the only copy.
        resetTokenHash: hashToken(token),
        resetTokenExpiresAt: expiresAt,
      })

      const base = (process.env.SITE_URL || '').replace(/\/$/, '')
      await sendPasswordReset({
        to: user.email,
        name: user.name,
        resetUrl: `${base}/portal/reset?token=${token}`,
        minutesValid: RESET_TOKEN_MINUTES,
      })

      // Recorded without the token, so the audit trail cannot be used to
      // take over an account.
      await recordAudit(req, 'password_reset_requested', 'user', user.id, {})
      res.json(sameAnswer)
    } catch (error) {
      console.error('Failed to start a password reset:', error.message)
      // Still the same answer: an error here must not be distinguishable
      // from an address that has no account.
      res.json(sameAnswer)
    }
  }
)

/**
 * Using the link. Single use, and only while it is still valid.
 */
router.post(
  '/reset-password',
  authLimiter,
  body('token').isString().isLength({ min: 32 }).withMessage('That reset link is not valid'),
  handleValidation,
  async (req, res) => {
    try {
      const { token, newPassword } = req.body

      if (String(newPassword || '').length < 10) {
        return res.status(400).json({ success: false, error: 'Choose a password of at least 10 characters' })
      }

      // Looked up by hash, so the token itself never has to be compared.
      const user = await User.findOne({ where: { resetTokenHash: hashToken(String(token)) } })

      const expired = user && user.resetTokenExpiresAt && user.resetTokenExpiresAt.getTime() < Date.now()
      if (!user || !user.isActive || expired) {
        return res.status(400).json({
          success: false,
          error: 'That reset link has expired or has already been used. Please ask for a new one.',
        })
      }

      await user.update({
        passwordHash: await bcrypt.hash(newPassword, BCRYPT_COST),
        // Used once: clearing these is what stops the link working again.
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        // They have just chosen this one themselves.
        mustChangePassword: false,
      })
      await recordAudit(req, 'password_reset_completed', 'user', user.id, {})

      res.json({ success: true, message: 'Your password has been set. You can sign in with it now.' })
    } catch (error) {
      console.error('Failed to complete a password reset:', error.message)
      res.status(500).json({ success: false, error: 'Failed to reset the password' })
    }
  }
)

// Get current user (verify token)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' })
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, error: 'Authentication is not configured' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' })
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
})

module.exports = router
