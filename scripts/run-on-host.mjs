/**
 * Runs one API script on the host, once, and prints what it wrote.
 *
 * There is no shell on this account. Cron is the only thing that can start a
 * process, so this adds an every-minute job, waits for it to fire, reads its
 * log back, and takes the job off again — in a finally, so a crash here cannot
 * leave it running the script once a minute for ever.
 *
 * The script must print a last line of `done` or `failed: ...`, which is how
 * this knows it has finished rather than merely started.
 *
 *   CPANEL_HOST / CPANEL_USER / CPANEL_API_TOKEN
 *   APP_ROOT   application root on the host, defaults to the Axis API
 *
 * Usage:  node scripts/run-on-host.mjs scripts/remove-demo-portal.js --apply
 */
import https from 'node:https'

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const APP_ROOT = process.env.APP_ROOT || `/home/${USER}/repos/axis/server`
const LOG = 'run-once.log'

const [script, ...args] = process.argv.slice(2)
if (!HOST || !USER || !TOKEN) {
  console.error('run-on-host: set CPANEL_HOST, CPANEL_USER and CPANEL_API_TOKEN.')
  process.exit(1)
}
// Cron on this host mangles quotes, braces and semicolons, so nothing that
// would need them is accepted.
if (!script || ![script, ...args].every((a) => /^[\w./=-]+$/.test(a))) {
  console.error('run-on-host: name a script relative to server/, with plain arguments only.')
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

const command = `/usr/bin/node ${APP_ROOT}/${[script, ...args].join(' ')} > /home/${USER}/${LOG} 2>&1`

const findJob = async () => {
  const list = await api2('Cron', 'fetchcron')
  return (list.cpanelresult.data || []).find((l) => String(l.command || '').endsWith(`/${LOG} 2>&1`))
}

const readLog = async () => {
  const r = await uapi('Fileman', 'get_file_content', { dir: `/home/${USER}`, file: LOG })
  return r.status ? String((r.data || {}).content || '').trim() : ''
}

if (await findJob()) {
  console.error('run-on-host: a previous run is still scheduled. Remove it from cPanel → Cron Jobs first.')
  process.exit(1)
}

await uapi('Fileman', 'save_file_content', { dir: `/home/${USER}`, file: LOG, content: '' })
await api2('Cron', 'add_line', { command, minute: '*', hour: '*', day: '*', month: '*', weekday: '*' })
console.log(`run-on-host: ${script} ${args.join(' ')} — waiting up to three minutes for cron`)

let log = ''
try {
  for (let i = 0; i < 18; i += 1) {
    await new Promise((r) => setTimeout(r, 10000))
    log = await readLog()
    // Taken off as soon as it has started, so it cannot fire a second time.
    if (log) break
  }
} finally {
  const job = await findJob()
  if (job) await api2('Cron', 'remove_line', { linekey: job.linekey, line: job.line })
}

for (let i = 0; i < 12 && log && !/^(done|failed:.*)$/m.test(log); i += 1) {
  await new Promise((r) => setTimeout(r, 5000))
  log = await readLog()
}

console.log(log ? log.split('\n').filter((l) => !l.startsWith('Executing')).join('\n') : '(nothing written — cron did not fire)')
if (!/^done$/m.test(log)) process.exit(1)
