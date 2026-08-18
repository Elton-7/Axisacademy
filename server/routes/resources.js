const express = require('express')
const { Resource } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { validateUuidParam } = require('../middleware/validateUuidParam')

const router = express.Router()

// Every :id in this router is a UUID; reject anything else as a 400, not a 500.
router.param('id', validateUuidParam)

router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query
    const where = { isActive: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      const { Op } = require('sequelize')
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const resources = await Resource.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 200),
      offset: parseInt(offset),
    })

    res.json({
      success: true,
      data: resources.rows,
      total: resources.count,
      limit: Math.min(parseInt(limit), 200),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch resources' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id)
    if (!resource || !resource.isActive) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    res.json({ success: true, data: resource })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch resource' })
  }
})

router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, author, coverImage, readTime, tags, publishedAt } = req.body

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'title and content are required' })
    }

    const resource = await Resource.create({
      title: title.trim(),
      slug: slug || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt,
      content,
      category: category || 'General',
      author: author || 'Axis Learning Team',
      coverImage,
      readTime,
      tags: Array.isArray(tags) ? tags : [],
      publishedAt: publishedAt || new Date(),
    })

    res.status(201).json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id)
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    const { title, slug, excerpt, content, category, author, coverImage, readTime, tags, isActive, sortOrder, publishedAt } = req.body

    await resource.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(slug !== undefined && { slug }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      ...(author !== undefined && { author }),
      ...(coverImage !== undefined && { coverImage }),
      ...(readTime !== undefined && { readTime }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(publishedAt !== undefined && { publishedAt }),
    })

    res.json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id)
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    await resource.update({ isActive: false })
    res.json({ success: true, message: 'Resource deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
