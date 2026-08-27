# Deploying Axis Learning

Two systems are deployed separately: a static site and an API with a database.

| What | Where | Config |
| --- | --- | --- |
| React site | Truehost cPanel, served by Apache from `public_html` | `scripts/deploy-cpanel.mjs`, rules generated into `dist/axis.htaccess` |
| Express API + PostgreSQL | Truehost cPanel (Passenger + local PostgreSQL) | `server/.env` on the server |
| Domain, DNS and mailboxes | Truehost | registrar control panel |

The site was previously on Netlify and the API on Render. `netlify.toml` and
`render.yaml` are kept because they still describe those deployments
accurately, and because the Apache rules are a translation of `netlify.toml` —
if you change one, change both or the two hosts stop agreeing.

Local work needs neither: run PostgreSQL on the machine, `npm run dev` in
`server/`, and `npm run dev` in `client/`. There is no container in the loop
anywhere, which is why the Docker Compose file was removed — it duplicated
that setup and rotted unnoticed until someone tried to start it.

## Order

Deploy the API first. The site is built with the API address compiled into it,
so it cannot be built correctly until the API has an address.

### 1. The API and database

Render reads `render.yaml` and creates both the web service and a managed
PostgreSQL instance. It runs the app directly on Node — `npm ci`, then
`node server.js` — because the server needs nothing beyond Node and a
PostgreSQL client, and a container only added a build step.

`server/Dockerfile` is kept for hosts that require an image, and it runs the
app under `tini` as a non-root user. **It is not exercised by this deploy**, so
build and run it before depending on it.

Nothing here is specific to Render. Railway runs the same two commands;
a VPS needs Node 20+, PostgreSQL, and something to keep the process alive.

Set these in the dashboard rather than in the repository:

- `JWT_SECRET` — generated automatically; do not reuse the development value.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` — generate the hash locally:
  `node -e "require('bcrypt').hash('your-password',12).then(console.log)"`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `NOTIFICATION_TO`,
  `NOTIFICATION_FROM` — enquiry notifications log instead of sending until
  these exist, so a missing credential never silently loses an enquiry.

Confirm `https://api.axislearning.co.ke/api/health` returns
`{"status":"OK","database":"connected"}` before going further.

### 2. The site

Build locally, then publish. There is no build step on the server and no
continuous deployment, so the bytes that get served are the bytes you built:

```
cd client
VITE_API_URL=https://api.axislearning.co.ke/api VITE_SITE_URL=https://www.axislearning.co.ke npm run build

cd ..
CPANEL_HOST=... CPANEL_USER=... CPANEL_PASSWORD=... node scripts/deploy-cpanel.mjs
```

The deploy script uploads `client/dist`, installs the generated Apache rules
into `public_html/.htaccess`, and then compares every file against the build.
That last step is not ceremony: cPanel's upload API keeps whatever file is
already at the destination and still reports success, which once left the
host's placeholder homepage in place while the deploy claimed every file had
uploaded.

The environment variables the build needs:

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

**Keep DNS at Truehost, and edit the zone one record at a time.** The
mailboxes resolve through this same zone, so rewriting it wholesale is the
usual way `info@` stops receiving mail — quietly, and usually noticed when a
parent says nobody replied. After any zone edit, check that `MX` and the `SPF`
record still resolve before moving on.

| Type | Name | Value | Purpose |
| --- | --- | --- | --- |
| A | `@` | the cPanel server IP | apex → redirected to `www` |
| A | `www` | the cPanel server IP | the website |
| A | `mail` | the cPanel server IP | mailboxes |
| MX | `@` | `mail.axislearning.co.ke` | email — leave as issued |

The apex needs an `A` record rather than a `CNAME` because DNS does not allow a
CNAME at a zone apex. `www` is the canonical host — `VITE_SITE_URL`,
`CORS_ORIGIN` and every canonical tag name it — and the apex is redirected
there by the generated Apache rules. Serving both without that redirect
publishes the whole site twice under two hostnames.

Certificates are issued automatically by cPanel's AutoSSL once the records
resolve, which can take from minutes to a couple of hours. The account already
carries a wildcard certificate covering the apex and every subdomain. You do
not need to buy an SSL certificate from the registrar, whatever the upsell at
checkout suggests.

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

#### What the cPanel account actually provides

An earlier version of this document argued against using Truehost's cPanel
hosting for the application. That advice was wrong about this account, and it
is recorded here so the reasoning is not repeated:

- It offers **PostgreSQL**, not only MySQL. The database is local to the
  server, so the API connects over `localhost` and negotiates no TLS.
- It runs persistent Node processes through Passenger, with the Node.js
  selector and Passenger both enabled on the account.
- AutoSSL issues and renews certificates without being asked.

What it genuinely does not provide:

- **A CDN.** Every page and image is served from the one server. That server is
  in Canada and the audience is in Kenya, which is a real cost paid on every
  request, and the main argument for putting the site behind a CDN again.
- **Continuous deployment.** Nothing rebuilds on push. Deploys are the manual
  step described above, which means the running site can silently drift from
  `master` if someone forgets.
- **A shell, on this account's API access.** There is no `mkdir`, no archive
  extraction and no delete in the file API available here, which is why the
  deploy script uploads a directory at a time and why `public_html` still holds
  files from the host's placeholder site that are blocked rather than removed.

### 4. Close the loop

`CORS_ORIGIN` on the API must exactly match the site's origin, scheme included.
Until it does, the browser blocks every API call and the site appears to load
but nothing works.

Then submit a real enquiry and confirm it appears in the admin pipeline.

## Working on this host

Things about this particular server that cost hours to discover. None are
faults in the application; all of them change how you deploy to it.

**Restarting the API is a click in cPanel, not a file you touch.** Passenger is
supposed to restart when `tmp/restart.txt` changes, and here it does not. New
files sit on disk and the running process keeps serving the old ones — which
looks exactly like a failed upload, so you go and check the upload again. None
of these worked: rewriting `restart.txt`, disabling and re-enabling the
application through the API, rewriting the document root's `.htaccess`, forcing
a new `PassengerAppGroupName`, running `npm install`, waiting out the idle
timeout, or touching the startup file. **cPanel → Setup Node.js App → Restart**
does work. Deploy the files, then click it, then verify — and verify by
behaviour, because the file being correct on disk proves nothing about what is
running.

**The interpreter predates `fetch`.** `/usr/bin/node` is what Passenger runs the
app with, and it is older than Node 18. Anything using global `fetch`,
`AbortSignal.timeout` or similar will throw at runtime. `lib/postJson.js` exists
for this reason; use it rather than reaching for `fetch`. The danger is not a
crash — both callers catch — it is that the feature silently never works.

**Outbound database ports are refused.** Port 5432 is blocked in both
directions: nothing outside can reach the site's PostgreSQL, and the server
cannot reach a database elsewhere. Port 443 is open, which is why
`scripts/import-from-database.js` can read another host's API but not its
database.

**The file API is unusually limited.** On this account cPanel's `Fileman` offers
`list_files`, `get_file_content`, `save_file_content` and `upload_files` — and
no delete, move, copy, or mkdir. Two consequences worth knowing: `upload_files`
creates a missing directory, which is the only way to make one; and it silently
keeps whatever file is already at the destination unless `overwrite` is sent,
while still reporting success. `scripts/deploy-cpanel.mjs` sends it and then
compares every file against the build, because a success count from that API is
not evidence that the bytes changed.

**Cron is only on the older API.** The `Cron` UAPI module is not installed; the
API2 endpoint (`/json-api/cpanel?cpanel_jsonapi_module=Cron`) works. That is the
route to running a one-off script on the server, since there is no shell access
through these credentials.

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

- **The host has no `pg_dump`.** Render's Node runtime does not ship the
  PostgreSQL client tools, and neither does `server/Dockerfile`. Run backups
  from a machine that has them — but the client must be **at least as new as
  the server** (18 here), or `pg_dump` refuses with a version mismatch.
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

- **Publishing content no longer regenerates the site.** An article is live on
  the Resources page the moment it is published, because that page reads the
  API. What it does not get is its own prerendered HTML page or its line in the
  sitemap, which is what a search engine reads. A build hook used to do this;
  there is no build system on this host, so it now takes a rebuild and a deploy.
  Until someone runs those, new articles are invisible to search.
- **Retention periods are still defaults.** The schedule in the Data protection
  tab uses two years for an unconverted enquiry and one year for a contact
  message. Those are placeholders for Axis to confirm, and applying the
  schedule is deliberately manual until they are.
- **Notifications are sent from the mailbox that receives them.** `info@` is
  live and enquiry notifications arrive, but they are sent from the same
  account. A separate `no-reply@` sender would keep automated mail out of the
  thread a parent replies to.
