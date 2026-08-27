'use strict'

const { DataTypes } = require('sequelize')

/**
 * Records publication consent against each testimonial.
 *
 * The gallery has carried this since the brief was read: a photograph of a
 * child is only published once someone has confirmed consent, and the
 * confirmation names who did it, when, and which signed release it refers to.
 * Testimonials were the one published thing that skipped all of it, despite
 * quoting parents and children by name.
 *
 * `consent_confirmed` defaults to false, so anything already in the table stops
 * being served until someone confirms it. That is the safe direction: a quote
 * whose consent nobody can vouch for should not be on a public page, and the
 * admin screen makes confirming it a few seconds' work.
 *
 * Each column is added only if it is missing. Outside production `DB_SYNC`
 * defaults to `alter`, so `sync` reaches the table first and creates the
 * columns the model now declares — and this migration then failed on a
 * developer's machine with "column already exists" while working perfectly on
 * a production database, where sync never alters anything. Checking first
 * makes the migration mean "these columns exist afterwards" rather than "these
 * columns did not exist before".
 */
const COLUMNS = {
  consent_confirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Staff confirmation that publication consent has been verified for this testimonial.',
  },
  consent_confirmed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'User who confirmed publication consent.',
  },
  consent_confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When publication consent was confirmed.',
  },
  consent_reference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Reference to the signed consent held on file for this testimonial.',
  },
}

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.describeTable('testimonials')
    for (const [name, definition] of Object.entries(COLUMNS)) {
      if (!existing[name]) await queryInterface.addColumn('testimonials', name, definition)
    }
  },

  async down(queryInterface) {
    const existing = await queryInterface.describeTable('testimonials')
    for (const name of Object.keys(COLUMNS).reverse()) {
      if (existing[name]) await queryInterface.removeColumn('testimonials', name)
    }
  },
}
