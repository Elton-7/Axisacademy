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
  /**
   * Accounts are disabled rather than deleted. An educator who leaves still
   * appears on the sessions they taught and the messages they wrote, so
   * removing the row would tear holes in a learner's history — and that history
   * is exactly what safeguarding depends on.
   */
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
  /** Set when an administrator issues a temporary password. */
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'must_change_password',
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at',
  },
}, {
  tableName: 'users',
  timestamps: true,
})

module.exports = User
