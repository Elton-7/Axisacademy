const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const { spawn } = require('node:child_process')

const baseUrl = `http://127.0.0.1:${process.env.TEST_PORT || 5050}/api`
let serverProcess
let token

async function waitForHealth() {
  // Startup runs sequelize.sync({ alter: true }), and the first run after a
  // model change has to migrate the schema before it can listen. Fifteen
  // seconds was not enough for that and failed as though the API were broken.
  const timeoutMs = Number(process.env.TEST_HEALTH_TIMEOUT_MS) || 60_000
  const intervalMs = 500
  const attempts = Math.ceil(timeoutMs / intervalMs)

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`)
      if (response.ok) return response.json()
    } catch (error) {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
  throw new Error(`API did not become healthy within ${timeoutMs}ms`)
}

before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: process.env.TEST_PORT || '5050', NODE_ENV: 'test' },
    stdio: 'ignore',
  })
  const health = await waitForHealth()
  assert.equal(health.status, 'OK')
  assert.equal(health.database, 'connected')

  if (!process.env.ADMIN_TEST_PASSWORD) return

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_TEST_PASSWORD }),
  })
  assert.equal(response.status, 200)
  token = (await response.json()).token
})

after(() => {
  serverProcess?.kill()
})

test('health endpoint reports database connectivity', async () => {
  const response = await fetch(`${baseUrl}/health`)
  const health = await response.json()
  assert.equal(response.status, 200)
  assert.deepEqual(health.status, 'OK')
  assert.deepEqual(health.database, 'connected')
})

test('authenticated dashboard endpoints return database data', async (t) => {
  if (!token) {
    t.skip('Set ADMIN_TEST_PASSWORD to run authenticated integration assertions')
    return
  }
  const headers = { authorization: `Bearer ${token}` }
  const [stats, contacts, enrollments, audit] = await Promise.all([
    fetch(`${baseUrl}/stats/dashboard`, { headers }),
    fetch(`${baseUrl}/contacts?page=1&limit=10`, { headers }),
    fetch(`${baseUrl}/enrollments?page=1&limit=10`, { headers }),
    fetch(`${baseUrl}/audit?page=1&limit=10`, { headers }),
  ])

  assert.equal(stats.status, 200)
  assert.equal(contacts.status, 200)
  assert.equal(enrollments.status, 200)
  assert.equal(audit.status, 200)
  assert.equal((await stats.json()).success, true)
  assert.equal((await contacts.json()).success, true)
  assert.equal((await enrollments.json()).success, true)
  assert.equal((await audit.json()).success, true)
})

test('resources endpoint is available for public browsing', async () => {
  const response = await fetch(`${baseUrl}/resources?limit=10`)
  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.equal(payload.success, true)
  assert.ok(Array.isArray(payload.data))
})
