/**
 * Schedules a nightly database backup on the host, and proves it works first.
 *
 * Nothing scheduled one before this. cPanel listed no backups of its own, and the
 * only cron job on the account was the keep-warm probe, so losing the database
 * would have lost every enquiry and learner record with no copy to restore.
 *
 * The dumps land in server/backups on the host — outside public_html, so never
 * served — and server/scripts/backup.js keeps fourteen days of them. A dump on
 * the same machine as the database does not survive losing the machine, so
 * copy one off it now and then; this covers the commoner failures, a table
 * emptied by mistake or a migration gone wrong.
 *
 * A job that is installed but never works looks exactly like one that does, so
 * before the nightly schedule goes in, the same command is run once from cron
 * (the only way to run anything on this host) and its log is read back.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   APP_ROOT   application root on the host, defaults to the Axis API
 *
 * Usage:  node scripts/schedule-backup.mjs            test, then install
 *         node scripts/schedule-backup.mjs --status   report without changing
 *         node scripts/schedule-backup.mjs --remove   take it off
 */
import https from 'node:https'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const APP_ROOT = process.env.APP_ROOT || `/home/${USER}/repos/axis/server`
const LOG = 'backup.log'
const TEST_LOG = 'backup-test.log'

const remove = process.argv.includes('--remove')
const statusOnly = process.argv.includes('--status')

if (!HOST || !USER || !TOKEN) {
  console.error('schedule-backup: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
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

// Same constraints as the keep-warm job: one command, one redirect, no quotes,
// braces or semicolons, which this host's cron has mangled before.
const commandFor = (log) => `/usr/bin/node ${APP_ROOT}/scripts/backup.js > /home/${USER}/${log} 2>&1`

const findJob = async (log) => {
  const list = await api2('Cron', 'fetchcron')
  return (list.cpanelresult.data || []).find((l) => String(l.command || '').endsWith(`/${log} 2>&1`))
}

const readLog = async (log) => {
  const r = await uapi('Fileman', 'get_file_content', { dir: `/home/${USER}`, file: log })
  return r.status ? String((r.data || {}).content || '').trim() : ''
}

const existing = await findJob(LOG)

if (statusOnly) {
  if (!existing) console.log('  not installed')
  else {
    console.log(`  installed: ${existing.minute} ${existing.hour} ${existing.day} ${existing.month} ${existing.weekday}`)
    console.log(`  last run:  ${(await readLog(LOG)).split('\n')[0] || '(nothing written yet)'}`)
  }
  process.exit(0)
}

if (remove) {
  if (!existing) { console.log('  nothing to remove'); process.exit(0) }
  await api2('Cron', 'remove_line', { linekey: existing.linekey, line: existing.line })
  console.log(`  removed: ${!(await findJob(LOG))}`)
  process.exit(0)
}

if (existing) {
  console.log(`  already installed: ${existing.minute} ${existing.hour} * * *`)
  process.exit(0)
}

// The test run. Every minute until it fires once, then taken straight off, so
// it cannot keep dumping the database once a minute if this script dies.
console.log('  test run: waiting up to three minutes for cron to fire it')
await uapi('Fileman', 'save_file_content', { dir: `/home/${USER}`, file: TEST_LOG, content: '' })
await api2('Cron', 'add_line', { command: commandFor(TEST_LOG), minute: '*', hour: '*', day: '*', month: '*', weekday: '*' })
let result = ''
try {
  for (let i = 0; i < 18 && !/Backup written|failed|not found|error/i.test(result); i += 1) {
    await new Promise((r) => setTimeout(r, 10000))
    result = await readLog(TEST_LOG)
  }
} finally {
  const test = await findJob(TEST_LOG)
  if (test) await api2('Cron', 'remove_line', { linekey: test.linekey, line: test.line })
}

console.log(`  it wrote: ${result ? result.split('\n').slice(0, 3).join(' | ') : '(nothing — cron did not fire)'}`)
if (!/Backup written/.test(result)) {
  console.error('schedule-backup: the test backup did not succeed, so nothing was scheduled.')
  process.exit(1)
}

// 01:15 server time. Quiet for the site, and well away from the keep-warm
// probe's five-minute marks.
await api2('Cron', 'add_line', { command: commandFor(LOG), minute: '15', hour: '1', day: '*', month: '*', weekday: '*' })
const stored = await findJob(LOG)
console.log(`  nightly backup installed: ${stored ? 'yes, 01:15 server time' : 'no'}`)
if (!stored) process.exit(1)
