const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * Which educator teaches which learner, and for what (brief §29).
 *
 * This is the record the educator portal reads to decide what an educator may
 * see. The brief is explicit that educators must not automatically have access
 * to all learner or parent information, so an educator's every query is scoped
 * through this table rather than filtered in the UI.
 */
const LearnerEducator = sequelize.define('LearnerEducator', {
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
  educatorUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'educator_user_id',
    comment: 'The educator’s login account, not the public Educator profile.',
  },
  subject: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: 'Cleared when an assignment ends, which also ends the educator’s access.',
  },
}, {
  tableName: 'learner_educators',
  timestamps: true,
  indexes: [
    { fields: ['educator_user_id'] },
    { fields: ['learner_id'] },
    { unique: true, fields: ['learner_id', 'educator_user_id', 'subject'] },
  ],
})

module.exports = LearnerEducator
