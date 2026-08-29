/**
 * Restarts the API on cPanel, when nothing else will.
 *
 * Passenger is supposed to reload when tmp/restart.txt changes. On this host it
 * does not, and neither does anything else reachable through the API: disabling
 * and re-enabling the application, a fresh PassengerAppGroupName, rewriting the
 * document root's .htaccess or its parent, touching the startup file, running
 * npm install, or waiting out the idle timeout. All were tried; the deployed
 * files simply keep sitting on disk while the old process serves.
 *
 * cPanel's own Restart button works, and what it does underneath is end the
 * process. There is no restart in either the UAPI or API2 surface — both were
 * enumerated — so this schedules that one command as a cron job, waits for it to
 * fire, and removes the job again.
 *
 * It is deliberately a named script rather than an inline command, so that
 * permitting it in settings permits exactly this and nothing else.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN (or CPANEL_PASSWORD)
 *   APP_ENTRY   the application root to match, defaults to the Axis API
 *   PROBE_URL   an endpoint polled to confirm the app came back
 *
 * Usage:  node scripts/restart-cpanel-app.mjs
 */
import https from 'node:https'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PASSWORD = process.env.CPANEL_PASSWORD
const PORT = Number(process.env.CPANEL_PORT || 2083)
/**
 * The application ROOT, not the startup file.
 *
 * Passenger names its process after the directory it was told to run, so
 * matching on server.js finds nothing, kills nothing, and reports success —
 * which cost an afternoon of believing the restart had happened.
 */
const APP_ENTRY = process.env.APP_ENTRY || `/home/${USER}/repos/axis/server`
const PROBE_URL = process.env.PROBE_URL || 'https://api.axislearning.co.ke/api/health'

if (!HOST || !USER || (!TOKEN && !PASSWORD)) {
  console.error('restart-cpanel-app: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN (or CPANEL_PASSWORD).')
  process.exit(1)
}

const authHeader = TOKEN
  ? `cpanel ${USER}:${TOKEN}`
  : 'Basic ' + Buffer.from(`${USER}:${PASSWORD}`).toString('base64')

/** cPanel's older interface: the Cron module is not in UAPI on this account. */
function api2(module, func, params = {}) {
  const qs = new URLSearchParams({
    cpanel_jsonapi_user: USER,
    cpanel_jsonapi_apiversion: '2',
    cpanel_jsonapi_module: module,
    cpanel_jsonapi_func: func,
    ...params,
  }).toString()

  return new Promise((resolve, reject) => {
    https
      .request(
        { host: HOST, port: PORT, path: `/json-api/cpanel?${qs}`, rejectUnauthorized: false, headers: { Authorization: authHeader } },
        (res) => {
          let d = ''
          res.on('data', (c) => (d += c))
          res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 160))) } })
        }
      )
      .on('error', reject)
      .end()
  })
}

const probe = () =>
  new Promise((resolve) => {
    https
      .get(PROBE_URL, (res) => { res.resume(); resolve(res.statusCode) })
      .on('error', () => resolve(0))
      .setTimeout(20000, function () { this.destroy(); resolve(0) })
  })

/** Removes the job whatever happens, so a repeating kill can never be left behind. */
async function removeJob() {
  const list = await api2('Cron', 'fetchcron')
  const job = (list.cpanelresult.data || []).find((l) => String(l.command || '').includes(APP_ENTRY))
  if (!job) return false
  await api2('Cron', 'remove_line', { linekey: job.linekey, line: job.line })
  const after = await api2('Cron', 'fetchcron')
  return !(after.cpanelresult.data || []).some((l) => String(l.command || '').includes(APP_ENTRY))
}

let scheduled = false
try {
  // Scoped to this account and this application root, so nothing else on the
  // machine — including other accounts' processes — can be affected.
  const command = `pkill -u ${USER} -f ${APP_ENTRY}`
  const added = await api2('Cron', 'add_line', { command, minute: '*', hour: '*', day: '*', month: '*', weekday: '*' })
  const ok = ((added.cpanelresult.data || [])[0] || {}).status === 1
  if (!ok) throw new Error(JSON.stringify(added.cpanelresult).slice(0, 160))
  scheduled = true
  console.log('  restart scheduled; waiting for it to fire')

  // Cron fires on the minute, so this may wait up to two.
  for (let i = 1; i <= 6; i += 1) {
    await new Promise((r) => setTimeout(r, 30000))
    const status = await probe()
    console.log(`  ${i * 30}s: ${PROBE_URL.replace(/^https?:\/\//, '')} -> ${status || 'no answer'}`)
    if (i >= 4 && status === 200) break
  }
} finally {
  if (scheduled) {
    const removed = await removeJob()
    console.log(`  restart job removed: ${removed}`)
    if (!removed) console.error('  WARNING: remove the cron job by hand — it would keep killing the app every minute')
  }
}

const finalStatus = await probe()
console.log(`  application answering: HTTP ${finalStatus || 'no answer'}`)
