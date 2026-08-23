const express = require('express')
const router = express.Router()
const AuditLog = require('../models/AuditLog')
const User = require('../models/User')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100)
    const action = typeof req.query.action === 'string' ? req.query.action : ''
    const entity = typeof req.query.entity === 'string' ? req.query.entity : ''
    const where = {}
    if (action) where.action = action
    if (entity) where.entity = entity
    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    })
    const userIds = [...new Set(logs.map((log) => log.userId).filter(Boolean))]
    const users = userIds.length ? await User.findAll({ where: { id: userIds }, attributes: ['id', 'name', 'email'] }) : []
    const usersById = new Map(users.map((user) => [user.id, user]))
    res.json({
      success: true,
      data: logs.map((log) => ({
        ...log.toJSON(),
        user: log.userId ? usersById.get(log.userId) || null : null,
      })),
      total: count,
      page,
      limit,
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' })
  }
})

module.exports = router
