const sequelize = require('../config/database')
const Service = require('./Service')
const Testimonial = require('./Testimonial')
const Contact = require('./Contact')
const Enrollment = require('./Enrollment')
const Newsletter = require('./Newsletter')
const User = require('./User')
const AuditLog = require('./AuditLog')
const PortalSchedule = require('./PortalSchedule')
const PortalMessage = require('./PortalMessage')
const Educator = require('./Educator')
const Event = require('./Event')
const FAQ = require('./FAQ')
const Location = require('./Location')
const Gallery = require('./Gallery')
const Resource = require('./Resource')
const Partner = require('./Partner')

const models = { Service, Testimonial, Contact, Enrollment, Newsletter, User, AuditLog, PortalSchedule, PortalMessage, Educator, Event, FAQ, Location, Gallery, Resource, Partner }

// Sync all models
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true })
    console.log('Database synchronized successfully')
  } catch (error) {
    console.error('Database sync error:', error)
  }
}

module.exports = { sequelize, syncDatabase, ...models }
