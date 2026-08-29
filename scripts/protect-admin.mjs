/**
 * Puts an Apache password in front of /admin, ahead of the app's own sign-in.
 *
 * Two secrets instead of one, and an attacker never reaches the login form or
 * learns whether an account exists. It is not a replacement for the app's
 * authentication — that is what actually protects the data — it is a second
 * gate on the one door that leads to everything.
 *
 * Only /admin is covered. The parent and educator portals stay open, because
 * families use them and cannot be handed a shared password.
 *
 * The password is hashed here and only the hash is sent. It is never written to
 * this repository and never printed.
 *
 *   ADMIN_BASIC_USER      the name staff will type, defaults to "axis"
 *   ADMIN_BASIC_PASSWORD  optional — you are asked for it if it is absent
 *   CPANEL_HOST / CPANEL_USER / CPANEL_PASSWORD or CPANEL_API_TOKEN
 *
 * Usage:
 *   node scripts/protect-admin.mjs              asks for the password
 *   node scripts/protect-admin.mjs --remove     takes the gate off again
 *
 * It verifies the result before finishing: /admin must refuse an anonymous
 * caller and accept the credentials, and the public site and the family
 * portals must be untouched. Locking the site out is the obvious way for this
 * to go wrong, so it is checked rather than assumed.
 */
import https from 'node:https'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

/**
 * bcrypt comes from the server's dependencies rather than a second copy here.
 * There is one hashing implementation in this project and it should stay that
 * way; a scripts-level duplicate could drift to a different version and hash
 * differently from everything else.
 */
let bcrypt
try {
  bcrypt = createRequire(new URL('../server/package.json', import.meta.url))('bcrypt')
} catch {
  console.error('protect-admin: bcrypt is missing. Run `npm install` in server/ first.')
  process.exit(1)
}

const HOST = process.env.CPANEL_HOST
const USER = process.env.CPANEL_USER
const PASSWORD = process.env.CPANEL_PASSWORD
const TOKEN = process.env.CPANEL_API_TOKEN
const PORT = Number(process.env.CPANEL_PORT || 2083)
const SITE = process.env.VITE_SITE_URL || 'https://www.axislearning.co.ke'

const BASIC_USER = process.env.ADMIN_BASIC_USER || 'axis'
const REMOVE = process.argv.includes('--remove')

/**
 * Three ways to supply the password, and the order is the safety order.
 *
 * Typed when asked is best: it exists only in memory, and never reaches a file
 * or the shell's history. A .env file at the repository root is next — it is
 * ignored by git at every level, so it cannot be committed by accident, and it
 * keeps the password out of the history too. An environment variable set on the
 * command line works but is the weakest: shells record it, and `history` then
 * holds a live credential in plain text.
 *
 * Note this is the .env in this repository, not the one on the server. Apache
 * reads the hashed password file; the API's own environment has nothing to do
 * with this gate, and putting it there would do nothing at all.
 */
try {
  createRequire(new URL('../server/package.json', import.meta.url))('dotenv').config({
    path: fileURLToPath(new URL('../.env', import.meta.url)),
  })
} catch {
  // No .env, or no dotenv. Both fine — the other two routes still work.
}

async function askForPassword() {
  const readline = await import('node:readline')
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    // Suppress the echo so the password is not left on screen or in a scrollback.
    rl._writeToOutput = () => {}
    process.stdout.write('  Password staff will type: ')
    rl.question('', (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

if (!HOST || !USER || (!PASSWORD && !TOKEN)) {
  console.error('protect-admin: set CPANEL_HOST, CPANEL_USER and CPANEL_PASSWORD (or CPANEL_API_TOKEN).')
  process.exit(1)
}
let BASIC_PASSWORD = process.env.ADMIN_BASIC_PASSWORD

if (!REMOVE && !BASIC_PASSWORD) {
  if (process.stdin.isTTY) {
    BASIC_PASSWORD = await askForPassword()
  }
  if (!BASIC_PASSWORD) {
    console.error('protect-admin: no password given. Any of these works:')
    console.error('  run it from a terminal and it will ask, which is the safest')
    console.error('  put ADMIN_BASIC_PASSWORD in a .env at the repository root')
    console.error('  set ADMIN_BASIC_PASSWORD in the environment')
    process.exit(1)
  }
}

const HOME = `/home/${USER}`
const DOCROOT = process.env.CPANEL_DOCROOT || `${HOME}/public_html`
// Outside the web root, so the file of hashes is never itself downloadable.
const PASSWD_FILE = '.htpasswd-axis-admin'
const BEGIN = '# BEGIN axis-admin-gate'
const END = '# END axis-admin-gate'

const authHeader = TOKEN
  ? `cpanel ${USER}:${TOKEN}`
  : 'Basic ' + Buffer.from(`${USER}:${PASSWORD}`).toString('base64')

function uapi(module, fn, params = {}, method = 'GET') {
  const qs = new URLSearchParams(params).toString()
  const path = `/execute/${module}/${fn}` + (method === 'GET' && qs ? `?${qs}` : '')
  const body = method === 'POST' ? qs : null
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: HOST, port: PORT, path, method, rejectUnauthorized: false,
        headers: {
          Authorization: authHeader,
          ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => { try { resolve(JSON.parse(d)) } catch { reject(new Error(String(d).slice(0, 160))) } })
      }
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

/** Fetches a public URL, optionally with Basic credentials, and returns the status. */
function probe(url, credentials) {
  return new Promise((resolve, reject) => {
    const target = new URL(url)
    https
      .get(
        {
          hostname: target.hostname,
          path: target.pathname,
          headers: credentials
            ? { Authorization: 'Basic ' + Buffer.from(credentials).toString('base64') }
            : {},
        },
        (res) => { res.resume(); resolve(res.statusCode) }
      )
      .on('error', reject)
  })
}

async function readHtaccess() {
  const r = await uapi('Fileman', 'get_file_content', { dir: DOCROOT, file: '.htaccess' })
  return r.status ? String(r.data.content) : ''
}

async function writeHtaccess(content) {
  const w = await uapi('Fileman', 'save_file_content', { dir: DOCROOT, file: '.htaccess', content }, 'POST')
  if (!w.status) throw new Error((w.errors || []).join('; ').slice(0, 160))
}

/** Everything except our own block, so the rest of the file survives untouched. */
function withoutBlock(text) {
  const start = text.indexOf(BEGIN)
  if (start === -1) return text
  const stop = text.indexOf(END, start)
  return text.slice(0, start) + text.slice(stop === -1 ? text.length : stop + END.length)
}

;(async () => {
  const existing = await readHtaccess()

  if (REMOVE) {
    if (!existing.includes(BEGIN)) { console.log('  no password gate is installed'); return }
    await writeHtaccess(withoutBlock(existing).replace(/\n{3,}/g, '\n\n').trimEnd() + '\n')
    console.log('  password gate removed')
    console.log(`  /admin now answers ${await probe(`${SITE}/admin`)} to an anonymous caller`)
    return
  }

  /*
   * Apache's bcrypt support expects the $2y$ prefix. The algorithm is identical
   * to what this library produces; only the version marker differs. Rather than
   * trust that, the credentials are tested against the live server below — if
   * the format were rejected, the check fails loudly instead of leaving a door
   * that refuses the people who are supposed to come through it.
   */
  // A function replacement, not a string: '$2y$' as a literal would be read as
  // a backreference to a capture group that does not exist. It happens to
  // survive that, which is worse than failing — it would go unnoticed until a
  // version marker changed and the hash silently became something else.
  const hash = (await bcrypt.hash(BASIC_PASSWORD, 10)).replace(/^\$2[ab]\$/, () => '$2y$')
  const w = await uapi(
    'Fileman', 'save_file_content',
    { dir: HOME, file: PASSWD_FILE, content: `${BASIC_USER}:${hash}\n` },
    'POST'
  )
  if (!w.status) throw new Error(`could not write the password file: ${(w.errors || []).join('; ').slice(0, 120)}`)
  console.log(`  password file written to ${HOME}/${PASSWD_FILE} (outside the web root)`)

  const block = `${BEGIN}
# A password before the staff panel's own sign-in, so an attacker needs two
# secrets and never reaches the login form. Only /admin: families use the
# portals and cannot be handed a shared password.
<If "%{REQUEST_URI} =~ m#^/admin(/|$)#">
  AuthType Basic
  AuthName "Axis Learning staff area"
  AuthUserFile "${HOME}/${PASSWD_FILE}"
  Require valid-user
</If>
${END}
`

  await writeHtaccess(withoutBlock(existing).trimEnd() + '\n\n' + block)
  console.log('  apache rule installed')

  // Verify, rather than assume. Locking out the site is the failure that matters.
  const results = {
    'anonymous /admin (want 401)': await probe(`${SITE}/admin`),
    'correct credentials (want 200)': await probe(`${SITE}/admin`, `${BASIC_USER}:${BASIC_PASSWORD}`),
    'wrong credentials (want 401)': await probe(`${SITE}/admin`, `${BASIC_USER}:not-the-password`),
    'homepage still open (want 200)': await probe(`${SITE}/`),
    'family portal still open (want 200)': await probe(`${SITE}/portal/student`),
  }
  console.log()
  for (const [label, status] of Object.entries(results)) console.log(`  ${label.padEnd(38)} ${status}`)

  const good =
    results['anonymous /admin (want 401)'] === 401 &&
    results['correct credentials (want 200)'] === 200 &&
    results['wrong credentials (want 401)'] === 401 &&
    results['homepage still open (want 200)'] === 200 &&
    results['family portal still open (want 200)'] === 200

  if (!good) {
    console.error('\n  the gate did not behave as intended — rolling it back')
    await writeHtaccess(withoutBlock(await readHtaccess()).trimEnd() + '\n')
    console.error('  rolled back. Nothing is password-protected and the site is as it was.')
    process.exit(1)
  }
  console.log('\n  done. Staff are asked for this password before the panel loads.')
})().catch((e) => { console.error('  failed: ' + String(e.message).slice(0, 200)); process.exit(1) })
