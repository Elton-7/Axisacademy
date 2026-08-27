/**
 * The JSON POST helper the error webhook and the build hook both use.
 *
 * Worth testing on its own because both callers swallow failures by design — a
 * monitoring call must never become a second outage — so a broken transport
 * here produces no error anywhere, just silence where an alert should have
 * been. That is exactly what happened with global fetch on the deployment's
 * interpreter, and it went unnoticed precisely because nothing complained.
 *
 * Runs against a real socket rather than a stub, so it would catch the same
 * class of problem again.
 */
const assert = require('node:assert/strict')
const { after, before, describe, test } = require('node:test')
const http = require('node:http')

const { postJson } = require('../lib/postJson')

let server
let received
let port
let delayMs = 0

before(async () => {
  server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      received = { method: req.method, contentType: req.headers['content-type'], body }
      const reply = () => {
        if (req.url === '/refuses') {
          res.writeHead(500, { 'content-type': 'application/json' })
          return res.end('{"error":"no"}')
        }
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end('{"ok":true}')
      }
      if (delayMs) setTimeout(reply, delayMs)
      else reply()
    })
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  port = server.address().port
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
})

describe('posting JSON without global fetch', () => {
  test('sends the payload as JSON and returns the status', async () => {
    const response = await postJson(`http://127.0.0.1:${port}/hook`, { text: 'hello', n: 1 })
    assert.equal(response.status, 200)
    assert.equal(received.method, 'POST')
    assert.equal(received.contentType, 'application/json')
    assert.deepEqual(JSON.parse(received.body), { text: 'hello', n: 1 })
  })

  test('reports a failing status rather than throwing', async () => {
    const response = await postJson(`http://127.0.0.1:${port}/refuses`, { text: 'hello' })
    assert.equal(response.status, 500, 'the caller decides what a 500 means')
  })

  test('a unicode payload is measured in bytes, not characters', async () => {
    // Content-Length counts bytes; a name with an accent is longer than its
    // length in characters, and getting that wrong truncates the request.
    await postJson(`http://127.0.0.1:${port}/hook`, { name: 'Wanjirũ — Kīambu' })
    assert.deepEqual(JSON.parse(received.body), { name: 'Wanjirũ — Kīambu' })
  })

  test('gives up rather than hanging', async () => {
    delayMs = 400
    try {
      await postJson(`http://127.0.0.1:${port}/hook`, { text: 'slow' }, { timeoutMs: 80 })
      assert.fail('a slow endpoint should not be waited on indefinitely')
    } catch (error) {
      assert.match(error.message, /timed out/)
    } finally {
      delayMs = 0
    }
  })

  test('an unreachable host rejects', async () => {
    await assert.rejects(() => postJson('http://127.0.0.1:1/hook', { text: 'nobody' }))
  })

  test('a malformed URL rejects without making a request', async () => {
    await assert.rejects(() => postJson('not a url', { text: 'x' }), /not a valid URL/)
  })
})
