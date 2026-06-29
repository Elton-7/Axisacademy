const sequelize = require('../config/database')
const Service = require('./Service')
const Testimonial = require('./Testimonial')
const Contact = require('./Contact')
const Enrollment = require('./Enrollment')

const models = { Service, Testimonial, Contact, Enrollment }

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
