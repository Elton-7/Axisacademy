const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const { contactLimiter, generalApiLimiter } = require('./middleware/rateLimiter')
const { syncDatabase } = require('./models')
const { runMigrations } = require('./lib/migrator')
const {
  reportError, requestId, reportFailedResponses, installProcessHandlers, markErrorReported,
} = require('./lib/reportError')
const { preflight } = require('./lib/preflight')
const sequelize = require('./config/database')
const seedData = require('./seeders/seed')

const app = express()
const PORT = process.env.PORT || 5000

// Before anything else: a production server with the wrong configuration
// should not reach the point of accepting requests.
preflight()

/**
 * Every managed host puts a load balancer in front of the app, so the client
 * address arrives in X-Forwarded-For. Without this, express-rate-limit sees the
 * proxy's address for every request and puts the whole internet in one bucket —
 * the first person to hit the login limiter would lock out everybody. It also
 * means the audit log records the proxy rather than the actual caller.
 *
 * Trust exactly one hop: trusting all of them lets a client forge the header.
 */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true
}))
// 'dev' is colourised and terse; 'combined' is the standard log format
// production log shippers expect.
// Ahead of the request log so every line can be tied to one request.
app.use(requestId)
app.use(reportFailedResponses)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', generalApiLimiter)

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate()
    res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() })
  } catch (error) {
    res.status(503).json({ status: 'DEGRADED', database: 'unavailable', timestamp: new Date().toISOString() })
  }
})

// Routes
app.use('/api/services', require('./routes/services'))
app.use('/api/testimonials', require('./routes/testimonials'))
app.use('/api/contacts', require('./routes/contact'))
app.use('/api/enrollments', require('./routes/enrollments'))
app.use('/api/educators', require('./routes/educators'))
app.use('/api/events', require('./routes/events'))
app.use('/api/faqs', require('./routes/faqs'))
app.use('/api/locations', require('./routes/locations'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/resources', require('./routes/resources'))
app.use('/api/partners', require('./routes/partners'))
app.use('/api/stats', require('./routes/stats'))
app.use('/api/newsletter', require('./routes/newsletter'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/portal', require('./routes/portal'))
app.use('/api/learners', require('./routes/learners'))
app.use('/api/users', require('./routes/users'))
app.use('/api/data-protection', require('./routes/dataprotection'))
app.use('/api/audit', require('./routes/audit'))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' })
})

// Error handler. Anything a route did not catch itself arrives here.
app.use((err, req, res, _next) => {
  markErrorReported(res)
  reportError('request', err, {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    status: 500,
    userId: req.user?.userId,
  })
  // The message is never returned: it can carry a query or a connection string.
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    requestId: req.id,
  })
})

// Start server
const startServer = async () => {
  installProcessHandlers()

  try {
    // Order matters. sync creates tables that do not exist; migrations then
    // apply the changes it cannot make to tables that already do.
    await syncDatabase()

    if (process.env.SKIP_MIGRATIONS !== 'true') {
      await runMigrations()
    }

    // Seeding is idempotent — it only fills empty tables — but it can be turned
    // off for a production database that is managed by hand.
    if (process.env.SKIP_SEED !== 'true') {
      await seedData()
    }

    // Bind to all interfaces: container platforms route to the published port
    // and a default of localhost would be unreachable from outside.
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
      console.log(`Health: http://localhost:${PORT}/api/health`)
    })

    /**
     * Container platforms send SIGTERM and then kill the process a short time
     * later. Without this, in-flight requests are cut off mid-response and the
     * connection pool is never closed, which shows up as errors on every deploy.
     */
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down`)
      server.close(async () => {
        try {
          await sequelize.close()
        } catch (error) {
          console.error('Error closing the database pool:', error.message)
        }
        process.exit(0)
      })
      // Do not hang forever if a connection refuses to drain.
      setTimeout(() => process.exit(1), 10000).unref()
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
