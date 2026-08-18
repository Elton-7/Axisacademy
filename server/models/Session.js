const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * One teaching session (brief §28 timetable and attendance, §29 marking).
 *
 * Timetable and attendance are the same record at different points in its life
 * rather than two tables: a session is scheduled, then it happens or it does
 * not. Keeping them together means a parent's attendance percentage and their
 * timetable can never disagree with each other.
 */
const Session = sequelize.define('Session', {
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
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'scheduled_for',
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    field: 'duration_minutes',
  },
  deliveryMode: {
    type: DataTypes.ENUM('online', 'home-based', 'centre-based'),
    allowNull: true,
    field: 'delivery_mode',
  },
  /**
   * 'Scheduled' means the session has not been marked yet. Attendance
   * percentages count only sessions that have reached an outcome, so an
   * upcoming session never drags a learner's figure down.
   */
  status: {
    type: DataTypes.ENUM('Scheduled', 'Attended', 'Missed', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Scheduled',
  },
  topicsCovered: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'topics_covered',
  },
  lessonNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'lesson_notes',
    comment: 'The educator’s record of the session. Visible to the parent.',
  },
  /**
   * Brief §29 — educators can flag a concern. Held separately from lesson notes
   * because a concern is for Axis to act on and is not shown to the parent
   * until a member of staff has reviewed it.
   */
  concernFlagged: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'concern_flagged',
  },
  concernNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'concern_note',
  },
  /**
   * Home-based safeguarding (brief §38).
   *
   * An adult alone with a child in a private home is the highest-risk part of
   * the service and the brief does not address it. A home-based session cannot
   * be marked attended without a check-in, a check-out and confirmation that a
   * responsible adult was present — so the record exists at the time, not
   * reconstructed afterwards.
   */
  checkInAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_in_at',
  },
  checkOutAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_out_at',
  },
  adultPresent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'adult_present',
    comment: 'A responsible adult was present for a home-based session.',
  },
  markedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'marked_at',
  },
  markedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'marked_by_user_id',
  },
}, {
  tableName: 'sessions',
  timestamps: true,
  indexes: [
    { fields: ['learner_id', 'scheduled_for'] },
    { fields: ['educator_user_id', 'scheduled_for'] },
  ],
})

module.exports = Session
