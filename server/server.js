const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const { contactLimiter, generalApiLimiter } = require('./middleware/rateLimiter')
const { syncDatabase } = require('./models')
const sequelize = require('./config/database')
const seedData = require('./seeders/seed')

const app = express()
const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production')
}

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
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
app.use('/api/data-protection', require('./routes/dataprotection'))
app.use('/api/audit', require('./routes/audit'))

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
const startServer = async () => {
  try {
    await syncDatabase()
    await seedData()

    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT)
      console.log('API: http://localhost:' + PORT + '/api')
      console.log('Health: http://localhost:' + PORT + '/api/health')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
