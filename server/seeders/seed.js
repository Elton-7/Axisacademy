const { Service, Testimonial, User, Enrollment, PortalSchedule, PortalMessage, Educator, Event, FAQ, Location, Gallery, Resource, Partner } = require('../models')

/**
 * Seeding runs on every server start, and most of these models have no unique
 * constraint — so `ignoreDuplicates` had nothing to detect a conflict against
 * and every restart inserted another full copy of the seed data.
 *
 * Seeding a table only when it is empty is idempotent regardless of constraints,
 * and leaves real content alone once Axis starts adding its own.
 */
const seedIfEmpty = async (Model, rows) => {
  const existing = await Model.count()
  if (existing > 0) return 0

  await Model.bulkCreate(rows)
  return rows.length
}

const seedData = async () => {
  try {
    await seedIfEmpty(Service, [
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
    ])

    await seedIfEmpty(Educator, [
      {
        name: 'Dr. Sarah Njoroge',
        position: 'Head of Academic Programmes',
        category: 'Leadership',
        qualifications: 'PhD in Education, M.Ed., B.A. in English Literature',
        experience: '15+ years in educational leadership and curriculum development',
        expertise: 'Curriculum design, educational strategy, learner assessment',
        biography: 'Passionate about creating personalized educational pathways for every learner.',
        subjects: ['Education Strategy', 'Curriculum Design', 'Learner Assessment'],
        languages: ['English', 'Swahili'],
        sortOrder: 1,
      },
      {
        name: 'Prof. James Kipchoge',
        position: 'Mathematics & Science Specialist',
        category: 'Teacher',
        qualifications: 'M.Sc. Mathematics, B.Ed., Cambridge A Level Examiner',
        experience: '12+ years teaching Mathematics and Physics at secondary level',
        expertise: 'A Levels, IGCSE Mathematics, Physics tuition, exam preparation',
        subjects: ['Mathematics', 'Physics', 'Sciences'],
        languages: ['English', 'Swahili'],
        email: 'james.kipchoge@axislearning.com',
        phone: '+254 724 556 789',
        sortOrder: 2,
      },
      {
        name: 'Amara Kabugi',
        position: 'Languages & Cultural Programs Lead',
        category: 'Language Educator',
        qualifications: 'MA in Linguistics, Certified French & Swahili Instructor',
        experience: '10+ years teaching languages to diverse learners',
        expertise: 'French, Swahili, German, language immersion, cultural education',
        subjects: [],
        languages: ['French', 'English', 'Swahili', 'German'],
        email: 'amara.kabugi@axislearning.com',
        phone: '+254 722 445 667',
        sortOrder: 3,
      },
      {
        name: 'David Ochieng',
        position: 'Special Needs Education Specialist',
        category: 'Specialist Educator',
        qualifications: 'M.Ed. Special Education, Diploma in Autism Spectrum Support',
        experience: '8+ years supporting learners with diverse educational needs',
        expertise: 'Autism spectrum, ADHD support, dyslexia intervention, individualized learning plans',
        subjects: ['Special Education', 'Inclusive Learning'],
        languages: ['English', 'Swahili'],
        email: 'david.ochieng@axislearning.com',
        sortOrder: 4,
      },
      {
        name: 'Zainab Hassan',
        position: 'Enrichment & Life Skills Tutor',
        category: 'Tutor',
        qualifications: 'B.A. in Psychology, Certified Leadership Coach',
        experience: '7+ years in student mentoring and enrichment programmes',
        expertise: 'Public speaking, debate, leadership development, study skills, confidence building',
        subjects: ['Leadership', 'Public Speaking', 'Study Skills'],
        languages: ['English', 'Arabic', 'Swahili'],
        email: 'zainab.hassan@axislearning.com',
        sortOrder: 5,
      },
      {
        name: 'Michael Kiplagat',
        position: 'Sports & Physical Development Coach',
        category: 'Coach',
        qualifications: 'B.Sc. Sports Science, Certified Sports Trainer',
        experience: '6+ years coaching various sports and fitness programmes',
        expertise: 'Swimming, football, athletics, sports coaching, team building',
        subjects: ['Sports', 'Physical Education'],
        languages: ['English', 'Swahili'],
        phone: '+254 721 334 456',
        sortOrder: 6,
      },
      {
        name: 'Priya Mendez',
        position: 'Arts & Creative Development Facilitator',
        category: 'Artist',
        qualifications: 'M.A. Fine Arts, Diploma in Drama & Theatre',
        experience: '9+ years in arts education and creative programme delivery',
        expertise: 'Drama, theatre, creative writing, visual arts, performance coaching',
        subjects: ['Drama', 'Creative Writing', 'Visual Arts'],
        languages: ['English', 'Spanish'],
        email: 'priya.mendez@axislearning.com',
        sortOrder: 7,
      },
      {
        name: 'Robert Mutua',
        position: 'Education Consultant & Learner Assessment',
        category: 'Education Consultant',
        qualifications: 'M.Ed. Educational Psychology, Certified Learning Assessor',
        experience: '11+ years in educational assessment and learner pathway design',
        expertise: 'Learner profiling, curriculum matching, individualized pathway development',
        subjects: ['Assessment', 'Curriculum Guidance'],
        languages: ['English', 'Swahili'],
        email: 'robert.mutua@axislearning.com',
        phone: '+254 723 221 998',
        sortOrder: 8,
      },
      {
        name: 'Jennifer Kipkemboi',
        position: 'Tutor - Cambridge & IGCSE',
        category: 'Tutor',
        qualifications: 'B.Sc. Chemistry, Cambridge A Level certified tutor',
        experience: '5+ years tutoring Cambridge and IGCSE students',
        expertise: 'Chemistry, Biology, English Literature, IGCSE exam preparation',
        subjects: ['Chemistry', 'Biology', 'English Literature'],
        languages: ['English', 'Swahili'],
        sortOrder: 9,
      },
      {
        name: 'Charles Nkosi',
        position: 'Academic Tutor - Mathematics & Business',
        category: 'Tutor',
        qualifications: 'B.Comm. Business Administration, Diploma in Mathematics Education',
        experience: '4+ years tutoring secondary students in mathematics and business studies',
        expertise: 'Mathematics, Business Studies, Accounting, CBC & Cambridge curricula',
        subjects: ['Mathematics', 'Business Studies', 'Accounting'],
        languages: ['English', 'Zulu', 'Swahili'],
        email: 'charles.nkosi@axislearning.com',
        sortOrder: 10,
      },
    ])

    await seedIfEmpty(Event, [
      {
        title: 'August Holiday Tuition Programme',
        description: 'Comprehensive holiday tuition covering Mathematics, Sciences, English, and other key subjects. Flexible scheduling with one-on-one and group sessions available.',
        category: 'Holiday Tuition',
        startDate: new Date('2026-08-18'),
        endDate: new Date('2026-08-29'),
        venue: 'Axis Learning Centre, Garden City',
        location: 'Garden City, Thika Road',
        capacity: 50,
        ageGroup: 'All ages',
        programme: 'CBC, Cambridge, IGCSE',
        priceKES: 5000,
        registrationDeadline: new Date('2026-08-17'),
        registrationLink: 'https://axis.registration.com/holiday-tuition',
        status: 'Upcoming',
        sortOrder: 1,
      },
      {
        title: 'KCSE Exam Preparation Intensive',
        description: 'Intensive 4-week programme designed to prepare Form 4 students for the KCSE examination. Focus on revision, past papers, and exam techniques.',
        category: 'Exam Preparation',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-28'),
        venue: 'Axis Learning Centre',
        location: 'Nairobi',
        capacity: 30,
        ageGroup: 'Form 4',
        programme: 'CBC - KCSE',
        priceKES: 8000,
        registrationDeadline: new Date('2026-08-25'),
        registrationLink: 'https://axis.registration.com/kcse-prep',
        status: 'Upcoming',
        sortOrder: 2,
      },
      {
        title: 'Public Speaking & Debate Championship',
        description: 'Annual Axis Learning public speaking and debate competition. Teams compete in various categories. Open to learners aged 10-19.',
        category: 'Competition',
        startDate: new Date('2026-09-15'),
        endDate: new Date('2026-09-15'),
        venue: 'Chandaria Innovation Centre, Kenyatta University',
        location: 'Kenyatta University',
        capacity: 200,
        ageGroup: '10-19 years',
        priceKES: 1000,
        registrationDeadline: new Date('2026-09-08'),
        registrationLink: 'https://axis.registration.com/debate-champs',
        status: 'Upcoming',
        sortOrder: 3,
      },
      {
        title: 'Languages & Cultural Immersion Week',
        description: 'An exciting week of language learning and cultural activities in French, Spanish, German, Arabic, and Swahili. Includes cultural performances and cuisine.',
        category: 'Enrichment',
        startDate: new Date('2026-10-05'),
        endDate: new Date('2026-10-09'),
        venue: 'Multiple Axis Centres',
        location: 'Nairobi',
        capacity: 100,
        ageGroup: 'All ages',
        programme: 'Languages',
        priceKES: 3500,
        registrationDeadline: new Date('2026-09-28'),
        registrationLink: 'https://axis.registration.com/culture-week',
        status: 'Upcoming',
        sortOrder: 4,
      },
      {
        title: 'IGCSE & A Level Revision Workshop',
        description: 'Intensive revision workshop for students preparing for IGCSE and A Level examinations. Expert tutors cover all major subjects.',
        category: 'Workshop',
        startDate: new Date('2026-10-12'),
        endDate: new Date('2026-10-16'),
        venue: 'Axis Learning Centre',
        location: 'Garden City',
        capacity: 40,
        ageGroup: 'Secondary & Tertiary',
        programme: 'Cambridge International',
        priceKES: 6500,
        registrationDeadline: new Date('2026-10-05'),
        registrationLink: 'https://axis.registration.com/igcse-revision',
        status: 'Upcoming',
        sortOrder: 5,
      },
      {
        title: 'Sports Day & Field Day',
        description: 'Annual Axis Learning sports day featuring swimming, athletics, football, basketball, and team activities. Fun and competitive games for all.',
        category: 'Sports Event',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-11-01'),
        venue: 'Nairobi Sports Complex',
        location: 'Kasarani',
        capacity: 150,
        ageGroup: 'All ages',
        programme: 'Sports & Recreation',
        priceKES: 500,
        registrationDeadline: new Date('2026-10-25'),
        registrationLink: 'https://axis.registration.com/sports-day',
        status: 'Upcoming',
        sortOrder: 6,
      },
      {
        title: 'Creative Arts & Drama Festival',
        description: 'Showcase of learner creativity through drama performances, visual arts, creative writing, and music. Open performance opportunities for all.',
        category: 'Cultural Event',
        startDate: new Date('2026-11-15'),
        endDate: new Date('2026-11-17'),
        venue: 'Nairobi National Theatre',
        location: 'Nairobi',
        capacity: 300,
        ageGroup: 'All ages',
        programme: 'Arts & Creative Development',
        registrationLink: 'https://axis.registration.com/arts-festival',
        status: 'Upcoming',
        sortOrder: 7,
      },
      {
        title: 'June Holiday Tuition (Past Event)',
        description: 'June holiday tuition programme - revision and catch-up sessions for all learners.',
        category: 'Holiday Tuition',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-26'),
        venue: 'Axis Learning Centre',
        location: 'Various',
        status: 'Completed',
        recap: 'Successfully conducted with 85 participants across CBC, Cambridge, and IGCSE programmes. Students showed significant improvement in targeted areas.',
        sortOrder: 8,
      },
    ])

    await seedIfEmpty(Location, [
      {
        name: 'Chandaria Innovation Centre',
        type: 'Head Office',
        address: 'Kenyatta University, Main Campus',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 700 000 001',
        email: 'info@axislearning.com',
        description: 'Axis Learning headquarters and innovation hub for curriculum planning, learner support, and educational consulting.',
        programmes: ['Curriculum Advisory', 'Learner Discovery', 'Academic Support'],
        latitude: -1.1849,
        longitude: 36.9304,
        sortOrder: 1,
      },
      {
        name: 'Garden City Learning Centre',
        type: 'Learning Centre',
        address: 'Garden City Mall, Thika Road',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 712 345 678',
        email: 'gardencity@axislearning.com',
        description: 'A vibrant centre for academic support, enrichment, and exam preparation in Nairobi.',
        programmes: ['Academic Support', 'Exam Preparation', 'Language Programmes'],
        latitude: -1.2142,
        longitude: 36.8927,
        sortOrder: 2,
      },
      {
        name: 'Kikuyu Learning Centre',
        type: 'Learning Centre',
        address: 'Kikuyu Town',
        city: 'Kikuyu',
        county: 'Kiambu',
        phone: '+254 722 345 678',
        description: 'Support for CBC, Cambridge, and enrichment programmes serving Kikuyu and surrounding areas.',
        programmes: ['CBC Support', 'Cambridge Tutoring', 'Sports & Enrichment'],
        latitude: -1.2458,
        longitude: 36.6624,
        sortOrder: 3,
      },
      {
        name: 'Northern Bypass Centre',
        type: 'Learning Centre',
        address: 'Northern bypass corridor',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 733 456 789',
        programmes: ['Homeschooling', 'Language Classes', 'STEM Tuition'],
        latitude: -1.1968,
        longitude: 36.8812,
        sortOrder: 4,
      },
      {
        name: 'Membley Learning Centre',
        type: 'Learning Centre',
        address: 'Membley Road',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 734 567 890',
        programmes: ['Academic Support', 'Special Learner Support'],
        latitude: -1.2929,
        longitude: 36.8260,
        sortOrder: 5,
      },
      {
        name: 'Umoja Learning Centre',
        type: 'Learning Centre',
        address: 'Umoja Estate',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 735 678 901',
        programmes: ['School Support', 'Mentorship', 'Homework Club'],
        latitude: -1.2874,
        longitude: 36.8931,
        sortOrder: 6,
      },
      {
        name: 'Kayole Learning Centre',
        type: 'Learning Centre',
        address: 'Kayole Estate',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 736 789 012',
        programmes: ['CBC Support', 'Homework Club', 'English Tuition'],
        latitude: -1.2744,
        longitude: 36.8934,
        sortOrder: 7,
      },
      {
        name: 'Ngong Road Centre',
        type: 'Learning Centre',
        address: 'Ngong Road',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 737 890 123',
        programmes: ['Academic Support', 'Portfolio Coaching'],
        latitude: -1.3130,
        longitude: 36.8042,
        sortOrder: 8,
      },
      {
        name: 'Juja Learning Hub',
        type: 'Learning Centre',
        address: 'Juja Town',
        city: 'Juja',
        county: 'Kiambu',
        phone: '+254 738 901 234',
        programmes: ['Exam Prep', 'Homeschooling', 'STEM'],
        latitude: -1.1832,
        longitude: 37.1193,
        sortOrder: 9,
      },
      {
        name: 'Ruiru Learning Centre',
        type: 'Learning Centre',
        address: 'Ruiru Town',
        city: 'Ruiru',
        county: 'Kiambu',
        phone: '+254 739 012 345',
        programmes: ['Academic Support', 'Special Needs Support'],
        latitude: -1.1517,
        longitude: 36.9619,
        sortOrder: 10,
      },
      {
        name: 'Westlands Educator Hub',
        type: 'Educator Hub',
        address: 'Westlands',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 740 123 456',
        programmes: ['Teacher Matching', 'Private Tuition', 'Mentorship'],
        latitude: -1.2617,
        longitude: 36.8049,
        sortOrder: 11,
      },
      {
        name: 'Kilimani Learning Centre',
        type: 'Learning Centre',
        address: 'Kilimani',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 741 234 567',
        programmes: ['Language Learning', 'Academic Coaching'],
        latitude: -1.2925,
        longitude: 36.7926,
        sortOrder: 12,
      },
      {
        name: 'Kileleshwa Learning Centre',
        type: 'Learning Centre',
        address: 'Kileleshwa',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 742 345 678',
        programmes: ['Homeschooling', 'Language Programmes'],
        latitude: -1.2888,
        longitude: 36.7882,
        sortOrder: 13,
      },
      {
        name: 'Lavington Learning Centre',
        type: 'Learning Centre',
        address: 'Lavington',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 743 456 789',
        programmes: ['Exam Preparation', 'Creative Arts'],
        latitude: -1.2860,
        longitude: 36.7807,
        sortOrder: 14,
      },
      {
        name: 'Karen Learning Centre',
        type: 'Learning Centre',
        address: 'Karen',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 744 567 890',
        programmes: ['Montessori', 'Primary Support', 'Life Skills'],
        latitude: -1.3252,
        longitude: 36.7038,
        sortOrder: 15,
      },
      {
        name: 'Lang\'ata Learning Centre',
        type: 'Learning Centre',
        address: 'Lang\'ata',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 745 678 901',
        programmes: ['Academic Support', 'Exam Prep'],
        latitude: -1.2997,
        longitude: 36.7241,
        sortOrder: 16,
      },
      {
        name: 'South C Learning Centre',
        type: 'Learning Centre',
        address: 'South C',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 746 789 012',
        programmes: ['Homeschooling', 'Academic Support'],
        latitude: -1.3301,
        longitude: 36.7899,
        sortOrder: 17,
      },
      {
        name: 'Mombasa Road Partner Hub',
        type: 'Partner Facility',
        address: 'Mombasa Road',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 747 890 123',
        programmes: ['Corporate Learning', 'Study Skills'],
        latitude: -1.3185,
        longitude: 36.8871,
        sortOrder: 18,
      },
      {
        name: 'Ngong Learning Centre',
        type: 'Learning Centre',
        address: 'Ngong Town',
        city: 'Ngong',
        county: 'Kajiado',
        phone: '+254 748 901 234',
        programmes: ['Academic Support', 'Learning Recovery'],
        latitude: -1.36,
        longitude: 36.6507,
        sortOrder: 19,
      },
      {
        name: 'Kasarani Learning Centre',
        type: 'Learning Centre',
        address: 'Kasarani',
        city: 'Nairobi',
        county: 'Nairobi',
        phone: '+254 749 012 345',
        programmes: ['Sports', 'Academic Support', 'Public Speaking'],
        latitude: -1.2199,
        longitude: 36.8980,
        sortOrder: 20,
      },
      {
        name: 'Kitengela Learning Centre',
        type: 'Learning Centre',
        address: 'Kitengela',
        city: 'Kitengela',
        county: 'Kajiado',
        phone: '+254 750 123 456',
        programmes: ['CBC Support', 'Homeschooling'],
        latitude: -1.4239,
        longitude: 36.7870,
        sortOrder: 21,
      },
      {
        name: 'Rongai Learning Centre',
        type: 'Learning Centre',
        address: 'Rongai',
        city: 'Rongai',
        county: 'Kajiado',
        phone: '+254 751 234 567',
        programmes: ['Academic Tutoring', 'Enrichment'],
        latitude: -1.4356,
        longitude: 36.6882,
        sortOrder: 22,
      }
    ])

    await seedIfEmpty(Testimonial, [
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
    ])

    await seedIfEmpty(FAQ, [
      {
        question: 'What is Axis Learning?',
        answer: 'Axis Learning is a comprehensive educational network providing personalized learning pathways for all learners through academic support, homeschooling, tuition, special needs education, languages, sports, enrichment programmes, and more. We believe every learner is different and education should be designed around the individual learner.',
        category: 'General',
        order: 1,
      },
      {
        question: 'What ages do you serve?',
        answer: 'Axis Learning serves learners of all ages, from early childhood through tertiary education and adult learners. Our programmes are tailored to different age groups and developmental stages.',
        category: 'General',
        order: 2,
      },
      {
        question: 'Which curricula do you support?',
        answer: 'We support multiple curricula including:\n- CBC (Competency-Based Curriculum)\n- Montessori\n- Cambridge International\n- IGCSE\n- A Levels\n- IB (International Baccalaureate)\n- British Curriculum\n- American Curriculum\n- And other recognized educational pathways\n\nOur education consultants can help you determine which curriculum is best suited for your learner.',
        category: 'Programmes & Curricula',
        order: 1,
      },
      {
        question: 'What is CBC?',
        answer: 'CBC (Competency-Based Curriculum) is a Kenyan educational approach that emphasizes skills, competencies, practical learning, creativity, and holistic development rather than examinations alone. It focuses on developing learners who can think critically and solve real-world problems.',
        category: 'Programmes & Curricula',
        order: 2,
      },
      {
        question: 'What is Montessori?',
        answer: 'Montessori is a learner-centered educational approach that encourages independence, practical learning, self-directed exploration, and development at an appropriate pace. It respects individual learning styles and focuses on developing the whole child.',
        category: 'Programmes & Curricula',
        order: 3,
      },
      {
        question: 'What is Cambridge?',
        answer: 'Cambridge is an internationally recognized curriculum with structured academic progression and strong subject-based learning. It includes pathways leading to IGCSE (International General Certificate of Secondary Education) and A Levels, preparing learners for university and higher education.',
        category: 'Programmes & Curricula',
        order: 4,
      },
      {
        question: 'What is IGCSE?',
        answer: 'IGCSE (International General Certificate of Secondary Education) is an internationally recognized secondary qualification offering broad subject choice and strong preparation for further education. It is widely accepted by universities worldwide.',
        category: 'Programmes & Curricula',
        order: 5,
      },
      {
        question: 'What are A Levels?',
        answer: 'A Levels are advanced subject-focused qualifications designed to prepare learners for university and other higher-level education pathways. They typically follow IGCSE and involve in-depth study of chosen subjects.',
        category: 'Programmes & Curricula',
        order: 6,
      },
      {
        question: 'What if I don\'t know which curriculum my child needs?',
        answer: 'Not sure which curriculum is right for your learner? That\'s perfectly fine. Axis can help! We offer Learner Discovery and Educational Consultancy services where we assess the learner\'s needs, strengths, and aspirations to recommend an appropriate curriculum and learning pathway suited to them.',
        category: 'Programmes & Curricula',
        order: 7,
      },
      {
        question: 'Do you provide homeschooling?',
        answer: 'Yes! Axis provides comprehensive homeschooling support across multiple curricula including CBC, Cambridge, IGCSE, A Levels, and International programmes. We support families with flexible scheduling, personalized learning plans, and regular progress monitoring.',
        category: 'Programmes & Curricula',
        order: 8,
      },
      {
        question: 'Do you provide tuition?',
        answer: 'Yes, Axis provides subject tutoring and examination preparation across all subjects and curricula. Our tutors work with learners in one-on-one and small group settings to support academic excellence.',
        category: 'Programmes & Curricula',
        order: 9,
      },
      {
        question: 'Can the educator come to my home?',
        answer: 'Yes! Axis offers home-based learning where an Axis educator travels to the learner\'s home to conduct the programme there. This is one of our flexible delivery models.',
        category: 'Programmes & Curricula',
        order: 10,
      },
      {
        question: 'Can my child attend an Axis centre?',
        answer: 'Yes! Learners can attend one of our Axis learning centers or approved learning facilities for their sessions. We have centers across Nairobi and metropolitan areas, and we continue to expand our network.',
        category: 'Programmes & Curricula',
        order: 11,
      },
      {
        question: 'Do you offer online learning?',
        answer: 'Yes, Axis offers online learning through appropriate digital platforms including Google Classroom, Zoom, Google Meet, Skype, and our Axis Learner Portal. Online learning remains structured, monitored, and supported.',
        category: 'Programmes & Curricula',
        order: 12,
      },
      {
        question: 'Do you offer blended learning?',
        answer: 'Yes! Learners can combine online learning, home-based learning, center-based learning, independent learning, and digital resources depending on the programme and learner\'s needs. Blended learning offers maximum flexibility.',
        category: 'Programmes & Curricula',
        order: 13,
      },
      {
        question: 'Do you support learners with special needs?',
        answer: 'Yes, Axis provides specialized support for learners with diverse educational and developmental needs including autism, ADHD, dyslexia, dysgraphia, speech delays, and many other learning support needs. Our special needs education is individualized rather than one-size-fits-all.',
        category: 'Special Needs',
        order: 1,
      },
      {
        question: 'Which special needs can you support?',
        answer: 'Axis supports learners with:\n- Autism Spectrum Disorder\n- ADHD\n- Cerebral Palsy\n- Down Syndrome\n- Dyslexia, Dysgraphia, Dyscalculia, Dyspraxia\n- Speech and language delays\n- Communication difficulties\n- Developmental delays\n- Intellectual disabilities\n- Hearing and visual impairment\n- Learning difficulties\n- Behavioural and emotional support needs\n- Other additional learning needs\n\nOur specialist educators focus on understanding, supporting, and adapting learning for each individual.',
        category: 'Special Needs',
        order: 2,
      },
      {
        question: 'Which languages do you teach?',
        answer: 'Axis teaches multiple foreign languages including French, Spanish, German, Mandarin/Chinese, Japanese, Korean, Arabic, and English. We also promote African language learning including Kiswahili, Dholuo, Kikuyu, and other African languages. Languages can be offered through one-on-one lessons, group lessons, online learning, or center-based learning.',
        category: 'Languages',
        order: 1,
      },
      {
        question: 'Where are your centres?',
        answer: 'Axis has a growing network of learning centers across Nairobi and metropolitan areas including Thika Road, Garden City, Kikuyu, Northern Bypass, Membley, Umoja, Kayole, Ngong Road, and many other locations. We also serve learners through home-based educators and online programmes.',
        category: 'Locations',
        order: 1,
      },
      {
        question: 'Can you serve families outside Nairobi?',
        answer: 'Yes! Axis is a national education network, not just Nairobi-based. We serve learners across Kenya through physical learning centers, partner facilities, home-based educators, online educators, and our growing educator network. If we don\'t have a physical presence in your location yet, contact us to learn how we can support your learner.',
        category: 'Locations',
        order: 2,
      },
      {
        question: 'How does the educator network work?',
        answer: 'Axis maintains an expanding network of qualified teachers, tutors, language educators, coaches, artists, musicians, theater practitioners, special needs educators, and academic specialists. This network enables us to connect the right learner to the right educator, regardless of location, ensuring personalized education at scale.',
        category: 'Educators',
        order: 1,
      },
      {
        question: 'How are educators selected?',
        answer: 'Axis educators are carefully selected based on qualifications, teaching experience, subject expertise, and demonstrated ability to work effectively with learners. We maintain rigorous standards to ensure our learners receive quality education from qualified professionals.',
        category: 'Educators',
        order: 2,
      },
      {
        question: 'How much do programmes cost?',
        answer: 'Programme costs vary depending on the type of service (tutoring, homeschooling, special needs support), curriculum, learning model (online, home-based, center-based), and other factors. Contact us for a fee structure for your specific learning needs. We strive to offer quality education at affordable rates.',
        category: 'Fees & Payments',
        order: 1,
      },
      {
        question: 'How does enrollment work?',
        answer: 'Enrollment typically involves: 1) Initial Inquiry - Contact us with your learning needs, 2) Learner Discovery - We understand the learner\'s profile and requirements, 3) Pathway Recommendation - We recommend an appropriate programme and curriculum, 4) Fee Discussion - We provide pricing details, 5) Enrollment - The learner joins the programme and begins their learning journey.',
        category: 'Enrollment',
        order: 1,
      },
      {
        question: 'Can my child join an existing programme?',
        answer: 'Yes, learners can join existing programmes depending on availability and the programme\'s design. Axis also offers personalized one-on-one programmes that can be customized for individual learners at any time.',
        category: 'Enrollment',
        order: 2,
      },
      {
        question: 'Do you offer holiday tuition?',
        answer: 'Yes! Axis offers holiday tuition programmes during school holidays. These programmes include revision, catch-up sessions, concept reinforcement, and preparation for the next term across supported curricula.',
        category: 'Programmes & Curricula',
        order: 14,
      },
      {
        question: 'Do you offer examination preparation?',
        answer: 'Yes, Axis provides comprehensive examination preparation services for KCSE, IGCSE, A Levels, Cambridge assessments, school examinations, and internal assessments. Services include revision, past papers, concept review, examination technique, and subject-specific tutoring.',
        category: 'Programmes & Curricula',
        order: 15,
      },
      {
        question: 'How do you monitor progress?',
        answer: 'Axis monitors learner progress through regular assessments, assignments, progress reports, parent-educator communication, attendance tracking, and the learner portal. Parents can see their learner\'s progress, attendance, and academic development in real-time through our parent portal.',
        category: 'Portals & Learning',
        order: 1,
      },
      {
        question: 'What is the parent portal?',
        answer: 'The parent portal is a secure online platform where parents can monitor their learner\'s progress, view timetables, attendance, assignments, assessments, results, teacher comments, and learning resources. Parents can also communicate with educators and view fee information.',
        category: 'Portals & Learning',
        order: 2,
      },
      {
        question: 'How do I contact Axis Learning?',
        answer: 'You can contact Axis Learning through:\n- Phone: 0737 003 007\n- Email: Visit our website for contact details\n- WhatsApp: Contact us via WhatsApp\n- Website: axis-learning.com\n- Visit an Axis Center in person\n\nOur team is ready to answer questions and help you find the right learning pathway for your learner.',
        category: 'General',
        order: 3,
      },
    ])

    const configuredUsers = [
      { email: process.env.ADMIN_EMAIL || 'admin@axis.com', passwordHash: process.env.ADMIN_PASSWORD_HASH, name: process.env.ADMIN_NAME || 'Admin User', role: 'admin' },
      { email: process.env.TUTOR_EMAIL, passwordHash: process.env.TUTOR_PASSWORD_HASH, name: process.env.TUTOR_NAME || 'Axis Tutor', role: 'tutor' },
      { email: process.env.STUDENT_EMAIL, passwordHash: process.env.STUDENT_PASSWORD_HASH, name: process.env.STUDENT_NAME || 'Axis Student', role: 'student' },
    ]

    for (const configuredUser of configuredUsers) {
      if (configuredUser.email && configuredUser.passwordHash) {
        const [user, created] = await User.findOrCreate({
          where: { email: configuredUser.email.toLowerCase().trim() },
          defaults: configuredUser,
        })

        if (!created && user.passwordHash !== configuredUser.passwordHash) {
          await user.update({
            passwordHash: configuredUser.passwordHash,
            name: configuredUser.name,
            role: configuredUser.role,
          })
        }
      }
    }

    const studentEmail = process.env.STUDENT_EMAIL?.toLowerCase().trim()
    if (studentEmail) {
      await Enrollment.findOrCreate({
        where: {
          email: studentEmail,
          programme: 'Academic Support',
        },
        defaults: {
          studentName: process.env.STUDENT_NAME || 'Axis Student',
          email: studentEmail,
          programme: 'Academic Support',
          ageGroup: 'teenager',
          status: 'approved',
          notes: 'Seeded demonstration assignment. Replace with the learner’s real programme assignment.',
        },
      })
    }

    /**
     * /api/portal/overview queries schedules and messages by (role, userId).
     * These records were previously seeded with userId left null, so they never
     * matched a signed-in account and the demonstration data was invisible.
     * They are attached to the seeded accounts here, and skipped entirely when
     * those accounts are not configured.
     */
    const tutorEmail = process.env.TUTOR_EMAIL?.toLowerCase().trim()
    const portalOwners = {}

    for (const [role, email] of [['student', studentEmail], ['tutor', tutorEmail]]) {
      if (!email) continue
      const owner = await User.findOne({ where: { email } })
      if (owner) portalOwners[role] = owner.id
    }

    const portalRecords = [
      { role: 'student', title: 'Academic Support orientation', date: '2026-08-17T10:00:00.000Z' },
      { role: 'tutor', title: 'Academic Support learner review', date: '2026-08-17T09:00:00.000Z' },
    ]
    for (const record of portalRecords) {
      const userId = portalOwners[record.role]
      if (!userId) continue
      await PortalSchedule.findOrCreate({
        where: { userId, role: record.role, title: record.title },
        defaults: { ...record, userId },
      })
    }

    const portalMessages = [
      { role: 'student', subject: 'Welcome to Academic Support', preview: 'Your programme orientation details are available. Contact the academy team if you need help.' },
      { role: 'tutor', subject: 'Learner review reminder', preview: 'Please review the Academic Support learner assignment before the next session.' },
    ]
    for (const message of portalMessages) {
      const userId = portalOwners[message.role]
      if (!userId) continue
      await PortalMessage.findOrCreate({
        where: { userId, role: message.role, subject: message.subject },
        defaults: { ...message, userId },
      })
    }

    await seedIfEmpty(Partner, [
      {
        name: 'Kenya Institute of Curriculum Development',
        category: 'Educational Institution',
        description: 'National partner supporting curriculum development and educational standards.',
        focusAreas: ['Curriculum Alignment', 'Assessment Standards', 'Learning Outcomes'],
        website: 'https://www.kicd.ac.ke',
        sortOrder: 1,
      },
      {
        name: 'Google for Education',
        category: 'Tech Partner',
        description: 'Technology partner providing digital learning tools and infrastructure.',
        focusAreas: ['Digital Literacy', 'Coding', 'Cloud Technology'],
        website: 'https://www.google.com/edu',
        sortOrder: 2,
      },
      {
        name: 'Microsoft Education',
        category: 'Tech Partner',
        description: 'Supporting learners with Microsoft Office 365 and educational technology.',
        focusAreas: ['Office Suite', 'Teams Collaboration', 'Digital Skills'],
        website: 'https://www.microsoft.com/education',
        sortOrder: 3,
      },
      {
        name: 'Kenya Association of Private Schools',
        category: 'Community Partner',
        description: 'Network promoting high-quality private education in Kenya.',
        focusAreas: ['Quality Standards', 'Professional Development', 'Networking'],
        email: 'info@kaps.or.ke',
        sortOrder: 4,
      },
      {
        name: 'British Council Kenya',
        category: 'Educational Institution',
        description: 'Supporting English language learning and British educational standards.',
        focusAreas: ['English Language', 'Cambridge Exams', 'Cultural Exchange'],
        website: 'https://www.britishcouncil.org.ke',
        sortOrder: 5,
      },
      {
        name: 'East African Educational Publishers',
        category: 'Content Provider',
        description: 'Providing quality educational content and learning materials.',
        focusAreas: ['Textbooks', 'Digital Resources', 'Assessment Tools'],
        email: 'sales@eaep.co.ke',
        sortOrder: 6,
      },
      {
        name: 'Kenya National Examination Council',
        category: 'Educational Institution',
        description: 'Official partner for national examination administration and results.',
        focusAreas: ['KCPE', 'KCSE', 'National Assessments'],
        website: 'https://www.knec.ac.ke',
        sortOrder: 7,
      },
      {
        name: 'Safaricom Education',
        category: 'Corporate',
        description: 'Supporting digital and mobile learning initiatives.',
        focusAreas: ['Mobile Learning', 'Connectivity', 'Digital Inclusion'],
        website: 'https://www.safaricom.co.ke',
        sortOrder: 8,
      },
      {
        name: 'Kenya Red Cross Society',
        category: 'Community Partner',
        description: 'Supporting health, safety, and humanitarian education.',
        focusAreas: ['First Aid', 'Disaster Preparedness', 'Humanitarian Values'],
        website: 'https://www.kenyaredcross.org',
        sortOrder: 9,
      },
      {
        name: 'African Leadership Academy',
        category: 'Educational Institution',
        description: 'Partner in developing leadership and life skills programmes.',
        focusAreas: ['Leadership Development', 'Critical Thinking', 'Entrepreneurship'],
        website: 'https://www.allafrica.edu',
        sortOrder: 10,
      },
    ])

    // Brief §24 — the resources section doubles as the SEO surface, so these are
    // written as genuinely useful parent guidance rather than filler.
    await seedIfEmpty(Resource, [
      {
        title: 'Choosing a curriculum in Kenya: CBC, Cambridge, IB or Montessori?',
        slug: 'choosing-a-curriculum-in-kenya',
        category: 'Parent Guide',
        author: 'Axis Learning',
        excerpt: 'A plain-language comparison of the main curricula available to Kenyan families, and how to think about which one suits your learner.',
        readTime: '8 min read',
        tags: ['CBC', 'Cambridge', 'IB', 'Montessori', 'Curriculum'],
        content: `Most parents are asked to choose a curriculum long before anyone explains what the choice actually means. This guide sets out the practical differences.

**CBC (Competency-Based Curriculum)** places emphasis on skills, competencies, practical learning, creativity and holistic development rather than examinations alone. It is the national curriculum, so transfers between Kenyan schools are straightforward, and it suits learners who do better demonstrating what they can do than sitting written papers.

**Montessori** is a learner-centred approach encouraging independence, practical learning, exploration and development at an appropriate pace. It is strongest in the early years, and suits learners who thrive with autonomy and hands-on materials.

**Cambridge** offers structured academic progression and strong subject-based learning, leading to IGCSE and then A Levels. It is internationally recognised and portable, which matters for families who may relocate or who are aiming at overseas universities.

**IB (International Baccalaureate)** emphasises inquiry, critical thinking, independent learning and holistic development. It is demanding and writing-intensive, and rewards learners who enjoy connecting ideas across subjects.

**How to actually decide.** Curriculum should follow the learner, not the other way round. Consider how your learner demonstrates understanding, whether they need breadth or depth, how they respond to examinations, whether the family expects to move, and what they might want to do afterwards.

If you are unsure, that is a normal position to be in — and not one you have to resolve alone. Axis can assess a learner's needs, strengths and aspirations and recommend a pathway.`,
        sortOrder: 1,
        publishedAt: new Date('2026-02-10'),
      },
      {
        title: 'Homeschooling in Kenya: how it actually works',
        slug: 'homeschooling-in-kenya-how-it-works',
        category: 'Parent Guide',
        author: 'Axis Learning',
        excerpt: 'What homeschooling involves in practice — structure, curriculum, assessment, socialisation and the questions parents ask most.',
        readTime: '7 min read',
        tags: ['Homeschooling', 'CBC', 'Parents'],
        content: `Homeschooling is often imagined as either total freedom or a parent teaching alone at a kitchen table. In practice, a well-run homeschooling programme looks much more like school — just built around one learner.

**It still needs structure.** A curriculum is agreed, goals are set, a timetable is built, and progress is assessed. What changes is that the timetable fits the household, and the pace fits the learner.

**You do not have to teach it yourself.** Many families work with an educator who delivers the programme — either travelling to the home or meeting the learner at a centre. Parents stay involved without becoming full-time teachers.

**Assessment still matters.** Learners are assessed regularly so that gaps are caught early, and so there is a documented record if the learner later returns to a school or sits formal examinations.

**Socialisation is a design question, not an accident.** Group programmes, sports, holiday tuition, clubs and shared activities need to be built into the plan deliberately.

**Who it suits.** Learners who are ahead and under-stimulated, learners who have fallen behind and need to rebuild, learners with additional needs, families who travel, and learners for whom a conventional classroom has stopped working.`,
        sortOrder: 2,
        publishedAt: new Date('2026-03-04'),
      },
      {
        title: 'Signs your learner needs academic support — and what to do next',
        slug: 'signs-your-learner-needs-academic-support',
        category: 'Learning Tips',
        author: 'Axis Learning',
        excerpt: 'Falling grades are usually the last signal, not the first. What to watch for earlier, and how to respond without escalating the pressure.',
        readTime: '5 min read',
        tags: ['Tuition', 'Academic Support', 'Parents'],
        content: `By the time grades drop, the difficulty has usually been building for a while. These earlier signals are more useful.

**Avoidance.** Homework starts later and later, or a specific subject's books never come out of the bag. Avoidance is usually about difficulty, not laziness.

**Effort without progress.** A learner who is genuinely working but not improving is often missing an earlier concept. More practice on the current topic will not fix it.

**Answers without understanding.** They can complete the procedure but cannot explain why it works, or cannot apply it when the question is phrased differently.

**A change in how they talk about themselves.** "I'm just bad at maths" is a warning sign. Learners generalise a specific gap into a permanent trait very quickly.

**What to do next.** Identify where understanding actually broke down rather than adding hours to the current topic. Good tuition is diagnostic before it is remedial — it works backwards to the foundation, repairs it, then moves forward. Rebuilding confidence usually matters as much as rebuilding content.`,
        sortOrder: 3,
        publishedAt: new Date('2026-04-18'),
      },
      {
        title: 'Supporting a learner with additional learning needs',
        slug: 'supporting-a-learner-with-additional-needs',
        category: 'Academic Support',
        author: 'Axis Learning',
        excerpt: 'How individualised educational support works, what to expect, and where educational support ends and clinical assessment begins.',
        readTime: '6 min read',
        tags: ['Special Needs', 'Inclusion', 'Individualised Learning'],
        content: `Every learner is different. For learners with additional educational or developmental needs, that principle simply carries more weight.

**Start with the learner, not the label.** A diagnosis describes a category; it does not tell an educator how this learner best takes in information, how long they can sustain attention, what motivates them, or what environment settles them. Those things have to be observed.

**Adaptation is specific.** Useful adaptation is concrete: shorter working blocks, materials presented differently, alternative ways of demonstrating understanding, a quieter environment, predictable routines, or assessment adjusted in form rather than lowered in expectation.

**Independence is the goal.** Support that a learner cannot eventually work without has not fully succeeded. Good programmes build strategies the learner can carry themselves.

**Where educational support ends.** Axis provides educational support. We do not diagnose or assess medical or developmental conditions. Where a formal diagnosis or therapy is appropriate, that is the work of qualified clinical professionals — and we work alongside those already supporting your family.

**What parents can expect.** A discovery conversation, an educator matched to your learner, an individualised plan, regular communication, and honest review — including telling you when something is not working.`,
        sortOrder: 4,
        publishedAt: new Date('2026-05-22'),
      },
      {
        title: 'Making school holidays count without exhausting your learner',
        slug: 'making-school-holidays-count',
        category: 'Learning Tips',
        author: 'Axis Learning',
        excerpt: 'Holidays are the best window for catching up or getting ahead — provided the programme is built for a learner who also needs to rest.',
        readTime: '5 min read',
        tags: ['Holiday Tuition', 'Revision', 'Enrichment'],
        content: `School holidays are the only stretch of the year where a learner can work on a weakness without simultaneously keeping up with new material. That makes them valuable — and easy to overload.

**Pick one or two priorities.** A holiday is not long enough to fix everything. Choose the subject where a gap is doing the most damage, and the one where a little momentum will build the most confidence.

**Short, frequent sessions beat long ones.** Three focused hours a week over a whole break achieves more than an intensive final fortnight.

**Leave the holiday intact.** Learners return to school in worse shape if they have had no rest. A good holiday programme is built around the break, not instead of it.

**Use the time for things term-time squeezes out.** Reading for pleasure, a language, chess, music, drama, sport. These build the confidence, communication and persistence that feed straight back into academic work.

**Prepare, do not just repair.** Previewing the next term's opening topics is one of the highest-return uses of holiday time — learners start the term ahead rather than behind.`,
        sortOrder: 5,
        publishedAt: new Date('2026-06-30'),
      },
      {
        title: 'Why we teach African languages alongside French, German and Mandarin',
        slug: 'why-we-teach-african-languages',
        category: 'Programme Spotlight',
        author: 'Axis Learning',
        excerpt: 'Language carries identity as well as opportunity. Why Axis promotes Kiswahili, Dholuo, Kikuyu and other African languages as seriously as global ones.',
        readTime: '4 min read',
        tags: ['Languages', 'Kiswahili', 'Culture'],
        content: `Language programmes in the region tend to treat foreign languages as an investment and African languages as an afterthought. We think that is the wrong way round — or rather, that it is a false choice.

**Global languages open doors.** French, Spanish, German, Mandarin, Japanese, Korean and Arabic open study, work and travel opportunities, and are increasingly requested by families with international plans.

**African languages open something else.** A learner who cannot speak with their grandparents in the language those conversations belong in has lost something no examination measures. Kiswahili, Dholuo, Kikuyu, Luhya, Kamba, Kalenjin, Maasai, Kisii, Somali and others carry family, culture and belonging.

**The skills transfer in both directions.** Learners who study any second language seriously become better at all of them — and at English. The habits are the same: listening closely, tolerating not understanding everything at once, and being willing to sound imperfect while learning.

**How we teach them.** One-to-one or in groups, online, at a centre or at home, with conversation practice and cultural activities rather than vocabulary lists alone. We want African identity, culture and linguistic diversity promoted alongside global languages — not beneath them.`,
        sortOrder: 6,
        publishedAt: new Date('2026-07-14'),
      },
    ])

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
