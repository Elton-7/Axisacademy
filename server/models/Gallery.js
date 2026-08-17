const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Gallery = sequelize.define(
  'Gallery',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [2, 255] },
    },
    type: {
      type: DataTypes.ENUM('Photo', 'Video'),
      allowNull: false,
      defaultValue: 'Photo',
    },
    category: {
      type: DataTypes.ENUM('Event', 'Programme', 'Activity', 'General'),
      allowNull: false,
      defaultValue: 'General',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    consentConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Staff confirmation that publication consent has been verified for this media item.',
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
    tableName: 'gallery',
    timestamps: true,
  }
)

module.exports = Gallery
