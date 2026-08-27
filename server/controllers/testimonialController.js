const Testimonial = require('../models/Testimonial')

const isStaff = (req) => Boolean(req.user && ['admin', 'staff'].includes(req.user.role))

/**
 * Fields a client is allowed to set.
 *
 * Named explicitly because the previous version passed `req.body` straight to
 * `create`. That was survivable while the model held nothing but the quote, but
 * consent columns record who vouched for publication and when — values a
 * request must never be able to supply for itself.
 */
const pick = (body) => ({
  ...(body.text !== undefined && { text: String(body.text).trim() }),
  ...(body.author !== undefined && { author: String(body.author).trim() }),
  ...(body.role !== undefined && { role: body.role }),
  ...(body.rating !== undefined && { rating: body.rating }),
})

/**
 * Public callers see only what is live and consented. Staff see everything,
 * because a testimonial awaiting confirmation is invisible otherwise and could
 * never be confirmed.
 */
exports.getAllTestimonials = async (req, res) => {
  try {
    const where = isStaff(req) ? {} : { isActive: true, consentConfirmed: true }
    const testimonials = await Testimonial.findAll({
      where,
      order: [['createdAt', 'DESC']],
    })
    res.json({ success: true, data: testimonials })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials' })
  }
}

exports.createTestimonial = async (req, res) => {
  try {
    const { consentConfirmed, consentReference } = req.body

    if (consentConfirmed !== true) {
      return res.status(400).json({
        success: false,
        error: 'Publication consent must be confirmed before a testimonial can be added',
      })
    }
    // A tick with no reference to the signed consent is not a record of it.
    if (!String(consentReference || '').trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please record the signed consent this refers to',
      })
    }

    const testimonial = await Testimonial.create({
      ...pick(req.body),
      consentConfirmed: true,
      consentConfirmedBy: req.user?.userId || null,
      consentConfirmedAt: new Date(),
      consentReference: String(consentReference).trim(),
    })

    res.status(201).json({ success: true, data: testimonial })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id)
    if (!testimonial) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' })
    }

    const { consentConfirmed, consentReference, isActive } = req.body
    const nextConsent = consentConfirmed !== undefined ? consentConfirmed : testimonial.consentConfirmed
    const nextActive = isActive !== undefined ? isActive : testimonial.isActive

    // The only combination that must not exist: on a public page, unvouched for.
    if (nextActive && nextConsent !== true) {
      return res.status(400).json({
        success: false,
        error: 'Publication consent must be confirmed before a testimonial can be published',
      })
    }

    await testimonial.update({
      ...pick(req.body),
      ...(isActive !== undefined && { isActive }),
      ...(consentReference !== undefined && { consentReference: String(consentReference).trim() || null }),
      ...(consentConfirmed !== undefined && { consentConfirmed }),
      // Confirming stamps who did it and when. Withdrawing clears the
      // provenance, so a stale approval cannot later read as a current one.
      ...(consentConfirmed === true &&
        !testimonial.consentConfirmed && {
          consentConfirmedBy: req.user?.userId || null,
          consentConfirmedAt: new Date(),
        }),
      ...(consentConfirmed === false && {
        consentConfirmedBy: null,
        consentConfirmedAt: null,
      }),
    })

    res.json({ success: true, data: testimonial })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

/**
 * Deactivates rather than destroys.
 *
 * A withdrawn consent has to take the quote off the site immediately, which
 * this does. Keeping the row keeps the record of what was published and who
 * had confirmed it — which is the thing a parent disputing publication would
 * be asking about.
 */
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id)
    if (!testimonial) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' })
    }

    await testimonial.update({ isActive: false })
    res.json({ success: true, message: 'Testimonial removed from the site' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
