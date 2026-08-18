const express = require('express')
const { Location } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { validateUuidParam } = require('../middleware/validateUuidParam')

const router = express.Router()

// Every :id in this router is a UUID; reject anything else as a 400, not a 500.
router.param('id', validateUuidParam)

router.get('/', async (req, res) => {
  try {
    const { type, county, search, limit = 200, offset = 0 } = req.query
    const where = { isActive: true }

    if (type && type !== 'all') {
      where.type = type
    }

    if (county && county !== 'all') {
      where.county = county
    }

    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { county: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const locations = await Location.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: locations.rows,
      total: locations.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch locations' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id)
    if (!location || !location.isActive) {
      return res.status(404).json({ success: false, error: 'Location not found' })
    }

    res.json({ success: true, data: location })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch location' })
  }
})

router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { name, type, address, city, county, phone, email, description, programmes, photo, latitude, longitude } = req.body

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'name and type are required' })
    }

    const location = await Location.create({
      name: name.trim(),
      type,
      address,
      city,
      county,
      phone,
      email,
      description,
      programmes: Array.isArray(programmes) ? programmes : [],
      photo,
      latitude,
      longitude,
    })

    res.status(201).json({ success: true, data: location })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id)
    if (!location) {
      return res.status(404).json({ success: false, error: 'Location not found' })
    }

    const { name, type, address, city, county, phone, email, description, programmes, photo, latitude, longitude, isActive, sortOrder } = req.body

    await location.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(type !== undefined && { type }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(county !== undefined && { county }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(description !== undefined && { description }),
      ...(programmes !== undefined && { programmes: Array.isArray(programmes) ? programmes : [] }),
      ...(photo !== undefined && { photo }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    })

    res.json({ success: true, data: location })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id)
    if (!location) {
      return res.status(404).json({ success: false, error: 'Location not found' })
    }

    await location.update({ isActive: false })
    res.json({ success: true, message: 'Location deactivated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
