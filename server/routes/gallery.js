const express = require('express')
const { Gallery } = require('../models')
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
  text(Gallery, 'title', { required: true, partial }),
  enumField(Gallery, 'type', { required: true, partial }),
  enumField(Gallery, 'category', { required: true, partial }),
  text(Gallery, 'description', { partial }),
  urlField(Gallery, 'url', { required: true, partial }),
  urlField(Gallery, 'thumbnail', { partial }),
  arrayField('tags'),
  boolField('consentConfirmed'),
  text(Gallery, 'consentReference', { partial }),
  boolField('isActive'),
  intField('sortOrder'),
]

router.get('/', async (req, res) => {
  try {
    const { category, type, search, limit = 200, offset = 0 } = req.query
    const where = { isActive: true, consentConfirmed: true }

    if (category && category !== 'all') where.category = category
    if (type && type !== 'all') where.type = type

    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const galleryItems = await Gallery.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: galleryItems.rows,
      total: galleryItems.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch gallery items' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id)
    if (!item || !item.isActive || !item.consentConfirmed) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' })
    }

    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch gallery item' })
  }
})

router.post('/', requireAuth, requireRole(['admin', 'staff']), rules(false), handleValidation, async (req, res) => {
  try {
    const { title, type, category, description, url, thumbnail, tags, consentConfirmed, consentReference } = req.body

    if (consentConfirmed !== true) {
      return res.status(400).json({ success: false, error: 'Publication consent must be confirmed before media can be added' })
    }
    // A tick with no reference to the signed release is not a record of consent.
    if (!String(consentReference || '').trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please record the signed media release this consent refers to',
      })
    }

    const item = await Gallery.create({
      title: title.trim(),
      type: type || 'Photo',
      category: category || 'General',
      description,
      url,
      thumbnail,
      tags: Array.isArray(tags) ? tags : [],
      consentConfirmed: true,
      consentConfirmedBy: req.user?.userId || null,
      consentConfirmedAt: new Date(),
      consentReference: String(consentReference).trim(),
    })

    res.status(201).json({ success: true, data: item })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), rules(true), handleValidation, async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' })
    }

    const { title, type, category, description, url, thumbnail, tags, consentConfirmed, isActive, sortOrder } = req.body
    const nextConsentConfirmed = consentConfirmed !== undefined ? consentConfirmed : item.consentConfirmed
    const nextIsActive = isActive !== undefined ? isActive : item.isActive

    if (nextIsActive && nextConsentConfirmed !== true) {
      return res.status(400).json({ success: false, error: 'Publication consent must be confirmed before media can be published' })
    }

    await item.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(type !== undefined && { type }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(url !== undefined && { url }),
      ...(thumbnail !== undefined && { thumbnail }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
      ...(consentConfirmed !== undefined && { consentConfirmed }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      // Re-confirming consent re-stamps who did it and when; withdrawing it
      // clears the provenance so a stale approval cannot be mistaken for a
      // current one.
      ...(consentConfirmed === true &&
        !item.consentConfirmed && {
          consentConfirmedBy: req.user?.userId || null,
          consentConfirmedAt: new Date(),
        }),
      ...(consentConfirmed === false && {
        consentConfirmedBy: null,
        consentConfirmedAt: null,
      }),
    })

    res.json({ success: true, data: item })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const item = await Gallery.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' })
    }

    await item.update({ isActive: false })
    res.json({ success: true, message: 'Gallery item deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
