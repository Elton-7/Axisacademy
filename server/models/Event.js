const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Event = sequelize.define(
  'Event',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [3, 255] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'Holiday Tuition',
        'Exam Preparation',
        'Competition',
        'Workshop',
        'Cultural Event',
        'Sports Event',
        'Enrichment',
        'Other'
      ),
      allowNull: false,
      defaultValue: 'Other',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    venue: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ageGroup: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    programme: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    priceKES: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    registrationLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    poster: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    videos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    results: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recap: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled'),
      defaultValue: 'Upcoming',
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
    tableName: 'events',
    timestamps: true,
  }
)

module.exports = Event
