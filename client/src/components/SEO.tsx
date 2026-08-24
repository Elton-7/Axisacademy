import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const pages: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Axis Learning | Personalised Learning Pathways in Kenya',
    description: 'Axis Learning creates personalised pathways through academic learning, homeschooling, tuition, languages, enrichment, sports, and individualised learning support.',
  },
  '/services': {
    title: 'Education Services | Axis Learning Kenya',
    description: 'Explore homeschooling, academic tuition, languages, enrichment, sports, holiday tuition, examination preparation, and learner discovery with Axis Learning.',
  },
  '/about': {
    title: 'About Axis Learning | Learner-Centred Education in Kenya',
    description: 'Who Axis Learning is, what we believe about learners, and how we build personalised educational pathways across Kenya.',
  },
  '/events': {
    title: 'Events, Workshops & Holiday Programmes | Axis Learning',
    description: 'Holiday tuition, public speaking and debate competitions, theatre, workshops, cultural events, camps and educational trips with Axis Learning.',
  },
  '/gallery': {
    title: 'Photo & Video Gallery | Axis Learning',
    description: 'Real photographs and videos of Axis Learning classrooms, tuition sessions, activities, events and learner projects across Kenya.',
  },
  '/partners': {
    title: 'Our Partners | Axis Learning',
    description: 'The schools, publishers, universities, cultural and sports organisations and community partners Axis Learning works with across Kenya.',
  },
  '/philosophy': {
    title: 'Our Educational Philosophy | Axis Learning',
    description: 'Every learner is different, and education should be designed around the learner. The belief behind how Axis Learning builds individual educational pathways in Kenya.',
  },
  '/learning-paths': {
    title: 'How Learning Works | Online, Home-Based & Blended | Axis Learning',
    description: 'Understand exactly how learning happens through Axis Learning — online lessons, an educator at your home, sessions at an Axis centre, or a blended combination.',
  },
  '/educator-network': {
    title: 'Our Educator Network | Axis Learning Kenya',
    description: 'A growing national network of teachers, tutors, language educators, coaches, artists and special needs educators connecting the right learner to the right educator.',
  },
  '/programmes': {
    title: 'Learning Programmes | Axis Learning Kenya',
    description: 'Explore flexible learning programmes for CBC, Montessori, Cambridge, IGCSE, O Levels, IB, languages, enrichment, and examination preparation.',
  },
  '/locations': {
    title: 'Axis Learning Locations & Educator Network | Kenya',
    description: 'Find Axis Learning offices, centres, partner facilities, and flexible learning support across Nairobi and Kenya.',
  },
  '/team': {
    title: 'Our Educator Network | Axis Learning',
    description: 'Meet the growing Axis Learning network of educators, tutors, specialists, coaches, artists, and learning professionals.',
  },
  '/resources': {
    title: 'Education Resources & Parent Guides | Axis Learning',
    description: 'Practical resources for parents and learners on homeschooling, curricula, study skills, learning support, and learner development.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Axis Learning',
    description: 'Answers about Axis Learning programmes, curricula, homeschooling, learning models, locations, and enrolment.',
  },
  '/enroll': {
    title: 'Start Learner Discovery | Axis Learning',
    description: 'Tell Axis Learning about your learner and begin a conversation about the right educational pathway.',
  },
  '/consultation': {
    title: 'Book a Consultation | Axis Learning',
    description: 'Talk to an Axis Learning education consultant about your learner. Tell us when suits you and we will confirm a time by WhatsApp, phone or email.',
  },
  '/contact': {
    title: 'Contact Axis Learning',
    description: 'Talk to Axis Learning about a learner, programme, consultation, or personalised educational pathway.',
  },
  '/privacy': {
    title: 'Privacy & Child Safety | Axis Learning',
    description: 'Learn how Axis Learning approaches privacy, consent, learner media, and role-based access to information.',
  },
  '/terms': {
    title: 'Terms of Use | Axis Learning',
    description: 'The terms covering use of this website. Nothing is booked, sold or paid for here — the agreement for teaching a learner is separate and agreed in writing.',
  },
  '/safeguarding': {
    title: 'How We Keep Your Child Safe | Axis Learning',
    description: 'Educator vetting that must be current before assignment, home-session check-in and check-out, safeguarding concerns that reach staff only, and consent recorded before any photograph is published.',
  },
}

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.axislearning.co.ke').replace(/\/$/, '')

/** Admin and portal routes must never be indexed. */
const isPrivateRoute = (pathname: string) =>
  pathname.startsWith('/admin') || pathname.startsWith('/portal')

/**
 * Detail pages write their own metadata, so this component stands back.
 *
 * A service or an article is not in the `pages` table above, so it fell to the
 * generic fallback — and every article ended up with two <meta
 * name="description"> tags: the site's default first, then the article's own.
 * Two descriptions on one page is a validation error, and it leaves a search
 * engine to pick between them.
 *
 * The robots directive still comes from here, because it is the one thing
 * every route needs and no detail page should have to remember.
 */
const ownsItsMetadata = (pathname: string) =>
  /^\/(services|resources)\/[^/]+$/.test(pathname)

export default function SEO() {
  const { pathname } = useLocation()
  const page = pages[pathname] || {
    title: 'Axis Learning | Learn • Think • Create • Explore • Thrive',
    description: 'Axis Learning provides learner-centred educational pathways in Kenya.',
  }

  const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  // Must be absolute: the crawlers that read this do not resolve relative paths.
  const previewImage = `${SITE_URL}/og-image.png`

  if (ownsItsMetadata(pathname)) {
    return (
      <Helmet>
        <meta name="robots" content={isPrivateRoute(pathname) ? 'noindex, nofollow' : 'index, follow'} />
      </Helmet>
    )
  }

  return (
    <Helmet>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={previewImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Axis Learning" />

      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={previewImage} />

      <meta
        name="robots"
        content={isPrivateRoute(pathname) ? 'noindex, nofollow' : 'index, follow'}
      />
    </Helmet>
  )
}
