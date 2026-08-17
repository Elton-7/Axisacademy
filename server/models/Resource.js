const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Resource = sequelize.define(
  'Resource',
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('Learning Tips', 'Parent Guide', 'Programme Spotlight', 'Assessment', 'Academic Support', 'General'),
      allowNull: false,
      defaultValue: 'General',
    },
    author: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: 'Axis Learning Team',
    },
    coverImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    readTime: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'resources',
    timestamps: true,
  }
)

module.exports = Resource
