'use strict'

// DataTypes comes from the package: the runner hands migrations the
// sequelize *instance* as its second argument, not the Sequelize class, so
// Sequelize.ENUM is undefined there.
const { DataTypes } = require('sequelize')
const { RESOURCE_CATEGORIES, LEGACY_CATEGORY_BY_SLUG } = require('../content/resourceCategories')

/**
 * Rebuilds article categories around subjects, and adds a real draft state.
 *
 * Two changes, both needed before Axis can run this section themselves.
 *
 * Categories described the shape of an article — Learning Tips, Parent Guide,
 * Programme Spotlight — rather than its subject. Nobody searches for "a parent
 * guide"; they search for "CBC homeschooling", which is what Axis wants these
 * pieces found for. The six existing articles are remapped by subject.
 *
 * And there was no way to save a draft. `isActive` alone cannot tell an
 * unfinished piece from a deliberately withdrawn one, and Axis asked for both.
 * `status` now carries that, and the public endpoint requires Published, so a
 * half-written article cannot reach a reader by accident.
 *
 * `metaDescription` is separate from `excerpt` on purpose: the excerpt is
 * written for a human scanning the list, the meta description for a search
 * result, and the two want different lengths and phrasing. It falls back to
 * the excerpt when Axis has not written one.
 */
module.exports = {
  async up(queryInterface) {
    // Postgres cannot rewrite an enum in place, so the column becomes text,
    // is remapped, and is then constrained again.
    await queryInterface.sequelize.query(
      'ALTER TABLE "resources" ALTER COLUMN "category" TYPE VARCHAR(64) USING "category"::text'
    )
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_resources_category"').catch(() => {})

    for (const [slug, category] of Object.entries(LEGACY_CATEGORY_BY_SLUG)) {
      await queryInterface.bulkUpdate('resources', { category }, { slug })
    }
    // Anything Axis added since, or anything the map missed, gets a home
    // rather than being left holding a category that no longer exists.
    await queryInterface.sequelize.query(
      `UPDATE "resources" SET "category" = 'Parenting & Learning' WHERE "category" NOT IN (${RESOURCE_CATEGORIES.map(
        (c) => `'${c.replace(/'/g, "''")}'`
      ).join(', ')})`
    )

    // The column keeps the old enum's default until it is told otherwise.
    await queryInterface.sequelize.query(
      `ALTER TABLE "resources" ALTER COLUMN "category" SET DEFAULT 'Parenting & Learning'`
    )

    await queryInterface.addColumn('resources', 'status', {
      type: DataTypes.ENUM('Draft', 'Published'),
      allowNull: false,
      defaultValue: 'Draft',
    })
    // Everything already on the site was live, so it stays live.
    await queryInterface.bulkUpdate('resources', { status: 'Published' }, {})

    await queryInterface.addColumn('resources', 'metaDescription', {
      type: DataTypes.STRING(320),
      allowNull: true,
    })

    // The article list is read by slug and filtered by category and status on
    // every request to the public page.
    await queryInterface.addIndex('resources', ['slug'], { name: 'resources_slug_idx', unique: true }).catch(() => {})
    await queryInterface.addIndex('resources', ['status', 'category'], { name: 'resources_status_category_idx' }).catch(() => {})
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('resources', 'resources_status_category_idx').catch(() => {})
    await queryInterface.removeIndex('resources', 'resources_slug_idx').catch(() => {})
    await queryInterface.removeColumn('resources', 'metaDescription')
    await queryInterface.removeColumn('resources', 'status')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_resources_status"').catch(() => {})
    await queryInterface.sequelize.query(
      `UPDATE "resources" SET "category" = 'General'`
    )
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_resources_category" AS ENUM ('Learning Tips','Parent Guide','Programme Spotlight','Assessment','Academic Support','General')`
    )
    await queryInterface.sequelize.query(
      'ALTER TABLE "resources" ALTER COLUMN "category" TYPE "enum_resources_category" USING "category"::"enum_resources_category"'
    )
  },
}
