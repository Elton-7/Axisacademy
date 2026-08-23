const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  subject: {
    type: DataTypes.STRING(100),
    defaultValue: 'General Enquiry'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied', 'closed'),
    defaultValue: 'new'
  }
}, {
  tableName: 'contacts',
  timestamps: true
})

module.exports = Contact
