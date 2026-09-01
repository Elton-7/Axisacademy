/**
 * Whether a password you set for yourself survives the next restart.
 *
 * It did not. The seeder compared each configured account's hash against the
 * one in the database and overwrote any difference, every single start — so an
 * administrator could change their password, be told it worked, and find the
 * old one working again after the next deploy. Nothing failed and nothing was
 * logged; the new password simply stopped being the password.
 *
 * That behaviour still exists, because it is the only way back in when nobody
 * knows the password at all. It is now asked for explicitly, one run at a time,
 * with RESEED_PASSWORDS.
 *
 * The seeder is run directly here rather than through the server, because what
 * is being tested is precisely what happens on a restart.
 */
const assert = require('node:assert/strict')
const { after, before, describe, test } = require('node:test')
const bcrypt = require('bcrypt')

const seedData = require('../seeders/seed')
const { User, sequelize } = require('../models')

const EMAIL = 'seedcheck-admin@axis.local'
const FROM_ENV = 'the-password-in-the-environment'
const CHOSEN = 'the-password-I-chose-myself'

let envHash
const saved = {}

before(async () => {
  envHash = await bcrypt.hash(FROM_ENV, 12)
  for (const key of ['ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH', 'ADMIN_NAME', 'RESEED_PASSWORDS']) {
    saved[key] = process.env[key]
  }
  process.env.ADMIN_EMAIL = EMAIL
  process.env.ADMIN_PASSWORD_HASH = envHash
  process.env.ADMIN_NAME = 'Seed Check'
  delete process.env.RESEED_PASSWORDS

  await User.destroy({ where: { email: EMAIL } })
})

after(async () => {
  await User.destroy({ where: { email: EMAIL } })
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

const find = () => User.findOne({ where: { email: EMAIL } })

describe('seeding an account that already exists', () => {
  test('the environment creates the account the first time', async () => {
    await seedData()
    const user = await find()
    assert.ok(user, 'the account should have been created')
    assert.ok(await bcrypt.compare(FROM_ENV, user.passwordHash), 'it should use the configured password')
  })

  test('a password changed afterwards survives the next start', async () => {
    const user = await find()
    await user.update({ passwordHash: await bcrypt.hash(CHOSEN, 12) })

    await seedData()

    const after_ = await find()
    assert.ok(
      await bcrypt.compare(CHOSEN, after_.passwordHash),
      'the password the account owner chose must still be the password'
    )
    assert.ok(
      !(await bcrypt.compare(FROM_ENV, after_.passwordHash)),
      'the environment must not have been put back'
    )
  })

  test('name and role are still kept in step with the configuration', async () => {
    const user = await find()
    await user.update({ name: 'Renamed By Hand' })

    await seedData()

    const after_ = await find()
    assert.equal(after_.name, 'Seed Check', 'configuration still owns the name')
    assert.equal(after_.role, 'admin')
  })

  test('RESEED_PASSWORDS puts the environment back, for when nobody can get in', async () => {
    process.env.RESEED_PASSWORDS = 'true'
    try {
      await seedData()
    } finally {
      delete process.env.RESEED_PASSWORDS
    }

    const after_ = await find()
    assert.ok(
      await bcrypt.compare(FROM_ENV, after_.passwordHash),
      'asking for it explicitly should restore the configured password'
    )
  })

  test('and only for that run — the next start leaves it alone again', async () => {
    const user = await find()
    await user.update({ passwordHash: await bcrypt.hash(CHOSEN, 12) })

    await seedData()

    const after_ = await find()
    assert.ok(
      await bcrypt.compare(CHOSEN, after_.passwordHash),
      'the reset must not be sticky'
    )
  })
})

after(async () => {
  await sequelize.close()
})
