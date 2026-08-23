const Testimonial = require('../models/Testimonial')

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    })
    res.json({ success: true, data: testimonials })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch testimonials' })
  }
}

exports.createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body)
    res.status(201).json({ success: true, data: testimonial })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}
