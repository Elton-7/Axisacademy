const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * A recorded assessment and its result (brief §28 academic area, §29 recording).
 *
 * Score and maximum are stored rather than a percentage so that a result can be
 * shown the way the educator recorded it, and so a mark out of 20 is never
 * silently rounded into something that misrepresents the learner.
 */
const Assessment = sequelize.define('Assessment', {
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
    allowNull: true,
    field: 'educator_user_id',
  },
  subject: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Assignment', 'Test', 'Mock Examination', 'Observation', 'Progress Report'),
    allowNull: false,
    defaultValue: 'Assignment',
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Null for a qualitative record such as an observation.',
  },
  maxScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'max_score',
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'The educator’s comment, shown to the parent alongside the result.',
  },
  learningObjectives: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'learning_objectives',
  },
  assessedOn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'assessed_on',
  },
  /**
   * An educator records a result, but it is not shown to the parent until it is
   * released — so a draft or a mistaken entry is not visible to a family before
   * anyone has checked it.
   */
  isReleased: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_released',
  },
}, {
  tableName: 'assessments',
  timestamps: true,
  indexes: [{ fields: ['learner_id', 'assessed_on'] }],
})

module.exports = Assessment
