const { Umzug, SequelizeStorage } = require('umzug')
const sequelize = require('../config/database')

/**
 * Schema changes in production.
 *
 * The two mechanisms do different jobs and neither replaces the other:
 *
 *   sync({})    creates tables that do not exist yet. It never modifies an
 *               existing one, so it is safe to run against live data — but for
 *               the same reason it will not add a column to a table that is
 *               already there.
 *
 *   migrations  everything else: new columns, changed types, indexes, and any
 *               backfill of existing rows. These run in order, once each, and
 *               are recorded in SequelizeMeta.
 *
 * That division is why `DB_SYNC=safe` is not enough on its own. Before this
 * existed, adding a field to a model would deploy cleanly and then fail at
 * runtime, because the column was never created.
 *
 * Migrations run automatically at startup. That suits a single instance, which
 * is what render.yaml provisions. If the API is ever scaled to more than one,
 * move this to a release command so two instances cannot race each other.
 */
const migrator = new Umzug({
  migrations: {
    glob: ['../migrations/*.js', { cwd: __dirname }],
    resolve: ({ name, path: filepath, context }) => {
      const migration = require(filepath)
      return {
        name,
        up: async () => migration.up(context, sequelize),
        down: async () => migration.down?.(context, sequelize),
      }
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: {
    info: (m) => console.log(`  migration: ${m.event === 'migrating' ? 'applying' : 'applied'} ${m.name}`),
    warn: console.warn,
    error: console.error,
    debug: () => {},
  },
})

async function runMigrations() {
  const pending = await migrator.pending()
  if (pending.length === 0) {
    console.log('Migrations up to date')
    return []
  }

  console.log(`Applying ${pending.length} migration(s)`)
  const applied = await migrator.up()
  return applied.map((m) => m.name)
}

module.exports = { migrator, runMigrations }
