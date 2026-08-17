const express = require('express')
const { Event } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

const router = express.Router()

/**
 * GET /api/events
 * Public endpoint - List all active events with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { category, status = 'Upcoming', search, limit = 50, offset = 0 } = req.query
    const where = { isActive: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { programme: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const events = await Event.findAndCountAll({
      where,
      order: [['startDate', 'ASC'], ['sortOrder', 'ASC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })

    res.json({
      data: events.rows,
      total: events.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

/**
 * GET /api/events/:id
 * Public endpoint - Get single event details
 */
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event || !event.isActive) {
      return res.status(404).json({ error: 'Event not found' })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

/**
 * POST /api/events
 * Admin only - Create new event
 */
router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      venue,
      location,
      capacity,
      ageGroup,
      programme,
      priceKES,
      registrationDeadline,
      registrationLink,
      poster,
      status,
    } = req.body

    if (!title || !description || !category || !startDate) {
      return res.status(400).json({ error: 'title, description, category, and startDate are required' })
    }

    const event = await Event.create({
      title: title.trim(),
      description,
      category,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      venue,
      location,
      capacity: capacity ? parseInt(capacity) : null,
      ageGroup,
      programme,
      priceKES: priceKES ? parseFloat(priceKES) : null,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      registrationLink,
      poster,
      status: status || 'Upcoming',
      photos: [],
      videos: [],
    })

    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * PUT /api/events/:id
 * Admin only - Update event
 */
router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    const {
      title,
      description,
      category,
      startDate,
      endDate,
      venue,
      location,
      capacity,
      ageGroup,
      programme,
      priceKES,
      registrationDeadline,
      registrationLink,
      poster,
      results,
      recap,
      status,
      isActive,
      sortOrder,
      photos,
      videos,
    } = req.body

    await event.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(venue !== undefined && { venue }),
      ...(location !== undefined && { location }),
      ...(capacity !== undefined && { capacity: capacity ? parseInt(capacity) : null }),
      ...(ageGroup !== undefined && { ageGroup }),
      ...(programme !== undefined && { programme }),
      ...(priceKES !== undefined && { priceKES: priceKES ? parseFloat(priceKES) : null }),
      ...(registrationDeadline !== undefined && { registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null }),
      ...(registrationLink !== undefined && { registrationLink }),
      ...(poster !== undefined && { poster }),
      ...(results !== undefined && { results }),
      ...(recap !== undefined && { recap }),
      ...(status !== undefined && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(photos !== undefined && { photos: Array.isArray(photos) ? photos : [] }),
      ...(videos !== undefined && { videos: Array.isArray(videos) ? videos : [] }),
    })

    res.json(event)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * DELETE /api/events/:id
 * Admin only - Soft delete event
 */
router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    await event.update({ isActive: false })
    res.json({ message: 'Event deactivated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
