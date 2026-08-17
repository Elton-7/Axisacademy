const { body, validationResult } = require('express-validator')
const Contact = require('../models/Contact')
const { recordAudit } = require('../middleware/audit')
const { notifyNewContact } = require('../services/notifications')

exports.submitContact = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long').escape(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 20 }).withMessage('Phone is too long').escape(),
  body('subject').optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('Subject is too long').escape(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message is too long').escape(),

  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      // Only allow expected fields to be stored
      const payload = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        subject: req.body.subject || 'General Enquiry',
        message: req.body.message,
      }
      const contact = await Contact.create(payload)

      // Non-blocking: the message is saved, and a mail outage must not turn a
      // successful submission into an error for the sender.
      notifyNewContact(contact).catch((error) =>
        console.error('Failed to notify of new contact message:', error)
      )

      res.status(201).json({
        success: true,
        message: 'Thank you for contacting us! We will respond within 24 hours.',
        data: contact 
      })
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit contact form' })
    }
  }
]

exports.getAllContacts = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100)
    const offset = (page - 1) * limit
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
    const status = typeof req.query.status === 'string' ? req.query.status : ''
    const where = {}

    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ]
    }

    if (['new', 'read', 'replied', 'closed'].includes(status)) {
      where.status = status
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })

    res.json({
      success: true,
      data: contacts,
      total: count,
      page,
      limit,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
}

exports.getContactById = async (req, res) => {
  const contact = await Contact.findByPk(req.params.id)
  if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' })
  res.json({ success: true, data: contact })
}

exports.updateContactStatus = async (req, res) => {
  const { status } = req.body
  if (!['new', 'read', 'replied', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' })
  }

  const contact = await Contact.findByPk(req.params.id)
  if (!contact) return res.status(404).json({ success: false, error: 'Contact not found' })

  await contact.update({ status })
  await recordAudit(req, 'status_updated', 'contact', contact.id, { status })
  res.json({ success: true, data: contact })
}
