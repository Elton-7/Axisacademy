const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * How far each person has read in a learner's thread.
 *
 * A single readAt on the message itself cannot work here: a thread has a
 * parent, one or more educators and Axis staff in it, and "read" means
 * something different for each of them. Tracking a per-person high-water mark
 * keeps unread counts honest without a row per person per message.
 */
const MessageRead = sequelize.define('MessageRead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
  },
  learnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'learner_id',
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'last_read_at',
  },
}, {
  tableName: 'message_reads',
  timestamps: true,
  indexes: [{ unique: true, fields: ['user_id', 'learner_id'] }],
})

module.exports = MessageRead
