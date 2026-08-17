// API Response Types

export interface Service {
  id: number
  title: string
  slug: string
  icon: string
  description: string
  items: string[]
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: number
  text: string
  author: string
  role: string
  rating: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: number
  studentName: string
  parentName?: string
  email: string
  phone?: string
  programme: string
  ageGroup: 'child' | 'teenager' | 'adult'
  learnerAge?: number
  location?: string
  currentSchool?: string
  curriculum?: string
  gradeClass?: string
  subjects?: string
  learningNeeds?: string
  preferredLearningModel?: 'online' | 'home-based' | 'centre-based' | 'blended' | 'not-sure'
  preferredDays?: string
  preferredTimes?: string
  contactConsent: boolean
  notes?: string
  status: 'pending' | 'approved' | 'rejected' | 'waitlist'
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalInquiries: number
  newInquiries: number
  respondedInquiries: number
  enrollments: number
  totalServices: number
  activeTestimonials: number
}

export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'staff' | 'tutor' | 'student' | 'user'
  createdAt: string
}

export interface PortalOverview {
  role: 'student' | 'tutor'
  programmes: Array<{ id: number; name: string; status: string; ageGroup?: string; createdAt: string }>
  learners: Array<{ id: number; name: string; programme: string; status: string }>
  schedule: Array<{ id: number; title: string; date: string }>
  messages: Array<{ id: number; subject: string; preview: string; createdAt: string }>
}

export interface Newsletter {
  id: number
  email: string
  subscribedAt: string
  isActive: boolean
}

export interface AuditLog {
  id: number
  userId?: number
  action: string
  entity: string
  entityId?: number
  metadata?: Record<string, unknown>
  ipAddress?: string
  createdAt: string
  user?: { id: number; name: string; email: string } | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// Request Body Types

export interface CreateContactRequest {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  programme?: string
}

export interface UpdateContactStatusRequest {
  status: 'new' | 'read' | 'replied' | 'closed'
}

export interface CreateEnrollmentRequest {
  studentName: string
  parentName?: string
  email: string
  phone?: string
  programme: string
  ageGroup: 'child' | 'teenager' | 'adult'
  learnerAge?: number
  location?: string
  currentSchool?: string
  curriculum?: string
  gradeClass?: string
  subjects?: string
  learningNeeds?: string
  preferredLearningModel?: 'online' | 'home-based' | 'centre-based' | 'blended' | 'not-sure'
  preferredDays?: string
  preferredTimes?: string
  contactConsent: boolean
  notes?: string
}

export interface CreateServiceRequest {
  title: string
  slug: string
  icon: string
  description: string
  items: string[]
  order?: number
  isActive?: boolean
}

export interface UpdateServiceRequest {
  title?: string
  slug?: string
  icon?: string
  description?: string
  items?: string[]
  order?: number
  isActive?: boolean
}

export interface CreateTestimonialRequest {
  text: string
  author: string
  role: string
  rating: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface NewsletterSubscribeRequest {
  email: string
}

export type EducatorCategory = 'Leadership' | 'Education Consultant' | 'Teacher' | 'Tutor' | 'Language Educator' | 'Specialist Educator' | 'Coach' | 'Artist' | 'Administrator'

export interface Educator {
  id: string
  name: string
  position: string
  category: EducatorCategory
  qualifications?: string
  experience?: string
  subjects?: string[]
  languages?: string[]
  expertise?: string
  biography?: string
  photo?: string
  email?: string
  phone?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateEducatorRequest {
  name: string
  position: string
  category: EducatorCategory
  qualifications?: string
  experience?: string
  subjects?: string[]
  languages?: string[]
  expertise?: string
  biography?: string
  photo?: string
  email?: string
  phone?: string
}

export interface UpdateEducatorRequest {
  name?: string
  position?: string
  category?: EducatorCategory
  qualifications?: string
  experience?: string
  subjects?: string[]
  languages?: string[]
  expertise?: string
  biography?: string
  photo?: string
  email?: string
  phone?: string
  isActive?: boolean
  sortOrder?: number
}

export type EventCategory = 'Holiday Tuition' | 'Exam Preparation' | 'Competition' | 'Workshop' | 'Cultural Event' | 'Sports Event' | 'Enrichment' | 'Other'
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'

export interface Event {
  id: string
  title: string
  description: string
  category: EventCategory
  startDate: string
  endDate?: string
  venue?: string
  location?: string
  capacity?: number
  ageGroup?: string
  programme?: string
  priceKES?: number
  registrationDeadline?: string
  registrationLink?: string
  poster?: string
  photos?: string[]
  videos?: string[]
  results?: string
  recap?: string
  status: EventStatus
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateEventRequest {
  title: string
  description: string
  category: EventCategory
  startDate: string
  endDate?: string
  venue?: string
  location?: string
  capacity?: number
  ageGroup?: string
  programme?: string
  priceKES?: number
  registrationDeadline?: string
  registrationLink?: string
  poster?: string
  status?: EventStatus
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  category?: EventCategory
  startDate?: string
  endDate?: string
  venue?: string
  location?: string
  capacity?: number
  ageGroup?: string
  programme?: string
  priceKES?: number
  registrationDeadline?: string
  registrationLink?: string
  poster?: string
  photos?: string[]
  videos?: string[]
  results?: string
  recap?: string
  status?: EventStatus
  isActive?: boolean
  sortOrder?: number
}

export type FAQCategory = 'General' | 'Programmes & Curricula' | 'Enrollment' | 'Special Needs' | 'Languages' | 'Locations' | 'Fees & Payments' | 'Educators' | 'Portals & Learning' | 'Technical'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
  order: number
  isActive: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateFAQRequest {
  question: string
  answer: string
  category?: FAQCategory
  order?: number
}

export interface UpdateFAQRequest {
  question?: string
  answer?: string
  category?: FAQCategory
  order?: number
  isActive?: boolean
}

export type GalleryType = 'Photo' | 'Video'
export type GalleryCategory = 'Event' | 'Programme' | 'Activity' | 'General'

export interface GalleryItem {
  id: string
  title: string
  type: GalleryType
  category: GalleryCategory
  description?: string
  url: string
  thumbnail?: string
  tags?: string[]
  consentConfirmed: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateGalleryRequest {
  title: string
  type?: GalleryType
  category?: GalleryCategory
  description?: string
  url: string
  thumbnail?: string
  tags?: string[]
  consentConfirmed: boolean
}

export interface UpdateGalleryRequest {
  title?: string
  type?: GalleryType
  category?: GalleryCategory
  description?: string
  url?: string
  thumbnail?: string
  tags?: string[]
  consentConfirmed?: boolean
  isActive?: boolean
  sortOrder?: number
}

export type ResourceCategory = 'Learning Tips' | 'Parent Guide' | 'Programme Spotlight' | 'Assessment' | 'Academic Support' | 'General'

export interface Resource {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category: ResourceCategory
  author: string
  coverImage?: string
  readTime?: string
  tags?: string[]
  isActive: boolean
  sortOrder: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateResourceRequest {
  title: string
  slug?: string
  excerpt?: string
  content: string
  category?: ResourceCategory
  author?: string
  coverImage?: string
  readTime?: string
  tags?: string[]
  publishedAt?: string
}

export interface UpdateResourceRequest {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  category?: ResourceCategory
  author?: string
  coverImage?: string
  readTime?: string
  tags?: string[]
  isActive?: boolean
  sortOrder?: number
  publishedAt?: string
}

export type PartnerCategory = 'Corporate' | 'Educational Institution' | 'Tech Partner' | 'Content Provider' | 'Community Partner'

export interface Partner {
  id: string
  name: string
  logo?: string
  category: PartnerCategory
  description?: string
  website?: string
  contact?: string
  email?: string
  phone?: string
  focusAreas?: string[]
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerRequest {
  name: string
  logo?: string
  category?: PartnerCategory
  description?: string
  website?: string
  contact?: string
  email?: string
  phone?: string
  focusAreas?: string[]
}

export interface UpdatePartnerRequest {
  name?: string
  logo?: string
  category?: PartnerCategory
  description?: string
  website?: string
  contact?: string
  email?: string
  phone?: string
  focusAreas?: string[]
  isActive?: boolean
  sortOrder?: number
}

export type LocationType = 'Head Office' | 'Learning Centre' | 'Partner Facility' | 'Educator Hub' | 'Home-Based Service'

export interface Location {
  id: string
  name: string
  type: LocationType
  address?: string
  city?: string
  county?: string
  phone?: string
  email?: string
  description?: string
  programmes?: string[]
  photo?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateLocationRequest {
  name: string
  type: LocationType
  address?: string
  city?: string
  county?: string
  phone?: string
  email?: string
  description?: string
  programmes?: string[]
  photo?: string
  latitude?: number
  longitude?: number
}

export interface UpdateLocationRequest {
  name?: string
  type?: LocationType
  address?: string
  city?: string
  county?: string
  phone?: string
  email?: string
  description?: string
  programmes?: string[]
  photo?: string
  latitude?: number
  longitude?: number
  isActive?: boolean
  sortOrder?: number
}
