const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * The learner at the centre of the platform (brief §28, §42).
 *
 * Enrollment records an enquiry; this records a learner who is actually with
 * Axis. They are kept apart deliberately: one family can enquire several times,
 * an enquiry may never convert, and a learner's details change over time
 * independently of whatever was typed into the original form.
 *
 * `parentUserId` is what makes the parent portal safe — every read is scoped to
 * it, so a parent can only ever reach their own learners.
 */
const Learner = sequelize.define('Learner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  parentUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'parent_user_id',
    comment: 'The parent or guardian account this learner belongs to.',
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'enrollment_id',
    comment: 'The enquiry this learner came from, where there was one.',
  },
  programme: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  curriculum: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  gradeClass: {
    type: DataTypes.STRING(80),
    allowNull: true,
    field: 'grade_class',
  },
  learningModel: {
    type: DataTypes.ENUM('online', 'home-based', 'centre-based', 'blended'),
    allowNull: true,
    field: 'learning_model',
  },
  /**
   * Support needs are held so educators can adapt teaching. This is sensitive
   * information about a child: it is never exposed on any public endpoint, and
   * only the parent, an assigned educator and Axis staff can read it.
   */
  supportNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'support_notes',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'learners',
  timestamps: true,
  indexes: [{ fields: ['parent_user_id'] }],
})

module.exports = Learner
