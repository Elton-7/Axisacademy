const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

/**
 * Vetting record for an educator account.
 *
 * The FAQ answers "how are educators selected?" and educators travel to
 * children's homes, so this cannot be a claim on a web page — it has to be a
 * record with an expiry that the platform enforces. An educator who is not
 * cleared, or whose clearance has lapsed, cannot be assigned to a learner.
 *
 * Nothing here is ever exposed on a public endpoint. Clearance documents are
 * referenced, not stored: the platform holds the reference number and the dates,
 * and the document itself stays in Axis's own files.
 */
const EducatorVetting = sequelize.define('EducatorVetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  educatorUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'educator_user_id',
  },
  /**
   * 'Cleared' is the only status that permits assignment, and only while
   * goodConductExpiresOn is in the future.
   */
  status: {
    type: DataTypes.ENUM('Not started', 'In progress', 'Cleared', 'Rejected', 'Suspended'),
    allowNull: false,
    defaultValue: 'Not started',
  },
  /** Certificate of Good Conduct — the DCI police clearance. */
  goodConductNumber: {
    type: DataTypes.STRING(80),
    allowNull: true,
    field: 'good_conduct_number',
  },
  goodConductIssuedOn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'good_conduct_issued_on',
  },
  /**
   * Clearance is not permanent. Kenyan certificates are commonly treated as
   * valid for a year, so an expiry is required rather than optional — without
   * it "cleared" silently means "cleared at some point in the past".
   */
  goodConductExpiresOn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'good_conduct_expires_on',
  },
  /** TSC registration, where the educator is a registered teacher. */
  tscNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tsc_number',
  },
  identityVerifiedOn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'identity_verified_on',
  },
  referencesCheckedOn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'references_checked_on',
  },
  referencesNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'references_note',
  },
  /** Who at Axis signed this off, so the decision has a name against it. */
  clearedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'cleared_by_user_id',
  },
  clearedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cleared_at',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'educator_vetting',
  timestamps: true,
})

/** True only when cleared and the clearance has not lapsed. */
EducatorVetting.prototype.isCurrentlyCleared = function isCurrentlyCleared() {
  if (this.status !== 'Cleared') return false
  if (!this.goodConductExpiresOn) return false
  return new Date(this.goodConductExpiresOn) >= new Date(new Date().toISOString().slice(0, 10))
}

module.exports = EducatorVetting
