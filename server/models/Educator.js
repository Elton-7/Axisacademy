const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Educator = sequelize.define(
  'Educator',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [2, 255] },
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [3, 255] },
    },
    category: {
      type: DataTypes.ENUM('Leadership', 'Education Consultant', 'Teacher', 'Tutor', 'Language Educator', 'Specialist Educator', 'Coach', 'Artist', 'Administrator'),
      allowNull: false,
      defaultValue: 'Tutor',
    },
    qualifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subjects: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    languages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    expertise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
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
    tableName: 'educators',
    timestamps: true,
  }
)

module.exports = Educator
