#!/usr/bin/env node
/**
 * Takes a backup of the database.
 *
 * Uses pg_dump's custom format (-Fc): compressed, and restorable table by table
 * rather than all or nothing, which matters when the goal is recovering one
 * table somebody emptied rather than rebuilding everything.
 *
 * Deliberately not tied to a host. Render's managed snapshots, where enabled,
 * are a separate mechanism with their own retention; this runs anywhere
 * Postgres does, which is what makes a restore rehearsable before it is needed.
 *
 *   npm run backup                 write a dump to server/backups
 *   BACKUP_DIR=/mnt/x npm run backup
 *   BACKUP_KEEP_DAYS=30 npm run backup
 */
const path = require('node:path')
// Found by path rather than by working directory: cron starts this from the
// home directory, where a bare config() finds no .env, connects as nobody, and
// fails every night without anyone looking.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const { spawn } = require('node:child_process')
const fs = require('node:fs')

// The same two forms config/database.js accepts: one DATABASE_URL, or the five
// separate variables. A backup that only understood one of them would fail on
// whichever host uses the other.
const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null
const decode = (value) => (value ? decodeURIComponent(value) : value)
const db = {
  host: url ? url.hostname : process.env.DB_HOST || 'localhost',
  port: String(url ? url.port || 5432 : process.env.DB_PORT || 5432),
  name: url ? decode(url.pathname.replace(/^\//, '')) : process.env.DB_NAME,
  user: url ? decode(url.username) : process.env.DB_USER,
  password: url ? decode(url.password) : process.env.DB_PASSWORD,
}

const DIR = process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups')
const KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS || 14)
const PG_DUMP = process.env.PG_DUMP_PATH || 'pg_dump'

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const target = path.join(DIR, `axis-${stamp}.dump`)

/** Old dumps are deleted only after a new one is safely on disk. */
const prune = () => {
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000
  let removed = 0
  for (const file of fs.readdirSync(DIR)) {
    if (!file.startsWith('axis-') || !file.endsWith('.dump')) continue
    const full = path.join(DIR, file)
    if (full === target) continue
    if (fs.statSync(full).mtimeMs < cutoff) {
      fs.unlinkSync(full)
      removed += 1
    }
  }
  return removed
}

fs.mkdirSync(DIR, { recursive: true })

const child = spawn(PG_DUMP, [
  '--host', db.host,
  '--port', db.port,
  '--username', db.user,
  '--dbname', db.name,
  '--format', 'custom',
  '--no-owner',
  '--no-privileges',
  '--file', target,
], {
  // Passing the password by environment keeps it off the process list, where
  // any other user on the machine could read it.
  env: { ...process.env, PGPASSWORD: db.password },
  stdio: ['ignore', 'inherit', 'inherit'],
})

child.on('error', (err) => {
  console.error(
    err.code === 'ENOENT'
      ? `pg_dump not found. Install the PostgreSQL client tools, or set PG_DUMP_PATH.`
      : `Backup failed to start: ${err.message}`
  )
  process.exit(1)
})

child.on('exit', (code) => {
  if (code !== 0) {
    // A partial file is worse than none: it looks like a backup and is not one.
    fs.rmSync(target, { force: true })
    console.error(`Backup failed (pg_dump exited ${code}). No file was kept.`)
    process.exit(1)
  }

  const mb = (fs.statSync(target).size / 1024 / 1024).toFixed(2)
  console.log(`Backup written: ${target} (${mb} MB)`)

  const removed = prune()
  if (removed) console.log(`Removed ${removed} backup(s) older than ${KEEP_DAYS} days`)

  console.log('\nA backup you have never restored is not yet a backup.')
  console.log('Rehearse it: npm run restore -- --file <path> --database axis_restore_test')
  // The last line run-on-host.mjs waits for.
  console.log('done')
})
