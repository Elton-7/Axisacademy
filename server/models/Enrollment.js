const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  /**
   * Optional because a consultation request often arrives before the family has
   * decided what to tell us about the learner — brief §13 is explicit that a
   * parent should be able to approach Axis without knowing what they need. The
   * full enquiry form still requires it at the route level.
   */
  studentName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  parentName: {
    type: DataTypes.STRING(100)
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  programme: {
    type: DataTypes.STRING(100)
  },
  ageGroup: {
    type: DataTypes.ENUM('child', 'teenager', 'adult')
  },
  learnerAge: {
    type: DataTypes.INTEGER
  },
  location: {
    type: DataTypes.STRING(120)
  },
  currentSchool: {
    type: DataTypes.STRING(160)
  },
  curriculum: {
    type: DataTypes.STRING(80)
  },
  gradeClass: {
    type: DataTypes.STRING(80)
  },
  subjects: {
    type: DataTypes.STRING(500)
  },
  learningNeeds: {
    type: DataTypes.TEXT
  },
  preferredLearningModel: {
    type: DataTypes.ENUM('online', 'home-based', 'centre-based', 'blended', 'not-sure')
  },
  preferredDays: {
    type: DataTypes.STRING(120)
  },
  preferredTimes: {
    type: DataTypes.STRING(120)
  },
  contactConsent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'waitlist'),
    defaultValue: 'pending'
  },
  /**
   * What the family actually asked for. Both land in the same pipeline — a
   * consultation is the start of the same journey — but they need answering
   * differently, and Axis needs to be able to tell them apart at a glance.
   */
  requestType: {
    type: DataTypes.ENUM('enquiry', 'consultation'),
    allowNull: false,
    defaultValue: 'enquiry',
    field: 'request_type'
  },
  /** How the family would prefer to be reached for the consultation itself. */
  preferredChannel: {
    type: DataTypes.ENUM('whatsapp', 'phone', 'email', 'in-person'),
    allowNull: true,
    field: 'preferred_channel'
  },
  /**
   * Brief §31 — the client journey, kept separate from `status`, which records
   * the admissions decision rather than where the family has reached.
   *
   * 'Lost' is not in the brief's list, but the stated purpose is to see where
   * potential clients are being lost, and that is unmeasurable without a
   * terminal negative stage: enquiries that go nowhere would otherwise sit in
   * an active stage forever and inflate every count above it.
   */
  pipelineStage: {
    type: DataTypes.ENUM(
      'New Enquiry',
      'Contacted',
      'Consultation Booked',
      'Consultation Completed',
      'Proposal Sent',
      'Awaiting Decision',
      'Enrolled',
      'Active Learner',
      'Lost'
    ),
    allowNull: false,
    defaultValue: 'New Enquiry'
  },
  stageChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the pipeline stage last moved, so time-in-stage can be reported.'
  },
  stageNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Why the enquiry moved to its current stage — especially why it was lost.'
  }
}, {
  tableName: 'enrollments',
  timestamps: true
})

module.exports = Enrollment
