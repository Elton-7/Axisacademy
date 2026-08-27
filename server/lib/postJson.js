const http = require('node:http')
const https = require('node:https')

/**
 * POSTs JSON to a URL, without depending on global fetch.
 *
 * The API is deployed under an interpreter that predates fetch. Nothing noticed
 * for a long time, because the only two callers are optional: an error webhook
 * and a build hook, both wrapped in a try/catch that logs and moves on. So they
 * would not have crashed anything — they would simply never have worked, while
 * looking configured. Someone would set ERROR_WEBHOOK_URL, see no alerts, and
 * reasonably conclude nothing had gone wrong.
 *
 * The timeout is enforced on the socket rather than through AbortSignal, which
 * arrived in the same era as fetch and would have the same problem.
 *
 * @param {string} url
 * @param {object} payload
 * @param {{ timeoutMs?: number }} options
 * @returns {Promise<{ status: number, body: string }>}
 */
function postJson(url, payload, { timeoutMs = 5000 } = {}) {
  return new Promise((resolve, reject) => {
    let target
    try {
      target = new URL(url)
    } catch {
      return reject(new Error(`not a valid URL: ${url}`))
    }

    const transport = target.protocol === 'http:' ? http : https
    const body = JSON.stringify(payload)

    const request = transport.request(
      {
        hostname: target.hostname,
        port: target.port || (target.protocol === 'http:' ? 80 : 443),
        path: `${target.pathname}${target.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => resolve({ status: response.statusCode, body: data }))
      }
    )

    request.on('error', reject)
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`timed out after ${timeoutMs}ms`))
    })

    request.write(body)
    request.end()
  })
}

module.exports = { postJson }
