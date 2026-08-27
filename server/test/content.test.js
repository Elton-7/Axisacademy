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
const bcrypt = require('bcrypt')

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
  const deadline = Date.now() + (Number(process.env.TEST_HEALTH_TIMEOUT_MS) || 180_000)
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
    content: 'Body text', category: 'Homeschooling', author: 'Suite',
  }),
}
const RESOURCES = Object.keys(validPayload)

before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: `${__dirname}/..`,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test', AUTH_RATE_LIMIT_MAX: '100', GENERAL_RATE_LIMIT_MAX: '100000', BCRYPT_COST: '4' },
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
  await models.Testimonial.destroy({ where: { author: like }, force: true })
  await models.Enrollment.destroy({ where: { studentName: like }, force: true })
  await models.Enrollment.destroy({ where: { parentName: like }, force: true })
  await User.destroy({ where: { id: Object.values(ids) } })
  await sequelize.close()
  serverProcess?.kill()
})

/**
 * Served by controllers/ rather than routes/, which is how they escaped the
 * first pass at making the responses consistent: /services and /testimonials
 * were still returning bare arrays long after everything else was enveloped.
 * They are listed separately because they are not full CRUD resources.
 */
const CONTROLLER_LISTS = ['services', 'testimonials']

describe('every content route answers in one shape', () => {
  for (const name of CONTROLLER_LISTS) {
    test(`GET /${name} returns an enveloped list`, async () => {
      const { status, body } = await api(`/${name}`)
      assert.equal(status, 200)
      assert.equal(body.success, true, `${name} did not envelope its list`)
      assert.ok(Array.isArray(body.data), `${name} data was not an array`)
    })
  }

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

  /*
   * The same rule for the routers keyed by an auto-increment integer, which had
   * no parameter check at all. Passing anything non-numeric reached Postgres,
   * which refuses to compare an integer column with a string, and the route
   * reported a 500 — the server saying it had failed when the request was
   * simply malformed. These are the routes that erase a learner's records and
   * manage accounts, so a misleading error there is the worst place for one.
   */
  const INTEGER_KEYED = [
    ['DELETE', '/data-protection/learners/abc'],
    ['GET', '/data-protection/learners/abc/export'],
    ['PUT', '/learners/abc'],
    ['POST', '/learners/abc/sessions'],
    ['PATCH', '/users/abc'],
    ['POST', '/users/abc/reset-password'],
    ['GET', '/users/abc/learners'],
  ]

  for (const [method, path] of INTEGER_KEYED) {
    test(`${method} ${path} is a 400, not a 500`, async () => {
      // No body on a GET: fetch refuses one, and the failure would look like a
      // route problem rather than a test problem.
      const { status } = await api(path, {
        method,
        token: tokens.admin,
        ...(method === 'GET' ? {} : { body: { confirmName: 'x' } }),
      })
      assert.equal(status, 400, `${method} ${path} did not reject a non-numeric id`)
    })
  }

  test('a well-formed but absent integer id is a 404, not a 400', async () => {
    const { status } = await api('/users/999999', { method: 'PATCH', token: tokens.admin, body: { name: 'x' } })
    assert.equal(status, 404, 'a valid id must still reach the handler')
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

      // Read back as staff. A resource is created as a draft, and a draft is
      // deliberately invisible to the public — the CMS still has to be able to
      // reopen it, which is what this asserts.
      const read = await api(`/${name}/${id}`, { token: tokens.admin })
      assert.equal(read.status, 200, `${name} could not be read back after creation`)
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

describe('a draft article is not readable by the public', () => {
  /*
   * Staff can read drafts so the CMS can reopen one after saving. This is the
   * other half of that rule: an unpublished article stays invisible to everyone
   * else, including through a direct link to its id. Without this, widening the
   * read rule again would go unnoticed.
   */
  test('returns 404 to an anonymous reader and 200 to staff', async () => {
    const created = await api('/resources', {
      method: 'POST',
      token: tokens.admin,
      body: {
        title: `${MARKER}Draft article`,
        slug: `cms-draft-${Date.now()}`,
        content: 'Body text',
        category: 'Homeschooling',
        author: 'Suite',
      },
    })
    assert.equal(created.status, 201, `draft create failed: ${JSON.stringify(created.body)}`)
    const id = created.body.data.id
    assert.equal(created.body.data.status, 'Draft', 'a new article should start as a draft')

    const anonymous = await api(`/resources/${id}`)
    assert.equal(anonymous.status, 404, 'a draft must not be readable without a token')

    const staff = await api(`/resources/${id}`, { token: tokens.admin })
    assert.equal(staff.status, 200, 'staff must be able to reopen their own draft')

    await api(`/resources/${id}`, { method: 'DELETE', token: tokens.admin })
  })

  /*
   * The same rule for the list, which is what the admin panel actually reads.
   * Filtering it for everyone meant a new article disappeared from the panel
   * the moment its author navigated away: still saved, still a draft, and with
   * no way left to find it, finish it or publish it.
   */
  test('a draft is listed for staff and hidden from everyone else', async () => {
    const created = await api('/resources', {
      method: 'POST',
      token: tokens.admin,
      body: {
        title: `${MARKER}Listed draft`,
        slug: `cms-listdraft-${Date.now()}`,
        content: 'Body text',
        category: 'Homeschooling',
        author: 'Suite',
      },
    })
    assert.equal(created.status, 201, JSON.stringify(created.body))
    const id = created.body.data.id

    const anonymous = await api('/resources?limit=200')
    assert.ok(!anonymous.body.data.some((r) => r.id === id), 'a visitor must not see a draft in the list')

    const staff = await api('/resources?limit=200', { token: tokens.admin })
    assert.ok(staff.body.data.some((r) => r.id === id), 'staff must find their draft in the list they manage')

    await api(`/resources/${id}`, { method: 'DELETE', token: tokens.admin })
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

/**
 * Resources that Axis links to rather than wrote.
 *
 * Every one of the sixteen works in the library is of this kind: a title, an
 * author, and a link to where the publisher hosts it. The column was made
 * nullable for that reason, but the route still demanded a body and never
 * accepted the link fields, so the admin panel could not create — or safely
 * edit — the only kind of resource the library contains. Worse, the only way
 * to add one was to paste the text in, which for someone else's paper is the
 * republishing the model comments warn against.
 */
describe('a resource can be linked instead of reproduced', () => {
  const linked = () => ({
    title: `${MARKER}Linked paper`,
    slug: `cms-linked-${Date.now()}`,
    category: 'Parenting & Learning',
    author: 'Someone Else',
    excerpt: 'A paper published elsewhere and listed here.',
    sourceUrl: 'https://example.com/the-paper',
  })
  let id

  test('a resource with no body but a source link is accepted', async () => {
    const { status, body } = await api('/resources', {
      method: 'POST', token: tokens.admin, body: linked(),
    })
    assert.equal(status, 201, JSON.stringify(body))
    assert.equal(body.data.sourceUrl, 'https://example.com/the-paper', 'the link is stored')
    id = body.data.id
  })

  test('a resource with neither a body nor a link is refused', async () => {
    const { slug, ...rest } = linked()
    const { status, body } = await api('/resources', {
      method: 'POST',
      token: tokens.admin,
      body: { ...rest, slug: `cms-empty-${Date.now()}`, sourceUrl: undefined },
    })
    assert.equal(status, 400)
    assert.match(body.error, /link|text/i)
  })

  test('editing other fields does not blank the link', async () => {
    const { status, body } = await api(`/resources/${id}`, {
      method: 'PUT', token: tokens.admin, body: { author: 'Someone Else, revised' },
    })
    assert.equal(status, 200, JSON.stringify(body))
    assert.equal(body.data.sourceUrl, 'https://example.com/the-paper', 'the link survives an unrelated edit')
  })

  test('the link can be changed', async () => {
    const { body } = await api(`/resources/${id}`, {
      method: 'PUT', token: tokens.admin, body: { sourceUrl: 'https://example.com/moved' },
    })
    assert.equal(body.data.sourceUrl, 'https://example.com/moved')
  })

  test('a malformed link is rejected', async () => {
    const { status } = await api(`/resources/${id}`, {
      method: 'PUT', token: tokens.admin, body: { sourceUrl: 'not-a-url' },
    })
    assert.equal(status, 400)
  })
})

/**
 * Testimonials, which quote parents and children by name.
 *
 * They were publishable but not removable: create was the only write route, so
 * a withdrawn consent could not be honoured without editing the database. The
 * point of these tests is the whole lifecycle, not just the guard on create —
 * a quote that cannot be taken down is the failure that matters.
 */
describe('a testimonial can be published, corrected and withdrawn', () => {
  const quote = () => ({
    text: `${MARKER}Our daughter looks forward to every session.`,
    author: `${MARKER}Parent`,
    role: 'Parent',
    rating: 5,
  })
  let id

  test('consent must be confirmed', async () => {
    const { status, body } = await api('/testimonials', {
      method: 'POST', token: tokens.admin, body: quote(),
    })
    assert.equal(status, 400)
    assert.match(body.error, /consent/i)
  })

  test('confirming consent without naming the signed record is not enough', async () => {
    const { status, body } = await api('/testimonials', {
      method: 'POST', token: tokens.admin, body: { ...quote(), consentConfirmed: true },
    })
    assert.equal(status, 400)
    assert.match(body.error, /consent/i)
  })

  test('consent plus a reference is accepted, and records who confirmed it', async () => {
    const { status, body } = await api('/testimonials', {
      method: 'POST',
      token: tokens.admin,
      body: { ...quote(), consentConfirmed: true, consentReference: 'Signed consent 2026-02' },
    })
    assert.equal(status, 201, JSON.stringify(body))
    assert.equal(body.data.consentConfirmed, true)
    assert.ok(body.data.consentConfirmedAt, 'the time consent was confirmed is recorded')
    assert.equal(body.data.consentConfirmedBy, ids.admin, 'the person who confirmed it is recorded')
    id = body.data.id
  })

  test('a request cannot forge the provenance of its own consent', async () => {
    const { body } = await api('/testimonials', {
      method: 'POST',
      token: tokens.admin,
      body: {
        ...quote(),
        consentConfirmed: true,
        consentReference: 'Signed consent 2026-03',
        consentConfirmedBy: 999999,
        consentConfirmedAt: '2000-01-01T00:00:00.000Z',
      },
    })
    assert.equal(body.data.consentConfirmedBy, ids.admin, 'the supplied confirmer is ignored')
    assert.notEqual(new Date(body.data.consentConfirmedAt).getFullYear(), 2000)
  })

  test('a published quote is visible to the public', async () => {
    const { body } = await api('/testimonials')
    assert.ok(body.data.some((t) => t.id === id), 'the consented quote is served')
  })

  test('consent cannot be withdrawn while the quote stays published', async () => {
    const { status, body } = await api(`/testimonials/${id}`, {
      method: 'PUT', token: tokens.admin, body: { consentConfirmed: false },
    })
    assert.equal(status, 400)
    assert.match(body.error, /consent/i)
  })

  test('withdrawing consent and unpublishing together is accepted', async () => {
    const { status, body } = await api(`/testimonials/${id}`, {
      method: 'PUT', token: tokens.admin, body: { consentConfirmed: false, isActive: false },
    })
    assert.equal(status, 200, JSON.stringify(body))
    assert.equal(body.data.consentConfirmed, false)
    assert.equal(body.data.consentConfirmedBy, null, 'the stale approval is cleared')
  })

  test('a withdrawn quote is gone from the public list but visible to staff', async () => {
    const anonymous = await api('/testimonials')
    assert.ok(!anonymous.body.data.some((t) => t.id === id), 'the public no longer sees it')
    const staff = await api('/testimonials', { token: tokens.admin })
    assert.ok(staff.body.data.some((t) => t.id === id), 'staff can still see and restore it')
  })

  test('delete takes a quote off the site', async () => {
    const { body } = await api('/testimonials', {
      method: 'POST',
      token: tokens.admin,
      body: { ...quote(), consentConfirmed: true, consentReference: 'Signed consent 2026-04' },
    })
    const removed = await api(`/testimonials/${body.data.id}`, { method: 'DELETE', token: tokens.admin })
    assert.equal(removed.status, 200)
    const anonymous = await api('/testimonials')
    assert.ok(!anonymous.body.data.some((t) => t.id === body.data.id))
  })

  test('a parent account cannot change a testimonial', async () => {
    const { status } = await api(`/testimonials/${id}`, {
      method: 'PUT', token: tokens.parent, body: { isActive: true },
    })
    assert.equal(status, 403)
  })

  test('a malformed id is a 400, not a 500', async () => {
    const { status } = await api('/testimonials/not-a-number', { method: 'DELETE', token: tokens.admin })
    assert.equal(status, 400)
  })
})

/**
 * The public enquiry form, which is the only path a parent has.
 *
 * Enrollment has six ENUM columns and the form can leave three of them blank.
 * An untouched select posts an empty string, which Postgres refuses for an
 * ENUM, so the enquiry came back as a 500 — for every parent who did not pick
 * a preferred learning model, which is the default.
 */
describe('a parent can send an enquiry', () => {
  const base = () => ({
    studentName: `${MARKER}Enquiry`,
    email: 'enquiry-suite@axis.local',
    programme: 'Academic Learning & Homeschooling',
    ageGroup: '6-8',
    contactConsent: true,
  })

  test('the minimum an enquiry needs is accepted', async () => {
    const { status, body } = await api('/enrollments', { method: 'POST', body: base() })
    assert.equal(status, 201, JSON.stringify(body))
    assert.equal(body.success, true)
  })

  test('untouched optional fields do not break it', async () => {
    // Exactly what the form posts when only the required fields are filled.
    const { status, body } = await api('/enrollments', {
      method: 'POST',
      body: {
        ...base(),
        preferredLearningModel: '', preferredDays: '', preferredTimes: '',
        parentName: '', phone: '', location: '', currentSchool: '',
        curriculum: '', gradeClass: '', subjects: '', learningNeeds: '', notes: '',
      },
    })
    assert.equal(status, 201, JSON.stringify(body))
    assert.equal(body.data.preferredLearningModel, null, 'blank should be stored as null')
  })

  test('a consultation request with no channel chosen is accepted', async () => {
    const { status, body } = await api('/enrollments/consultation', {
      method: 'POST',
      body: {
        parentName: `${MARKER}Consult`,
        email: 'consult-suite@axis.local',
        preferredChannel: '', phone: '', notes: '',
        contactConsent: true,
      },
    })
    assert.equal(status, 201, JSON.stringify(body))
    assert.equal(body.data.preferredChannel, null)
  })

  test('consent is still required', async () => {
    const { status } = await api('/enrollments', {
      method: 'POST', body: { ...base(), contactConsent: false },
    })
    assert.equal(status, 400)
  })
})
