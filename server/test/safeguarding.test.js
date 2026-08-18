/**
 * The rules that protect a child's record.
 *
 * These were all verified by hand while being built and then had nothing
 * guarding them. This file exists so that the next change to resolveLearnerIds,
 * the vetting gate or the session rules cannot quietly open a hole without a
 * test going red.
 *
 * It builds its own accounts rather than relying on the seeded ones, so it
 * needs no knowledge of any existing password, and removes everything it made.
 */
const assert = require('node:assert/strict')
const { after, before, describe, test } = require('node:test')
const { spawn } = require('node:child_process')
const bcrypt = require('bcryptjs')

const PORT = process.env.SAFEGUARDING_TEST_PORT || 5071
const baseUrl = `http://127.0.0.1:${PORT}/api`
const PREFIX = 'sgtest-'
const PASSWORD = 'safeguarding-suite-password'

let serverProcess
const models = require('../models')
const { User, Learner, LearnerEducator, Session, Assessment, Message, MessageRead, EducatorVetting, SafeguardingConcern, sequelize } = models

const tokens = {}
const ids = {}

const api = async (path, { method = 'GET', token, body } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return { status: response.status, body: await response.json().catch(() => null) }
}

async function waitForHealth() {
  const deadline = Date.now() + (Number(process.env.TEST_HEALTH_TIMEOUT_MS) || 60_000)
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.ok) return
    } catch {
      // still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('API did not become healthy in time')
}

async function makeUser(key, role, name) {
  const email = `${PREFIX}${key}@axis.local`
  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  const [user] = await User.findOrCreate({ where: { email }, defaults: { email, role, name, passwordHash } })
  await user.update({ passwordHash, role, isActive: true, mustChangePassword: false })
  ids[key] = user.id
  const login = await api('/auth/login', { method: 'POST', body: { email, password: PASSWORD } })
  tokens[key] = login.body?.token
  assert.ok(tokens[key], `${key} could not sign in`)
}

/** Clearance dated in the future unless a past date is asked for. */
const clearanceFor = (offsetDays = 300) =>
  new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10)

before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    stdio: 'ignore',
  })
  await waitForHealth()

  await makeUser('admin', 'admin', 'Suite Admin')
  await makeUser('parentA', 'student', 'Suite Parent A')
  await makeUser('parentB', 'student', 'Suite Parent B')
  await makeUser('tutor1', 'tutor', 'Suite Tutor One')
  await makeUser('tutor2', 'tutor', 'Suite Tutor Two')

  const learnerA = await Learner.create({ name: 'Suite Learner A', parentUserId: ids.parentA, programme: 'Tuition' })
  const learnerB = await Learner.create({ name: 'Suite Learner B', parentUserId: ids.parentB, programme: 'Tuition' })
  ids.learnerA = learnerA.id
  ids.learnerB = learnerB.id
})

after(async () => {
  const learnerIds = [ids.learnerA, ids.learnerB].filter(Boolean)
  const userIds = Object.entries(ids)
    .filter(([key]) => !key.startsWith('learner'))
    .map(([, value]) => value)

  await SafeguardingConcern.destroy({ where: { learnerId: learnerIds } })
  await Message.destroy({ where: { learnerId: learnerIds } })
  await MessageRead.destroy({ where: { learnerId: learnerIds } })
  await Assessment.destroy({ where: { learnerId: learnerIds } })
  await Session.destroy({ where: { learnerId: learnerIds } })
  await LearnerEducator.destroy({ where: { learnerId: learnerIds } })
  await EducatorVetting.destroy({ where: { educatorUserId: userIds } })
  await Learner.destroy({ where: { id: learnerIds } })
  await User.destroy({ where: { id: userIds } })
  await sequelize.close()
  serverProcess?.kill()
})

describe('educator vetting gates assignment', () => {
  test('an educator with no vetting record cannot be assigned', async () => {
    const result = await api(`/learners/${ids.learnerA}/educators`, {
      method: 'POST', token: tokens.admin, body: { educatorUserId: ids.tutor1, subject: 'Maths' },
    })
    assert.equal(result.status, 422)
  })

  test('clearance is refused without evidence', async () => {
    const noCertificate = await api(`/learners/vetting/${ids.tutor1}`, {
      method: 'PUT', token: tokens.admin, body: { status: 'Cleared' },
    })
    assert.equal(noCertificate.status, 400)

    const expired = await api(`/learners/vetting/${ids.tutor1}`, {
      method: 'PUT',
      token: tokens.admin,
      body: {
        status: 'Cleared',
        goodConductNumber: 'GC-1',
        goodConductExpiresOn: clearanceFor(-30),
        referencesCheckedOn: '2026-01-01',
      },
    })
    assert.equal(expired.status, 400, 'an expired certificate must not clear an educator')
  })

  test('a cleared educator can be assigned', async () => {
    const cleared = await api(`/learners/vetting/${ids.tutor1}`, {
      method: 'PUT',
      token: tokens.admin,
      body: {
        status: 'Cleared',
        goodConductNumber: 'GC-1',
        goodConductExpiresOn: clearanceFor(),
        referencesCheckedOn: '2026-01-01',
        identityVerifiedOn: '2026-01-01',
      },
    })
    assert.equal(cleared.status, 200)

    const assigned = await api(`/learners/${ids.learnerA}/educators`, {
      method: 'POST', token: tokens.admin, body: { educatorUserId: ids.tutor1, subject: 'Maths' },
    })
    assert.equal(assigned.status, 201)
  })

  test('scheduling is refused for an educator who is not assigned', async () => {
    const result = await api(`/learners/${ids.learnerA}/sessions`, {
      method: 'POST',
      token: tokens.admin,
      body: { subject: 'Maths', scheduledFor: new Date().toISOString(), educatorUserId: ids.tutor2 },
    })
    assert.equal(result.status, 400, 'scheduling must not become a second route to access')
  })
})

describe('a learner is reachable only by their own family and educators', () => {
  test('a parent cannot reach another family’s learner', async () => {
    const result = await api(`/portal/learners/${ids.learnerB}`, { token: tokens.parentA })
    assert.equal(result.status, 404, 'must be 404, not 403 — existence itself is private')
  })

  test('an unassigned educator sees nothing and cannot reach the record', async () => {
    const overview = await api('/portal/overview', { token: tokens.tutor2 })
    assert.equal(overview.body.data.learners.length, 0)

    const direct = await api(`/portal/learners/${ids.learnerA}`, { token: tokens.tutor2 })
    assert.equal(direct.status, 404)
  })

  test('an assigned educator sees exactly their own learner', async () => {
    const overview = await api('/portal/overview', { token: tokens.tutor1 })
    assert.equal(overview.body.data.learners.length, 1)
    assert.equal(overview.body.data.learners[0].name, 'Suite Learner A')
  })
})

describe('home-based sessions require a safeguarding record', () => {
  let sessionId

  before(async () => {
    const created = await api(`/learners/${ids.learnerA}/sessions`, {
      method: 'POST',
      token: tokens.admin,
      body: {
        subject: 'Maths',
        scheduledFor: new Date().toISOString(),
        deliveryMode: 'home-based',
        educatorUserId: ids.tutor1,
      },
    })
    sessionId = created.body.data.id
  })

  test('attendance is refused without arrival and departure times', async () => {
    const result = await api(`/portal/sessions/${sessionId}`, {
      method: 'PATCH', token: tokens.tutor1, body: { status: 'Attended' },
    })
    assert.equal(result.status, 400)
  })

  test('attendance is refused without confirming an adult was present', async () => {
    const result = await api(`/portal/sessions/${sessionId}`, {
      method: 'PATCH',
      token: tokens.tutor1,
      body: {
        status: 'Attended',
        checkInAt: new Date().toISOString(),
        checkOutAt: new Date(Date.now() + 3_600_000).toISOString(),
      },
    })
    assert.equal(result.status, 400)
  })

  test('attendance is accepted once the record is complete', async () => {
    const result = await api(`/portal/sessions/${sessionId}`, {
      method: 'PATCH',
      token: tokens.tutor1,
      body: {
        status: 'Attended',
        checkInAt: new Date().toISOString(),
        checkOutAt: new Date(Date.now() + 3_600_000).toISOString(),
        adultPresent: true,
      },
    })
    assert.equal(result.status, 200)
  })
})

describe('safeguarding concerns stay with Axis', () => {
  let concernId

  test('a parent can raise one', async () => {
    const result = await api('/portal/concerns', {
      method: 'POST',
      token: tokens.parentA,
      body: { learnerId: ids.learnerA, category: 'Conduct of an educator', detail: 'Suite concern' },
    })
    assert.equal(result.status, 201)
    concernId = result.body.data.id
  })

  test('an educator cannot read concerns', async () => {
    const result = await api('/portal/concerns', { token: tokens.tutor1 })
    assert.equal(result.status, 403, 'the subject of a concern must not be able to read it')
  })

  test('a concern cannot be resolved without recording what was done', async () => {
    const result = await api(`/portal/concerns/${concernId}`, {
      method: 'PATCH', token: tokens.admin, body: { status: 'Resolved' },
    })
    assert.equal(result.status, 400)
  })
})

describe('results reach a family only when released', () => {
  test('a draft assessment is hidden from the parent', async () => {
    const recorded = await api('/portal/assessments', {
      method: 'POST',
      token: tokens.tutor1,
      body: { learnerId: ids.learnerA, subject: 'Maths', title: 'Suite draft', score: 5, maxScore: 10 },
    })
    assert.equal(recorded.status, 201)
    assert.equal(recorded.body.data.isReleased, false)

    const parentView = await api(`/portal/learners/${ids.learnerA}`, { token: tokens.parentA })
    const titles = parentView.body.data.assessments.map((assessment) => assessment.title)
    assert.ok(!titles.includes('Suite draft'), 'an unreleased result must not reach the family')
  })
})

describe('withdrawing clearance removes access immediately', () => {
  test('a suspended educator loses every assignment', async () => {
    const suspended = await api(`/learners/vetting/${ids.tutor1}`, {
      method: 'PUT', token: tokens.admin, body: { status: 'Suspended' },
    })
    assert.equal(suspended.status, 200)

    const overview = await api('/portal/overview', { token: tokens.tutor1 })
    assert.equal(overview.body.data.learners.length, 0)

    const direct = await api(`/portal/learners/${ids.learnerA}`, { token: tokens.tutor1 })
    assert.equal(direct.status, 404)
  })

  test('the parent is unaffected', async () => {
    const overview = await api('/portal/overview', { token: tokens.parentA })
    assert.equal(overview.body.data.learners.length, 1)
  })
})

describe('data protection', () => {
  test('erasure is refused without an exact confirmation', async () => {
    const result = await api(`/data-protection/learners/${ids.learnerA}`, {
      method: 'DELETE', token: tokens.admin, body: { confirmName: 'not the name' },
    })
    assert.equal(result.status, 400)
  })

  test('a parent cannot erase records', async () => {
    const result = await api(`/data-protection/learners/${ids.learnerA}`, {
      method: 'DELETE', token: tokens.parentA, body: { confirmName: 'Suite Learner A' },
    })
    assert.equal(result.status, 403)
  })

  test('an export includes the audit trail', async () => {
    const result = await api(`/data-protection/learners/${ids.learnerA}/export`, { token: tokens.admin })
    assert.equal(result.status, 200)
    assert.ok(Array.isArray(result.body.data.auditTrail))
  })
})

describe('account access', () => {
  test('a parent cannot create accounts', async () => {
    const result = await api('/users', {
      method: 'POST',
      token: tokens.parentA,
      body: { name: 'Nope', email: `${PREFIX}nope@axis.local`, role: 'admin' },
    })
    assert.equal(result.status, 403)
  })

  test('no password hash appears in the account listing', async () => {
    const result = await api('/users', { token: tokens.admin })
    assert.equal(result.status, 200)
    assert.ok(!/\$2[aby]\$/.test(JSON.stringify(result.body)), 'a bcrypt hash leaked into the response')
  })

  test('a disabled account cannot sign in', async () => {
    const disabled = await api(`/users/${ids.parentB}`, {
      method: 'PATCH', token: tokens.admin, body: { isActive: false },
    })
    assert.equal(disabled.status, 200)

    const attempt = await api('/auth/login', {
      method: 'POST', body: { email: `${PREFIX}parentB@axis.local`, password: PASSWORD },
    })
    assert.equal(attempt.status, 403)
  })

  test('an administrator cannot disable their own account', async () => {
    const result = await api(`/users/${ids.admin}`, {
      method: 'PATCH', token: tokens.admin, body: { isActive: false },
    })
    assert.equal(result.status, 400)
  })
})
