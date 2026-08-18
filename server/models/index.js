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
const Learner = require('./Learner')
const LearnerEducator = require('./LearnerEducator')
const Session = require('./Session')
const Assessment = require('./Assessment')
const Message = require('./Message')
const MessageRead = require('./MessageRead')
const EducatorVetting = require('./EducatorVetting')
const SafeguardingConcern = require('./SafeguardingConcern')

const models = { Service, Testimonial, Contact, Enrollment, Newsletter, User, AuditLog, PortalSchedule, PortalMessage, Educator, Event, FAQ, Location, Gallery, Resource, Partner, Learner, LearnerEducator, Session, Assessment, Message, MessageRead, EducatorVetting, SafeguardingConcern }

/**
 * Portal associations. Every one of these is what keeps the portals safe: reads
 * are scoped by walking these relationships rather than by filtering in the UI,
 * so an educator cannot reach a learner they are not assigned to (brief §29).
 */
User.hasMany(Learner, { foreignKey: 'parentUserId', as: 'learners' })
Learner.belongsTo(User, { foreignKey: 'parentUserId', as: 'parent' })

Learner.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enquiry' })

Learner.hasMany(LearnerEducator, { foreignKey: 'learnerId', as: 'assignments' })
LearnerEducator.belongsTo(Learner, { foreignKey: 'learnerId', as: 'learner' })
LearnerEducator.belongsTo(User, { foreignKey: 'educatorUserId', as: 'educator' })

Learner.hasMany(Session, { foreignKey: 'learnerId', as: 'sessions' })
Session.belongsTo(Learner, { foreignKey: 'learnerId', as: 'learner' })
Session.belongsTo(User, { foreignKey: 'educatorUserId', as: 'educator' })

Learner.hasMany(Assessment, { foreignKey: 'learnerId', as: 'assessments' })
Assessment.belongsTo(Learner, { foreignKey: 'learnerId', as: 'learner' })
Assessment.belongsTo(User, { foreignKey: 'educatorUserId', as: 'educator' })

Learner.hasMany(Message, { foreignKey: 'learnerId', as: 'messages' })
Message.belongsTo(Learner, { foreignKey: 'learnerId', as: 'learner' })
Message.belongsTo(User, { foreignKey: 'senderUserId', as: 'sender' })

User.hasOne(EducatorVetting, { foreignKey: 'educatorUserId', as: 'vetting' })
EducatorVetting.belongsTo(User, { foreignKey: 'educatorUserId', as: 'educator' })

SafeguardingConcern.belongsTo(Learner, { foreignKey: 'learnerId', as: 'learner' })
SafeguardingConcern.belongsTo(User, { foreignKey: 'raisedByUserId', as: 'raisedBy' })

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
