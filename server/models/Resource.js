const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const { RESOURCE_CATEGORIES } = require('../content/resourceCategories')

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
      // Optional: a resource Axis links to rather than wrote has no body, and
      // pasting someone else's paper in here would be republishing it.
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      // Subjects, not article shapes. Nobody searches for "a parent guide";
      // they search for "CBC homeschooling". See content/resourceCategories.js.
      // Text with a validator, not an enum. Axis adds categories as the
      // section grows — the review says "Cambridge, Montessori, CBC, SNE,
      // Homeschooling, Languages, Current Affairs, etc." — and every enum
      // change is a migration against a live table. It also stops sync() from
      // trying to rebuild the type on each boot, which is what took the API
      // down when the column became text.
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: 'Parenting & Learning',
      validate: {
        isIn: {
          args: [RESOURCE_CATEGORIES],
          msg: `Category must be one of: ${RESOURCE_CATEGORIES.join(', ')}`,
        },
      },
    },
    status: {
      // A draft is not the same thing as a withdrawn article, and Axis asked
      // for both. The public endpoints require Published.
      type: DataTypes.ENUM('Draft', 'Published'),
      allowNull: false,
      defaultValue: 'Draft',
    },
    metaDescription: {
      // Written for a search result rather than for someone scanning the list.
      // Falls back to the excerpt where Axis has not written one.
      type: DataTypes.STRING(320),
      allowNull: true,
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
    /**
     * Where the work is published by whoever owns it. Linking here is always
     * safe, and is the default for anything Axis did not write.
     */
    sourceUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    /**
     * A copy Axis serves itself. Set this only for something Axis has the
     * right to redistribute — its own writing, an open-licence paper, or a
     * brochure supplied for the purpose. Never on the assumption that it is
     * probably fine.
     */
    fileUrl: {
      type: DataTypes.STRING(2048),
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
