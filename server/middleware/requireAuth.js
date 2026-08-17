const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  const secret = process.env.JWT_SECRET

  if (!secret) {
    return res.status(500).json({ success: false, error: 'Authentication is not configured' })
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  try {
    req.user = jwt.verify(token, secret)
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'You do not have permission to perform this action' })
  }
  next()
  }
}

module.exports = { requireAuth, requireRole }
