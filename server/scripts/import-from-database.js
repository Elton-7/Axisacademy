/**
 * Copies the records people created from one database into this one.
 *
 * Written for the move off the hosted database, where the enquiries a parent
 * had already sent could not come with the schema: the site's database is
 * reachable only from the server itself, so nothing outside could write to it.
 * This runs on the server and pulls, rather than being pushed to.
 *
 * Only what a person produced is copied. Everything else — services, resources,
 * educators, FAQs — is written by the seeder from files in this repository, so
 * copying it would duplicate rows that are about to be recreated anyway.
 *
 * Ids are not preserved. The destination has its own sequences and its own
 * seeded rows, and forcing ids would either collide or leave the sequence
 * pointing at an occupied number, so the next real enquiry would fail to save.
 * Rows are matched on what identifies them to a human instead, which also makes
 * the script safe to run twice.
 *
 * Usage, from the server, with the source connection string in the environment:
 *
 *   IMPORT_SOURCE_DATABASE_URL=postgres://... node scripts/import-from-database.js
 *
 * It reports what it found, what it wrote, and what it skipped. It never
 * deletes anything, in either database.
 */
const https = require('node:https')
const { Client } = require('pg')
require('dotenv').config()

const { Enrollment, Newsletter, sequelize } = require('../models')

const SOURCE = process.env.IMPORT_SOURCE_DATABASE_URL
const SOURCE_API = process.env.IMPORT_SOURCE_API
const SOURCE_TOKEN = process.env.IMPORT_SOURCE_TOKEN
let sourceClient = null

/**
 * What makes a row the same row in both databases.
 *
 * An enquiry is identified by who sent it and when: two parents can share a
 * name, and one parent can enquire twice, but not in the same second.
 */
const TABLES = [
  {
    name: 'enrollments',
    endpoint: '/api/enrollments?limit=500',
    model: () => Enrollment,
    identity: (row) => `${String(row.email || '').toLowerCase()}|${new Date(row.createdAt).toISOString()}`,
    describe: (row) => `${row.parentName || row.studentName || '(no name)'} <${row.email}>`,
  },
  {
    name: 'newsletter_subscriptions',
    endpoint: '/api/newsletter?limit=500',
    model: () => Newsletter,
    identity: (row) => String(row.email || '').toLowerCase(),
    describe: (row) => row.email,
  },
]

/**
 * Where the records come from.
 *
 * Two sources, because the obvious one is not always reachable. Copying
 * straight from the old database is the cleaner route, but a shared host
 * commonly refuses outbound database ports — this one rejects 5432 in both
 * directions — while leaving 443 open. Reading the old site's own API gets the
 * same rows over a port that works, and keeps the transfer between the two
 * servers rather than routing it through somebody's laptop.
 */
async function readSource(table) {
  if (SOURCE) {
    const { rows } = await sourceClient.query(`SELECT * FROM "${table.name}"`)
    return rows
  }

  // node:https rather than fetch: the interpreter this runs under on the
  // server predates global fetch, and a migration script is a poor place to
  // discover that.
  const url = new URL(`${SOURCE_API.replace(/\/$/, '')}${table.endpoint}`)
  const body = await new Promise((resolve, reject) => {
    const request = https.request(
      {
        host: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: { authorization: `Bearer ${SOURCE_TOKEN}` },
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => {
          if (response.statusCode >= 400) {
            return reject(new Error(`${table.endpoint} answered ${response.statusCode}`))
          }
          try { resolve(JSON.parse(data)) } catch { reject(new Error(`${table.endpoint} did not return JSON`)) }
        })
      }
    )
    request.on('error', reject)
    request.end()
  })

  const rows = Array.isArray(body) ? body : body.data || body.items || body.rows
  if (!Array.isArray(rows)) throw new Error(`${table.endpoint} did not return a list`)
  return rows
}

async function main() {
  if (!SOURCE && !(SOURCE_API && SOURCE_TOKEN)) {
    console.error(
      'import: set IMPORT_SOURCE_DATABASE_URL, or IMPORT_SOURCE_API with IMPORT_SOURCE_TOKEN.'
    )
    process.exitCode = 1
    return
  }

  if (SOURCE) {
    /**
     * SSL follows the connection, the same way the app's own config decides it:
     * a hosted database refuses an unencrypted connection, and a local one does
     * not offer encryption at all. Verification is off because several providers
     * front their databases with an intermediate certificate Node's bundled
     * roots do not recognise; the traffic is still encrypted.
     */
    const sourceHost = new URL(SOURCE).hostname
    const isLocal = /^(localhost|127\.0\.0\.1|::1)$/.test(sourceHost)
    sourceClient = new Client({
      connectionString: SOURCE,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    })
    await sourceClient.connect()
    console.log(`import: connected to ${sourceHost}${isLocal ? '' : ' over TLS'}`)
  } else {
    console.log(`import: reading from ${new URL(SOURCE_API).hostname}`)
  }

  for (const table of TABLES) {
    const Model = table.model()
    const rows = await readSource(table)
    console.log(`\nimport: ${table.name} — ${rows.length} row(s) in the source`)

    // Read the destination once rather than querying per row.
    const existing = await Model.findAll({ raw: true })
    const seen = new Set(existing.map((r) => table.identity(r)))

    let written = 0
    let skipped = 0

    for (const row of rows) {
      if (seen.has(table.identity(row))) {
        skipped += 1
        continue
      }
      // Drop the source's primary key and let this database assign its own.
      const { id, ...values } = row
      await Model.create(values, { silent: true })
      seen.add(table.identity(row))
      written += 1
      console.log(`  copied  ${table.describe(row)}`)
    }

    console.log(`import: ${table.name} — ${written} copied, ${skipped} already present`)
    console.log(`import: ${table.name} — ${await Model.count()} row(s) here now`)
  }

  if (sourceClient) await sourceClient.end()
  await sequelize.close()
  console.log('\nimport: done. Nothing was deleted from either database.')
}

main().catch(async (error) => {
  console.error(`import: failed — ${error.message}`)
  process.exitCode = 1
})
