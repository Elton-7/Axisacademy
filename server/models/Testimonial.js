const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'Parent'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
    defaultValue: 5
  },
  /**
   * Brief 38 — a testimonial names a family, and often quotes a child. Consent
   * to publish one can be withdrawn at any time, and a tick on its own is not a
   * record of it: if a parent later withdraws consent or disputes that it was
   * given, Axis has to show who confirmed it, when, and against which signed
   * release. The gallery already works this way; testimonials carry the same
   * duty and were the only published thing that did not.
   */
  consentConfirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'consent_confirmed',
    comment: 'Staff confirmation that publication consent has been verified for this testimonial.'
  },
  consentConfirmedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'consent_confirmed_by',
    comment: 'User who confirmed publication consent.'
  },
  consentConfirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'consent_confirmed_at',
    comment: 'When publication consent was confirmed.'
  },
  consentReference: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'consent_reference',
    comment: 'Reference to the signed consent held on file for this testimonial.'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'testimonials',
  timestamps: true
})

module.exports = Testimonial
