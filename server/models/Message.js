const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * Two-way conversation about a learner (brief §28 communication).
 *
 * Distinct from PortalMessage, which is a one-way announcement with no sender
 * and no body — the brief lists announcements and communication separately, and
 * they behave differently.
 *
 * Threads are scoped to a learner rather than to a pair of people. That is what
 * makes "parent and educator where appropriate" workable: the appropriateness
 * comes from the educator being assigned to that learner, so access follows the
 * assignment and ends with it.
 */
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  learnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'learner_id',
  },
  senderUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sender_user_id',
  },
  /**
   * Stored rather than looked up, so the thread still reads correctly after
   * someone's role changes or their account is closed.
   */
  senderRole: {
    type: DataTypes.ENUM('student', 'tutor', 'staff', 'admin'),
    allowNull: false,
    field: 'sender_role',
  },
  senderName: {
    type: DataTypes.STRING(120),
    allowNull: false,
    field: 'sender_name',
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [{ fields: ['learner_id', 'createdAt'] }],
})

module.exports = Message
