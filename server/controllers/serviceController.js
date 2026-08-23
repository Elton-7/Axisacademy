const Service = require('../models/Service')

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    })
    res.json({ success: true, data: services })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch services' })
  }
}

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' })
    res.json({ success: true, data: service })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch service' })
  }
}

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body)
    res.status(201).json({ success: true, data: service })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' })
    await service.update(req.body)
    res.json({ success: true, data: service })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' })
    await service.destroy()
    res.json({ success: true, message: 'Service deleted' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
