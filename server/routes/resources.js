const express = require('express')
const { Resource } = require('../models')
const { requireAuth, requireRole } = require('../middleware/requireAuth')
const { validateUuidParam } = require('../middleware/validateUuidParam')
const { body } = require('express-validator')
const { requestSiteRebuild } = require('../lib/siteRebuild')
const {
  text, enumField, urlField, emailField, intField, dateField, boolField, arrayField,
  handleValidation,
} = require('../middleware/validate')

const router = express.Router()

// Every :id in this router is a UUID; reject anything else as a 400, not a 500.
router.param('id', validateUuidParam)

const rules = (partial) => [
  text(Resource, 'title', { required: true, partial }),
  text(Resource, 'slug', { required: true, partial }),
  text(Resource, 'content', { required: true, partial }),
  enumField(Resource, 'category', { required: true, partial }),
  text(Resource, 'author', { required: true, partial }),
  text(Resource, 'excerpt', { partial }),
  urlField(Resource, 'coverImage', { partial }),
  text(Resource, 'readTime', { partial }),
  arrayField('tags'),
  dateField('publishedAt'),
  boolField('isActive'),
  intField('sortOrder'),
]

router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query
    // Published only. isActive alone would let a half-written article through,
    // which is the whole reason the draft state exists.
    const where = { isActive: true, status: 'Published' }

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

/**
 * By slug, because that is what an article's URL contains.
 *
 * The only single-article route looked up by primary key, so /resources/:slug
 * had nothing to call — which is why articles had no page of their own and
 * nothing for a search engine to index. Declared before '/:id' so a slug is
 * never mistaken for an identifier.
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const resource = await Resource.findOne({ where: { slug: req.params.slug } })
    if (!resource || !resource.isActive || resource.status !== 'Published') {
      return res.status(404).json({ success: false, error: 'Article not found' })
    }
    res.json({ success: true, data: resource })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch article' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id)
    if (!resource || !resource.isActive || resource.status !== 'Published') {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    res.json({ success: true, data: resource })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch resource' })
  }
})

router.post('/', requireAuth, requireRole(['admin', 'staff']), rules(false), handleValidation, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, author, coverImage, readTime, tags, publishedAt, status, metaDescription } = req.body

    const resource = await Resource.create({
      title: title.trim(),
      slug: slug || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt,
      content,
      // 'General' is no longer a category — see content/resourceCategories.js.
      category: category || 'Parenting & Learning',
      author: author || 'Axis Learning Team',
      coverImage,
      readTime,
      tags: Array.isArray(tags) ? tags : [],
      // Drafts by default: an article saved half-written should not appear on
      // the site because someone forgot to set a flag.
      status: status === 'Published' ? 'Published' : 'Draft',
      metaDescription,
      publishedAt: publishedAt || new Date(),
    })

    // Only a published article changes the public site; a draft changes
    // nothing a crawler would ever see, so it must not cost a build.
    if (resource.status === 'Published' && resource.isActive) {
      requestSiteRebuild(`new article "${resource.title}"`)
    }

    res.status(201).json({ success: true, data: resource })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

router.put('/:id', requireAuth, requireRole(['admin', 'staff']), rules(true), handleValidation, async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id)
    if (!resource) {
      return res.status(404).json({ success: false, error: 'Resource not found' })
    }

    const { title, slug, excerpt, content, category, author, coverImage, readTime, tags, isActive, sortOrder, publishedAt, status, metaDescription } = req.body

    // Taken before the update: an article being unpublished changes the public
    // site just as much as one being published, and afterwards there is no way
    // to tell which happened.
    const wasPublic = resource.status === 'Published' && resource.isActive

    await resource.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(slug !== undefined && { slug }),
      ...(status !== undefined && { status }),
      ...(metaDescription !== undefined && { metaDescription }),
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

    const isPublic = resource.status === 'Published' && resource.isActive
    if (wasPublic || isPublic) {
      requestSiteRebuild(`article "${resource.title}" ${isPublic ? 'updated' : 'unpublished'}`)
    }

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

    const wasPublic = resource.status === 'Published' && resource.isActive
    await resource.update({ isActive: false })
    // Otherwise the sitemap keeps advertising a page that now 404s.
    if (wasPublic) requestSiteRebuild(`article "${resource.title}" removed`)

    res.json({ success: true, message: 'Resource deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
