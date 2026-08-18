const express = require('express')
const { Educator } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { validateUuidParam } = require('../middleware/validateUuidParam')

const router = express.Router()

// Every :id in this router is a UUID; reject anything else as a 400, not a 500.
router.param('id', validateUuidParam)

/**
 * GET /api/educators
 * Public endpoint - List all active educators with optional filtering
 */
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
        { position: { [Op.iLike]: `%${search}%` } },
        { expertise: { [Op.iLike]: `%${search}%` } },
        { biography: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const educators = await Educator.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: educators.rows,
      total: educators.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch educators' })
  }
})

/**
 * GET /api/educators/:id
 * Public endpoint - Get single educator details
 */
router.get('/:id', async (req, res) => {
  try {
    const educator = await Educator.findByPk(req.params.id)
    if (!educator || !educator.isActive) {
      return res.status(404).json({ success: false, error: 'Educator not found' })
    }
    res.json({ success: true, data: educator })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch educator' })
  }
})

/**
 * POST /api/educators
 * Admin only - Create new educator
 */
router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { name, position, category, qualifications, experience, subjects, languages, expertise, biography, photo, email, phone } = req.body

    if (!name || !position || !category) {
      return res.status(400).json({ success: false, error: 'name, position, and category are required' })
    }

    const educator = await Educator.create({
      name: name.trim(),
      position: position.trim(),
      category,
      qualifications,
      experience,
      subjects: Array.isArray(subjects) ? subjects : [],
      languages: Array.isArray(languages) ? languages : [],
      expertise,
      biography,
      photo,
      email: email?.toLowerCase(),
      phone,
    })

    res.status(201).json({ success: true, data: educator })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

/**
 * PUT /api/educators/:id
 * Admin only - Update educator
 */
router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const educator = await Educator.findByPk(req.params.id)
    if (!educator) {
      return res.status(404).json({ success: false, error: 'Educator not found' })
    }

    const { name, position, category, qualifications, experience, subjects, languages, expertise, biography, photo, email, phone, isActive, sortOrder } = req.body

    await educator.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(position !== undefined && { position: position.trim() }),
      ...(category !== undefined && { category }),
      ...(qualifications !== undefined && { qualifications }),
      ...(experience !== undefined && { experience }),
      ...(subjects !== undefined && { subjects: Array.isArray(subjects) ? subjects : [] }),
      ...(languages !== undefined && { languages: Array.isArray(languages) ? languages : [] }),
      ...(expertise !== undefined && { expertise }),
      ...(biography !== undefined && { biography }),
      ...(photo !== undefined && { photo }),
      ...(email !== undefined && { email: email?.toLowerCase() }),
      ...(phone !== undefined && { phone }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    })

    res.json({ success: true, data: educator })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

/**
 * DELETE /api/educators/:id
 * Admin only - Soft delete educator
 */
router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const educator = await Educator.findByPk(req.params.id)
    if (!educator) {
      return res.status(404).json({ success: false, error: 'Educator not found' })
    }

    await educator.update({ isActive: false })
    res.json({ success: true, message: 'Educator deactivated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
