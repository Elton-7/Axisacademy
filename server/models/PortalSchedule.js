const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const PortalSchedule = sequelize.define('PortalSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: true, field: 'user_id' },
  role: { type: DataTypes.ENUM('student', 'tutor'), allowNull: false },
  title: { type: DataTypes.STRING(150), allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'portal_schedules',
  timestamps: true,
  indexes: [{ fields: ['user_id', 'role', 'date'] }],
})

module.exports = PortalSchedule
