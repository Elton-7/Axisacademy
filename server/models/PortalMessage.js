const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PortalMessage = sequelize.define('PortalMessage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  role: { type: DataTypes.ENUM('student', 'tutor'), allowNull: false },
  subject: { type: DataTypes.STRING(150), allowNull: false },
  preview: { type: DataTypes.STRING(300), allowNull: false },
}, {
  tableName: 'portal_messages',
  timestamps: true,
  indexes: [{ fields: ['user_id', 'role', 'createdAt'] }],
})

module.exports = PortalMessage
