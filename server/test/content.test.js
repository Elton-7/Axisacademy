/**
 * The content routes: response shape, validation, identifiers and permissions.
 *
 * These seven routers were changed three times in quick succession — enveloped,
 * given UUID parameter checks, then given field validation — and none of it was
 * covered. The failure mode is quiet: a route that returns a bare record again
 * breaks every admin save, and the admin panel is the only thing that would
 * notice.
 *
 * Builds its own accounts and removes everything it creates.
 */
const assert = require('node:assert/strict')
const { after, before, describe, test } = require('node:test')
const { spawn } = require('node:child_process')
const bcrypt = require('bcryptjs')

const PORT = process.env.CONTENT_TEST_PORT || 5072
const baseUrl = `http://127.0.0.1:${PORT}/api`
const PREFIX = 'cmstest-'
const PASSWORD = 'content-suite-password'
const MARKER = 'CMS suite '

const models = require('../models')
const { User, Educator, Event, FAQ, Location, Partner, Resource, Gallery, sequelize } = models
const { Op } = require('sequelize')

let serverProcess
const tokens = {}
const ids = {}
const created = { educators: [], events: [], faqs: [], locations: [], partners: [], resources: [] }

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

/** One valid payload per resource, so each router can be exercised the same way. */
const validPayload = {
  educators: () => ({ name: `${MARKER}Educator`, position: 'Tutor', category: 'Teacher' }),
  events: () => ({
    title: `${MARKER}Event`, description: 'A description', category: 'Workshop',
    startDate: new Date().toISOString(),
  }),
  faqs: () => ({ question: `${MARKER}Question?`, answer: 'An answer long enough to pass', category: 'General' }),
  locations: () => ({ name: `${MARKER}Location`, type: 'Learning Centre' }),
  partners: () => ({ name: `${MARKER}Partner`, category: 'Corporate' }),
  resources: () => ({
    title: `${MARKER}Resource`, slug: `cms-suite-resource-${Date.now()}`,
    content: 'Body text', category: 'General', author: 'Suite',
  }),
}
const RESOURCES = Object.keys(validPayload)

before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    stdio: 'ignore',
  })
  await waitForHealth()

  await makeUser('admin', 'admin', 'CMS Suite Admin')
  await makeUser('parent', 'student', 'CMS Suite Parent')
})

after(async () => {
  const like = { [Op.like]: `${MARKER}%` }
  await Educator.destroy({ where: { name: like }, force: true })
  await Event.destroy({ where: { title: like }, force: true })
  await FAQ.destroy({ where: { question: like }, force: true })
  await Location.destroy({ where: { name: like }, force: true })
  await Partner.destroy({ where: { name: like }, force: true })
  await Resource.destroy({ where: { title: like }, force: true })
  await Gallery.destroy({ where: { title: like }, force: true })
  await User.destroy({ where: { id: Object.values(ids) } })
  await sequelize.close()
  serverProcess?.kill()
})

describe('every content route answers in one shape', () => {
  for (const name of RESOURCES) {
    test(`GET /${name} returns an enveloped list`, async () => {
      const { status, body } = await api(`/${name}?limit=1`)
      assert.equal(status, 200)
      assert.equal(body.success, true, `${name} did not envelope its list`)
      assert.ok(Array.isArray(body.data), `${name} data was not an array`)
      assert.equal(typeof body.total, 'number')
    })
  }

  test('a 404 is enveloped too', async () => {
    const { status, body } = await api('/does-not-exist')
    assert.equal(status, 404)
    assert.equal(body.success, false)
    assert.ok(body.error)
  })
})

describe('identifiers are checked before they reach the database', () => {
  for (const name of RESOURCES) {
    test(`GET /${name}/1 is a 400, not a 500`, async () => {
      // These models are keyed by UUID. Passing an integer used to reach
      // Postgres, which refuses uuid = integer, and surfaced as a server error.
      const { status, body } = await api(`/${name}/1`)
      assert.equal(status, 400, `${name} did not reject a non-UUID id`)
      assert.equal(body.success, false)
    })
  }

  test('a well-formed but absent id is a 404', async () => {
    const { status, body } = await api('/events/3f1b8c2a-0000-4000-8000-000000000000')
    assert.equal(status, 404)
    assert.equal(body.success, false)
  })
})

describe('writing requires the right account', () => {
  test('an anonymous caller cannot create', async () => {
    const { status } = await api('/faqs', { method: 'POST', body: validPayload.faqs() })
    assert.equal(status, 401)
  })

  test('a parent account cannot create', async () => {
    const { status } = await api('/faqs', {
      method: 'POST', token: tokens.parent, body: validPayload.faqs(),
    })
    assert.equal(status, 403)
  })
})

describe('field validation', () => {
  test('a missing required field names the field', async () => {
    const { status, body } = await api('/educators', {
      method: 'POST', token: tokens.admin, body: { position: 'Tutor', category: 'Teacher' },
    })
    assert.equal(status, 400)
    assert.equal(body.success, false)
    assert.match(body.error, /name/i)
    assert.equal(body.errors[0].field, 'name')
  })

  test('a value outside the ENUM is rejected and the options are listed', async () => {
    const { status, body } = await api('/educators', {
      method: 'POST', token: tokens.admin,
      body: { ...validPayload.educators(), category: 'Wizard' },
    })
    assert.equal(status, 400)
    assert.match(body.error, /Teacher/)
  })

  test('a value longer than its column is rejected', async () => {
    const { status, body } = await api('/faqs', {
      method: 'POST', token: tokens.admin,
      body: { ...validPayload.faqs(), question: 'q'.repeat(520) },
    })
    assert.equal(status, 400)
    assert.match(body.error, /500/)
  })

  test('a value shorter than the model allows names the range', async () => {
    // FAQ answers are TEXT with a model rule of at least 10 characters. Before
    // the rules read that, this came back as "Validation len on answer failed".
    const { status, body } = await api('/faqs', {
      method: 'POST', token: tokens.admin,
      body: { ...validPayload.faqs(), answer: 'short' },
    })
    assert.equal(status, 400)
    assert.match(body.error, /Answer must be between 10 and 5000/)
    assert.equal(body.errors[0].field, 'answer')
  })

  test('a malformed URL is rejected', async () => {
    const { status } = await api('/partners', {
      method: 'POST', token: tokens.admin,
      body: { ...validPayload.partners(), website: 'not-a-url' },
    })
    assert.equal(status, 400)
  })

  test('a malformed date is rejected', async () => {
    const { status } = await api('/events', {
      method: 'POST', token: tokens.admin,
      body: { ...validPayload.events(), startDate: 'soon' },
    })
    assert.equal(status, 400)
  })

  test('an out-of-range coordinate is rejected', async () => {
    const { status } = await api('/locations', {
      method: 'POST', token: tokens.admin,
      body: { ...validPayload.locations(), latitude: 999 },
    })
    assert.equal(status, 400)
  })

  test('an error carries per-field detail as well as a message', async () => {
    const { body } = await api('/locations', {
      method: 'POST', token: tokens.admin, body: { type: 'Learning Centre' },
    })
    assert.equal(typeof body.error, 'string')
    assert.ok(Array.isArray(body.errors))
    assert.ok(body.errors[0].field && body.errors[0].message)
  })
})

describe('a record can be created, changed and removed', () => {
  for (const name of RESOURCES) {
    test(`${name} round-trips`, async () => {
      const create = await api(`/${name}`, {
        method: 'POST', token: tokens.admin, body: validPayload[name](),
      })
      assert.equal(create.status, 201, `${name} create failed: ${JSON.stringify(create.body)}`)
      assert.equal(create.body.success, true)
      assert.ok(create.body.data?.id, `${name} did not return the created record`)
      const id = create.body.data.id
      created[name].push(id)

      const read = await api(`/${name}/${id}`)
      assert.equal(read.status, 200)
      assert.equal(read.body.success, true)
      assert.equal(read.body.data.id, id)

      const remove = await api(`/${name}/${id}`, { method: 'DELETE', token: tokens.admin })
      assert.equal(remove.status, 200)
      assert.equal(remove.body.success, true)
    })
  }

  test('an update may omit unchanged fields', async () => {
    const create = await api('/educators', {
      method: 'POST', token: tokens.admin, body: validPayload.educators(),
    })
    const id = create.body.data.id
    created.educators.push(id)

    const update = await api(`/educators/${id}`, {
      method: 'PUT', token: tokens.admin, body: { position: 'Senior Tutor' },
    })
    assert.equal(update.status, 200)
    assert.equal(update.body.data.position, 'Senior Tutor')
    assert.match(update.body.data.name, /Educator/, 'the untouched name was lost')
  })

  test('an update may not blank a required field', async () => {
    // Absent is fine on an update; empty would write '' into a NOT NULL column.
    const create = await api('/educators', {
      method: 'POST', token: tokens.admin, body: validPayload.educators(),
    })
    const id = create.body.data.id
    created.educators.push(id)

    const update = await api(`/educators/${id}`, {
      method: 'PUT', token: tokens.admin, body: { name: '' },
    })
    assert.equal(update.status, 400)
    assert.match(update.body.error, /name/i)
  })
})

describe('gallery will not publish media without recorded consent', () => {
  const media = () => ({
    title: `${MARKER}Photo`, type: 'Photo', category: 'Event',
    url: 'https://example.com/photo.jpg',
  })

  test('consent must be confirmed', async () => {
    const { status, body } = await api('/gallery', {
      method: 'POST', token: tokens.admin, body: media(),
    })
    assert.equal(status, 400)
    assert.match(body.error, /consent/i)
  })

  test('confirming consent without naming the release is not enough', async () => {
    const { status, body } = await api('/gallery', {
      method: 'POST', token: tokens.admin, body: { ...media(), consentConfirmed: true },
    })
    assert.equal(status, 400)
    assert.match(body.error, /release/i)
  })

  test('consent plus a reference is accepted', async () => {
    const { status, body } = await api('/gallery', {
      method: 'POST',
      token: tokens.admin,
      body: { ...media(), consentConfirmed: true, consentReference: 'Signed release 2026-01' },
    })
    assert.equal(status, 201, JSON.stringify(body))
    assert.equal(body.success, true)
  })
})
