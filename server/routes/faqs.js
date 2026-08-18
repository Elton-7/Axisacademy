const express = require('express')
const { FAQ } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

const router = express.Router()

/**
 * GET /api/faqs
 * Public endpoint - List all active FAQs with optional filtering
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
        { question: { [Op.iLike]: `%${search}%` } },
        { answer: { [Op.iLike]: `%${search}%` } },
      ]
    }

    const faqs = await FAQ.findAndCountAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })

    res.json({
      data: faqs.rows,
      total: faqs.count,
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQs' })
  }
})

/**
 * GET /api/faqs/:id
 * Public endpoint - Get single FAQ and increment view count
 */
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id)
    if (!faq || !faq.isActive) {
      return res.status(404).json({ error: 'FAQ not found' })
    }

    // Increment view count
    await faq.increment('viewCount')

    res.json(faq)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FAQ' })
  }
})

/**
 * POST /api/faqs
 * Admin only - Create new FAQ
 */
router.post('/', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { question, answer, category, order } = req.body

    if (!question || !answer) {
      return res.status(400).json({ error: 'question and answer are required' })
    }

    const faq = await FAQ.create({
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'General',
      order: order ? parseInt(order) : 0,
    })

    res.status(201).json(faq)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * PUT /api/faqs/:id
 * Admin only - Update FAQ
 */
router.put('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id)
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' })
    }

    const { question, answer, category, order, isActive } = req.body

    await faq.update({
      ...(question !== undefined && { question: question.trim() }),
      ...(answer !== undefined && { answer: answer.trim() }),
      ...(category !== undefined && { category }),
      ...(order !== undefined && { order: parseInt(order) }),
      ...(isActive !== undefined && { isActive }),
    })

    res.json(faq)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * DELETE /api/faqs/:id
 * Admin only - Soft delete FAQ
 */
router.delete('/:id', requireAuth, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const faq = await FAQ.findByPk(req.params.id)
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' })
    }

    await faq.update({ isActive: false })
    res.json({ message: 'FAQ deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
