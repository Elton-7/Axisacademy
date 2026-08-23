const express = require('express')
const router = express.Router()
const contactController = require('../controllers/contactController')
const { contactLimiter } = require('../middleware/rateLimiter')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

router.post('/', contactLimiter, contactController.submitContact)
router.get('/', requireAuth, requireRole('admin', 'staff'), contactController.getAllContacts)
router.get('/:id', requireAuth, requireRole('admin', 'staff'), contactController.getContactById)
router.patch('/:id/status', requireAuth, requireRole('admin', 'staff'), contactController.updateContactStatus)

module.exports = router
