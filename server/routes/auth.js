const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authLimiter } = require('../middleware/rateLimiter')
const User = require('../models/User')

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
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

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

    clearLoginAttempts(email, ip)

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, error: 'Authentication is not configured' })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
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
