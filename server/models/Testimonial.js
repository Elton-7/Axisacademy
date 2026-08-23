const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'Parent'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
    defaultValue: 5
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'testimonials',
  timestamps: true
})

module.exports = Testimonial
