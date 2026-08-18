const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim())
    },
  },
    passwordHash: {
      type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'tutor', 'student', 'user'),
    allowNull: false,
    defaultValue: 'staff',
  },
}, {
  tableName: 'users',
  timestamps: true,
})

module.exports = User
