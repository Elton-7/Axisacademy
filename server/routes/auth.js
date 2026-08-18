const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { handleValidation } = require('../middleware/validate')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authLimiter } = require('../middleware/rateLimiter')
const User = require('../models/User')
const { requireAuth } = require('../middleware/requireAuth')
const { recordAudit } = require('../middleware/audit')

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
      passwordHash: await bcrypt.hash(newPassword, 10),
      mustChangePassword: false,
    })
    await recordAudit(req, 'password_changed', 'user', user.id, {})

    res.json({ success: true, message: 'Your password has been changed.' })
  } catch (error) {
    console.error('Failed to change password:', error)
    res.status(500).json({ success: false, error: 'Failed to change password' })
  }
})

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
