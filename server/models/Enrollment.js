const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentName: {
    type: DataTypes.STRING(100),
    allowNull: false
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
  }
}, {
  tableName: 'enrollments',
  timestamps: true
})

module.exports = Enrollment
