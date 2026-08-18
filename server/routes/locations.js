const express = require('express')
const { Location } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

const router = express.Router()

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
      data: locations.rows,
      total: locations.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id)
    if (!location || !location.isActive) {
      return res.status(404).json({ error: 'Location not found' })
    }

    res.json(location)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' })
  }
})

router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { name, type, address, city, county, phone, email, description, programmes, photo, latitude, longitude } = req.body

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' })
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

    res.status(201).json(location)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id)
    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
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

    res.json(location)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id)
    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }

    await location.update({ isActive: false })
    res.json({ message: 'Location deactivated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
