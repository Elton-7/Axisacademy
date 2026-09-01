/**
 * Asks the API to restart, and tells you the truth about whether it did.
 *
 * On this host nothing an account can reach will restart the application. That
 * is not for want of trying; every one of these was attempted and disproved
 * against a signal that cannot be faked:
 *
 *   tmp/restart.txt in the app root, the document root and above it
 *   a fresh PassengerAppGroupName
 *   a trailing slash on PassengerAppRoot, and a different PassengerStartupFile
 *   unregistering the application and registering it again
 *   PassengerApps ensure_deps, which does run npm install
 *   PassengerApps edit_application — permanently broken here, see below
 *   an idle window with no traffic at all
 *   killing the process from cron
 *
 * The last one deserves its own note, because an earlier version of this script
 * did exactly that and reported success every time. The server is LiteSpeed,
 * not Apache: it reads the Passenger directives but runs the application
 * itself, and keeps that process where this account cannot see it. A cron job
 * here gets its own PID namespace — `ps -u <user>` from cron lists three
 * processes, all of them the cron job — so the pkill matched nothing, killed
 * nothing, and exited 0. Meanwhile /api/health answered 200 throughout, because
 * the old process was still serving it. Every signal said restarted.
 *
 * edit_application cannot be used at all: cPanel recorded this application's
 * python interpreter as /usr/bin/python-html2text, which is not a python, and
 * its own validator now rejects that value on every edit.
 *
 * So this script attempts the one harmless thing that ought to work, then
 * checks /api/health's startedAt — which changes if and only if a new process
 * began — and if nothing happened, says so and tells you what a human must do.
 * It will not report a restart it cannot see.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   APP_ROOT   application root on the host, defaults to the Axis API
 *   PROBE_URL  health endpoint, must report startedAt
 *
 * Usage:  node scripts/restart-cpanel-app.mjs
 */
import https from 'node:https'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const APP_ROOT = process.env.APP_ROOT || `/home/${USER}/repos/axis/server`
const PROBE_URL = process.env.PROBE_URL || 'https://www.axislearning.co.ke/api/health'

if (!HOST || !USER || !TOKEN) {
  console.error('restart-cpanel-app: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}

const uapi = (module, fn, params = {}, method = 'GET') =>
  new Promise((resolve, reject) => {
    const body = method === 'POST' ? new URLSearchParams(params).toString() : ''
    const qs = method === 'GET' ? `?${new URLSearchParams(params).toString()}` : ''
    const req = https.request(
      {
        host: HOST, port: PORT, method,
        path: `/execute/${module}/${fn}${qs}`,
        rejectUnauthorized: false,
        headers: {
          Authorization: `cpanel ${USER}:${TOKEN}`,
          ...(method === 'POST'
            ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
            : {}),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 200))) } })
      }
    )
    req.on('error', reject)
    if (method === 'POST') req.write(body)
    req.end()
  })

const health = () =>
  new Promise((resolve) => {
    https
      .get(PROBE_URL, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve({}) } })
      })
      .on('error', () => resolve({}))
      .setTimeout(20000, function () { this.destroy(); resolve({}) })
  })

const before = await health()
if (!before.startedAt) {
  console.log('  the live API does not report startedAt, so it is running code from')
  console.log('  before that was added. Any restart at all will be visible as a change.')
} else {
  console.log(`  running since: ${before.startedAt}`)
}

await uapi('Fileman', 'save_file_content', {
  dir: `${APP_ROOT}/tmp`, file: 'restart.txt', content: `${new Date().toISOString()}\n`,
}, 'POST')
console.log('  touched tmp/restart.txt; knocking for two minutes')

// LiteSpeed notices a restart file when a request arrives, not on a timer.
for (let i = 1; i <= 20; i += 1) {
  await new Promise((r) => setTimeout(r, 6000))
  const now = await health()
  if (now.startedAt && now.startedAt !== before.startedAt) {
    console.log(`\n  RESTARTED — running since ${now.startedAt}`)
    process.exit(0)
  }
}

console.log('\n  NOT RESTARTED. The application is still the process that was already running,')
console.log('  and any code or .env change you deployed is on disk but not running.')
console.log('\n  A person has to do it, in cPanel:')
console.log('    Software > Setup Node.js App > the axis-api application > RESTART')
console.log('    or, if that page is absent, ask the host to restart the application.')
console.log(`\n  Confirm afterwards — startedAt at ${PROBE_URL} must change.`)
process.exit(1)
