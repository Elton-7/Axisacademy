/**
 * Keeps the API from going cold, so no visitor pays for the first request.
 *
 * LiteSpeed stops the application when nothing has asked for it in a while, and
 * starts it again on the next request. That is fine for the second visitor and
 * poor for the first: they wait through a cold start, and if they arrive at the
 * wrong moment they get a 503 rather than a page. It was observed exactly that
 * way — six days of quiet, then a 503 on the first probe and a healthy 200
 * thirty-eight seconds later.
 *
 * So a cron job asks for /api/health every five minutes. The interval is
 * deliberately shorter than any plausible idle timeout rather than tuned to a
 * measured one, because the timeout is not published and guessing high risks
 * exactly the cold start this exists to prevent.
 *
 * The response is written to a log on the host, so "is it actually working?" is
 * answerable by reading a file rather than by inferring from uptime — which is
 * the same mistake as trusting a 200 to prove a restart happened.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   PROBE_URL   what to request, defaults to the live health endpoint
 *
 * Usage:  node scripts/keep-api-warm.mjs            install it, or report it
 *         node scripts/keep-api-warm.mjs --status   report without changing
 *         node scripts/keep-api-warm.mjs --remove   take it off
 */
import https from 'node:https'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const PROBE_URL = process.env.PROBE_URL || 'https://www.axislearning.co.ke/api/health'
const LOG = `/home/${USER}/keepwarm.log`
const MARKER = 'keepwarm.log'

const remove = process.argv.includes('--remove')
const statusOnly = process.argv.includes('--status')

if (!HOST || !USER || !TOKEN) {
  console.error('keep-api-warm: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}

const request = (path) =>
  new Promise((resolve, reject) => {
    https
      .request(
        { host: HOST, port: PORT, path, rejectUnauthorized: false, headers: { Authorization: `cpanel ${USER}:${TOKEN}` } },
        (res) => {
          let d = ''
          res.on('data', (c) => (d += c))
          res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 200))) } })
        }
      )
      .on('error', reject)
      .end()
  })

const api2 = (module, func, params = {}) =>
  request(`/json-api/cpanel?${new URLSearchParams({
    cpanel_jsonapi_user: USER, cpanel_jsonapi_apiversion: '2',
    cpanel_jsonapi_module: module, cpanel_jsonapi_func: func, ...params,
  })}`)

const uapi = (module, fn, params = {}) => request(`/execute/${module}/${fn}?${new URLSearchParams(params)}`)

const findJob = async () => {
  const list = await api2('Cron', 'fetchcron')
  return (list.cpanelresult.data || []).find((l) => String(l.command || '').includes(MARKER))
}

const existing = await findJob()

if (statusOnly || (!remove && existing)) {
  if (!existing) {
    console.log('  not installed')
  } else {
    console.log(`  installed: ${existing.minute} ${existing.hour} ${existing.day} ${existing.month} ${existing.weekday}`)
    console.log(`  command:   ${existing.command}`)
    const log = await uapi('Fileman', 'get_file_content', { dir: `/home/${USER}`, file: 'keepwarm.log' })
    const text = String((log.data || {}).content || '').trim()
    console.log(`  last response: ${text ? text.slice(0, 140) : '(nothing written yet — it may not have fired)'}`)
  }
  process.exit(0)
}

if (remove) {
  if (!existing) { console.log('  nothing to remove'); process.exit(0) }
  await api2('Cron', 'remove_line', { linekey: existing.linekey, line: existing.line })
  console.log(`  removed: ${!(await findJob())}`)
  process.exit(0)
}

// Deliberately free of quotes, braces and semicolons: anything more elaborate
// than one command and one redirect has reached cron on this host mangled, and
// silently done nothing.
const command = `curl -sS ${PROBE_URL} > ${LOG} 2>&1`

const added = await api2('Cron', 'add_line', {
  command,
  minute: '*/5',
  hour: '*',
  day: '*',
  month: '*',
  weekday: '*',
})
const ok = ((added.cpanelresult.data || [])[0] || {}).status === 1
console.log(`  installed every 5 minutes: ${ok ? 'yes' : 'no — ' + JSON.stringify(added.cpanelresult).slice(0, 160)}`)
if (!ok) process.exit(1)

const stored = await findJob()
console.log(`  stored: ${stored ? stored.command : '(not found)'}`)

// Wait for it to fire, then read what it actually wrote. An installed job that
// never runs, or runs a command the host does not have, looks identical to a
// working one from here.
console.log('  waiting up to six minutes for it to fire')
for (let i = 1; i <= 12; i += 1) {
  await new Promise((r) => setTimeout(r, 30000))
  const log = await uapi('Fileman', 'get_file_content', { dir: `/home/${USER}`, file: 'keepwarm.log' })
  const text = String((log.data || {}).content || '').trim()
  if (text) {
    console.log(`\n  it ran, and wrote: ${text.slice(0, 160)}`)
    console.log(text.includes('startedAt') ? '  the API answered — the ping works' : '  WARNING: that is not a health response; check the command')
    process.exit(text.includes('startedAt') ? 0 : 1)
  }
}

console.error('\n  it has not written anything. The job is installed but may not be running.')
console.error('  Check with --status, and remove it with --remove if it is not working.')
process.exit(1)
