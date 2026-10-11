'use strict'

/**
 * Renames five coordinators and repoints their photographs.
 *
 * The seeder was updated at the same time as this, but the seeder only fills an
 * empty table — these rows were written in August 2025, so nothing in the
 * codebase would ever have touched them again. A migration is the mechanism
 * this project already uses to correct data that is only wrong on databases
 * that have already been seeded.
 *
 * Each update is guarded on the id AND on the name it expects to find. That
 * makes it idempotent — running it twice changes nothing the second time — and,
 * more importantly, means it cannot overwrite a correction someone makes in the
 * admin before this ever runs. If a row does not match, it is left exactly as
 * it is and the migration still succeeds; a startup that fails here would take
 * the whole API down over five names.
 *
 * Only `name` and `photo` change. Position, category, biography, sortOrder and
 * isActive are deliberately untouched: it is the same post, and the biography
 * was written to describe the role rather than the person holding it.
 */

const CHANGES = [
  { id: '8415057f-0a30-4866-a8f6-5e2945b7b05d', from: 'Amelie Mussard', to: 'Shadrack Mutonga', photo: '/team/shadrack-mutonga.jpg' },
  { id: 'cea2d870-2543-469f-9a99-b0e5dff6176c', from: 'Naomie Kalachi', to: 'Millicent Auma', photo: '/team/millicent-auma.jpg' },
  { id: 'ce77136f-14a8-4872-8506-9df861d5e5d5', from: 'Gloria Lakeiisha', to: 'Gloria Atyang', photo: '/team/gloria-atyang.jpg' },
  { id: 'f9a59739-a8d3-48da-9f41-e494ea182a29', from: 'Mulati Mike', to: 'Collins Okisegere', photo: '/team/collins-okisegere.jpg' },
  { id: '04d6b3d1-8dca-49d4-9551-791955e87072', from: 'Daisy Luvanda', to: 'Eunice Mukami', photo: '/team/eunice-mukami.jpg' },
]

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize

    // The table may not exist yet on a database created from scratch, where
    // sync runs first but the seeder has not yet inserted anyone. Nothing to
    // rename in that case, and the seeder already writes the new names.
    const [[{ exists }]] = await sequelize.query(
      "SELECT to_regclass('public.educators') IS NOT NULL AS exists"
    )
    if (!exists) return

    for (const change of CHANGES) {
      const [, result] = await sequelize.query(
        'UPDATE educators SET name = :to, photo = :photo, "updatedAt" = NOW() WHERE id = :id AND name = :from',
        { replacements: change }
      )
      const changed = result && typeof result.rowCount === 'number' ? result.rowCount : 0
      console.log(
        changed
          ? `  renamed ${change.from} -> ${change.to}`
          : `  left alone: ${change.from} (already renamed, or edited since)`
      )
    }
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize

    const [[{ exists }]] = await sequelize.query(
      "SELECT to_regclass('public.educators') IS NOT NULL AS exists"
    )
    if (!exists) return

    // Reverses only rows still holding the new name, and puts the old
    // photograph path back with it.
    for (const change of CHANGES) {
      const oldPhoto = '/team/' + change.from.toLowerCase().replace(/\s+/g, '-') + '.jpg'
      await sequelize.query(
        'UPDATE educators SET name = :from, photo = :oldPhoto, "updatedAt" = NOW() WHERE id = :id AND name = :to',
        { replacements: { ...change, oldPhoto } }
      )
    }
  },
}
