const { body, validationResult } = require('express-validator')
const Contact = require('../models/Contact')

exports.submitContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),

  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const contact = await Contact.create(req.body)
      res.status(201).json({ 
        message: 'Thank you for contacting us! We will respond within 24 hours.',
        contact 
      })
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit contact form' })
    }
  }
]

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] })
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
}
