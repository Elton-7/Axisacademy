#!/usr/bin/env node
/**
 * Restores a dump — normally into a scratch database, as a rehearsal.
 *
 * The target must be named explicitly and is never taken from DB_NAME. A
 * restore script that defaults to the live database is one mistyped command
 * away from erasing it, and the moment you reach for this is the moment you are
 * least careful.
 *
 *   npm run restore -- --file backups/axis-2026-08-19T08-00-00.dump --database axis_restore_test
 *
 * Overwriting a database that already exists additionally requires --force.
 */
require('dotenv').config()
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')

const args = process.argv.slice(2)
const valueOf = (flag) => {
  const i = args.indexOf(flag)
  return i === -1 ? null : args[i + 1]
}

const file = valueOf('--file')
const database = valueOf('--database')
const force = args.includes('--force')

if (!file || !database) {
  console.error('Usage: npm run restore -- --file <dump> --database <name> [--force]')
  process.exit(1)
}
if (!fs.existsSync(file)) {
  console.error(`No such file: ${file}`)
  process.exit(1)
}
if (database === process.env.DB_NAME && !force) {
  console.error(
    `Refusing to restore over "${database}", the database this application uses.\n` +
    `Restore into a scratch database instead, or pass --force if you truly mean it.`
  )
  process.exit(1)
}

const conn = [
  '--host', process.env.DB_HOST || 'localhost',
  '--port', String(process.env.DB_PORT || 5432),
  '--username', process.env.DB_USER,
]
const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
const PSQL = process.env.PSQL_PATH || 'psql'
const PG_RESTORE = process.env.PG_RESTORE_PATH || 'pg_restore'

const exists = spawnSync(PSQL, [...conn, '--dbname', 'postgres', '--tuples-only', '--no-align',
  '--command', `SELECT 1 FROM pg_database WHERE datname='${database}'`], { env, encoding: 'utf8' })

if (exists.stdout?.trim() === '1') {
  if (!force) {
    console.error(`Database "${database}" already exists. Pass --force to replace it.`)
    process.exit(1)
  }
  console.log(`Dropping existing "${database}"`)
  spawnSync(PSQL, [...conn, '--dbname', 'postgres', '--command', `DROP DATABASE "${database}"`],
    { env, stdio: 'inherit' })
}

console.log(`Creating "${database}"`)
const created = spawnSync(PSQL, [...conn, '--dbname', 'postgres',
  '--command', `CREATE DATABASE "${database}"`], { env, stdio: 'inherit' })
if (created.status !== 0) process.exit(1)

console.log(`Restoring ${file}`)
const restored = spawnSync(PG_RESTORE, [...conn, '--dbname', database, '--no-owner',
  '--no-privileges', file], { env, stdio: 'inherit' })

// pg_restore reports non-zero for benign ownership notices as well as real
// failures, so the row counts below are the actual check, not the exit code.
if (restored.status !== 0) {
  console.warn('\npg_restore reported warnings. Confirm the counts below before trusting it.')
}

const counts = spawnSync(PSQL, [...conn, '--dbname', database, '--tuples-only', '--no-align',
  '--command',
  `SELECT relname || ': ' || n_live_tup FROM pg_stat_user_tables
   WHERE n_live_tup > 0 ORDER BY n_live_tup DESC LIMIT 12`], { env, encoding: 'utf8' })

console.log(`\nRestored into "${database}":`)
console.log(counts.stdout?.trim() || '  (no rows — this restore did NOT work)')
console.log(`\nWhen finished, drop it: DROP DATABASE "${database}";`)
