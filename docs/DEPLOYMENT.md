# Deploying Axis Learning

Two systems are deployed separately. Netlify serves static files and cannot run
the API or the database.

| What | Where | Config |
| --- | --- | --- |
| React site | Netlify | `netlify.toml` |
| Express API + PostgreSQL | Render (or any Docker host) | `render.yaml`, `server/Dockerfile` |
| Domain, DNS and mailboxes | Truehost | registrar control panel |

`docker-compose.yml` at the repository root is **not** part of this. It runs the
whole stack on one machine for local work — localhost origins, the database
port published to the host, the server's source mounted over the image — and
its `.env.example` covers only that.

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

### 3. Domain, DNS and email

The domain is registered with Truehost, a KeNIC registrar. Nothing in the
project depends on that — any registrar works, provided you can edit records.
What follows is written for Truehost's DNS manager because that is where the
domain is.

**Keep DNS at Truehost. Do not delegate the nameservers to Netlify.** Netlify
DNS is otherwise a reasonable choice, but the mailboxes are Truehost's, and
moving the zone without recreating the `MX` records is the usual way `info@`
stops receiving mail — quietly, and usually noticed when a parent says nobody
replied.

| Type | Name | Value | Purpose |
| --- | --- | --- | --- |
| CNAME | `www` | `<site>.netlify.app` | the website |
| A | `@` | Netlify's load balancer IP | apex → website |
| CNAME | `api` | `<service>.onrender.com` | the API |
| MX | `@` | Truehost's mail servers | email — leave as issued |

Take the exact values from the dashboards rather than from this table: Netlify
shows both the `.netlify.app` hostname and the apex IP under Domain
management, and Render shows the service hostname under Settings. The apex IP
in particular is Netlify's to change, and a copied-out number goes stale
silently.

The apex needs an `A` record rather than a `CNAME` because DNS does not allow a
CNAME at a zone apex. `www` is the canonical host — `VITE_SITE_URL` and
`CORS_ORIGIN` both name it — so the apex only has to reach Netlify and be
redirected there. Truehost's panel also offers a URL redirect, which is
equivalent for this purpose.

Certificates are issued automatically by Netlify and Render once the records
resolve, which can take from minutes to a couple of hours. The site will look
broken until it completes. You do not need to buy an SSL certificate from the
registrar, whatever the upsell at checkout suggests.

#### Email

Three addresses are referenced by the application and must exist before
enquiries reach anyone:

- `info@axislearning.co.ke` — published on the site
- `enquiries@axislearning.co.ke` — `NOTIFICATION_TO`
- `no-reply@axislearning.co.ke` — `NOTIFICATION_FROM`

Truehost supplies SMTP credentials with the mailboxes; they go into `SMTP_HOST`,
`SMTP_USER` and `SMTP_PASSWORD` on the API. Until all of them are set, enquiry
notifications are written to the log instead of being sent, so a missing
credential never silently loses an enquiry — but nobody is told about it either.

#### What not to buy from the registrar

Truehost sells cPanel shared hosting alongside domains. It does not fit this
application and is not needed:

- The site is a static build; Netlify builds it from the repository on every
  push, which shared hosting would not do.
- The API is Express with **PostgreSQL**. Shared cPanel plans offer MySQL, and
  running a persistent Node process there means giving up the health checks,
  automatic TLS and restart behaviour that `render.yaml` already provides.

Domain and mailboxes from Truehost, application on Netlify and Render, is the
combination this repository is configured for.

### 4. Close the loop

`CORS_ORIGIN` on the API must exactly match the site's origin, scheme included.
Until it does, the browser blocks every API call and the site appears to load
but nothing works.

Then submit a real enquiry and confirm it appears in the admin pipeline.

## Things that behave differently in production

**Schema changes** are handled by two mechanisms that do different jobs.

`DB_SYNC` defaults to `safe` in production: missing tables are created,
existing ones are never altered. `alter` inspects the live schema and rewrites
it to match the models, which on a database holding learner records can change
column types or drop columns a model no longer mentions. Set `DB_SYNC=alter`
deliberately and briefly, or `none` to disable it entirely. A sync failure
stops the server rather than being logged and ignored — serving requests
against a half-built schema produces confusing errors much later.

Because `safe` never touches an existing table, it cannot add a column to one.
Everything sync will not do — new columns, changed types, indexes, backfills —
goes in `server/migrations/`, runs in filename order, once each, and is
recorded in `SequelizeMeta`.

```
npm run migrate          apply everything pending
npm run migrate:status   what has run and what has not
npm run migrate:undo     revert the most recent one
```

Migrations also run automatically at startup, after sync and before seeding, so
a deploy applies its own schema changes. That is safe for one instance, which
is what `render.yaml` provisions. **If the API is ever scaled past one
instance, set `SKIP_MIGRATIONS=true` and run `npm run migrate` as a release
step instead** — otherwise two instances start together and race.

Write one as a file named `YYYYMMDDHHMMSS-what-it-does.js` exporting `up` and
`down`, both taking Sequelize's query interface:

```js
module.exports = {
  async up(queryInterface) { /* addColumn, addIndex, changeColumn, bulk update */ },
  async down(queryInterface) { /* the reverse */ },
}
```

A migration that has run on production is history — never edit it. Correct it
with a new one. Write `down` even if you expect never to use it: it is what
makes a bad deploy recoverable, and it is only cheap to write at the time.

**Seeding** runs on every start but only fills empty tables. Set
`SKIP_SEED=true` for a database managed entirely by hand.

**Proxy awareness.** In production the app trusts exactly one proxy hop, so
rate limiting and the audit log see the real client address rather than the
load balancer. Trusting every hop would let a client forge the header.

## Backups

```
npm run backup                                          write a dump
npm run restore -- --file <dump> --database <scratch>   rehearse a restore
```

`backup` writes a compressed `pg_dump` custom-format file to `server/backups`
(git-ignored — a dump holds real learner records and must never be committed)
and prunes anything older than `BACKUP_KEEP_DAYS`, default 14. The old file is
deleted only after the new one is safely written, and a failed dump leaves no
file behind, because a truncated dump looks like a backup and is not one.

`restore` refuses to write over the database the application uses unless forced,
creates the target, restores, and then prints row counts per table. **Those
counts are the check, not the exit code** — `pg_restore` reports non-zero for
harmless ownership notices too.

Two things this does not do for you:

- **The container has no `pg_dump`.** `server/Dockerfile` is a Node image. Run
  backups from a machine that has the PostgreSQL client tools, or add them to
  the image — but the client must be **at least as new as the server** (18
  here), or `pg_dump` refuses with a version mismatch. Alpine's default
  `postgresql-client` may be older, which is why it is not added blindly.
- **Nothing schedules it.** Add a cron job, a Render cron service, or a Task
  Scheduler entry. Render also takes its own daily snapshots on paid plans;
  these dumps are independent of that and portable between hosts.

Still to agree: how long backups are kept, how much data loss is acceptable if
the database is lost, and where the dumps live — a dump beside the database it
came from does not survive losing the machine. Rehearse a restore before you
need one; the restore command above exists so that costs a minute.

## Error monitoring

Every 5xx is written as a single structured JSON line, and every request
carries an `X-Request-Id` — echoed back in the response, and included in the
error body — so a report of "it failed at about two o'clock" can be tied to the
exact log line.

Set `ERROR_WEBHOOK_URL` to also receive a summary of each failure by POST; any
endpoint accepting JSON works, including a Slack or Discord incoming webhook.
Repeats of the same failure are suppressed for five minutes so a broken
endpoint cannot flood the channel, while every occurrence is still logged.

Unhandled rejections and uncaught exceptions are reported before the process
exits. Error messages are never returned to the client — they can carry a query
or a connection string — so the caller sees only `Internal server error` and
the request id.

Nothing here depends on a vendor. Adopting Sentry or similar later means
pointing it at these logs, or one call inside `lib/reportError.js`.

## Known advisories

`npm audit` reports two moderate advisories against production dependencies.
Both were assessed on 19 August 2026 and neither is exploitable here; both
would require a major upgrade to clear, which is a larger risk than what it
would fix.

- **uuid via sequelize** — the flaw needs a buffer passed to the generator.
  Sequelize's `UUIDV4` does not pass one and nothing here calls uuid directly.
  `sequelize@6.37.8` is the newest v6; clearing it means v7.
- **react-router open redirect** — needs an attacker-controlled URL reaching
  `<Link to>` or `navigate()`. Every target is a literal, a slug from
  `content/services.ts`, or a static nav entry; the one query parameter
  (`?programme=`) fills a form field and is never navigated to.
  `react-router-dom@6.30.6` is the newest v6; the fix is in v7.

Re-check both when either package is upgraded, and before adding any route that
navigates to a value from the API or the URL.

## Still outstanding

- **The mailboxes do not exist yet.** Until `info@`, `enquiries@` and
  `no-reply@axislearning.co.ke` are created and their SMTP details set, every
  enquiry notification is written to the log and nobody is emailed.
- **Retention periods are still defaults.** The schedule in the Data protection
  tab uses two years for an unconverted enquiry and one year for a contact
  message. Those are placeholders for Axis to confirm, and applying the
  schedule is deliberately manual until they are.
