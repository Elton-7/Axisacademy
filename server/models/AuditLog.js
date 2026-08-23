const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entity: { type: DataTypes.STRING(50), allowNull: false },
  entityId: { type: DataTypes.INTEGER, allowNull: true, field: 'entity_id' },
  metadata: { type: DataTypes.JSONB, allowNull: true },
  ipAddress: { type: DataTypes.STRING(100), allowNull: true, field: 'ip_address' },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false,
})

module.exports = AuditLog
