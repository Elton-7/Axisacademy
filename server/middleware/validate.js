const { body, validationResult } = require('express-validator')

/**
 * Request validation for the content routes.
 *
 * Rules are derived from the Sequelize model rather than restated here. A
 * hand-copied list of ENUM values or a repeated STRING(255) drifts the first
 * time a model changes, and the failure shows up as a database error at the
 * end of a save rather than as a message the admin can act on. Reading the
 * model means the two can never disagree.
 */

/** STRING(n) knows its own n; TEXT has no limit. */
const columnLimit = (Model, field) => Model.rawAttributes?.[field]?.type?.options?.length

const enumValues = (Model, field) => Model.rawAttributes?.[field]?.values ?? []

/** Turns `startDate` into `Start date` for messages aimed at an admin. */
const labelFor = (field) =>
  field
    .replace(/([A-Z])/g, (c) => ` ${c.toLowerCase()}`)
    .replace(/^./, (c) => c.toUpperCase())
    .trim()

/**
 * On create the client sends the whole record, so required fields must be
 * present. On update it sends only what changed, so the same field is optional
 * — but still validated when supplied. `partial` expresses that difference,
 * which is why one definition can serve both verbs.
 */
const text = (Model, field, { required = false, partial = false, label } = {}) => {
  const name = label || labelFor(field)
  const limit = columnLimit(Model, field)

  // A required field may be absent on an update (nothing changed) but must not
  // arrive empty — that would blank a NOT NULL column with an empty string.
  let chain = body(field)
  if (required) {
    if (partial) chain = chain.optional()
    chain = chain.trim().notEmpty().withMessage(`${name} is required`)
  } else {
    chain = chain.optional({ values: 'falsy' }).trim()
  }

  if (limit) {
    chain = chain.isLength({ max: limit }).withMessage(`${name} must be ${limit} characters or fewer`)
  }
  return chain
}

const enumField = (Model, field, { required = false, partial = false, label } = {}) => {
  const name = label || labelFor(field)
  const values = enumValues(Model, field)

  let chain = body(field)
  if (required) {
    if (partial) chain = chain.optional()
    chain = chain.trim().notEmpty().withMessage(`${name} is required`)
  } else {
    chain = chain.optional({ values: 'falsy' })
  }

  return chain.isIn(values).withMessage(`${name} must be one of: ${values.join(', ')}`)
}

const urlField = (Model, field, { required = false, partial = false, label } = {}) => {
  const name = label || labelFor(field)
  let chain = text(Model, field, { required, partial, label: name })
  return chain.isURL({ require_protocol: true }).withMessage(`${name} must be a full URL including https://`)
}

const emailField = (field = 'email') =>
  body(field).optional({ values: 'falsy' }).trim().isEmail().withMessage('Email must be a valid address')

const intField = (field, { min = 0, max } = {}) =>
  body(field)
    .optional({ values: 'falsy' })
    .isInt({ min, ...(max !== undefined ? { max } : {}) })
    .withMessage(`${labelFor(field)} must be a whole number${max !== undefined ? ` between ${min} and ${max}` : ` of ${min} or more`}`)

const dateField = (field, { required = false, partial = false } = {}) => {
  const name = labelFor(field)
  let chain = body(field)
  if (required) {
    if (partial) chain = chain.optional()
    chain = chain.notEmpty().withMessage(`${name} is required`)
  } else {
    chain = chain.optional({ values: 'falsy' })
  }
  return chain.isISO8601().withMessage(`${name} must be a valid date`)
}

const boolField = (field) =>
  body(field).optional().isBoolean().withMessage(`${labelFor(field)} must be true or false`)

const arrayField = (field) =>
  body(field).optional({ values: 'falsy' }).isArray().withMessage(`${labelFor(field)} must be a list`)

/**
 * One shape for a rejected request.
 *
 * `error` carries the first message because that is what every caller already
 * reads — the toast, the enquiry form, the unwrap helper. `errors` carries the
 * per-field detail for the forms that can place a message next to the input
 * that caused it. Returning only the array, as the four existing routes did,
 * left every simple caller showing a generic failure.
 */
const handleValidation = (req, res, next) => {
  const result = validationResult(req)
  if (result.isEmpty()) return next()

  const errors = result.array().map((e) => ({ field: e.path || e.param, message: e.msg }))
  return res.status(400).json({ success: false, error: errors[0].message, errors })
}

module.exports = {
  text, enumField, urlField, emailField, intField, dateField, boolField, arrayField,
  handleValidation, columnLimit, enumValues,
}
