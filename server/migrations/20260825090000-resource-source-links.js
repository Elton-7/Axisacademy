'use strict'

// The runner passes the sequelize instance as the second argument, not the
// Sequelize class, so DataTypes is required directly rather than read off it.
const { DataTypes } = require('sequelize')

/**
 * Lets a resource point at where it actually lives.
 *
 * The table was built for articles Axis writes: a title, a body, an author.
 * The collection Axis has supplied is mostly other people's work — academic
 * papers, an institutional brochure, a commercially published book — and Axis
 * is not free to host most of it.
 *
 * Two fields, and the difference between them matters legally:
 *
 * `sourceUrl` is where the work is published by whoever owns it. Linking to it
 * is always safe and is the default.
 *
 * `fileUrl` is a copy Axis serves itself. It is only ever set for something
 * Axis has the right to redistribute — its own writing, an open-licence paper,
 * or a brochure a publisher supplies for that purpose. Nothing is put here on
 * the assumption that it is probably fine.
 *
 * A resource may have neither yet, in which case the title is listed but is
 * not a link. That is deliberate: a title with nothing behind it is honest,
 * where a dead link or an unlicensed copy is not.
 */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('resources')

    if (!table.sourceUrl) {
      await queryInterface.addColumn('resources', 'sourceUrl', {
        type: DataTypes.STRING(2048),
        allowNull: true,
      })
    }

    if (!table.fileUrl) {
      await queryInterface.addColumn('resources', 'fileUrl', {
        type: DataTypes.STRING(2048),
        allowNull: true,
      })
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('resources')
    if (table.sourceUrl) await queryInterface.removeColumn('resources', 'sourceUrl')
    if (table.fileUrl) await queryInterface.removeColumn('resources', 'fileUrl')
  },
}
