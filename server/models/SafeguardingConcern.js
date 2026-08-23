const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * A safeguarding concern (brief §38).
 *
 * Deliberately separate from the learner message thread. A parent or educator
 * raising a concern about a child's safety should not have to post it into a
 * conversation that the person they may be concerned about can read — so these
 * are visible only to Axis staff, never to educators, and never to the parent
 * of another learner.
 *
 * Every concern is acknowledged and resolved explicitly rather than being left
 * to fall off the end of an inbox.
 */
const SafeguardingConcern = sequelize.define('SafeguardingConcern', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  learnerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'learner_id',
    comment: 'Null where the concern is not about a specific learner.',
  },
  raisedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'raised_by_user_id',
  },
  raisedByRole: {
    type: DataTypes.ENUM('student', 'tutor', 'staff', 'admin'),
    allowNull: false,
    field: 'raised_by_role',
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'session_id',
    comment: 'The session it relates to, where there is one.',
  },
  category: {
    type: DataTypes.ENUM(
      'Conduct of an educator',
      'Learner wellbeing',
      'Safety of the setting',
      'Communication',
      'Other'
    ),
    allowNull: false,
    defaultValue: 'Other',
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Open', 'Acknowledged', 'Under review', 'Resolved', 'Escalated'),
    allowNull: false,
    defaultValue: 'Open',
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'acknowledged_at',
  },
  acknowledgedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'acknowledged_by_user_id',
  },
  /** What Axis did about it — required before a concern can be resolved. */
  outcome: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at',
  },
}, {
  tableName: 'safeguarding_concerns',
  timestamps: true,
  indexes: [{ fields: ['status'] }, { fields: ['learner_id'] }],
})

module.exports = SafeguardingConcern
