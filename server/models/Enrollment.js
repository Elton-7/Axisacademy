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
