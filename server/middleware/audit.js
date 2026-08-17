const AuditLog = require('../models/AuditLog')

function recordAudit(req, action, entity, entityId, metadata = {}) {
  return AuditLog.create({
    userId: req.user?.userId || null,
    action,
    entity,
    entityId: entityId || null,
    metadata,
    ipAddress: req.ip || req.connection?.remoteAddress || null,
  }).catch((error) => console.error('Audit log error:', error))
}

module.exports = { recordAudit }