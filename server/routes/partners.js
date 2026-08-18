const express = require('express')
const { Partner } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

const router = express.Router()

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

router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { name, logo, category, description, website, contact, email, phone, focusAreas } = req.body

    if (!name) {
      return res.status(400).json({ success: false, error: 'name is required' })
    }

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

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
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
