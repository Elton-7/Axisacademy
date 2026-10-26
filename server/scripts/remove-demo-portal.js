#!/usr/bin/env node
/**
 * Removes the demonstration learner that seeders/demoPortal.js creates, and
 * stops it coming back.
 *
 * That learner is a child who does not exist, put in so the portals had
 * something to show while the site was under review. It must be gone before a
 * real family is enrolled: a parent or educator who sees it cannot tell it
 * from a real record.
 *
 * Only the learner with the demo name AND attached to the demonstration parent
 * account is touched, together with its rows in every table that refers to a
 * learner. A real learner who happened to share the name would belong to a
 * different parent and is left alone.
 *
 * Deleting it is not enough on its own. The seeder runs at startup whenever
 * SEED_DEMO_PORTAL=true and no learner exists, so on a system with no real
 * learners yet it would recreate the record at the next restart. With --apply
 * the setting is commented out of .env as well — on the host, so the file's
 * contents never leave it.
 *
 *   node scripts/remove-demo-portal.js           report what would be removed
 *   node scripts/remove-demo-portal.js --apply   remove it
 */
const path = require('node:path')
const fs = require('node:fs')
// By path, so it works when cron starts it from the home directory.
const ENV_FILE = path.join(__dirname, '..', '.env')
require('dotenv').config({ path: ENV_FILE })

const {
  sequelize, User, Learner, LearnerEducator, Session, Assessment, Message, MessageRead, SafeguardingConcern,
} = require('../models')
const { DEMO_LEARNER } = require('../seeders/demoPortal')

const apply = process.argv.includes('--apply')
// Children before what they might point at: a concern can name a session, and
// a read receipt belongs with its message.
const DEPENDENTS = { SafeguardingConcern, MessageRead, Message, Assessment, Session, LearnerEducator }

const disableSeedFlag = () => {
  if (!fs.existsSync(ENV_FILE)) return 'no .env file'
  const text = fs.readFileSync(ENV_FILE, 'utf8')
  const line = /^[ \t]*SEED_DEMO_PORTAL[ \t]*=.*$/m
  if (!line.test(text)) return 'not set'
  if (!apply) return `set to ${JSON.stringify(process.env.SEED_DEMO_PORTAL)} (would be turned off)`
  const stamp = new Date().toISOString().slice(0, 10)
  fs.writeFileSync(ENV_FILE, text.replace(line, (m) => `# ${m.trim()}  (turned off ${stamp} with the demo learner removed)`))
  return 'turned off'
}

const main = async () => {
  console.log(apply ? 'Removing the demonstration learner' : 'Dry run — nothing will be changed')

  const parent = await User.findOne({ where: { email: process.env.STUDENT_EMAIL || 'student@axis.com' } })
  const learners = parent
    ? await Learner.findAll({ where: { name: DEMO_LEARNER, parentUserId: parent.id } })
    : []
  console.log(`  demonstration parent account: ${parent ? 'present' : 'not found'}`)
  console.log(`  demo learner records: ${learners.length}`)

  const ids = learners.map((l) => l.id)
  if (ids.length) {
    await sequelize.transaction(async (transaction) => {
      for (const [name, Model] of Object.entries(DEPENDENTS)) {
        const where = { learnerId: ids }
        const n = apply ? await Model.destroy({ where, transaction }) : await Model.count({ where, transaction })
        console.log(`  ${name}: ${n} row(s)${apply ? ' removed' : ''}`)
      }
      if (apply) await Learner.destroy({ where: { id: ids }, transaction })
    })
    if (apply) console.log(`  learner removed: ${DEMO_LEARNER}`)
  }

  console.log(`  SEED_DEMO_PORTAL: ${disableSeedFlag()}`)
  console.log(`  real learners remaining: ${await Learner.count()}`)
  console.log('done')
}

main()
  .catch((err) => {
    console.error(`failed: ${err.message}`)
    process.exitCode = 1
  })
  .finally(() => sequelize.close())
