#!/usr/bin/env node
/**
 * Removes the demonstration data the seeders create for the portals, and stops
 * it coming back.
 *
 * It was put in so the portals had something to show while the site was under
 * review: a learner who does not exist, a parent and an educator account to
 * sign in as, a seeded enquiry, a schedule entry and a welcome message each. It
 * must be gone before a real family is enrolled, because a parent or educator
 * who sees it cannot tell it from a real record.
 *
 * What is touched, and nothing else:
 *
 *   - the learner with the demo name attached to the demonstration parent,
 *     with its rows in every table that refers to a learner
 *   - the seeded enquiry for the demonstration parent's address
 *   - the portal schedule entries and messages belonging to the two accounts
 *   - the two accounts themselves, disabled rather than deleted (as every
 *     account here is), and only when no other learner depends on them
 *
 * Deleting is not enough on its own. At every start the seeder recreates the
 * enquiry while STUDENT_EMAIL is set, and the learner while SEED_DEMO_PORTAL is
 * true and no learner exists. With --apply those settings are commented out of
 * .env too — on the host, so the file's contents never leave it.
 *
 *   node scripts/remove-demo-portal.js           report what would be removed
 *   node scripts/remove-demo-portal.js --apply   remove it
 */
const path = require('node:path')
const fs = require('node:fs')
// By path, so it works when cron starts it from the home directory.
const ENV_FILE = path.join(__dirname, '..', '.env')
require('dotenv').config({ path: ENV_FILE })

const { Op } = require('sequelize')
const {
  sequelize, User, Learner, LearnerEducator, Session, Assessment, Message, MessageRead, SafeguardingConcern,
  Enrollment, PortalSchedule, PortalMessage,
} = require('../models')
const { DEMO_LEARNER } = require('../seeders/demoPortal')

const apply = process.argv.includes('--apply')
// Children before what they might point at: a concern can name a session, and
// a read receipt belongs with its message.
const DEPENDENTS = { SafeguardingConcern, MessageRead, Message, Assessment, Session, LearnerEducator }
const ENV_KEYS = [
  'SEED_DEMO_PORTAL',
  'STUDENT_EMAIL', 'STUDENT_NAME', 'STUDENT_PASSWORD_HASH',
  'TUTOR_EMAIL', 'TUTOR_NAME', 'TUTOR_PASSWORD_HASH',
]

const studentEmail = (process.env.STUDENT_EMAIL || 'student@axis.com').toLowerCase().trim()
const tutorEmail = (process.env.TUTOR_EMAIL || 'tutor@axis.com').toLowerCase().trim()

const disableEnvKeys = () => {
  if (!fs.existsSync(ENV_FILE)) return 'no .env file'
  let text = fs.readFileSync(ENV_FILE, 'utf8')
  const present = ENV_KEYS.filter((key) => new RegExp(`^[ \\t]*${key}[ \\t]*=`, 'm').test(text))
  if (!present.length) return 'none of the demo settings are set'
  if (!apply) return `would turn off ${present.join(', ')}`
  const stamp = new Date().toISOString().slice(0, 10)
  for (const key of present) {
    text = text.replace(new RegExp(`^[ \\t]*${key}[ \\t]*=.*$`, 'm'), (m) => `# ${m.trim()}  (demo data removed ${stamp})`)
  }
  fs.writeFileSync(ENV_FILE, text)
  return `turned off ${present.join(', ')}`
}

const main = async () => {
  console.log(apply ? 'Removing the demonstration data' : 'Dry run — nothing will be changed')

  const parent = await User.findOne({ where: { email: studentEmail, role: 'student' } })
  const educator = await User.findOne({ where: { email: tutorEmail, role: 'tutor' } })
  console.log(`  demo parent account:   ${parent ? `${parent.email}, ${parent.isActive ? 'active' : 'already disabled'}` : 'not found'}`)
  console.log(`  demo educator account: ${educator ? `${educator.email}, ${educator.isActive ? 'active' : 'already disabled'}` : 'not found'}`)

  const learners = parent ? await Learner.findAll({ where: { name: DEMO_LEARNER, parentUserId: parent.id } }) : []
  const ids = learners.map((l) => l.id)
  console.log(`  demo learner records: ${ids.length}`)

  // Anyone real hanging off a demo account means it is not only a demo account,
  // and disabling it would lock a family or an educator out.
  const otherChildren = parent
    ? await Learner.count({ where: { parentUserId: parent.id, id: { [Op.notIn]: ids.length ? ids : [0] } } })
    : 0
  const otherAssignments = educator
    ? await LearnerEducator.count({ where: { educatorUserId: educator.id, learnerId: { [Op.notIn]: ids.length ? ids : [0] } } })
    : 0
  if (otherChildren || otherAssignments) {
    console.log(`  REAL DATA ON A DEMO ACCOUNT: ${otherChildren} other learner(s) on the parent, ${otherAssignments} other assignment(s) on the educator`)
  }

  const userIds = [parent, educator].filter(Boolean).map((u) => u.id)
  const enquiryWhere = { email: studentEmail, notes: { [Op.like]: 'Seeded demonstration%' } }

  await sequelize.transaction(async (transaction) => {
    const step = async (label, Model, where) => {
      const n = apply ? await Model.destroy({ where, transaction }) : await Model.count({ where, transaction })
      console.log(`  ${label}: ${n} row(s)${apply ? ' removed' : ''}`)
    }

    if (ids.length) {
      for (const [name, Model] of Object.entries(DEPENDENTS)) await step(name, Model, { learnerId: ids })
      await step('Learner', Learner, { id: ids })
    }
    await step('seeded enquiry', Enrollment, enquiryWhere)
    if (userIds.length) {
      await step('PortalSchedule', PortalSchedule, { userId: userIds })
      await step('PortalMessage', PortalMessage, { userId: userIds })
    }

    for (const [label, account, inUse] of [['parent', parent, otherChildren], ['educator', educator, otherAssignments]]) {
      if (!account || !account.isActive) continue
      if (inUse) { console.log(`  ${label} account left active: real records depend on it`); continue }
      if (apply) await account.update({ isActive: false }, { transaction })
      console.log(`  ${label} account: ${apply ? 'disabled' : 'would be disabled'}`)
    }
  })

  console.log(`  .env: ${disableEnvKeys()}`)
  console.log(`  learners remaining: ${await Learner.count()}`)
  console.log('done')
}

main()
  .catch((err) => {
    console.error(`failed: ${err.message}`)
    process.exitCode = 1
  })
  .finally(() => sequelize.close())
