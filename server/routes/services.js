const express = require('express')
const router = express.Router()
const serviceController = require('../controllers/serviceController')
const { requireAuth, requireRole } = require('../middleware/requireAuth')

router.get('/', serviceController.getAllServices)
router.get('/:id', serviceController.getServiceById)
router.post('/', requireAuth, requireRole('admin', 'staff'), serviceController.createService)
router.put('/:id', requireAuth, requireRole('admin', 'staff'), serviceController.updateService)
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), serviceController.deleteService)

module.exports = router
