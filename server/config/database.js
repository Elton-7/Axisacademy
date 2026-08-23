const { Sequelize } = require('sequelize')
require('dotenv').config()

/**
 * One connection string, or five separate variables.
 *
 * Managed Postgres providers — Neon, Supabase, Railway — hand out a single
 * DATABASE_URL and nothing else. Render supplies the five parts. Supporting
 * both means moving the database between providers is a change of environment
 * variables rather than a change of code.
 *
 * The URL is parsed here rather than handed to Sequelize whole, because
 * Sequelize's own URL parsing has two behaviours that bite:
 *
 *   - a `?sslmode=require` in the URL makes it overwrite dialectOptions.ssl
 *     with an empty object, silently discarding the settings below. Neon puts
 *     exactly that parameter in the string it gives you.
 *   - a URL with no explicit port yields port: "", an empty string rather than
 *     a default.
 *
 * Both surface at deploy time as a connection failure that names neither the
 * URL nor the setting responsible.
 */
const connectionUrl = process.env.DATABASE_URL
const url = connectionUrl ? new URL(connectionUrl) : null

// Every part of a connection string is percent-encoded; passwords from these
// providers routinely contain characters that require it.
const decode = (value) => (value ? decodeURIComponent(value) : value)

const host = url ? url.hostname : process.env.DB_HOST || 'localhost'
const port = Number(url ? url.port || 5432 : process.env.DB_PORT || 5432)
const database = url ? decode(url.pathname.replace(/^\//, '')) : process.env.DB_NAME || 'axis_academy'
const username = url ? decode(url.username) : process.env.DB_USER || 'postgres'
const password = url ? decode(url.password) : process.env.DB_PASSWORD || '4488'

/**
 * Hosted Postgres refuses unencrypted connections; a local one does not offer
 * encryption at all. Enabling SSL unconditionally would break every developer
 * machine, so it follows the connection: on when talking to something remote,
 * off for localhost. DB_SSL settles it either way.
 */
const isLocalHost = /^(localhost|127\.0\.0\.1|::1)$/.test(host)
const sslmode = url?.searchParams.get('sslmode')
const sslRequested =
  process.env.DB_SSL === 'true' ||
  (process.env.DB_SSL !== 'false' && (sslmode ? sslmode !== 'disable' : !isLocalHost))

/**
 * Certificate verification is off by default because several providers front
 * their databases with an intermediate certificate that Node's bundled roots do
 * not recognise, and the connection fails outright rather than degrading. The
 * traffic is still encrypted either way. Set DB_SSL_STRICT=true, with the
 * provider's CA bundle in NODE_EXTRA_CA_CERTS, to verify the certificate too —
 * worth doing once the provider is settled.
 */
const ssl = sslRequested ? { require: true, rejectUnauthorized: process.env.DB_SSL_STRICT === 'true' } : null

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: ssl ? { ssl } : {},
})

module.exports = sequelize
