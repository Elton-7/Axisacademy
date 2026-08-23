'use strict'

const { Op } = require('sequelize')

/**
 * Gives each coordinator a sentence saying what they are responsible for.
 *
 * The team cards had a name, a job title and a category chip and nothing else,
 * because every descriptive field on the record was empty. A parent reading
 * "CBC Junior Secondary Coordinator" has to already know what that means.
 *
 * Each line below is drawn from the coordinator's own job title and nothing
 * else. No qualification, institution or length of service is stated for
 * anyone, because none of that has been supplied and inventing it on a page
 * that families use to judge whether to trust Axis with a child would be
 * indefensible. Axis should review the wording, and can edit any of it from
 * the CMS.
 *
 * Only empty biographies are filled, so anything Axis has already written is
 * left alone, and the down migration removes only the exact text it added.
 *
 * This repairs databases that were seeded before the text existed. A database
 * created from scratch never needs it, because migrations run before seeding
 * and the table is still empty at that point — the seeder writes the same text
 * itself, from the same file.
 */
const { COORDINATOR_BIOS: RESPONSIBILITIES } = require('../content/coordinatorBios')

module.exports = {
  async up(queryInterface) {
    for (const [name, biography] of Object.entries(RESPONSIBILITIES)) {
      await queryInterface.bulkUpdate(
        'educators',
        { biography, updatedAt: new Date() },
        {
          name,
          [Op.or]: [{ biography: null }, { biography: '' }],
        }
      )
    }
  },

  async down(queryInterface) {
    for (const [name, biography] of Object.entries(RESPONSIBILITIES)) {
      await queryInterface.bulkUpdate('educators', { biography: null, updatedAt: new Date() }, { name, biography })
    }
  },
}
