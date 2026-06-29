const Service = require('../models/Service')

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    })
    res.json(services)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' })
  }
}

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) return res.status(404).json({ error: 'Service not found' })
    res.json(service)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' })
  }
}

exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body)
    res.status(201).json(service)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) return res.status(404).json({ error: 'Service not found' })
    await service.update(req.body)
    res.json(service)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id)
    if (!service) return res.status(404).json({ error: 'Service not found' })
    await service.destroy()
    res.json({ message: 'Service deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
