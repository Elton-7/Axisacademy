# Deploying Axis Learning

Two systems are deployed separately. Netlify serves static files and cannot run
the API or the database.

| What | Where | Config |
| --- | --- | --- |
| React site | Netlify | `netlify.toml` |
| Express API + PostgreSQL | Render (or any Docker host) | `render.yaml`, `server/Dockerfile` |

## Order

Deploy the API first. The site is built with the API address compiled into it,
so it cannot be built correctly until the API has an address.

### 1. The API and database

Render reads `render.yaml` and creates both the web service and a managed
PostgreSQL instance. Nothing in the application depends on Render — the server
is a plain Dockerfile, so Railway, Fly or a VPS work identically and only that
file changes.

Set these in the dashboard rather than in the repository:

- `JWT_SECRET` — generated automatically; do not reuse the development value.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` — generate the hash locally:
  `node -e "require('bcryptjs').hash('your-password',12).then(console.log)"`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `NOTIFICATION_TO`,
  `NOTIFICATION_FROM` — enquiry notifications log instead of sending until
  these exist, so a missing credential never silently loses an enquiry.

Confirm `https://api.axislearning.co.ke/api/health` returns
`{"status":"OK","database":"connected"}` before going further.

### 2. The site

In Netlify, set the build environment:

- `VITE_API_URL` — `https://api.axislearning.co.ke/api`
- `VITE_SITE_URL` — `https://www.axislearning.co.ke`
- `VITE_GA_MEASUREMENT_ID` — only when Axis has settled its consent position.
  Left empty, the analytics code is removed from the bundle entirely rather
  than merely disabled.

**These are read at build time, not at run time.** Vite substitutes them into
the bundle, so changing one in the dashboard does nothing until the site is
rebuilt.

### 3. DNS

- `www.axislearning.co.ke` → Netlify
- `api.axislearning.co.ke` → the API host
- Keep the `MX` records pointing at whoever hosts email. Repointing the whole
  domain at Netlify and dropping them is the usual way `info@` stops working.

Certificates are issued automatically once DNS resolves, which can take from
minutes to a couple of hours. The site will look broken until it completes.

### 4. Close the loop

`CORS_ORIGIN` on the API must exactly match the site's origin, scheme included.
Until it does, the browser blocks every API call and the site appears to load
but nothing works.

Then submit a real enquiry and confirm it appears in the admin pipeline.

## Things that behave differently in production

**Schema changes.** `DB_SYNC` defaults to `safe` in production: missing tables
are created, existing ones are never altered. `alter` inspects the live schema
and rewrites it to match the models, which on a database holding learner
records can change column types or drop columns a model no longer mentions.
Set `DB_SYNC=alter` deliberately and briefly, or `none` if migrations are
managed elsewhere. A sync failure stops the server rather than being logged and
ignored — serving requests against a half-built schema produces confusing
errors much later.

**Seeding** runs on every start but only fills empty tables. Set
`SKIP_SEED=true` for a database managed entirely by hand.

**Proxy awareness.** In production the app trusts exactly one proxy hop, so
rate limiting and the audit log see the real client address rather than the
load balancer. Trusting every hop would let a client forge the header.

## Still outstanding

- **Backups.** Render takes daily snapshots on paid plans. Neither the
  retention period nor an acceptable amount of data loss has been agreed, and
  a restore has never been rehearsed.
- **Error monitoring.** Nothing reports a production failure. If the API starts
  returning 500s, the first report will come from a parent.
- **Test coverage.** The behaviour of vetting, portal scoping and the
  safeguarding rules was verified by hand and is not protected by tests.
