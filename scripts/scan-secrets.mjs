/**
 * Fails the build if a credential is about to be committed.
 *
 * Nothing is exposed today — the client bundle, every tracked file and the
 * whole git history were checked and are clean. But "clean today" is not a
 * control, and the credentials this project uses are exactly the kind that get
 * pasted into a config file while debugging and then forgotten: a database URL
 * with the password in it, a hosting API key, a deploy hook that triggers
 * builds on demand.
 *
 * Patterns are anchored to real credential formats rather than to words like
 * "password", so this does not fire on documentation, on the .env.example
 * placeholders, or on the test fixture that deliberately contains a fake
 * connection string in order to prove the error handler never returns one.
 *
 * Run: node scripts/scan-secrets.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const PATTERNS = [
  { name: 'Render API key', re: /\brnd_[A-Za-z0-9]{20,}\b/ },
  { name: 'Neon database password', re: /\bnpg_[A-Za-z0-9]{10,}\b/ },
  { name: 'Netlify token', re: /\bnfp_[A-Za-z0-9]{20,}\b/ },
  { name: 'Netlify build hook', re: /api\.netlify\.com\/build_hooks\/[a-f0-9]{16,}/ },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { name: 'OpenAI-style key', re: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  {
    name: 'Database URL containing a password',
    // "postgres://user:pw@host" is allowed deliberately: a test asserts that
    // such a string never reaches a client, so the fixture has to contain one.
    re: /\bpostgres(?:ql)?:\/\/(?!user:pw@)[^\s:'"]+:[^\s@'"]{8,}@/,
  },
]

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .map((file) => file.trim())
  .filter(Boolean)
  // Lockfiles are enormous and machine-generated; media and fonts are binary.
  .filter((file) => !/package-lock\.json$|\.(png|jpe?g|webp|gif|svg|ico|pdf|woff2?|ttf|mp4)$/i.test(file))

const findings = []

for (const file of files) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  for (const { name, re } of PATTERNS) {
    const match = text.match(re)
    if (!match) continue
    const line = text.slice(0, match.index).split('\n').length
    findings.push({ file, line, name, sample: `${match[0].slice(0, 12)}…` })
  }
}

if (findings.length > 0) {
  console.error('\nSecrets found in tracked files:\n')
  for (const finding of findings) {
    console.error(`  ${finding.file}:${finding.line}  ${finding.name}  (${finding.sample})`)
  }
  console.error(
    '\nMove the value into an environment variable and rotate it. Anything that\n' +
      'has been committed must be treated as exposed even after it is deleted,\n' +
      'because it remains in the git history.\n'
  )
  process.exit(1)
}

console.log(`scan-secrets: ${files.length} tracked files checked, nothing found.`)
