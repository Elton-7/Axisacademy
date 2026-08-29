'use strict'

const { DataTypes } = require('sequelize')

/**
 * Somewhere to keep a pending password reset.
 *
 * Two columns on the account rather than a table of tokens, because only one
 * reset may be outstanding at a time: asking for a second link invalidates the
 * first, which is the behaviour people expect and one fewer live token in the
 * world.
 *
 * What is stored is a SHA-256 of the token, never the token itself. The link
 * emailed to the person is the only copy. If this database were ever read by
 * someone who should not have it, they would hold a set of hashes that cannot
 * be turned back into working links — the same reasoning that applies to the
 * password column beside it.
 *
 * Added only if missing, because outside production DB_SYNC defaults to alter
 * and sync creates the model's columns before migrations run.
 */
const COLUMNS = {
  reset_token_hash: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'SHA-256 of the outstanding reset token. Never the token itself.',
  },
  reset_token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the outstanding reset link stops working.',
  },
}

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.describeTable('users')
    for (const [name, definition] of Object.entries(COLUMNS)) {
      if (!existing[name]) await queryInterface.addColumn('users', name, definition)
    }
  },

  async down(queryInterface) {
    const existing = await queryInterface.describeTable('users')
    for (const name of Object.keys(COLUMNS).reverse()) {
      if (existing[name]) await queryInterface.removeColumn('users', name)
    }
  },
}
