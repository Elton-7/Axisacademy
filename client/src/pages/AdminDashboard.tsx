import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, TrendingUp, Mail, Phone, Calendar, Search, Filter, Download, LogOut, RefreshCw, X, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiErrorMessage } from '../utils/apiError'
import PipelineBoard from '../components/PipelineBoard'
import LearnerAdmin from '../components/LearnerAdmin'
import Safeguarding from '../components/Safeguarding'
import Accounts from '../components/Accounts'
import DataProtection from '../components/DataProtection'
import { auditApi, authApi, contactsApi, enrollmentsApi, newsletterApi, statsApi, galleryApi, resourcesApi, partnersApi, educatorsApi, eventsApi, faqsApi, locationsApi, testimonialsApi } from '../services/apiClient'
import type { AuditLog, Contact, DashboardStats, Enrollment, Newsletter, GalleryItem, Resource, Partner, Educator, Event, FAQ, Location, Testimonial, GalleryType, GalleryCategory, ResourceCategory, ResourceStatus, PartnerCategory, EducatorCategory, EventCategory, EventStatus, FAQCategory, LocationType } from '../types'
import { RESOURCE_CATEGORIES } from '../types'

const TAB_LABELS: Record<string, string> = {
  faqs: 'FAQs',
  'data-protection': 'Data protection',
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'learners' | 'accounts' | 'safeguarding' | 'data-protection' | 'gallery' | 'resources' | 'partners' | 'educators' | 'events' | 'faqs' | 'locations' | 'testimonials'>('dashboard')
  
  // Dashboard state
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactTotal, setContactTotal] = useState(0)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollmentTotal, setEnrollmentTotal] = useState(0)
  const [subscribers, setSubscribers] = useState<Newsletter[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditError, setAuditError] = useState<string | null>(null)
  const [auditAction, setAuditAction] = useState('')
  const [auditEntity, setAuditEntity] = useState('')
  const [subscriberError, setSubscriberError] = useState<string | null>(null)
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalInquiries: 0,
    newInquiries: 0,
    respondedInquiries: 0,
    enrollments: 0,
    totalServices: 0,
    activeTestimonials: 0,
  })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  // The search box drives a request, so the typed value and the value actually
  // queried are kept apart: the input stays responsive while requests wait.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  // Identifies the most recent contacts request so slower earlier ones can be
  // discarded rather than overwriting fresher rows.
  const contactRequestRef = useRef(0)
  const [contactPage, setContactPage] = useState(1)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null | undefined>(undefined)
  const [galleryForm, setGalleryForm] = useState<{title: string; type: GalleryType; category: GalleryCategory; description: string; url: string; thumbnail: string; tags: string; consentConfirmed: boolean; consentReference: string}>({
    title: '', type: 'Photo', category: 'General', description: '', url: '', thumbnail: '', tags: '', consentConfirmed: false, consentReference: ''
  })

  // Resources state
  const [resources, setResources] = useState<Resource[]>([])
  const [editingResource, setEditingResource] = useState<Resource | null | undefined>(undefined)
  const [resourceForm, setResourceForm] = useState<{title: string; slug: string; excerpt: string; content: string; category: ResourceCategory; author: string; coverImage: string; sourceUrl: string; fileUrl: string; readTime: string; tags: string; status: ResourceStatus; metaDescription: string}>({
    title: '', slug: '', excerpt: '', content: '', category: 'Parenting & Learning', author: '', coverImage: '', sourceUrl: '', fileUrl: '', readTime: '', tags: '', status: 'Draft', metaDescription: ''
  })

  // Partners state
  const [partners, setPartners] = useState<Partner[]>([])
  const [editingPartner, setEditingPartner] = useState<Partner | null | undefined>(undefined)
  const [partnerForm, setPartnerForm] = useState<{name: string; logo: string; category: PartnerCategory; description: string; website: string; contact: string; email: string; phone: string; focusAreas: string}>({
    name: '', logo: '', category: 'Corporate', description: '', website: '', contact: '', email: '', phone: '', focusAreas: ''
  })

  // Educators state
  const [educators, setEducators] = useState<Educator[]>([])
  const [editingEducator, setEditingEducator] = useState<Educator | null | undefined>(undefined)
  const [educatorForm, setEducatorForm] = useState<{name: string; position: string; category: EducatorCategory; qualifications: string; experience: string; subjects: string; languages: string; expertise: string; biography: string; photo: string; email: string; phone: string}>({
    name: '', position: '', category: 'Teacher', qualifications: '', experience: '', subjects: '', languages: '', expertise: '', biography: '', photo: '', email: '', phone: ''
  })

  // Events state
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null | undefined>(undefined)
  const [eventForm, setEventForm] = useState<{title: string; description: string; category: EventCategory; startDate: string; endDate: string; venue: string; location: string; capacity: string; ageGroup: string; programme: string; priceKES: string; registrationDeadline: string; registrationLink: string; poster: string; status: EventStatus}>({
    title: '', description: '', category: 'Workshop', startDate: '', endDate: '', venue: '', location: '', capacity: '', ageGroup: '', programme: '', priceKES: '', registrationDeadline: '', registrationLink: '', poster: '', status: 'Upcoming'
  })

  // FAQs state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null | undefined>(undefined)
  const [faqForm, setFaqForm] = useState<{question: string; answer: string; category: FAQCategory; order: string}>({
    question: '', answer: '', category: 'General', order: ''
  })

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null | undefined>(undefined)
  const emptyTestimonialForm = { text: '', author: '', role: 'Parent', rating: '5', consentConfirmed: false, consentReference: '' }
  const [testimonialForm, setTestimonialForm] = useState<{
    text: string; author: string; role: string; rating: string; consentConfirmed: boolean; consentReference: string
  }>(emptyTestimonialForm)

  // Locations state
  const [locations, setLocations] = useState<Location[]>([])
  const [editingLocation, setEditingLocation] = useState<Location | null | undefined>(undefined)
  const [locationForm, setLocationForm] = useState<{name: string; type: LocationType; address: string; city: string; county: string; phone: string; email: string; description: string; programmes: string; photo: string; latitude: string; longitude: string}>({
    name: '', type: 'Head Office', address: '', city: '', county: '', phone: '', email: '', description: '', programmes: '', photo: '', latitude: '', longitude: ''
  })

  const pageSize = 10

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchEnrollments()
      fetchSubscribers()
      fetchStats()
    } else if (activeTab === 'gallery') {
      fetchGallery()
    } else if (activeTab === 'resources') {
      fetchResources()
    } else if (activeTab === 'partners') {
      fetchPartners()
    } else if (activeTab === 'educators') {
      fetchEducators()
    } else if (activeTab === 'events') {
      fetchEvents()
    } else if (activeTab === 'faqs') {
      fetchFAQs()
    } else if (activeTab === 'locations') {
      fetchLocations()
    } else if (activeTab === 'testimonials') {
      fetchTestimonials()
    }
  }, [activeTab])

  // Settle the typed term before querying, and move back to the first page in
  // the same update so the two changes produce one fetch rather than two.
  useEffect(() => {
    if (search === debouncedSearch) return

    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setContactPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search, debouncedSearch])

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchContacts()
    }
  }, [contactPage, filter, debouncedSearch, activeTab])

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setContactPage(1)
    }
  }, [filter])

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchAuditLogs()
    }
  }, [auditAction, auditEntity])

  const fetchStats = async () => {
    try {
      setStats(await statsApi.getDashboardStats())
    } catch (error) {
      console.error('Failed to fetch dashboard statistics:', error)
      toast.error('Could not load dashboard statistics. Please try again.')
    }
  }

  const fetchAuditLogs = async () => {
    try {
      setAuditError(null)
      setAuditLogs((await auditApi.getAll({ limit: 10, action: auditAction || undefined, entity: auditEntity || undefined })).data)
    } catch (error) {
      console.error('Failed to fetch audit activity:', error)
      setAuditLogs([])
      setAuditError('Audit activity is unavailable right now.')
    }
  }

  const fetchSubscribers = async () => {
    try {
      setSubscriberError(null)
      setSubscribers(await newsletterApi.getAll())
    } catch (error) {
      console.error('Failed to fetch newsletter subscribers:', error)
      setSubscriberError('Subscriber data is unavailable right now.')
    }
  }

  const fetchEnrollments = async () => {
    try {
      setEnrollmentError(null)
      const response = await enrollmentsApi.getAll({ limit: 100 })
      setEnrollments(response.data)
      setEnrollmentTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch enrollments:', error)
      setEnrollments([])
      setEnrollmentError('Enrollment data is unavailable right now.')
    }
  }

  const fetchContacts = async () => {
    const requestId = ++contactRequestRef.current
    try {
      const response = await contactsApi.getAll({ page: contactPage, limit: pageSize, search: debouncedSearch, ...(filter !== 'all' ? { status: filter as Contact['status'] } : {}) })
      // A slower earlier request must not overwrite the results of a later one.
      if (requestId !== contactRequestRef.current) return
      setContacts(response.data)
      setContactTotal(response.total)
    } catch (error) {
      if (requestId !== contactRequestRef.current) return
      console.error('Failed to fetch contacts:', error)
      setContacts([])
      toast.error('Could not load inquiries. Please try again.')
    } finally {
      if (requestId === contactRequestRef.current) setLoading(false)
    }
  }

  // Gallery functions
  const fetchGallery = async () => {
    try {
      setLoading(true)
      const items = await galleryApi.getAll({ limit: 100 })
      setGalleryItems(items)
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
      toast.error('Failed to load gallery items')
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }

  const saveGalleryItem = async () => {
    if (!galleryForm.title.trim() || !galleryForm.url.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    if (!galleryForm.consentConfirmed) {
      toast.error('Confirm publication consent before adding media')
      return
    }
    if (!galleryForm.consentReference.trim()) {
      toast.error('Record which signed media release this consent refers to')
      return
    }
    try {
      const payload = {
        ...galleryForm,
        tags: galleryForm.tags ? galleryForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      if (editingGallery) {
        await galleryApi.update(editingGallery.id, payload)
        setGalleryItems(prev => prev.map(item => item.id === editingGallery.id ? { ...item, ...payload } : item))
        toast.success('Gallery item updated')
      } else {
        const newItem = await galleryApi.create(payload)
        setGalleryItems(prev => [...prev, newItem])
        toast.success('Gallery item created')
      }
      setEditingGallery(undefined)
      setGalleryForm({ title: '', type: 'Photo', category: 'General', description: '', url: '', thumbnail: '', tags: '', consentConfirmed: false, consentReference: '' })
    } catch (error) {
      console.error('Failed to save gallery item:', error)
      toast.error(apiErrorMessage(error, 'Failed to save gallery item'))
    }
  }

  const deleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await galleryApi.delete(id)
      setGalleryItems(prev => prev.filter(item => item.id !== id))
      toast.success('Gallery item deleted')
    } catch (error) {
      console.error('Failed to delete gallery item:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete gallery item'))
    }
  }

  // Resources functions
  const fetchResources = async () => {
    try {
      setLoading(true)
      const items = await resourcesApi.getAll({ limit: 100 })
      setResources(items)
    } catch (error) {
      console.error('Failed to fetch resources:', error)
      toast.error('Failed to load resources')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const saveResource = async () => {
    if (!resourceForm.title.trim()) {
      toast.error('Please give the resource a title')
      return
    }
    // Most of the library is other people's work, listed and linked rather than
    // reproduced. So a body is not required — but an entry with neither a body
    // nor a link is a title with nothing a reader can open.
    if (!resourceForm.content.trim() && !resourceForm.sourceUrl.trim() && !resourceForm.fileUrl.trim()) {
      toast.error('Add the article text, or a link to where the work is published')
      return
    }
    try {
      const payload = {
        ...resourceForm,
        slug: resourceForm.slug || resourceForm.title.toLowerCase().replace(/\s+/g, '-'),
        tags: resourceForm.tags ? resourceForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      if (editingResource) {
        await resourcesApi.update(editingResource.id, payload)
        setResources(prev => prev.map(item => item.id === editingResource.id ? { ...item, ...payload } : item))
        toast.success('Resource updated')
      } else {
        const newItem = await resourcesApi.create(payload)
        setResources(prev => [...prev, newItem])
        toast.success('Resource created')
      }
      setEditingResource(undefined)
      setResourceForm({ title: '', slug: '', excerpt: '', content: '', category: 'Parenting & Learning', author: '', coverImage: '', sourceUrl: '', fileUrl: '', readTime: '', tags: '', status: 'Draft', metaDescription: '' })
    } catch (error) {
      console.error('Failed to save resource:', error)
      toast.error(apiErrorMessage(error, 'Failed to save resource'))
    }
  }

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await resourcesApi.delete(id)
      setResources(prev => prev.filter(item => item.id !== id))
      toast.success('Resource deleted')
    } catch (error) {
      console.error('Failed to delete resource:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete resource'))
    }
  }

  // Partners functions
  const fetchPartners = async () => {
    try {
      setLoading(true)
      const items = await partnersApi.getAll({ limit: 100 })
      setPartners(items)
    } catch (error) {
      console.error('Failed to fetch partners:', error)
      toast.error('Failed to load partners')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  const savePartner = async () => {
    if (!partnerForm.name.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload = {
        ...partnerForm,
        focusAreas: partnerForm.focusAreas ? partnerForm.focusAreas.split(',').map(a => a.trim()).filter(Boolean) : []
      }
      if (editingPartner) {
        await partnersApi.update(editingPartner.id, payload)
        setPartners(prev => prev.map(item => item.id === editingPartner.id ? { ...item, ...payload } : item))
        toast.success('Partner updated')
      } else {
        const newItem = await partnersApi.create(payload)
        setPartners(prev => [...prev, newItem])
        toast.success('Partner created')
      }
      setEditingPartner(undefined)
      setPartnerForm({ name: '', logo: '', category: 'Corporate', description: '', website: '', contact: '', email: '', phone: '', focusAreas: '' })
    } catch (error) {
      console.error('Failed to save partner:', error)
      toast.error(apiErrorMessage(error, 'Failed to save partner'))
    }
  }

  const deletePartner = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await partnersApi.delete(id)
      setPartners(prev => prev.filter(item => item.id !== id))
      toast.success('Partner deleted')
    } catch (error) {
      console.error('Failed to delete partner:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete partner'))
    }
  }

  // Educators functions
  const fetchEducators = async () => {
    try {
      setLoading(true)
      const items = await educatorsApi.getAll({ limit: 100 })
      setEducators(items)
    } catch (error) {
      console.error('Failed to fetch educators:', error)
      toast.error('Failed to load educators')
      setEducators([])
    } finally {
      setLoading(false)
    }
  }

  const saveEducator = async () => {
    if (!educatorForm.name.trim() || !educatorForm.position.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload = {
        ...educatorForm,
        subjects: educatorForm.subjects ? educatorForm.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
        languages: educatorForm.languages ? educatorForm.languages.split(',').map(l => l.trim()).filter(Boolean) : []
      }
      if (editingEducator) {
        await educatorsApi.update(editingEducator.id, payload)
        setEducators(prev => prev.map(item => item.id === editingEducator.id ? { ...item, ...payload } : item))
        toast.success('Educator updated')
      } else {
        const newItem = await educatorsApi.create(payload)
        setEducators(prev => [...prev, newItem])
        toast.success('Educator created')
      }
      setEditingEducator(undefined)
      setEducatorForm({ name: '', position: '', category: 'Teacher', qualifications: '', experience: '', subjects: '', languages: '', expertise: '', biography: '', photo: '', email: '', phone: '' })
    } catch (error) {
      console.error('Failed to save educator:', error)
      toast.error(apiErrorMessage(error, 'Failed to save educator'))
    }
  }

  const deleteEducator = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await educatorsApi.delete(id)
      setEducators(prev => prev.filter(item => item.id !== id))
      toast.success('Educator deleted')
    } catch (error) {
      console.error('Failed to delete educator:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete educator'))
    }
  }

  // Events functions
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const items = await eventsApi.getAll({ limit: 100 })
      setEvents(items)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      toast.error('Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const saveEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.startDate.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload = {
        ...eventForm,
        capacity: eventForm.capacity ? parseInt(eventForm.capacity) : undefined,
        priceKES: eventForm.priceKES ? parseFloat(eventForm.priceKES) : undefined
      }
      if (editingEvent) {
        await eventsApi.update(editingEvent.id, payload)
        setEvents(prev => prev.map(item => item.id === editingEvent.id ? { ...item, ...payload } : item))
        toast.success('Event updated')
      } else {
        const newItem = await eventsApi.create(payload)
        setEvents(prev => [...prev, newItem])
        toast.success('Event created')
      }
      setEditingEvent(undefined)
      setEventForm({ title: '', description: '', category: 'Workshop', startDate: '', endDate: '', venue: '', location: '', capacity: '', ageGroup: '', programme: '', priceKES: '', registrationDeadline: '', registrationLink: '', poster: '', status: 'Upcoming' })
    } catch (error) {
      console.error('Failed to save event:', error)
      toast.error(apiErrorMessage(error, 'Failed to save event'))
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await eventsApi.delete(id)
      setEvents(prev => prev.filter(item => item.id !== id))
      toast.success('Event deleted')
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete event'))
    }
  }

  // FAQs functions
  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const items = await faqsApi.getAll({ limit: 100 })
      setFaqs(items)
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
      toast.error('Failed to load FAQs')
      setFaqs([])
    } finally {
      setLoading(false)
    }
  }

  const saveFAQ = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload = {
        ...faqForm,
        order: faqForm.order ? parseInt(faqForm.order) : 0
      }
      if (editingFAQ) {
        await faqsApi.update(editingFAQ.id, payload)
        setFaqs(prev => prev.map(item => item.id === editingFAQ.id ? { ...item, ...payload } : item))
        toast.success('FAQ updated')
      } else {
        const newItem = await faqsApi.create(payload)
        setFaqs(prev => [...prev, newItem])
        toast.success('FAQ created')
      }
      setEditingFAQ(undefined)
      setFaqForm({ question: '', answer: '', category: 'General', order: '' })
    } catch (error) {
      console.error('Failed to save FAQ:', error)
      toast.error(apiErrorMessage(error, 'Failed to save FAQ'))
    }
  }

  // Testimonials functions
  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      // Staff see every quote, including any awaiting confirmation, which the
      // public list never returns.
      const items = await testimonialsApi.getAll()
      setTestimonials(items)
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
      toast.error('Failed to load testimonials')
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const saveTestimonial = async () => {
    if (!testimonialForm.text.trim() || !testimonialForm.author.trim()) {
      toast.error('Please fill in the quote and who said it')
      return
    }
    // The API refuses both of these. Saying so here means the person filling
    // the form is told what is missing before they lose the text they typed.
    if (!testimonialForm.consentConfirmed) {
      toast.error('Confirm consent before a quote can be published')
      return
    }
    if (!testimonialForm.consentReference.trim()) {
      toast.error('Record which signed consent this refers to')
      return
    }
    try {
      const payload = {
        text: testimonialForm.text.trim(),
        author: testimonialForm.author.trim(),
        role: testimonialForm.role,
        rating: testimonialForm.rating ? parseInt(testimonialForm.rating) : 5,
        consentConfirmed: true,
        consentReference: testimonialForm.consentReference.trim(),
      }
      if (editingTestimonial) {
        const updated = await testimonialsApi.update(editingTestimonial.id, payload)
        setTestimonials(prev => prev.map(item => item.id === editingTestimonial.id ? updated : item))
        toast.success('Testimonial updated')
      } else {
        const created = await testimonialsApi.create(payload)
        setTestimonials(prev => [created, ...prev])
        toast.success('Testimonial published')
      }
      setEditingTestimonial(undefined)
      setTestimonialForm(emptyTestimonialForm)
    } catch (error) {
      console.error('Failed to save testimonial:', error)
      toast.error(apiErrorMessage(error, 'Failed to save testimonial'))
    }
  }

  /**
   * Takes a quote off the site. This is the path a withdrawn consent takes, so
   * the wording says what actually happens rather than asking "are you sure".
   */
  const withdrawTestimonial = async (item: Testimonial) => {
    if (!confirm(`Take this quote from ${item.author} off the website? The record is kept.`)) return
    try {
      await testimonialsApi.delete(item.id)
      setTestimonials(prev => prev.map(t => t.id === item.id ? { ...t, isActive: false } : t))
      toast.success('Quote removed from the site')
    } catch (error) {
      console.error('Failed to withdraw testimonial:', error)
      toast.error(apiErrorMessage(error, 'Failed to remove the quote'))
    }
  }

  const republishTestimonial = async (item: Testimonial) => {
    try {
      const updated = await testimonialsApi.update(item.id, { isActive: true })
      setTestimonials(prev => prev.map(t => t.id === item.id ? updated : t))
      toast.success('Quote is back on the site')
    } catch (error) {
      console.error('Failed to republish testimonial:', error)
      toast.error(apiErrorMessage(error, 'Failed to publish the quote'))
    }
  }

  const deleteFAQ = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await faqsApi.delete(id)
      setFaqs(prev => prev.filter(item => item.id !== id))
      toast.success('FAQ deleted')
    } catch (error) {
      console.error('Failed to delete FAQ:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete FAQ'))
    }
  }

  // Locations functions
  const fetchLocations = async () => {
    try {
      setLoading(true)
      const items = await locationsApi.getAll({ limit: 100 })
      setLocations(items)
    } catch (error) {
      console.error('Failed to fetch locations:', error)
      toast.error('Failed to load locations')
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  const saveLocation = async () => {
    if (!locationForm.name.trim()) {
      toast.error('Please fill in required fields')
      return
    }
    try {
      const payload = {
        ...locationForm,
        programmes: locationForm.programmes ? locationForm.programmes.split(',').map(p => p.trim()).filter(Boolean) : [],
        latitude: locationForm.latitude ? parseFloat(locationForm.latitude) : undefined,
        longitude: locationForm.longitude ? parseFloat(locationForm.longitude) : undefined
      }
      if (editingLocation) {
        await locationsApi.update(editingLocation.id, payload)
        setLocations(prev => prev.map(item => item.id === editingLocation.id ? { ...item, ...payload } : item))
        toast.success('Location updated')
      } else {
        const newItem = await locationsApi.create(payload)
        setLocations(prev => [...prev, newItem])
        toast.success('Location created')
      }
      setEditingLocation(undefined)
      setLocationForm({ name: '', type: 'Head Office', address: '', city: '', county: '', phone: '', email: '', description: '', programmes: '', photo: '', latitude: '', longitude: '' })
    } catch (error) {
      console.error('Failed to save location:', error)
      toast.error(apiErrorMessage(error, 'Failed to save location'))
    }
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await locationsApi.delete(id)
      setLocations(prev => prev.filter(item => item.id !== id))
      toast.success('Location deleted')
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast.error(apiErrorMessage(error, 'Failed to delete location'))
    }
  }

  const refreshDashboard = async () => {
    setLoading(true)
    await Promise.all([fetchContacts(), fetchEnrollments(), fetchSubscribers(), fetchStats(), fetchAuditLogs()])
  }

  const handleLogout = async () => {
    await authApi.logout()
    toast.success('You have been signed out')
    window.location.href = '/admin/login'
  }

  const exportData = async () => {
    // `contacts` holds only the current page, so exporting it would silently
    // produce a ten-row file. Walk every page under the active filter and
    // search instead — the API caps `limit` at 100, so a single large request
    // would truncate just as quietly.
    const perRequest = 100
    let allContacts: Contact[] = []

    try {
      setExporting(true)
      for (let page = 1; ; page += 1) {
        const response = await contactsApi.getAll({
          page,
          limit: perRequest,
          search: debouncedSearch,
          ...(filter !== 'all' ? { status: filter as Contact['status'] } : {}),
        })

        allContacts = allContacts.concat(response.data)

        if (response.data.length < perRequest || allContacts.length >= response.total) break
      }
    } catch (error) {
      console.error('Failed to fetch all contacts for export:', error)
      toast.error('Could not export every inquiry. Please try again.')
      setExporting(false)
      return
    }

    const rows = [
      ['Type', 'Name or Email', 'Email', 'Subject or Programme', 'Status', 'Date'],
      ...allContacts.map((contact) => [
        'Contact',
        contact.name,
        contact.email,
        contact.subject,
        contact.status,
        contact.createdAt,
      ]),
      ...subscribers.map((subscriber) => [
        'Newsletter',
        subscriber.email,
        subscriber.email,
        'Newsletter subscription',
        subscriber.isActive ? 'active' : 'inactive',
        subscriber.subscribedAt,
      ]),
    ]

    // Contact and enrolment text comes from a public form, and a spreadsheet
    // treats a leading =, +, -, @ or control character as a formula. Prefixing
    // with an apostrophe forces Excel and Sheets to read the cell as text.
    const escapeCell = (value: unknown) => {
      const text = String(value ?? '')
      const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
      return `"${safe.replace(/"/g, '""')}"`
    }

    const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `axis-academy-export-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    toast.success(`Exported ${allContacts.length} inquiries and ${subscribers.length} subscribers`)
  }

  const updateStatus = async (id: number, status: Contact['status']) => {
    try {
      await contactsApi.updateStatus(id, { status })
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error(apiErrorMessage(error, 'Failed to update status'))
    }
  }

  const updateEnrollmentStatus = async (id: number, status: Enrollment['status']) => {
    try {
      const updated = await enrollmentsApi.updateStatus(id, status)
      setEnrollments((previous) => previous.map((enrollment) => enrollment.id === id ? updated : enrollment))
      toast.success('Enrollment status updated successfully')
    } catch (error) {
      console.error('Failed to update enrollment status:', error)
      toast.error(apiErrorMessage(error, 'Failed to update enrollment status'))
    }
  }

  const filteredContacts = contacts
  const contactPageCount = Math.max(1, Math.ceil(contactTotal / pageSize))
  const paginatedContacts = contacts

  const statCards = [
    { icon: MessageSquare, label: 'Total Inquiries', value: stats.totalInquiries, color: 'bg-tint-blue text-info' },
    { icon: Mail, label: 'New Messages', value: stats.newInquiries, color: 'bg-tint-amber text-warning' },
    { icon: TrendingUp, label: 'Responded', value: stats.respondedInquiries, color: 'bg-tint-positive text-positive' },
    { icon: Users, label: 'Enrolled', value: stats.enrollments, color: 'bg-tint-purple text-purple-600' },
  ]

  return (
    <div className="pt-20 min-h-screen bg-surface-sunk">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
            <p className="text-ink-muted text-sm">Manage content and track engagement</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'dashboard' && (
              <>
                <button onClick={refreshDashboard} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-sunk disabled:opacity-50">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button onClick={exportData} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60">
                  <Download className="h-4 w-4" />
                  {exporting ? 'Preparing export...' : 'Export Data'}
                </button>
              </>
            )}
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-line-critical px-4 py-2 text-sm text-critical transition-colors hover:bg-tint-critical">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface rounded-xl border border-line mb-6 overflow-hidden">
          <div className="flex border-b border-line overflow-x-auto">
            {(['dashboard', 'pipeline', 'learners', 'accounts', 'safeguarding', 'data-protection', 'gallery', 'resources', 'partners', 'educators', 'events', 'faqs', 'locations', 'testimonials'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-navy-900 text-white'
                    : 'bg-surface text-ink-muted hover:bg-surface-sunk'
                }`}
              >
                {TAB_LABELS[tab] ?? tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface rounded-xl p-6 border border-line"
                >
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-ink">{stat.value}</p>
                  <p className="text-ink-muted text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-surface rounded-xl border border-line mb-6 overflow-hidden">
          <div className="border-b border-line px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
                <p className="text-sm text-ink-muted">Latest protected administrative actions</p>
              </div>
              <div className="flex gap-2">
                <select value={auditAction} onChange={(event) => setAuditAction(event.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-xs text-ink-muted">
                  <option value="">All actions</option>
                  <option value="status_updated">Status updated</option>
                </select>
                <select value={auditEntity} onChange={(event) => setAuditEntity(event.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-xs text-ink-muted">
                  <option value="">All records</option>
                  <option value="contact">Contacts</option>
                  <option value="enrollment">Enrollments</option>
                </select>
              </div>
            </div>
          </div>
          {auditError ? (
            <p className="px-6 py-5 text-sm text-critical">{auditError}</p>
          ) : auditLogs.length === 0 ? (
            <p className="px-6 py-5 text-sm text-ink-faint">No administrative activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-line">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-3">
                  <div>
                    <p className="text-sm text-ink"><span className="font-medium capitalize">{log.action.replaceAll('_', ' ')}</span> {log.entity} #{log.entityId ?? '—'}</p>
                    <p className="text-xs text-ink-faint">{log.user ? `${log.user.name} (${log.user.email})` : 'System'}{log.metadata?.status ? ` · Status: ${String(log.metadata.status)}` : ''}</p>
                  </div>
                  <time className="text-xs text-ink-faint" dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString()}</time>
                </div>
              ))}
            </div>
          )}
            </div>
          </>
        )}

        {/* Pipeline Tab — brief §31 */}
        {activeTab === 'pipeline' && <PipelineBoard />}

        {/* Learners Tab — brief §30 */}
        {activeTab === 'learners' && <LearnerAdmin />}

        {/* Accounts Tab — nothing in the portals works without these */}
        {activeTab === 'accounts' && <Accounts />}

        {/* Safeguarding Tab — brief §38 */}
        {activeTab === 'safeguarding' && <Safeguarding />}

        {activeTab === 'data-protection' && <DataProtection />}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setEditingGallery(null)
                setGalleryForm({ title: '', type: 'Photo', category: 'General', description: '', url: '', thumbnail: '', tags: '', consentConfirmed: false, consentReference: '' })
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"
            >
              <Plus className="h-4 w-4" />
              Add Gallery Item
            </button>

            {editingGallery !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingGallery ? 'Edit' : 'Add'} Gallery Item</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={galleryForm.title} onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <select value={galleryForm.type} onChange={(e) => setGalleryForm({...galleryForm, type: e.target.value as GalleryType})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Photo">Photo</option>
                    <option value="Video">Video</option>
                  </select>
                  <select value={galleryForm.category} onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value as GalleryCategory})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="General">General</option>
                    <option value="Event">Event</option>
                    <option value="Programme">Programme</option>
                    <option value="Activity">Activity</option>
                  </select>
                  <textarea placeholder="Description" value={galleryForm.description} onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={3} />
                  <input type="url" placeholder="Image/Video URL" value={galleryForm.url} onChange={(e) => setGalleryForm({...galleryForm, url: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Thumbnail URL (optional)" value={galleryForm.thumbnail} onChange={(e) => setGalleryForm({...galleryForm, thumbnail: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Tags (comma-separated)" value={galleryForm.tags} onChange={(e) => setGalleryForm({...galleryForm, tags: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="space-y-3 rounded-lg border border-line-warning bg-tint-amber p-3">
                    <label className="flex items-start gap-3 text-sm text-ink-muted">
                      <input type="checkbox" checked={galleryForm.consentConfirmed} onChange={(e) => setGalleryForm({...galleryForm, consentConfirmed: e.target.checked})} className="mt-0.5 h-4 w-4 rounded border-line-strong text-gold-600 focus:ring-gold-500" />
                      <span>I confirm that the appropriate consent has been verified for public publication of this photo or video.</span>
                    </label>
                    <input type="text" placeholder="Signed media release reference (e.g. MR-2026-014)" value={galleryForm.consentReference} onChange={(e) => setGalleryForm({...galleryForm, consentReference: e.target.value})} className="w-full rounded-lg border border-line-warning bg-surface px-4 py-2 text-sm outline-none focus:border-gold-500" />
                    <p className="text-xs text-ink-muted">Recorded with your name and the date, so consent can be evidenced or withdrawn later.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveGalleryItem} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button>
                    <button onClick={() => {setEditingGallery(undefined); setGalleryForm({ title: '', type: 'Photo', category: 'General', description: '', url: '', thumbnail: '', tags: '', consentConfirmed: false, consentReference: '' })}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Title</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {galleryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <ImageIcon className="w-4 h-4 text-ink-faint" />
                            <span className="text-sm font-medium text-ink">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{item.type}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{item.category}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => {setEditingGallery(item); setGalleryForm({title: item.title, type: item.type, category: item.category, description: item.description || '', url: item.url, thumbnail: item.thumbnail || '', tags: item.tags?.join(', ') || '', consentConfirmed: item.consentConfirmed, consentReference: item.consentReference || ''})}} className="text-ink-muted hover:text-ink">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteGalleryItem(item.id)} className="text-critical hover:text-critical">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {galleryItems.length === 0 && (
                <div className="text-center py-12 text-ink-faint text-sm">
                  No gallery items yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setEditingResource(null)
                setResourceForm({ title: '', slug: '', excerpt: '', content: '', category: 'Parenting & Learning', author: '', coverImage: '', sourceUrl: '', fileUrl: '', readTime: '', tags: '', status: 'Draft', metaDescription: '' })
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </button>

            {editingResource !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingResource ? 'Edit' : 'Add'} Resource</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={resourceForm.title} onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Slug" value={resourceForm.slug} onChange={(e) => setResourceForm({...resourceForm, slug: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Excerpt" value={resourceForm.excerpt} onChange={(e) => setResourceForm({...resourceForm, excerpt: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <select value={resourceForm.category} onChange={(e) => setResourceForm({...resourceForm, category: e.target.value as ResourceCategory})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <textarea placeholder="Content" value={resourceForm.content} onChange={(e) => setResourceForm({...resourceForm, content: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={5} />
                  <input type="text" placeholder="Author" value={resourceForm.author} onChange={(e) => setResourceForm({...resourceForm, author: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Cover Image URL" value={resourceForm.coverImage} onChange={(e) => setResourceForm({...resourceForm, coverImage: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Link to where the work is published (for work Axis did not write)" value={resourceForm.sourceUrl} onChange={(e) => setResourceForm({...resourceForm, sourceUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Link to a copy Axis serves itself (only where Axis may redistribute it)" value={resourceForm.fileUrl} onChange={(e) => setResourceForm({...resourceForm, fileUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Read Time (e.g., '5 min')" value={resourceForm.readTime} onChange={(e) => setResourceForm({...resourceForm, readTime: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Draft or Published, so an unfinished article can be saved
                      without reaching a reader, and a published one can be
                      pulled back without being deleted. */}
                  <select value={resourceForm.status} onChange={(e) => setResourceForm({...resourceForm, status: e.target.value as ResourceStatus})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Draft">Draft — not visible on the site</option>
                    <option value="Published">Published — live on the site</option>
                  </select>
                  {/* Separate from the excerpt: this is what Google shows under
                      the title, and it wants different phrasing and length. */}
                  <input type="text" maxLength={320} placeholder="Search description (optional — falls back to the excerpt)" value={resourceForm.metaDescription} onChange={(e) => setResourceForm({...resourceForm, metaDescription: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Tags (comma-separated)" value={resourceForm.tags} onChange={(e) => setResourceForm({...resourceForm, tags: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="flex gap-2">
                    <button onClick={saveResource} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button>
                    <button onClick={() => {setEditingResource(undefined); setResourceForm({ title: '', slug: '', excerpt: '', content: '', category: 'Parenting & Learning', author: '', coverImage: '', sourceUrl: '', fileUrl: '', readTime: '', tags: '', status: 'Draft', metaDescription: '' })}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Title</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Author</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink">{resource.title}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{resource.category}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{resource.author || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${resource.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>
                            {resource.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => {setEditingResource(resource); setResourceForm({title: resource.title, slug: resource.slug, excerpt: resource.excerpt || '', content: resource.content || '', category: resource.category, author: resource.author, coverImage: resource.coverImage || '', sourceUrl: resource.sourceUrl || '', fileUrl: resource.fileUrl || '', readTime: resource.readTime || '', status: resource.status || 'Draft', metaDescription: resource.metaDescription || '', tags: resource.tags?.join(', ') || ''})}} className="text-ink-muted hover:text-ink">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteResource(resource.id)} className="text-critical hover:text-critical">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {resources.length === 0 && (
                <div className="text-center py-12 text-ink-faint text-sm">
                  No resources yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            <button
              onClick={() => {
                setEditingPartner(null)
                setPartnerForm({ name: '', logo: '', category: 'Corporate', description: '', website: '', contact: '', email: '', phone: '', focusAreas: '' })
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"
            >
              <Plus className="h-4 w-4" />
              Add Partner
            </button>

            {editingPartner !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingPartner ? 'Edit' : 'Add'} Partner</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Partner Name" value={partnerForm.name} onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Logo URL" value={partnerForm.logo} onChange={(e) => setPartnerForm({...partnerForm, logo: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <select value={partnerForm.category} onChange={(e) => setPartnerForm({...partnerForm, category: e.target.value as PartnerCategory})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Corporate">Corporate</option>
                    <option value="Educational Institution">Educational Institution</option>
                    <option value="Tech Partner">Tech Partner</option>
                    <option value="Content Provider">Content Provider</option>
                    <option value="Community Partner">Community Partner</option>
                  </select>
                  <textarea placeholder="Description" value={partnerForm.description} onChange={(e) => setPartnerForm({...partnerForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={3} />
                  <input type="url" placeholder="Website URL" value={partnerForm.website} onChange={(e) => setPartnerForm({...partnerForm, website: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Contact Person" value={partnerForm.contact} onChange={(e) => setPartnerForm({...partnerForm, contact: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="email" placeholder="Email" value={partnerForm.email} onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="tel" placeholder="Phone" value={partnerForm.phone} onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Focus Areas (comma-separated)" value={partnerForm.focusAreas} onChange={(e) => setPartnerForm({...partnerForm, focusAreas: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="flex gap-2">
                    <button onClick={savePartner} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button>
                    <button onClick={() => {setEditingPartner(undefined); setPartnerForm({ name: '', logo: '', category: 'Corporate', description: '', website: '', contact: '', email: '', phone: '', focusAreas: '' })}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Contact</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {partners.map((partner) => (
                      <tr key={partner.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink">{partner.name}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{partner.category}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">
                          {partner.email && <p>{partner.email}</p>}
                          {partner.phone && <p className="text-xs text-ink-faint">{partner.phone}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${partner.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>
                            {partner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => {setEditingPartner(partner); setPartnerForm({name: partner.name, logo: partner.logo || '', category: partner.category, description: partner.description || '', website: partner.website || '', contact: partner.contact || '', email: partner.email || '', phone: partner.phone || '', focusAreas: partner.focusAreas?.join(', ') || ''})}} className="text-ink-muted hover:text-ink">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => deletePartner(partner.id)} className="text-critical hover:text-critical">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {partners.length === 0 && (
                <div className="text-center py-12 text-ink-faint text-sm">
                  No partners yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Educators Tab */}
        {activeTab === 'educators' && (
          <div className="space-y-6">
            <button onClick={() => {setEditingEducator(null); setEducatorForm({name: '', position: '', category: 'Teacher', qualifications: '', experience: '', subjects: '', languages: '', expertise: '', biography: '', photo: '', email: '', phone: ''})}} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"><Plus className="h-4 w-4" />Add Educator</button>
            {editingEducator !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingEducator ? 'Edit' : 'Add'} Educator</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Name" value={educatorForm.name} onChange={(e) => setEducatorForm({...educatorForm, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Position" value={educatorForm.position} onChange={(e) => setEducatorForm({...educatorForm, position: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <select value={educatorForm.category} onChange={(e) => setEducatorForm({...educatorForm, category: e.target.value as EducatorCategory})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Teacher">Teacher</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Education Consultant">Education Consultant</option>
                    <option value="Language Educator">Language Educator</option>
                    <option value="Specialist Educator">Specialist Educator</option>
                    <option value="Coach">Coach</option>
                    <option value="Artist">Artist</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                  <input type="text" placeholder="Qualifications" value={educatorForm.qualifications} onChange={(e) => setEducatorForm({...educatorForm, qualifications: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Experience" value={educatorForm.experience} onChange={(e) => setEducatorForm({...educatorForm, experience: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Subjects (comma-separated)" value={educatorForm.subjects} onChange={(e) => setEducatorForm({...educatorForm, subjects: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Languages (comma-separated)" value={educatorForm.languages} onChange={(e) => setEducatorForm({...educatorForm, languages: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Expertise" value={educatorForm.expertise} onChange={(e) => setEducatorForm({...educatorForm, expertise: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <textarea placeholder="Biography" value={educatorForm.biography} onChange={(e) => setEducatorForm({...educatorForm, biography: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={3} />
                  <input type="url" placeholder="Photo URL" value={educatorForm.photo} onChange={(e) => setEducatorForm({...educatorForm, photo: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="email" placeholder="Email" value={educatorForm.email} onChange={(e) => setEducatorForm({...educatorForm, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="tel" placeholder="Phone" value={educatorForm.phone} onChange={(e) => setEducatorForm({...educatorForm, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="flex gap-2"><button onClick={saveEducator} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button><button onClick={() => {setEditingEducator(undefined); setEducatorForm({name: '', position: '', category: 'Teacher', qualifications: '', experience: '', subjects: '', languages: '', expertise: '', biography: '', photo: '', email: '', phone: ''})}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button></div>
                </div>
              </div>
            )}
            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Position</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {educators.map((educator) => (
                      <tr key={educator.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink">{educator.name}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{educator.position}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{educator.category}</td>
                        <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${educator.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>{educator.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => {setEditingEducator(educator); setEducatorForm({name: educator.name, position: educator.position, category: educator.category, qualifications: educator.qualifications || '', experience: educator.experience || '', subjects: educator.subjects?.join(', ') || '', languages: educator.languages?.join(', ') || '', expertise: educator.expertise || '', biography: educator.biography || '', photo: educator.photo || '', email: educator.email || '', phone: educator.phone || ''})}} className="text-ink-muted hover:text-ink"><Edit className="w-4 h-4" /></button><button onClick={() => deleteEducator(educator.id)} className="text-critical hover:text-critical"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {educators.length === 0 && (<div className="text-center py-12 text-ink-faint text-sm">No educators yet.</div>)}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <button onClick={() => {setEditingEvent(null); setEventForm({title: '', description: '', category: 'Workshop', startDate: '', endDate: '', venue: '', location: '', capacity: '', ageGroup: '', programme: '', priceKES: '', registrationDeadline: '', registrationLink: '', poster: '', status: 'Upcoming'})}} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"><Plus className="h-4 w-4" />Add Event</button>
            {editingEvent !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingEvent ? 'Edit' : 'Add'} Event</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <textarea placeholder="Description" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={3} />
                  <select value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value as EventCategory})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Workshop">Workshop</option>
                    <option value="Holiday Tuition">Holiday Tuition</option>
                    <option value="Exam Preparation">Exam Preparation</option>
                    <option value="Competition">Competition</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Sports Event">Sports Event</option>
                    <option value="Enrichment">Enrichment</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="date" placeholder="Start Date" value={eventForm.startDate} onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                    <input type="date" placeholder="End Date" value={eventForm.endDate} onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  </div>
                  <input type="text" placeholder="Venue" value={eventForm.venue} onChange={(e) => setEventForm({...eventForm, venue: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Location" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="number" placeholder="Capacity" value={eventForm.capacity} onChange={(e) => setEventForm({...eventForm, capacity: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Age Group" value={eventForm.ageGroup} onChange={(e) => setEventForm({...eventForm, ageGroup: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="text" placeholder="Programme" value={eventForm.programme} onChange={(e) => setEventForm({...eventForm, programme: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="number" placeholder="Price (KES)" value={eventForm.priceKES} onChange={(e) => setEventForm({...eventForm, priceKES: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="date" placeholder="Registration Deadline" value={eventForm.registrationDeadline} onChange={(e) => setEventForm({...eventForm, registrationDeadline: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Registration Link" value={eventForm.registrationLink} onChange={(e) => setEventForm({...eventForm, registrationLink: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Poster URL" value={eventForm.poster} onChange={(e) => setEventForm({...eventForm, poster: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <select value={eventForm.status} onChange={(e) => setEventForm({...eventForm, status: e.target.value as EventStatus})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="flex gap-2"><button onClick={saveEvent} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button><button onClick={() => {setEditingEvent(undefined); setEventForm({title: '', description: '', category: 'Workshop', startDate: '', endDate: '', venue: '', location: '', capacity: '', ageGroup: '', programme: '', priceKES: '', registrationDeadline: '', registrationLink: '', poster: '', status: 'Upcoming'})}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button></div>
                </div>
              </div>
            )}
            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Title</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Start Date</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink">{event.title}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{event.category}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{new Date(event.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${event.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>{event.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => {setEditingEvent(event); setEventForm({title: event.title, description: event.description, category: event.category, startDate: event.startDate, endDate: event.endDate || '', venue: event.venue || '', location: event.location || '', capacity: event.capacity?.toString() || '', ageGroup: event.ageGroup || '', programme: event.programme || '', priceKES: event.priceKES?.toString() || '', registrationDeadline: event.registrationDeadline || '', registrationLink: event.registrationLink || '', poster: event.poster || '', status: event.status})}} className="text-ink-muted hover:text-ink"><Edit className="w-4 h-4" /></button><button onClick={() => deleteEvent(event.id)} className="text-critical hover:text-critical"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {events.length === 0 && (<div className="text-center py-12 text-ink-faint text-sm">No events yet.</div>)}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <button onClick={() => {setEditingFAQ(null); setFaqForm({question: '', answer: '', category: 'General', order: ''})}} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"><Plus className="h-4 w-4" />Add FAQ</button>
            {editingFAQ !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingFAQ ? 'Edit' : 'Add'} FAQ</h3>
                <div className="space-y-4">
                  <textarea placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({...faqForm, question: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={2} />
                  <textarea placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={4} />
                  <select value={faqForm.category} onChange={(e) => setFaqForm({...faqForm, category: e.target.value as FAQCategory})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="General">General</option>
                    <option value="Programmes & Curricula">Programmes & Curricula</option>
                    <option value="Enrollment">Enrollment</option>
                    <option value="Special Needs">Special Needs</option>
                    <option value="Languages">Languages</option>
                    <option value="Locations">Locations</option>
                    <option value="Fees & Payments">Fees & Payments</option>
                    <option value="Educators">Educators</option>
                    <option value="Portals & Learning">Portals & Learning</option>
                    <option value="Technical">Technical</option>
                  </select>
                  <input type="number" placeholder="Order" value={faqForm.order} onChange={(e) => setFaqForm({...faqForm, order: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="flex gap-2"><button onClick={saveFAQ} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button><button onClick={() => {setEditingFAQ(undefined); setFaqForm({question: '', answer: '', category: 'General', order: ''})}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button></div>
                </div>
              </div>
            )}
            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Question</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Views</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {faqs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink max-w-xs line-clamp-2">{faq.question}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{faq.category}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{faq.viewCount}</td>
                        <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${faq.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>{faq.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => {setEditingFAQ(faq); setFaqForm({question: faq.question, answer: faq.answer, category: faq.category, order: faq.order.toString()})}} className="text-ink-muted hover:text-ink"><Edit className="w-4 h-4" /></button><button onClick={() => deleteFAQ(faq.id)} className="text-critical hover:text-critical"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {faqs.length === 0 && (<div className="text-center py-12 text-ink-faint text-sm">No FAQs yet.</div>)}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-line bg-surface-sunk p-4 text-sm text-ink-muted">
              A testimonial names a family, and often quotes a child. Nothing appears on the website
              until consent is confirmed against a signed record, and withdrawing consent takes it
              down immediately.
            </div>
            <button
              onClick={() => { setEditingTestimonial(null); setTestimonialForm(emptyTestimonialForm) }}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"
            >
              <Plus className="h-4 w-4" />Add testimonial
            </button>

            {editingTestimonial !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingTestimonial ? 'Edit' : 'Add'} testimonial</h3>
                <div className="space-y-4">
                  <textarea placeholder="What they said" value={testimonialForm.text} onChange={(e) => setTestimonialForm({...testimonialForm, text: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={4} />
                  <input type="text" placeholder="Who said it" value={testimonialForm.author} onChange={(e) => setTestimonialForm({...testimonialForm, author: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select value={testimonialForm.role} onChange={(e) => setTestimonialForm({...testimonialForm, role: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                      <option value="Parent">Parent</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Learner">Learner</option>
                      <option value="Educator">Educator</option>
                      <option value="Partner">Partner</option>
                    </select>
                    <select value={testimonialForm.rating} onChange={(e) => setTestimonialForm({...testimonialForm, rating: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                      {[5, 4, 3, 2, 1].map((n) => (<option key={n} value={String(n)}>{n} out of 5</option>))}
                    </select>
                  </div>

                  <div className="rounded-lg border border-gold-500/40 bg-gold-500/5 p-4 space-y-3">
                    <label className="flex items-start gap-3 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={testimonialForm.consentConfirmed}
                        onChange={(e) => setTestimonialForm({...testimonialForm, consentConfirmed: e.target.checked})}
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                      />
                      <span>I have confirmed that consent to publish this quote has been given.</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Which signed consent does this refer to?"
                      value={testimonialForm.consentReference}
                      onChange={(e) => setTestimonialForm({...testimonialForm, consentReference: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500"
                    />
                    <p className="text-xs text-ink-muted">
                      Your name and the date are recorded against this confirmation, so it can be
                      answered for later.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={saveTestimonial} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button>
                    <button onClick={() => { setEditingTestimonial(undefined); setTestimonialForm(emptyTestimonialForm) }} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Quote</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Who</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Consent</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">On the site</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {testimonials.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-ink max-w-md line-clamp-2">{item.text}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted whitespace-nowrap">{item.author}<span className="block text-xs text-ink-muted">{item.role}</span></td>
                        <td className="px-6 py-4 text-sm">
                          {item.consentConfirmed ? (
                            <>
                              <span className="rounded-full bg-tint-positive px-2 py-1 text-xs font-medium text-positive">Confirmed</span>
                              <span className="mt-1 block text-xs text-ink-muted">
                                {item.consentConfirmedAt ? new Date(item.consentConfirmedAt).toLocaleDateString() : null}
                                {item.consentReference ? ' — ' + item.consentReference : null}
                              </span>
                            </>
                          ) : (
                            <span className="rounded-full bg-tint-critical px-2 py-1 text-xs font-medium text-critical">Not confirmed</span>
                          )}
                        </td>
                        <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>{item.isActive ? 'Published' : 'Withdrawn'}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingTestimonial(item); setTestimonialForm({ text: item.text, author: item.author, role: item.role, rating: String(item.rating), consentConfirmed: item.consentConfirmed, consentReference: item.consentReference || '' }) }}
                              className="text-ink-muted hover:text-ink"
                              aria-label={'Edit the quote from ' + item.author}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {item.isActive ? (
                              <button onClick={() => withdrawTestimonial(item)} className="text-critical hover:text-critical" aria-label={'Take the quote from ' + item.author + ' off the site'}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => republishTestimonial(item)}
                                disabled={!item.consentConfirmed}
                                title={item.consentConfirmed ? 'Put this quote back on the site' : 'Consent must be confirmed first'}
                                className="text-xs font-medium text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Republish
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {testimonials.length === 0 && (<div className="text-center py-12 text-ink-faint text-sm">No testimonials yet.</div>)}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <button onClick={() => {setEditingLocation(null); setLocationForm({name: '', type: 'Head Office', address: '', city: '', county: '', phone: '', email: '', description: '', programmes: '', photo: '', latitude: '', longitude: ''})}} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-800"><Plus className="h-4 w-4" />Add Location</button>
            {editingLocation !== undefined && (
              <div className="bg-surface rounded-xl border border-line p-6">
                <h3 className="text-lg font-semibold text-ink mb-4">{editingLocation ? 'Edit' : 'Add'} Location</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Location Name" value={locationForm.name} onChange={(e) => setLocationForm({...locationForm, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <select value={locationForm.type} onChange={(e) => setLocationForm({...locationForm, type: e.target.value as LocationType})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500">
                    <option value="Head Office">Head Office</option>
                    <option value="Learning Centre">Learning Centre</option>
                    <option value="Partner Facility">Partner Facility</option>
                    <option value="Educator Hub">Educator Hub</option>
                    <option value="Home-Based Service">Home-Based Service</option>
                  </select>
                  <input type="text" placeholder="Address" value={locationForm.address} onChange={(e) => setLocationForm({...locationForm, address: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="City" value={locationForm.city} onChange={(e) => setLocationForm({...locationForm, city: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                    <input type="text" placeholder="County" value={locationForm.county} onChange={(e) => setLocationForm({...locationForm, county: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  </div>
                  <input type="email" placeholder="Email" value={locationForm.email} onChange={(e) => setLocationForm({...locationForm, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="tel" placeholder="Phone" value={locationForm.phone} onChange={(e) => setLocationForm({...locationForm, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <textarea placeholder="Description" value={locationForm.description} onChange={(e) => setLocationForm({...locationForm, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" rows={3} />
                  <input type="text" placeholder="Programmes (comma-separated)" value={locationForm.programmes} onChange={(e) => setLocationForm({...locationForm, programmes: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <input type="url" placeholder="Photo URL" value={locationForm.photo} onChange={(e) => setLocationForm({...locationForm, photo: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Latitude" step="0.0001" value={locationForm.latitude} onChange={(e) => setLocationForm({...locationForm, latitude: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                    <input type="number" placeholder="Longitude" step="0.0001" value={locationForm.longitude} onChange={(e) => setLocationForm({...locationForm, longitude: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-line outline-none focus:border-gold-500" />
                  </div>
                  <div className="flex gap-2"><button onClick={saveLocation} className="flex-1 rounded-lg bg-gold-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gold-700">Save</button><button onClick={() => {setEditingLocation(undefined); setLocationForm({name: '', type: 'Head Office', address: '', city: '', county: '', phone: '', email: '', description: '', programmes: '', photo: '', latitude: '', longitude: ''})}} className="flex-1 rounded-lg bg-line px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-gray-300">Cancel</button></div>
                </div>
              </div>
            )}
            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Type</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">City</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {locations.map((location) => (
                      <tr key={location.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-ink">{location.name}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{location.type}</td>
                        <td className="px-6 py-4 text-sm text-ink-muted">{location.city || '—'}</td>
                        <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-medium ${location.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>{location.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => {setEditingLocation(location); setLocationForm({name: location.name, type: location.type, address: location.address || '', city: location.city || '', county: location.county || '', phone: location.phone || '', email: location.email || '', description: location.description || '', programmes: location.programmes?.join(', ') || '', photo: location.photo || '', latitude: location.latitude?.toString() || '', longitude: location.longitude?.toString() || ''})}} className="text-ink-muted hover:text-ink"><Edit className="w-4 h-4" /></button><button onClick={() => deleteLocation(location.id)} className="text-critical hover:text-critical"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {locations.length === 0 && (<div className="text-center py-12 text-ink-faint text-sm">No locations yet.</div>)}
            </div>
          </div>
        )}

        {/* Dashboard Tab, continued — subscribers, contacts and enrolments */}
        {activeTab === 'dashboard' && (
          <>
            <div className="bg-surface rounded-xl border border-line mb-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Newsletter Subscribers</h2>
                  <p className="text-sm text-ink-muted">{subscribers.length} total subscribers</p>
                </div>
              </div>
              {subscriberError ? (
                <p className="px-6 py-5 text-sm text-critical">{subscriberError}</p>
              ) : subscribers.length === 0 ? (
                <p className="px-6 py-5 text-sm text-ink-faint">No newsletter subscribers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-sunk border-b border-line">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Subscribed</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-3 text-sm text-ink">{subscriber.email}</td>
                          <td className="px-6 py-3 text-sm text-ink-muted">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${subscriber.isActive ? 'bg-tint-positive text-positive' : 'bg-surface-muted text-ink-muted'}`}>
                              {subscriber.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-surface rounded-xl border border-line mb-6 overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Enrollment Applications</h2>
                  <p className="text-sm text-ink-muted">{enrollmentTotal} total applications</p>
                </div>
              </div>
              {enrollmentError ? (
                <p className="px-6 py-5 text-sm text-critical">{enrollmentError}</p>
              ) : enrollments.length === 0 ? (
                <p className="px-6 py-5 text-sm text-ink-faint">No enrollment applications yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-sunk border-b border-line">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Programme</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Applied</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-surface-sunk/50 transition-colors">
                          <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedEnrollment(enrollment)}>
                            <p className="text-sm font-medium text-ink">{enrollment.studentName}</p>
                            {enrollment.parentName && <p className="text-xs text-ink-faint">Parent: {enrollment.parentName}</p>}
                          </td>
                          <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedEnrollment(enrollment)}>
                            <p className="text-xs text-ink-muted">{enrollment.email}</p>
                            {enrollment.phone && <p className="mt-1 text-xs text-ink-faint">{enrollment.phone}</p>}
                          </td>
                          <td className="px-6 py-4 text-sm text-ink-muted cursor-pointer" onClick={() => setSelectedEnrollment(enrollment)}>{enrollment.programme}</td>
                          <td className="px-6 py-4 text-xs text-ink-faint cursor-pointer" onClick={() => setSelectedEnrollment(enrollment)}>{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <select
                              value={enrollment.status}
                              onChange={(event) => updateEnrollmentStatus(enrollment.id, event.target.value as Enrollment['status'])}
                              className="text-xs border border-line rounded-lg px-2 py-1 focus:border-gold-500 outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="waitlist">Waitlist</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-surface rounded-xl border border-line mb-6">
              <div className="p-4 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
                  <input
                    type="text"
                    placeholder="Search inquiries..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-line focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-ink-faint" />
                  {['all', 'new', 'read', 'replied', 'closed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setContactPage(1) }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                        filter === f 
                          ? 'bg-navy-900 text-white' 
                          : 'bg-surface-muted text-ink-muted hover:bg-line'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-sunk border-b border-line">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Contact</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Subject</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Programme</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {paginatedContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-surface-sunk/50 transition-colors">
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <p className="text-sm font-medium text-ink">{contact.name}</p>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <div className="space-y-1">
                            <p className="text-xs text-ink-muted flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {contact.email}
                            </p>
                            <p className="text-xs text-ink-muted flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {contact.phone || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <p className="text-sm text-ink-muted">{contact.subject}</p>
                          <p className="text-xs text-ink-faint mt-1 line-clamp-1">{contact.message}</p>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <span className="text-xs bg-surface-muted text-ink-muted px-2 py-1 rounded-full capitalize">
                            General
                          </span>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                            contact.status === 'new' ? 'bg-tint-amber text-warning' :
                            contact.status === 'read' ? 'bg-tint-blue text-info' :
                            contact.status === 'replied' ? 'bg-tint-positive text-positive' :
                            'bg-surface-sunk text-ink-muted'
                          }`}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                          <p className="text-xs text-ink-faint flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={contact.status}
                            onChange={(e) => updateStatus(contact.id, e.target.value as Contact['status'])}
                            className="text-xs border border-line rounded-lg px-2 py-1 focus:border-gold-500 outline-none"
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-ink-faint text-sm">
                  No inquiries found matching your criteria.
                </div>
              )}
              {filteredContacts.length > 0 && (
                <div className="flex items-center justify-between border-t border-line px-6 py-3 text-sm text-ink-muted">
                  <span>Showing {(contactPage - 1) * pageSize + 1}-{Math.min(contactPage * pageSize, contactTotal)} of {contactTotal}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" disabled={contactPage === 1} onClick={() => setContactPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-line px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                    <span>Page {contactPage} of {contactPageCount}</span>
                    <button type="button" disabled={contactPage === contactPageCount} onClick={() => setContactPage((page) => Math.min(contactPageCount, page + 1))} className="rounded-lg border border-line px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                  </div>
                </div>
              )}
            </div>
            </>
          )}
      </div>
      {(selectedContact || selectedEnrollment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 px-4" onClick={() => { setSelectedContact(null); setSelectedEnrollment(null) }}>
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Record details</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{selectedContact ? selectedContact.name : selectedEnrollment?.studentName}</h2>
              </div>
              <button type="button" aria-label="Close details" onClick={() => { setSelectedContact(null); setSelectedEnrollment(null) }} className="rounded-lg p-2 text-ink-muted hover:bg-surface-muted"><X className="h-5 w-5" /></button>
            </div>
            {selectedContact ? (
              <div className="space-y-3 text-sm text-ink-muted">
                <p><strong>Email:</strong> {selectedContact.email}</p>
                <p><strong>Phone:</strong> {selectedContact.phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> {selectedContact.subject}</p>
                <p><strong>Status:</strong> {selectedContact.status}</p>
                <p><strong>Received:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
                <div><strong>Message:</strong><p className="mt-1 rounded-lg bg-surface-sunk p-3 leading-relaxed">{selectedContact.message}</p></div>
              </div>
            ) : selectedEnrollment && (
              <div className="space-y-3 text-sm text-ink-muted">
                <p><strong>Parent:</strong> {selectedEnrollment.parentName || 'Not provided'}</p>
                <p><strong>Email:</strong> {selectedEnrollment.email}</p>
                <p><strong>Phone:</strong> {selectedEnrollment.phone || 'Not provided'}</p>
                <p><strong>Programme:</strong> {selectedEnrollment.programme}</p>
                <p><strong>Age group:</strong> {selectedEnrollment.ageGroup}</p>
                {selectedEnrollment.learnerAge && <p><strong>Learner age:</strong> {selectedEnrollment.learnerAge}</p>}
                {selectedEnrollment.location && <p><strong>Location:</strong> {selectedEnrollment.location}</p>}
                {selectedEnrollment.currentSchool && <p><strong>Current school:</strong> {selectedEnrollment.currentSchool}</p>}
                {selectedEnrollment.curriculum && <p><strong>Current curriculum:</strong> {selectedEnrollment.curriculum}</p>}
                {selectedEnrollment.gradeClass && <p><strong>Grade or class:</strong> {selectedEnrollment.gradeClass}</p>}
                {selectedEnrollment.subjects && <p><strong>Subjects or interests:</strong> {selectedEnrollment.subjects}</p>}
                {selectedEnrollment.preferredLearningModel && <p><strong>Learning model:</strong> {selectedEnrollment.preferredLearningModel.replace('-', ' ')}</p>}
                {selectedEnrollment.preferredDays && <p><strong>Preferred days:</strong> {selectedEnrollment.preferredDays}</p>}
                {selectedEnrollment.preferredTimes && <p><strong>Preferred times:</strong> {selectedEnrollment.preferredTimes}</p>}
                <p><strong>Status:</strong> {selectedEnrollment.status}</p>
                <p><strong>Contact consent:</strong> {selectedEnrollment.contactConsent ? 'Confirmed' : 'Not recorded'}</p>
                <p><strong>Applied:</strong> {new Date(selectedEnrollment.createdAt).toLocaleString()}</p>
                {selectedEnrollment.learningNeeds && <div><strong>Learning context:</strong><p className="mt-1 rounded-lg bg-surface-sunk p-3 leading-relaxed">{selectedEnrollment.learningNeeds}</p></div>}
                <div><strong>Notes:</strong><p className="mt-1 rounded-lg bg-surface-sunk p-3 leading-relaxed">{selectedEnrollment.notes || 'No notes provided.'}</p></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
