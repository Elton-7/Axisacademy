const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const FAQ = sequelize.define(
  'FAQ',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { len: [5, 500] },
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { len: [10, 5000] },
    },
    category: {
      type: DataTypes.ENUM(
        'General',
        'Programmes & Curricula',
        'Enrollment',
        'Special Needs',
        'Languages',
        'Locations',
        'Fees & Payments',
        'Educators',
        'Portals & Learning',
        'Technical'
      ),
      defaultValue: 'General',
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'faqs',
    timestamps: true,
  }
)

module.exports = FAQ
