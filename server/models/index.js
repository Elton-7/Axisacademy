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
/**
 * Schema synchronisation.
 *
 * `alter: true` is right for development and dangerous in production: it
 * inspects the live schema and rewrites it to match the models, which on a
 * database holding real learner records can change column types or drop
 * columns that a model no longer mentions. Production therefore defaults to a
 * plain sync, which creates missing tables and never modifies existing ones.
 *
 * DB_SYNC overrides it deliberately:
 *   alter  — development default; brings an existing schema into line
 *   safe   — production default; creates what is missing, touches nothing else
 *   none   — skip entirely, for when migrations are managed elsewhere
 *
 * Failures are fatal rather than logged and ignored. Serving requests against a
 * half-built schema produces confusing errors much later, at a point where the
 * cause is no longer obvious.
 */
const syncDatabase = async () => {
  const mode = process.env.DB_SYNC || (process.env.NODE_ENV === 'production' ? 'safe' : 'alter')

  if (mode === 'none') {
    console.log('Database sync skipped (DB_SYNC=none)')
    return { createdFromScratch: false }
  }

  /**
   * Whether this database had anything in it before sync ran.
   *
   * It decides how migrations are treated. sync builds tables from the current
   * models, so on an empty database it produces the schema every migration is
   * working towards — and running them afterwards fails on the first
   * ALTER TABLE ... ADD COLUMN, because the column is already there. That is
   * invisible on a long-lived database, where the tables predate the
   * migrations, and it only bites when someone deploys somewhere new.
   */
  let createdFromScratch = false
  try {
    const existing = await sequelize.getQueryInterface().showAllTables()
    createdFromScratch = existing.length === 0
  } catch {
    // If the check itself fails, assume an existing database and let the
    // migrations run normally — the cautious direction.
    createdFromScratch = false
  }

  try {
    await sequelize.sync(mode === 'alter' ? { alter: true } : {})
    console.log(`Database synchronized successfully (mode: ${mode})`)
    return { createdFromScratch }
  } catch (error) {
    console.error('Database sync failed:', error.message)
    throw error
  }
}

module.exports = { sequelize, syncDatabase, ...models }
