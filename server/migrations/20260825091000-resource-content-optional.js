'use strict'

const { DataTypes } = require('sequelize')

/**
 * Makes `resources.content` optional.
 *
 * The column was NOT NULL because the table was designed for articles Axis
 * writes, where a body is the whole point. Most of the collection Axis has
 * supplied is other people's work, listed by title and author and linked to
 * where its publisher hosts it. Those entries have no body, and must not:
 * pasting a copyrighted paper into a `content` column is republishing it,
 * which is exactly what linking out is meant to avoid.
 *
 * Axis's own articles still carry their text. Nothing that has a body loses it.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.changeColumn('resources', 'content', {
      type: DataTypes.TEXT,
      allowNull: true,
    })
  },

  async down(queryInterface) {
    // Anything linked rather than written has no body, so it needs one before
    // the column can be required again.
    await queryInterface.sequelize.query(
      `UPDATE "resources" SET "content" = '' WHERE "content" IS NULL`
    )
    await queryInterface.changeColumn('resources', 'content', {
      type: DataTypes.TEXT,
      allowNull: false,
    })
  },
}
