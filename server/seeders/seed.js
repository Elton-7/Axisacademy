const { Service, Testimonial } = require('../models')

const seedData = async () => {
  try {
    await Service.bulkCreate([
      {
        title: 'Homeschooling',
        slug: 'homeschooling',
        icon: 'Home',
        description: 'Personalized homeschooling support for learners of all ages.',
        items: ['CBC', 'Cambridge', 'IGCSE', 'A Levels', 'International Programmes', 'Customized Learning Plans'],
        order: 1
      },
      {
        title: 'Academic Support',
        slug: 'academic-support',
        icon: 'GraduationCap',
        description: 'Subject tutoring and examination preparation.',
        items: ['Mathematics', 'Sciences', 'Languages', 'Humanities', 'Business Studies', 'Examination Preparation'],
        order: 2
      },
      {
        title: 'Language Programmes',
        slug: 'language-programmes',
        icon: 'Languages',
        description: 'French, German, Arabic, Swahili, English Language Support',
        items: ['School Learners', 'University Students', 'Professionals', 'Travellers', 'Migrants', 'Personal Enrichment'],
        order: 3
      },
      {
        title: 'Enrichment Programmes',
        slug: 'enrichment-programmes',
        icon: 'Star',
        description: 'Chess, Public Speaking, Debate, Acting and Theatre, Creative Writing, Coding, Robotics, Entrepreneurship, Financial Literacy, Leadership Development, Study Skills, Career Guidance, Mentorship',
        items: ['Chess', 'Public Speaking', 'Debate', 'Acting and Theatre', 'Creative Writing', 'Coding', 'Robotics', 'Entrepreneurship', 'Financial Literacy', 'Leadership Development', 'Study Skills', 'Career Guidance', 'Mentorship'],
        order: 4
      },
      {
        title: 'Sports and Recreational',
        slug: 'sports-recreational',
        icon: 'Activity',
        description: 'Physical activities and outdoor programmes.',
        items: ['Swimming', 'Skating', 'Football', 'Basketball', 'Athletics', 'Outdoor Activities'],
        order: 5
      },
      {
        title: 'Special Learner Support',
        slug: 'special-learner-support',
        icon: 'HeartHandshake',
        description: 'Support for learners with diverse educational needs.',
        items: ['Personalized learning pathways designed to help every learner succeed.'],
        order: 6
      }
    ], { ignoreDuplicates: true })

    await Testimonial.bulkCreate([
      {
        text: "Axis has been a blessing for our family. The personalized attention and flexibility have helped our child excel academically and build confidence.",
        author: 'Parent',
        role: 'Parent',
        rating: 5
      },
      {
        text: "The support I received from Axis tutors helped me improve my grades and discover new interests. Highly recommended!",
        author: 'Learner',
        role: 'Student',
        rating: 5
      },
      {
        text: "Professional, caring, and results-driven. Axis transformed my daughter's academic journey completely.",
        author: 'Parent',
        role: 'Parent',
        rating: 5
      }
    ], { ignoreDuplicates: true })

    console.log('Seed data inserted successfully')
  } catch (error) {
    console.error('Seed error:', error)
  }
}

module.exports = seedData

if (require.main === module) {
  const { syncDatabase } = require('../models')
  syncDatabase().then(() => seedData().then(() => process.exit(0)))
}
