'use strict'

/**
 * Widens `enrollments.ageGroup` from a three-value enum to free text.
 *
 * The column allowed only 'child', 'teenager' and 'adult', which put a
 * two-year-old and an eleven-year-old in the same box and told Axis almost
 * nothing about who an enquiry was for. Axis works to eight bands, from
 * infants to adults.
 *
 * Text rather than a wider enum, deliberately: the bands are Axis's own
 * classification and will change as the organisation does. An enum would make
 * every future change another migration against a live table.
 *
 * Existing enquiries are mapped onto the nearest new band rather than dropped.
 * The mapping is necessarily approximate — 'child' covered 0 to 12 — so each
 * one lands on the band that cannot overstate the learner's age, and the
 * learnerAge column still holds the real figure where a parent gave one.
 */
const FROM_LEGACY = {
  child: '6-8',
  teenager: '12-14',
  adult: '25+',
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // Postgres will not cast an enum to varchar implicitly, so the type change
    // is spelled out with an explicit USING clause.
    await queryInterface.sequelize.query(
      'ALTER TABLE "enrollments" ALTER COLUMN "ageGroup" TYPE VARCHAR(32) USING "ageGroup"::text'
    )

    for (const [legacy, band] of Object.entries(FROM_LEGACY)) {
      await queryInterface.bulkUpdate('enrollments', { ageGroup: band }, { ageGroup: legacy })
    }

    // The old enum type lingers once nothing references it.
    await queryInterface.sequelize
      .query('DROP TYPE IF EXISTS "enum_enrollments_ageGroup"')
      .catch(() => {})
  },

  async down(queryInterface) {
    // Reversing collapses eight bands into three; the mapping cannot be exact.
    const toLegacy = [
      ['child', ['0-2', '3-5', '6-8', '9-11']],
      ['teenager', ['12-14', '15-17']],
      ['adult', ['18-24', '25+']],
    ]
    const { Op } = require('sequelize')
    for (const [legacy, bands] of toLegacy) {
      await queryInterface.bulkUpdate('enrollments', { ageGroup: legacy }, { ageGroup: { [Op.in]: bands } })
    }
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_enrollments_ageGroup" AS ENUM ('child','teenager','adult')`
    )
    await queryInterface.sequelize.query(
      'ALTER TABLE "enrollments" ALTER COLUMN "ageGroup" TYPE "enum_enrollments_ageGroup" USING "ageGroup"::"enum_enrollments_ageGroup"'
    )
  },
}
