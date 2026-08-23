const express = require('express')
const { Partner } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { validateUuidParam } = require('../middleware/validateUuidParam')
const { body } = require('express-validator')
const {
  text, enumField, urlField, emailField, intField, dateField, boolField, arrayField,
  handleValidation,
} = require('../middleware/validate')

const router = express.Router()

// Every :id in this router is a UUID; reject anything else as a 400, not a 500.
router.param('id', validateUuidParam)

const rules = (partial) => [
  text(Partner, 'name', { required: true, partial }),
  enumField(Partner, 'category', { required: true, partial }),
  urlField(Partner, 'logo', { partial }),
  text(Partner, 'description', { partial }),
  urlField(Partner, 'website', { partial }),
  text(Partner, 'contact', { partial }),
  emailField('email'),
  text(Partner, 'phone', { partial }),
  arrayField('focusAreas'),
  boolField('isActive'),
  intField('sortOrder'),
]

router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 100, offset = 0 } = req.query
    const where = { isActive: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { focusAreas: { [Op.overlap]: [search.trim()] } },
      ]
    }

    const partners = await Partner.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: partners.rows,
      total: partners.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch partners' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const partner = await Partner.findByPk(req.params.id)
    if (!partner || !partner.isActive) {
      return res.status(404).json({ success: false, error: 'Partner not found' })
    }

    res.json({ success: true, data: partner })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch partner' })
  }
})

router.post('/', requireAuth, requireRole(['admin', 'staff']), rules(false), handleValidation, async (req, res) => {
  try {
    const { name, logo, category, description, website, contact, email, phone, focusAreas } = req.body

    const partner = await Partner.create({
      name: name.trim(),
      logo,
      category: category || 'Corporate',
      description,
      website,
      contact,
      email,
      phone,
      focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
    })

    res.status(201).json({ success: true, data: partner })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), rules(true), handleValidation, async (req, res) => {
  try {
    const partner = await Partner.findByPk(req.params.id)
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' })
    }

    const { name, logo, category, description, website, contact, email, phone, focusAreas, isActive, sortOrder } = req.body

    await partner.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(logo !== undefined && { logo }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(website !== undefined && { website }),
      ...(contact !== undefined && { contact }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(focusAreas !== undefined && { focusAreas: Array.isArray(focusAreas) ? focusAreas : [] }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    })

    res.json({ success: true, data: partner })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const partner = await Partner.findByPk(req.params.id)
    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' })
    }

    await partner.update({ isActive: false })
    res.json({ success: true, message: 'Partner deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
